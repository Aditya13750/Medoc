const mongoose = require('mongoose');

/**
 * TimeSlot Schema
 * Stores doctor's available time slots and capacity
 */
const TimeSlotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: true,
      index: true
    },
    startTime: {
      type: Number,
      required: true
    },
    endTime: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      default: 20
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Create compound index for doctor and time
TimeSlotSchema.index({ doctorId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);
