const mongoose = require('mongoose');

const handoverSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: true
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    handedOverBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    handoverDate: {
      type: Date,
      default: Date.now
    },
    handoverNote: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed'],
      default: 'Completed'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Handover', handoverSchema);
