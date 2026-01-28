const express = require("express");
const router = express.Router();

module.exports = (database, tokenService) => {
  /**
   * POST /api/emergency/insert
   * Insert an emergency token with highest priority
   */
  router.post("/insert", async (req, res) => {
    try {
      const {
        patientId,
        patientName,
        doctorId,
        phone,
        slotStartTime,
        slotEndTime,
      } = req.body;

      // Validate required fields
      if (!patientId || !doctorId) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: patientId and doctorId are required",
        });
      }

      // Insert emergency token
      const result = await tokenService.handleEmergency({
        patientId,
        patientName: patientName || "Emergency Patient",
        doctorId,
        phone: phone || "",
        slotStartTime: slotStartTime || Date.now(),
        slotEndTime: slotEndTime || Date.now() + 1800000, // 30 min default
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Emergency token inserted successfully with highest priority",
        token: result.token,
        tokenId: result.tokenId,
        priorityLevel: 1,
      });
    } catch (error) {
      console.error("Error inserting emergency token:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  });

  /**
   * GET /api/emergency/status/:doctorId
   * Get emergency token status for a doctor
   */
  router.get("/status/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;

      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const tokens = await database.getTokensByDoctorAndStatus(doctorId, "allocated");
        const emergencyTokens = tokens.filter(t => t.isEmergency);

        return res.json({
          success: true,
          doctorId,
          emergencyTokensCount: emergencyTokens.length,
          emergencyTokens,
        });
      } else {
        // In-memory
        const tokens = database.getTokensByDoctor(doctorId);
        const emergencyTokens = tokens.filter(t => t.isEmergency && t.status === "allocated");

        return res.json({
          success: true,
          doctorId,
          emergencyTokensCount: emergencyTokens.length,
          emergencyTokens,
        });
      }
    } catch (error) {
      console.error("Error fetching emergency status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * GET /api/emergency/system-status
   * Get overall emergency status across all doctors
   */
  router.get("/system-status", async (req, res) => {
    try {
      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const allTokens = await database.getAllTokens ? await database.getAllTokens() : [];
        const emergencies = allTokens.filter(t => t.isEmergency);

        return res.json({
          success: true,
          totalEmergencies: emergencies.length,
          byStatus: {
            allocated: emergencies.filter(t => t.status === "allocated").length,
            called: emergencies.filter(t => t.status === "called").length,
            completed: emergencies.filter(t => t.status === "completed").length,
          },
          emergencies: emergencies.slice(0, 10), // Last 10 emergencies
        });
      } else {
        // In-memory
        const allTokens = database.getAllTokens();
        const emergencies = allTokens.filter(t => t.isEmergency);

        return res.json({
          success: true,
          totalEmergencies: emergencies.length,
          byStatus: {
            allocated: emergencies.filter(t => t.status === "allocated").length,
            called: emergencies.filter(t => t.status === "called").length,
            completed: emergencies.filter(t => t.status === "completed").length,
          },
          emergencies: emergencies.slice(0, 10),
        });
      }
    } catch (error) {
      console.error("Error fetching emergency system status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  return router;
};
