const mongoose = require('mongoose');

/**
 * Queue Schema
 * Stores queue information for each doctor
 */
const QueueSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    tokens: [
      {
        tokenId: String,
        position: Number,
        priority: Number
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Queue', QueueSchema);
