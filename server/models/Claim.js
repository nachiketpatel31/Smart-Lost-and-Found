const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      required: true,
      unique: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ownershipDescription: {
      type: String,
      required: [true, 'Ownership description is required'],
      trim: true
    },
    evidenceDetails: {
      type: String,
      default: '',
      trim: true
    },
    evidenceImages: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ['Pending Verification', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending Verification'
    },
    adminNote: {
      type: String,
      default: '',
      trim: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Claim', claimSchema);
