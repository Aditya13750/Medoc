/**
 * Emergency Controller - Handles emergency token operations
 */
class EmergencyController {
  constructor(database, tokenService) {
    this.db = database;
    this.tokenService = tokenService;
  }

  /**
   * Insert an emergency token with highest priority
   */
  async insertEmergency(req, res) {
    try {
      const { patientId, patientName, doctorId, phone, slotStartTime, slotEndTime } = req.body;

      if (!patientId || !doctorId) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: patientId and doctorId are required",
        });
      }

      const result = await this.tokenService.handleEmergency({
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
  }

  /**
   * Get emergency status for a doctor
   */
  async getEmergencyStatus(req, res) {
    try {
      const { doctorId } = req.params;

      const tokens = this.tokenService.isDatabaseAsync()
        ? await this.db.getTokensByDoctor(doctorId)
        : this.db.getTokensByDoctor(doctorId);

      const emergencyTokens = tokens.filter((t) => t.priority === 1 && t.status !== "completed");

      return res.json({
        success: true,
        doctorId,
        emergencyCount: emergencyTokens.length,
        emergencyTokens,
      });
    } catch (error) {
      console.error("Error fetching emergency status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get system-wide emergency status
   */
  async getSystemEmergencyStatus(req, res) {
    try {
      const tokens = this.tokenService.isDatabaseAsync()
        ? await this.db.getAllocatedTokens()
        : this.db.getAllTokens();

      const emergencyTokens = tokens.filter((t) => t.priority === 1 && t.status !== "completed");

      const byDoctor = {};
      emergencyTokens.forEach((token) => {
        if (!byDoctor[token.doctorId]) {
          byDoctor[token.doctorId] = [];
        }
        byDoctor[token.doctorId].push(token);
      });

      return res.json({
        success: true,
        totalEmergencies: emergencyTokens.length,
        byDoctor,
        emergencies: emergencyTokens,
      });
    } catch (error) {
      console.error("Error fetching system emergency status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

module.exports = EmergencyController;
