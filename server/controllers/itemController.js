const Item = require('../models/Item');
const StatusHistory = require('../models/StatusHistory');
const { generateReportId } = require('../utils/generateReportId');
const { handleFileUpload } = require('../config/storage');
const { findPotentialMatches } = require('../services/imageMatchingService');
const { isWithinCampusGeofence, getHaversineDistance } = require('../config/campusConfig');

/**
 * Filter item payload based on Privacy & Ownership Rules Matrix
 */
function applyPrivacyFilter(item, reqUser) {
  const itemObj = item.toObject ? item.toObject() : item;

  const isReporter = reqUser && itemObj.reporter && String(reqUser._id) === String(itemObj.reporter._id || itemObj.reporter);
  const isAdmin = reqUser && reqUser.role === 'admin';

  if (!isReporter && !isAdmin) {
    if (itemObj.reporter && typeof itemObj.reporter === 'object') {
      delete itemObj.reporter.phone;
      delete itemObj.reporter.email;
      itemObj.reporter.privacyNotice = 'Contact details protected for privacy. Submit a claim or contact campus security.';
    }
  }

  return itemObj;
}

// @desc    Check for duplicate reports before submission
// @route   POST /api/items/check-duplicates
// @access  Private
const checkDuplicates = async (req, res) => {
  try {
    const { type, itemName, category, location, locationName } = req.body;

    if (!type || !itemName || !category) {
      return res.json({ success: true, duplicates: [] });
    }

    const locSearch = locationName || location;

    // Query active items of same type in same category
    const candidates = await Item.find({
      type,
      category,
      status: { $nin: ['Returned', 'Rejected'] }
    });

    const searchKeywords = itemName.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    const duplicates = candidates.filter((item) => {
      const nameLower = item.itemName.toLowerCase();
      const matchCount = searchKeywords.filter((word) => nameLower.includes(word)).length;
      return matchCount > 0 || item.location === locSearch || item.locationName === locSearch;
    });

    res.json({
      success: true,
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates.slice(0, 3).map((d) => ({
        _id: d._id,
        reportId: d.reportId,
        itemName: d.itemName,
        location: d.locationName || d.location,
        date: d.date,
        images: d.images
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a lost or found report
// @route   POST /api/items/lost OR /api/items/found
// @access  Private
const createItemReport = async (req, res) => {
  try {
    const {
      type,
      itemName,
      category,
      description,
      location,
      locationName,
      specificLocation,
      latitude,
      longitude,
      locationSource,
      date,
      time,
      identifyingFeatures
    } = req.body;

    const finalLocationName = locationName || location;

    if (!type || !itemName || !category || !description || !finalLocationName || !date) {
      return res.status(400).json({ success: false, message: 'Please provide all required item report fields.' });
    }

    const latNum = latitude ? parseFloat(latitude) : null;
    const lngNum = longitude ? parseFloat(longitude) : null;

    // Validate Campus Geofence Boundary
    if (latNum !== null && lngNum !== null) {
      if (!isWithinCampusGeofence(latNum, lngNum)) {
        return res.status(400).json({
          success: false,
          message: 'Please select a location within the university campus boundary.'
        });
      }
    }

    const reportId = await generateReportId(type);

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await handleFileUpload(file);
        if (url) imageUrls.push(url);
      }
    }

    const item = await Item.create({
      reportId,
      type,
      itemName,
      category,
      description,
      location: finalLocationName,
      locationName: finalLocationName,
      specificLocation: specificLocation || '',
      latitude: latNum,
      longitude: lngNum,
      locationSource: locationSource || 'campus_selection',
      date: new Date(date),
      time: time || '',
      identifyingFeatures: identifyingFeatures || '',
      images: imageUrls,
      reporter: req.user._id,
      status: 'Reported'
    });

    // Record initial status history
    await StatusHistory.create({
      item: item._id,
      oldStatus: 'None',
      newStatus: 'Reported',
      changedBy: req.user._id,
      note: 'Initial report submission with campus location data'
    });

    // Trigger Hybrid Image + Metadata Similarity Engine in background
    setTimeout(async () => {
      await findPotentialMatches(item);
    }, 100);

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item report submitted successfully!`,
      item
    });
  } catch (error) {
    console.error('Error creating report:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search and filter items with multi-criteria, location proximity, & pagination
// @route   GET /api/items/search
// @access  Public
const searchItems = async (req, res) => {
  try {
    const { query, type, category, location, status, startDate, endDate, lat, lng, page = 1, limit = 9 } = req.query;

    let filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (location) {
      filter.$or = [{ location: location }, { locationName: location }];
    }
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (query) {
      const regex = new RegExp(query, 'i');
      const searchOr = [
        { itemName: regex },
        { description: regex },
        { location: regex },
        { locationName: regex },
        { specificLocation: regex },
        { reportId: regex },
        { identifyingFeatures: regex }
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
        delete filter.$or;
      } else {
        filter.$or = searchOr;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(filter);
    let items = await Item.find(filter)
      .populate('reporter', 'name email phone collegeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // If latitude and longitude are provided in search, calculate proximity distance
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      items = items.map((item) => {
        const itemObj = applyPrivacyFilter(item, req.user);
        if (itemObj.latitude && itemObj.longitude) {
          itemObj.distanceKm = Math.round(
            getHaversineDistance(userLat, userLng, itemObj.latitude, itemObj.longitude) * 100
          ) / 100;
        }
        return itemObj;
      });
    } else {
      items = items.map((item) => applyPrivacyFilter(item, req.user));
    }

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single item details by ID with privacy enforcement
// @route   GET /api/items/:id
// @access  Public (with optional user context)
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reporter', 'name email phone collegeId');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item report not found.' });
    }

    const statusHistory = await StatusHistory.find({ item: item._id })
      .populate('changedBy', 'name role')
      .sort({ createdAt: -1 });

    const safeItem = applyPrivacyFilter(item, req.user);

    res.json({
      success: true,
      item: safeItem,
      statusHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reports created by current logged-in user
// @route   GET /api/items/my
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    let filter = { reporter: req.user._id };

    if (type) filter.type = type;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update item status (Reporter or Admin)
// @route   PUT /api/items/:id/status
// @access  Private
const updateItemStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item report not found.' });
    }

    const isReporter = String(item.reporter) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this report status.' });
    }

    const oldStatus = item.status;
    item.status = status;
    await item.save();

    await StatusHistory.create({
      item: item._id,
      oldStatus,
      newStatus: status,
      changedBy: req.user._id,
      note: note || `Status changed from ${oldStatus} to ${status}`
    });

    res.json({
      success: true,
      message: `Item status updated to "${status}".`,
      item
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createItemReport,
  checkDuplicates,
  searchItems,
  getItemById,
  getMyReports,
  updateItemStatus
};
