/**
 * Doctor Routes - All doctor-related endpoints
 */
const express = require("express");
const router = express.Router();
const DoctorController = require("../controllers/doctorController");
const { validateAddDoctor } = require("../middlewares/validation");

module.exports = (database, tokenService) => {
  const controller = new DoctorController(database, tokenService);

  /**
   * POST /api/doctors
   * Add a new doctor
   */
  router.post("/", validateAddDoctor, (req, res) =>
    controller.addDoctor(req, res)
  );

  /**
   * GET /api/doctors
   * Get all doctors
   */
  router.get("/", (req, res) => controller.getAllDoctors(req, res));

  /**
   * GET /api/doctors/:doctorId
   * Get doctor by ID
   */
  router.get("/:doctorId", (req, res) => controller.getDoctor(req, res));

  /**
   * PATCH /api/doctors/:doctorId/status
   * Update doctor status
   */
  router.patch("/:doctorId/status", (req, res) =>
    controller.updateDoctorStatus(req, res)
  );

  return router;
};
