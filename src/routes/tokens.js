const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

module.exports = (database, tokenService) => {
  /**
   * POST /api/tokens/book
   * Book a token for a patient
   */
  router.post("/book", (req, res) => {
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

      // Add patient if not exists
      let patient = database.getPatient(patientId);
      if (!patient) {
        patient = {
          id: patientId,
          name: patientName || "Unknown",
          phone: patientPhone || "N/A",
          createdAt: new Date(),
          isFollowUp: isFollowUp || false,
        };
        database.addPatient(patient);
      }

      // Attempt booking
      const bookingResult = tokenService.bookToken({
        patientId,
        doctorId,
        slotStartTime,
        slotEndTime,
        source,
        isFollowUp: isFollowUp || false,
      });

      if (!bookingResult.success) {
        return res.status(400).json({
          success: false,
          error: bookingResult.error,
          waitlist: bookingResult.waitlist || false,
        });
      }

      res.status(201).json({
        success: true,
        token: bookingResult.token,
        queuePosition: bookingResult.queuePosition,
        message: `Token allocated. Queue position: ${bookingResult.queuePosition}`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/tokens/:tokenId/cancel
   * Cancel a token
   */
  router.post("/:tokenId/cancel", (req, res) => {
    try {
      const { tokenId } = req.params;
      const { reason } = req.body;

      const result = tokenService.cancelToken(tokenId, reason || "Cancelled by patient");

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        token: result.token,
        reallocations: result.reallocations,
        message: "Token cancelled successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/tokens/:tokenId/call
   * Call a token (mark as called/under consultation)
   */
  router.post("/:tokenId/call", (req, res) => {
    try {
      const { tokenId } = req.params;
      const result = tokenService.callToken(tokenId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        token: result.token,
        message: "Token called",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/tokens/:tokenId/complete
   * Mark token as completed
   */
  router.post("/:tokenId/complete", (req, res) => {
    try {
      const { tokenId } = req.params;
      const { consultationNotes } = req.body;

      const result = tokenService.completeToken(tokenId, consultationNotes);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        token: result.token,
        message: "Token marked as completed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/tokens/:tokenId/no-show
   * Mark token as no-show
   */
  router.post("/:tokenId/no-show", (req, res) => {
    try {
      const { tokenId } = req.params;
      const { reason } = req.body;

      const result = tokenService.markNoShow(tokenId, reason || "No-show");

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        token: result.token,
        reallocations: result.reallocations,
        message: "Token marked as no-show",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/tokens/:tokenId
   * Get token details
   */
  router.get("/:tokenId", (req, res) => {
    try {
      const { tokenId } = req.params;
      const token = database.getToken(tokenId);

      if (!token) {
        return res.status(404).json({
          success: false,
          error: "Token not found",
        });
      }

      const doctor = database.getDoctor(token.doctorId);
      const queuePosition = database.getQueuePosition(token.doctorId, tokenId);

      res.json({
        success: true,
        token: {
          ...token,
          doctor: doctor ? { id: doctor.id, name: doctor.name } : null,
          queuePosition: queuePosition > 0 ? queuePosition : null,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/tokens/doctor/:doctorId
   * Get all tokens for a doctor
   */
  router.get("/doctor/:doctorId", (req, res) => {
    try {
      const { doctorId } = req.params;
      const { status } = req.query;

      let tokens = database.getTokensByDoctor(doctorId);

      if (status) {
        tokens = tokens.filter((t) => t.status === status);
      }

      res.json({
        success: true,
        count: tokens.length,
        tokens,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/tokens
   * Get all tokens (with optional filters)
   */
  router.get("/", (req, res) => {
    try {
      const { doctorId, status, source } = req.query;

      let tokens = database.getAllTokens();

      if (doctorId) {
        tokens = tokens.filter((t) => t.doctorId === doctorId);
      }

      if (status) {
        tokens = tokens.filter((t) => t.status === status);
      }

      if (source) {
        tokens = tokens.filter((t) => t.source === source);
      }

      res.json({
        success: true,
        count: tokens.length,
        tokens,
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
