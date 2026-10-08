const Item = require('../models/Item');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const { getHaversineDistance } = require('../config/campusConfig');

/**
 * Tokenize and normalize text string for keyword extraction
 */
function extractKeywords(text) {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

/**
 * Calculate Jaccard Similarity between two sets of keywords
 */
function calculateJaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

/**
 * Simulated Image Feature & Color Metric Similarity Comparison
 * (Calculates metric correlation based on image path features and visual descriptor length)
 */
function calculateImageFeatureSimilarity(itemA, itemB) {
  const hasImageA = itemA.images && itemA.images.length > 0;
  const hasImageB = itemB.images && itemB.images.length > 0;

  if (!hasImageA || !hasImageB) return 60; // Baseline fallback when one lacks image

  // Extract hash/string metric from image file names / URLs
  const imgA = itemA.images[0];
  const imgB = itemB.images[0];

  let sim = 70; // Standard base correlation for uploaded photographs

  // Bonus for similar image extensions or asset patterns
  if (imgA.slice(-4) === imgB.slice(-4)) sim += 10;
  if (Math.abs(imgA.length - imgB.length) < 5) sim += 10;

  return Math.min(100, sim);
}

/**
 * Core Hybrid Image + Metadata Similarity Engine (with Location Proximity)
 */
async function findPotentialMatches(newItem) {
  try {
    const targetType = newItem.type === 'lost' ? 'found' : 'lost';

    // Find active opposite type items
    const candidates = await Item.find({
      type: targetType,
      _id: { $ne: newItem._id },
      status: { $in: ['Reported', 'Under Review', 'Potential Match', 'Claim Requested'] }
    });

    const results = [];

    const newKeywords = extractKeywords(`${newItem.itemName} ${newItem.description} ${newItem.identifyingFeatures}`);

    for (const candidate of candidates) {
      // 1. Category Similarity (25% max)
      let categoryScore = newItem.category === candidate.category ? 25 : 0;

      // 2. Geographic Location Similarity (25% max)
      let locationScore = 0;

      const hasNewCoords = newItem.latitude !== null && newItem.longitude !== null && newItem.latitude !== undefined;
      const hasCandCoords = candidate.latitude !== null && candidate.longitude !== null && candidate.latitude !== undefined;

      if (hasNewCoords && hasCandCoords) {
        // Calculate Haversine physical distance in kilometers
        const distKm = getHaversineDistance(newItem.latitude, newItem.longitude, candidate.latitude, candidate.longitude);
        if (distKm <= 0.1) locationScore = 25;       // Within 100 meters
        else if (distKm <= 0.3) locationScore = 20;  // Within 300 meters
        else if (distKm <= 0.5) locationScore = 15;  // Within 500 meters
        else if (distKm <= 1.0) locationScore = 10;  // Within 1 km
        else if (distKm <= 2.0) locationScore = 5;   // Within 2 km
      } else {
        // Fallback to text building / campus location matching
        const locA = newItem.locationName || newItem.location;
        const locB = candidate.locationName || candidate.location;

        if (locA === locB) {
          locationScore += 20;
          if (
            newItem.specificLocation &&
            candidate.specificLocation &&
            newItem.specificLocation.toLowerCase().includes(candidate.specificLocation.toLowerCase())
          ) {
            locationScore += 5;
          }
        }
      }

      // 3. Date Proximity Score (15% max)
      const dateA = new Date(newItem.date).getTime();
      const dateB = new Date(candidate.date).getTime();
      const diffDays = Math.abs(dateA - dateB) / (1000 * 3600 * 24);
      let dateScore = 0;
      if (diffDays <= 1) dateScore = 15;
      else if (diffDays <= 3) dateScore = 10;
      else if (diffDays <= 7) dateScore = 5;

      // 4. Text Feature Keyword Overlap (20% max)
      const candKeywords = extractKeywords(`${candidate.itemName} ${candidate.description} ${candidate.identifyingFeatures}`);
      const textSim = calculateJaccardSimilarity(newKeywords, candKeywords);
      const textScore = Math.round(textSim * 20);

      // Metadata Total (75% max normalized to 100%)
      const metadataSimilarity = Math.round(((categoryScore + locationScore + dateScore + textScore) / 85) * 100);

      // 5. Image Metric Comparison (20% weight contribution)
      const imageSimilarity = calculateImageFeatureSimilarity(newItem, candidate);

      // Overall Score Calculation
      const overallScore = Math.round(metadataSimilarity * 0.7 + imageSimilarity * 0.3);

      if (overallScore >= 45) {
        const lostItem = newItem.type === 'lost' ? newItem : candidate;
        const foundItem = newItem.type === 'found' ? newItem : candidate;

        // Save or update match record
        const match = await Match.findOneAndUpdate(
          { lostItem: lostItem._id, foundItem: foundItem._id },
          {
            imageSimilarity,
            metadataSimilarity,
            overallScore,
            status: 'Suggested'
          },
          { upsert: true, new: true }
        );

        // Update item statuses to Potential Match
        await Item.findByIdAndUpdate(lostItem._id, { status: 'Potential Match' });
        await Item.findByIdAndUpdate(foundItem._id, { status: 'Potential Match' });

        // Notify both reporters
        await Notification.create({
          user: lostItem.reporter,
          title: 'Potential Item Match Found',
          message: `A potential match (${overallScore}% similarity) was identified for your lost item "${lostItem.itemName}".`,
          type: 'MATCH_FOUND',
          link: `/potential-matches`
        });

        await Notification.create({
          user: foundItem.reporter,
          title: 'Potential Item Match Found',
          message: `Your found item report "${foundItem.itemName}" has a potential match (${overallScore}% similarity).`,
          type: 'MATCH_FOUND',
          link: `/potential-matches`
        });

        results.push({
          matchId: match._id,
          lostItem,
          foundItem,
          imageSimilarity,
          metadataSimilarity,
          overallScore
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error in Hybrid Image + Metadata Similarity Engine:', error.message);
    return [];
  }
}

module.exports = {
  findPotentialMatches,
  calculateImageFeatureSimilarity
};
