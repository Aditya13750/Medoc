/**
 * Admin Routes - Administrative and system endpoints
 */
const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/adminController");
const { validateAddDoctor, validateAddTimeSlot } = require("../middlewares/validation");

module.exports = (database, tokenService) => {
  const controller = new AdminController(database, tokenService);

  // ============ DOCTOR MANAGEMENT ============

  /**
   * POST /api/admin/doctors
   * Add a new doctor
   */
  router.post("/doctors", validateAddDoctor, (req, res) =>
    controller.addDoctor(req, res)
  );

  /**
   * GET /api/admin/doctors
   * Get all doctors
   */
  router.get("/doctors", (req, res) => controller.getAllDoctors(req, res));

  // ============ TIME SLOT MANAGEMENT ============

  /**
   * POST /api/admin/time-slots
   * Add a new time slot
   */
  router.post("/time-slots", validateAddTimeSlot, (req, res) =>
    controller.addTimeSlot(req, res)
  );

  /**
   * GET /api/admin/time-slots/:doctorId
   * Get time slots for a doctor
   */
  router.get("/time-slots/:doctorId", (req, res) =>
    controller.getTimeSlots(req, res)
  );

  // ============ QUEUE MANAGEMENT ============

  /**
   * GET /api/admin/queue/:doctorId
   * Get queue status for a doctor
   */
  router.get("/queue/:doctorId", (req, res) =>
    controller.getQueueStatus(req, res)
  );

  // ============ ANALYTICS ============

  /**
   * GET /api/admin/analytics/:doctorId
   * Get doctor analytics
   */
  router.get("/analytics/:doctorId", (req, res) =>
    controller.getDoctorAnalytics(req, res)
  );

  /**
   * GET /api/admin/system-status
   * Get system status
   */
  router.get("/system-status", (req, res) =>
    controller.getSystemStatus(req, res)
  );

  // ============ DATA MANAGEMENT ============

  /**
   * DELETE /api/admin/clear-data
   * Clear all data (requires confirmation token)
   */
  router.delete("/clear-data", (req, res) =>
    controller.clearAllData(req, res)
  );

  /**
   * POST /api/admin/bulk-setup
   * Bulk create doctors and time slots
   */
  router.post("/bulk-setup", (req, res) =>
    controller.bulkSetup(req, res)
  );

  return router;
};
