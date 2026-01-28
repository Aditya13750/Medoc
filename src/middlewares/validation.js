/**
 * Validation Middleware - Request validation
 */

const validateBookToken = (req, res, next) => {
  const { patientId, doctorId, slotStartTime, slotEndTime, source } = req.body;

  const errors = [];

  if (!patientId) errors.push("patientId is required");
  if (!doctorId) errors.push("doctorId is required");
  if (!slotStartTime) errors.push("slotStartTime is required");
  if (!slotEndTime) errors.push("slotEndTime is required");
  if (!source) errors.push("source is required");

  if (source && !["emergency", "walk_in", "online_booking", "paid_priority"].includes(source)) {
    errors.push("Invalid source. Must be: emergency, walk_in, online_booking, or paid_priority");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

const validateAddDoctor = (req, res, next) => {
  const { doctorId, name } = req.body;

  const errors = [];

  if (!doctorId) errors.push("doctorId is required");
  if (!name) errors.push("name is required");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

const validateAddPatient = (req, res, next) => {
  const { patientId, name } = req.body;

  const errors = [];

  if (!patientId) errors.push("patientId is required");
  if (!name) errors.push("name is required");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

const validateAddTimeSlot = (req, res, next) => {
  const { doctorId, startTime, endTime } = req.body;

  const errors = [];

  if (!doctorId) errors.push("doctorId is required");
  if (!startTime) errors.push("startTime is required");
  if (!endTime) errors.push("endTime is required");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

const validateEmergency = (req, res, next) => {
  const { patientId, doctorId } = req.body;

  const errors = [];

  if (!patientId) errors.push("patientId is required");
  if (!doctorId) errors.push("doctorId is required");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

module.exports = {
  validateBookToken,
  validateAddDoctor,
  validateAddPatient,
  validateAddTimeSlot,
  validateEmergency,
};
