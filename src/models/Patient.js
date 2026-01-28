const mongoose = require('mongoose');

/**
 * Patient Schema
 * Stores patient information and medical history
 */
const PatientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: ''
    },
    age: {
      type: Number,
      default: null
    },
    gender: {
      type: String,
      enum: ['M', 'F', 'O'],
      default: null
    },
    address: {
      type: String,
      default: ''
    },
    isFollowUp: {
      type: Boolean,
      default: false
    },
    medicalHistory: {
      type: String,
      default: ''
    },
    allergies: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Index for phone searches
PatientSchema.index({ phone: 1 });

module.exports = mongoose.model('Patient', PatientSchema);
