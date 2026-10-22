const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    imageSimilarity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    metadataSimilarity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['Suggested', 'Confirmed', 'Dismissed'],
      default: 'Suggested'
    }
  },
  {
    timestamps: true
  }
);

matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
