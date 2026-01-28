const express = require("express");
const router = express.Router();

module.exports = (database, tokenService) => {
  /**
   * POST /api/emergency/insert
   * Handle emergency token insertion
   */
  router.post("/insert", (req, res) => {
    try {
      const {
        patientId,
        patientName,
        patientPhone,
        doctorId,
        slotStartTime,
        slotEndTime,
        severity,
      } = req.body;

      // Validate required fields
      if (!patientId || !doctorId || !slotStartTime || !slotEndTime) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      // Add patient if not exists
      let patient = database.getPatient(patientId);
      if (!patient) {
        patient = {
          id: patientId,
          name: patientName || "Unknown",
          phone: patientPhone || "N/A",
          createdAt: new Date(),
        };
        database.addPatient(patient);
      }

      // Handle emergency
      const result = tokenService.handleEmergency({
        patientId,
        doctorId,
        slotStartTime,
        slotEndTime,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        token: result.token,
        queuePosition: result.queuePosition,
        capacityOverride: result.capacityOverride,
        message: `EMERGENCY TOKEN ALLOCATED - Queue Position: ${result.queuePosition}`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/emergency/status/:doctorId
   * Get emergency status for a doctor
   */
  router.get("/status/:doctorId", (req, res) => {
    try {
      const { doctorId } = req.params;
      const tokens = database.getTokensByDoctor(doctorId);
      const emergencies = tokens.filter((t) => t.isEmergency);

      res.json({
        success: true,
        doctorId,
        totalEmergencies: emergencies.length,
        emergencies: emergencies.map((t) => ({
          tokenId: t.id,
          patientId: t.patientId,
          slotStartTime: t.slotStartTime,
          slotEndTime: t.slotEndTime,
          allocatedAt: t.allocatedAt,
          status: t.status,
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  return router;
};
