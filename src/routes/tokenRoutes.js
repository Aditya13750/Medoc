/**
 * Token Routes - All token-related endpoints
 */
const express = require("express");
const router = express.Router();
const TokenController = require("../controllers/tokenController");
const { validateBookToken } = require("../middlewares/validation");

module.exports = (database, tokenService) => {
  const controller = new TokenController(database, tokenService);

  /**
   * POST /api/tokens/book
   * Book a token for a patient
   */
  router.post("/book", validateBookToken, (req, res) =>
    controller.bookToken(req, res)
  );

  /**
   * GET /api/tokens/:tokenId
   * Get token details by ID
   */
  router.get("/:tokenId", (req, res) => controller.getToken(req, res));

  /**
   * GET /api/tokens/doctor/:doctorId
   * Get all tokens for a doctor (optional status filter)
   */
  router.get("/doctor/:doctorId", (req, res) =>
    controller.getTokensByDoctor(req, res)
  );

  /**
   * GET /api/tokens/patient/:patientId
   * Get all tokens for a patient
   */
  router.get("/patient/:patientId", (req, res) =>
    controller.getTokensByPatient(req, res)
  );

  /**
   * PATCH /api/tokens/:tokenId/status
   * Update token status
   */
  router.patch("/:tokenId/status", (req, res) =>
    controller.updateTokenStatus(req, res)
  );

  /**
   * POST /api/tokens/:tokenId/call
   * Mark token as called
   */
  router.post("/:tokenId/call", (req, res) => controller.callToken(req, res));

  /**
   * POST /api/tokens/:tokenId/complete
   * Mark token as completed
   */
  router.post("/:tokenId/complete", (req, res) =>
    controller.completeToken(req, res)
  );

  /**
   * DELETE /api/tokens/:tokenId
   * Cancel a token
   */
  router.delete("/:tokenId", (req, res) =>
    controller.cancelToken(req, res)
  );

  /**
   * POST /api/tokens/:tokenId/no-show
   * Mark token as no-show
   */
  router.post("/:tokenId/no-show", (req, res) =>
    controller.markNoShow(req, res)
  );

  /**
   * GET /api/tokens/status/summary
   * Get status summary (optional doctorId filter)
   */
  router.get("/status/summary", (req, res) =>
    controller.getStatusSummary(req, res)
  );

  return router;
};
