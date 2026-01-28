/**
 * MongoDB Models Aggregator
 * Central import point for all Mongoose models
 * Individual model files contain schema definitions
 */

const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Token = require('./Token');
const TimeSlot = require('./TimeSlot');
const Queue = require('./Queue');

module.exports = {
  Doctor,
  Patient,
  Token,
  TimeSlot,
  Queue
};
