/**
 * Helpers - Utility helper functions
 */

/**
 * Calculate wait time between two dates
 */
const calculateWaitTime = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const diff = new Date(endTime) - new Date(startTime);
  return Math.round(diff / 60000); // Convert to minutes
};

/**
 * Format time slot range
 */
const formatTimeSlot = (startTime, endTime) => {
  const start = new Date(startTime).toLocaleTimeString();
  const end = new Date(endTime).toLocaleTimeString();
  return `${start} - ${end}`;
};

/**
 * Get priority label from priority number
 */
const getPriorityLabel = (priority) => {
  const labels = {
    1: "Emergency",
    2: "Follow-up",
    3: "Paid Priority",
    4: "Walk-in",
    5: "Online Booking",
  };
  return labels[priority] || "Unknown";
};

/**
 * Get status label from status string
 */
const getStatusLabel = (status) => {
  const labels = {
    allocated: "Allocated",
    called: "Called",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };
  return labels[status] || status;
};

/**
 * Generate token ID
 */
const generateTokenId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `TKN-${timestamp}-${random}`;
};

/**
 * Generate doctor ID
 */
const generateDoctorId = () => {
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `DOC-${random}`;
};

/**
 * Generate patient ID
 */
const generatePatientId = () => {
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `PAT-${random}`;
};

/**
 * Check if object is empty
 */
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Parse date safely
 */
const parseDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch (e) {
    return null;
  }
};

/**
 * Compare dates
 */
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Get time range display
 */
const getTimeRange = (startTime, endTime) => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startStr = start.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const endStr = end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${startStr} - ${endStr}`;
  } catch (e) {
    return "Invalid time";
  }
};

module.exports = {
  calculateWaitTime,
  formatTimeSlot,
  getPriorityLabel,
  getStatusLabel,
  generateTokenId,
  generateDoctorId,
  generatePatientId,
  isEmpty,
  parseDate,
  isSameDay,
  getTimeRange,
};
