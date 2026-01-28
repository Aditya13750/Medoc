/**
 * Emergency Routes - All emergency token endpoints
 */
const express = require("express");
const router = express.Router();
const EmergencyController = require("../controllers/emergencyController");
const { validateEmergency } = require("../middlewares/validation");

module.exports = (database, tokenService) => {
  const controller = new EmergencyController(database, tokenService);

  /**
   * POST /api/emergency/insert
   * Insert an emergency token with highest priority
   */
  router.post("/insert", validateEmergency, (req, res) =>
    controller.insertEmergency(req, res)
  );

  /**
   * GET /api/emergency/status/:doctorId
   * Get emergency status for a specific doctor
   */
  router.get("/status/:doctorId", (req, res) =>
    controller.getEmergencyStatus(req, res)
  );

  /**
   * GET /api/emergency/system-status
   * Get system-wide emergency status
   */
  router.get("/system-status", (req, res) =>
    controller.getSystemEmergencyStatus(req, res)
  );

  return router;
};
