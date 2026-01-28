const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

module.exports = (database, tokenService) => {
  /**
   * POST /api/tokens/book
   * Book a token for a patient
   */
  router.post("/book", async (req, res) => {
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
          error: "Missing required fields",
        });
      }

      // Attempt booking using async service
      const bookingResult = await tokenService.bookToken({
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
  });

  /**
   * GET /api/tokens/:tokenId
   * Get token details by ID
   */
  router.get("/:tokenId", async (req, res) => {
    try {
      const { tokenId } = req.params;

      // Check if using MongoDB
      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const token = await database.getToken(tokenId);
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
      } else {
        // In-memory database
        const token = database.getToken(tokenId);
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
      }
    } catch (error) {
      console.error("Error fetching token:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * GET /api/tokens/doctor/:doctorId
   * Get all tokens for a doctor
   */
  router.get("/doctor/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { status } = req.query;

      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        let tokens;
        if (status) {
          tokens = await database.getTokensByDoctorAndStatus(doctorId, status);
        } else {
          tokens = await database.getTokensByDoctor(doctorId);
        }

        return res.json({
          success: true,
          count: tokens.length,
          tokens,
        });
      } else {
        // In-memory
        let tokens = database.getTokensByDoctor(doctorId);
        if (status) {
          tokens = tokens.filter(t => t.status === status);
        }

        return res.json({
          success: true,
          count: tokens.length,
          tokens,
        });
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * GET /api/tokens/patient/:patientId
   * Get all tokens for a patient
   */
  router.get("/patient/:patientId", async (req, res) => {
    try {
      const { patientId } = req.params;

      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const tokens = await database.getTokensByPatient(patientId);
        return res.json({
          success: true,
          count: tokens.length,
          tokens,
        });
      } else {
        // In-memory
        const tokens = database.getAllTokens().filter(t => t.patientId === patientId);
        return res.json({
          success: true,
          count: tokens.length,
          tokens,
        });
      }
    } catch (error) {
      console.error("Error fetching patient tokens:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * PATCH /api/tokens/:tokenId/status
   * Update token status
   */
  router.patch("/:tokenId/status", async (req, res) => {
    try {
      const { tokenId } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: "Status is required",
        });
      }

      const result = await tokenService.updateTokenStatus(tokenId, status, notes);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json({
        success: true,
        message: `Token status updated to ${status}`,
        token: result.token,
      });
    } catch (error) {
      console.error("Error updating token status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * POST /api/tokens/:tokenId/call
   * Call a token (mark as called)
   */
  router.post("/:tokenId/call", async (req, res) => {
    try {
      const { tokenId } = req.params;

      const result = await tokenService.callToken(tokenId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json({
        success: true,
        message: "Token called successfully",
        token: result.token,
      });
    } catch (error) {
      console.error("Error calling token:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * POST /api/tokens/:tokenId/complete
   * Complete a token (consultation done)
   */
  router.post("/:tokenId/complete", async (req, res) => {
    try {
      const { tokenId } = req.params;
      const { notes } = req.body;

      const result = await tokenService.completeToken(tokenId, notes);

      if (!result.success) {
        return res.status(404).json(result);
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
  });

  /**
   * DELETE /api/tokens/:tokenId
   * Cancel a token
   */
  router.delete("/:tokenId", async (req, res) => {
    try {
      const { tokenId } = req.params;
      const { reason } = req.body;

      const result = await tokenService.cancelToken(tokenId, reason);

      if (!result.success) {
        return res.status(404).json(result);
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
  });

  /**
   * POST /api/tokens/:tokenId/no-show
   * Mark token as no-show
   */
  router.post("/:tokenId/no-show", async (req, res) => {
    try {
      const { tokenId } = req.params;
      const { reason } = req.body;

      const result = await tokenService.markNoShow(tokenId, reason);

      if (!result.success) {
        return res.status(404).json(result);
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
  });

  /**
   * GET /api/tokens/status/summary
   * Get status summary across all tokens
   */
  router.get("/status/summary", async (req, res) => {
    try {
      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const systemStatus = await database.getSystemStatus();
        return res.json({
          success: true,
          ...systemStatus,
        });
      } else {
        // In-memory
        const allTokens = database.getAllTokens();
        const summary = {
          total: allTokens.length,
          allocated: allTokens.filter(t => t.status === 'allocated').length,
          called: allTokens.filter(t => t.status === 'called').length,
          completed: allTokens.filter(t => t.status === 'completed').length,
          cancelled: allTokens.filter(t => t.status === 'cancelled').length,
          noShow: allTokens.filter(t => t.status === 'no_show').length,
        };

        return res.json({
          success: true,
          ...summary,
        });
      }
    } catch (error) {
      console.error("Error fetching status summary:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  return router;
};
