const mongoose = require('mongoose');

/**
 * Token Schema
 * Stores token allocations and status tracking
 */
const TokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    patientId: {
      type: String,
      required: true,
      index: true
    },
    doctorId: {
      type: String,
      required: true,
      index: true
    },
    slotStartTime: {
      type: Number,
      required: true
    },
    slotEndTime: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      enum: ['online_booking', 'walk_in', 'paid_priority', 'follow_up', 'emergency'],
      required: true
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    status: {
      type: String,
      enum: ['allocated', 'called', 'completed', 'cancelled', 'no_show', 'waitlist'],
      default: 'allocated',
      index: true
    },
    isFollowUp: {
      type: Boolean,
      default: false
    },
    isEmergency: {
      type: Boolean,
      default: false
    },
    allocatedAt: {
      type: Date,
      default: Date.now
    },
    calledAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    noShowAt: {
      type: Date,
      default: null
    },
    consultationNotes: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    },
    reallocatedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Create indexes for common queries
TokenSchema.index({ doctorId: 1, status: 1 });
TokenSchema.index({ doctorId: 1, slotStartTime: 1, slotEndTime: 1 });
TokenSchema.index({ status: 1 });
TokenSchema.index({ patientId: 1 });

module.exports = mongoose.model('Token', TokenSchema);
