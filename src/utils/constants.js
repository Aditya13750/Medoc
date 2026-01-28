/**
 * Constants - Application-wide constants
 */

const PRIORITY_LEVELS = {
  EMERGENCY: 1,
  FOLLOW_UP: 2,
  PAID_PRIORITY: 3,
  WALK_IN: 4,
  ONLINE_BOOKING: 5,
};

const TOKEN_STATUS = {
  ALLOCATED: "allocated",
  CALLED: "called",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

const BOOKING_SOURCE = {
  EMERGENCY: "emergency",
  WALK_IN: "walk_in",
  ONLINE_BOOKING: "online_booking",
  PAID_PRIORITY: "paid_priority",
  FOLLOW_UP: "follow_up",
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

const ERROR_MESSAGES = {
  MISSING_FIELDS: "Missing required fields",
  INVALID_INPUT: "Invalid input",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized",
  INTERNAL_ERROR: "Internal server error",
  SLOT_FULL: "Slot capacity full",
  DOCTOR_NOT_FOUND: "Doctor not found",
  PATIENT_NOT_FOUND: "Patient not found",
  TOKEN_NOT_FOUND: "Token not found",
  INVALID_STATUS: "Invalid token status",
};

module.exports = {
  PRIORITY_LEVELS,
  TOKEN_STATUS,
  BOOKING_SOURCE,
  HTTP_STATUS,
  ERROR_MESSAGES,
};
