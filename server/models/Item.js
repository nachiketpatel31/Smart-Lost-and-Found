const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Bags', 'Mobile Phones', 'Wallets', 'ID Cards', 'Books', 'Watches', 'Keys', 'Earphones', 'Laptops', 'Other']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required']
    },
    locationName: {
      type: String,
      trim: true
    },
    specificLocation: {
      type: String,
      default: '',
      trim: true
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    locationSource: {
      type: String,
      enum: ['campus_selection', 'map_selection', 'current_location'],
      default: 'campus_selection'
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    time: {
      type: String,
      default: ''
    },
    identifyingFeatures: {
      type: String,
      default: '',
      trim: true
    },
    images: [
      {
        type: String
      }
    ],
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Reported', 'Under Review', 'Potential Match', 'Claim Requested', 'Verified', 'Returned', 'Unclaimed', 'Rejected'],
      default: 'Reported'
    }
  },
  {
    timestamps: true
  }
);

itemSchema.index({ type: 1, category: 1, location: 1, status: 1, latitude: 1, longitude: 1 });

module.exports = mongoose.model('Item', itemSchema);
