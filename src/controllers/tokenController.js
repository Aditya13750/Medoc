const { v4: uuidv4 } = require("uuid");

/**
 * Token Controller - Handles token-related operations
 */
class TokenController {
  constructor(database, tokenService) {
    this.db = database;
    this.tokenService = tokenService;
  }

  /**
   * Book a token for a patient
   */
  async bookToken(req, res) {
    try {
      const {
        patientId,
        patientName,
        patientPhone,
        doctorId,
        slotStartTime,
        slotEndTime,
        source,
        isFollowUp,
      } = req.body;

      // Validate required fields
      if (!patientId || !doctorId || !slotStartTime || !slotEndTime || !source) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: patientId, doctorId, slotStartTime, slotEndTime, source",
        });
      }

      // Attempt booking
      const bookingResult = await this.tokenService.bookToken({
        patientId,
        patientName,
        doctorId,
        slotStartTime,
        slotEndTime,
        source,
        isFollowUp: isFollowUp || false,
        phone: patientPhone,
      });

      if (!bookingResult.success) {
        return res.status(400).json({
          success: false,
          error: bookingResult.error,
          waitlist: bookingResult.waitlist || false,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Token booked successfully",
        token: bookingResult.token,
        tokenId: bookingResult.tokenId || (bookingResult.token ? bookingResult.token.tokenId : null),
      });
    } catch (error) {
      console.error("Error booking token:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  /**
   * Get token details by ID
   */
  async getToken(req, res) {
    try {
      const { tokenId } = req.params;

      const token = this.tokenService.isDatabaseAsync()
        ? await this.db.getToken(tokenId)
        : this.db.getToken(tokenId);

      if (!token) {
        return res.status(404).json({
          success: false,
          error: "Token not found",
        });
      }

      return res.json({
        success: true,
        token,
      });
    } catch (error) {
      console.error("Error fetching token:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get all tokens for a doctor
   */
  async getTokensByDoctor(req, res) {
    try {
      const { doctorId } = req.params;
      const { status } = req.query;

      let tokens = this.tokenService.isDatabaseAsync()
        ? await this.db.getTokensByDoctor(doctorId)
        : this.db.getTokensByDoctor(doctorId);

      if (status) {
        tokens = tokens.filter((t) => t.status === status);
      }

      return res.json({
        success: true,
        count: tokens.length,
        tokens,
      });
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get all tokens for a patient
   */
  async getTokensByPatient(req, res) {
    try {
      const { patientId } = req.params;

      const tokens = this.tokenService.isDatabaseAsync()
        ? await this.db.getTokensByPatient(patientId)
        : this.db.getTokensByPatient(patientId);

      return res.json({
        success: true,
        count: tokens.length,
        tokens,
      });
    } catch (error) {
      console.error("Error fetching patient tokens:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Update token status
   */
  async updateTokenStatus(req, res) {
    try {
      const { tokenId } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: "Status is required",
        });
      }

      const validStatuses = ["allocated", "called", "completed", "cancelled", "no_show"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const updated = await this.tokenService.dbUpdateTokenStatus(
        tokenId,
        status,
        notes || ""
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "Token not found",
        });
      }

      return res.json({
        success: true,
        message: "Token status updated",
        token: updated,
      });
    } catch (error) {
      console.error("Error updating token status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Call a token (mark as called)
   */
  async callToken(req, res) {
    try {
      const { tokenId } = req.params;

      const token = await this.tokenService.callToken(tokenId);

      if (!token.success) {
        return res.status(400).json({
          success: false,
          error: token.error,
        });
      }

      return res.json({
        success: true,
        message: "Token called successfully",
        token: token.token,
      });
    } catch (error) {
      console.error("Error calling token:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Mark token as completed
   */
  async completeToken(req, res) {
    try {
      const { tokenId } = req.params;

      const result = await this.tokenService.completeToken(tokenId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        message: "Token marked as completed",
        token: result.token,
      });
    } catch (error) {
      console.error("Error completing token:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Cancel a token
   */
  async cancelToken(req, res) {
    try {
      const { tokenId } = req.params;
      const { reason } = req.body;

      const result = await this.tokenService.cancelToken(tokenId, reason || "");

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        message: "Token cancelled successfully",
        token: result.token,
      });
    } catch (error) {
      console.error("Error cancelling token:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Mark token as no-show
   */
  async markNoShow(req, res) {
    try {
      const { tokenId } = req.params;

      const result = await this.tokenService.markNoShow(tokenId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        message: "Token marked as no-show",
        token: result.token,
      });
    } catch (error) {
      console.error("Error marking no-show:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get token status summary
   */
  async getStatusSummary(req, res) {
    try {
      const { doctorId } = req.query;

      let tokens = doctorId
        ? this.tokenService.isDatabaseAsync()
          ? await this.db.getTokensByDoctor(doctorId)
          : this.db.getTokensByDoctor(doctorId)
        : this.tokenService.isDatabaseAsync()
        ? await this.db.getAllocatedTokens()
        : this.db.getAllTokens();

      const summary = {
        total: tokens.length,
        allocated: tokens.filter((t) => t.status === "allocated").length,
        called: tokens.filter((t) => t.status === "called").length,
        completed: tokens.filter((t) => t.status === "completed").length,
        cancelled: tokens.filter((t) => t.status === "cancelled").length,
        no_show: tokens.filter((t) => t.status === "no_show").length,
      };

      return res.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error("Error getting status summary:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

module.exports = TokenController;
