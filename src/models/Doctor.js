const mongoose = require('mongoose');

/**
 * Doctor Schema
 * Stores doctor information and availability status
 */
const DoctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      default: 'General'
    },
    contactNumber: {
      type: String,
      default: 'N/A'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
