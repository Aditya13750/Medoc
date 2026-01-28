/**
 * Patient Routes - All patient-related endpoints
 */
const express = require("express");
const router = express.Router();
const PatientController = require("../controllers/patientController");
const { validateAddPatient } = require("../middlewares/validation");

module.exports = (database, tokenService) => {
  const controller = new PatientController(database, tokenService);

  /**
   * POST /api/patients
   * Add a new patient
   */
  router.post("/", validateAddPatient, (req, res) =>
    controller.addPatient(req, res)
  );

  /**
   * GET /api/patients
   * Get all patients
   */
  router.get("/", (req, res) => controller.getAllPatients(req, res));

  /**
   * GET /api/patients/:patientId
   * Get patient by ID
   */
  router.get("/:patientId", (req, res) => controller.getPatient(req, res));

  /**
   * GET /api/patients/search/phone
   * Get patient by phone number
   */
  router.get("/search/phone", (req, res) =>
    controller.getPatientByPhone(req, res)
  );

  /**
   * PATCH /api/patients/:patientId
   * Update patient information
   */
  router.patch("/:patientId", (req, res) =>
    controller.updatePatient(req, res)
  );

  /**
   * GET /api/patients/:patientId/history
   * Get patient token history
   */
  router.get("/:patientId/history", (req, res) =>
    controller.getPatientHistory(req, res)
  );

  return router;
};
