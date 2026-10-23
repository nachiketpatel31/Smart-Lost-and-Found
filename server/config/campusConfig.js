/**
 * GSFC University Campus Configuration
 * Primary Location: Fertilizernagar, Vadodara, Gujarat 391750
 */

const CAMPUS_CONFIG = {
  universityName: 'GSFC University',
  
  // Center Coordinates for GSFC University
  center: {
    latitude: 22.3705,
    longitude: 73.1585
  },

  // Maximum allowed radius from campus center in kilometers (Geofence)
  maxRadiusKm: 3.5,

  // Latitude and Longitude Bounding Box for Geofencing
  bounds: {
    minLatitude: 22.3400,
    maxLatitude: 22.4000,
    minLongitude: 73.1200,
    maxLongitude: 73.1900
  },

  // Pre-configured Campus Buildings / Locations with default coordinates
  locations: [
    { name: 'Main Building', latitude: 22.3705, longitude: 73.1585 },
    { name: 'Library', latitude: 22.3708, longitude: 73.1582 },
    { name: 'Canteen', latitude: 22.3701, longitude: 73.1590 },
    { name: 'Computer Lab', latitude: 22.3712, longitude: 73.1588 },
    { name: 'Classroom', latitude: 22.3706, longitude: 73.1580 },
    { name: 'Laboratory', latitude: 22.3710, longitude: 73.1584 },
    { name: 'Parking Area', latitude: 22.3698, longitude: 73.1575 },
    { name: 'Hostel', latitude: 22.3720, longitude: 73.1600 },
    { name: 'Sports Ground', latitude: 22.3715, longitude: 73.1610 },
    { name: 'Security Office', latitude: 22.3695, longitude: 73.1570 },
    { name: 'Other', latitude: 22.3705, longitude: 73.1585 }
  ]
};

/**
 * Calculate Haversine distance in kilometers between two lat/lng points
 */
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if given coordinates are within GSFC University campus geofence
 */
function isWithinCampusGeofence(latitude, longitude) {
  if (latitude === null || longitude === null || latitude === undefined || longitude === undefined) {
    return true; // Allow submission without coordinates if using campus selection
  }

  const distance = getHaversineDistance(
    CAMPUS_CONFIG.center.latitude,
    CAMPUS_CONFIG.center.longitude,
    latitude,
    longitude
  );

  return distance <= CAMPUS_CONFIG.maxRadiusKm;
}

module.exports = {
  CAMPUS_CONFIG,
  getHaversineDistance,
  isWithinCampusGeofence
};
