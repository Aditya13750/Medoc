/**
 * Patient Controller - Handles patient-related operations
 */
class PatientController {
  constructor(database, tokenService) {
    this.db = database;
    this.tokenService = tokenService;
  }

  /**
   * Add a new patient
   */
  async addPatient(req, res) {
    try {
      const { patientId, name, phone, email, age, gender, address, medicalHistory } = req.body;

      if (!patientId || !name) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: patientId and name",
        });
      }

      const patient = this.tokenService.isDatabaseAsync()
        ? await this.db.addPatient(
            patientId,
            name,
            phone || "",
            email || "",
            age || null,
            gender || "N/A",
            address || "",
            medicalHistory || ""
          )
        : this.db.addPatient({
            patientId,
            name,
            phone: phone || "",
            email: email || "",
            age: age || null,
            gender: gender || "N/A",
            address: address || "",
            medicalHistory: medicalHistory || "",
            createdAt: new Date(),
          });

      return res.status(201).json({
        success: true,
        message: "Patient added successfully",
        patient,
      });
    } catch (error) {
      console.error("Error adding patient:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  /**
   * Get all patients
   */
  async getAllPatients(req, res) {
    try {
      const patients = this.tokenService.isDatabaseAsync()
        ? await this.db.getAllPatients()
        : this.db.getAllPatients();

      return res.json({
        success: true,
        count: patients.length,
        patients,
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get patient by ID
   */
  async getPatient(req, res) {
    try {
      const { patientId } = req.params;

      const patient = this.tokenService.isDatabaseAsync()
        ? await this.db.getPatient(patientId)
        : this.db.getPatient(patientId);

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: "Patient not found",
        });
      }

      return res.json({
        success: true,
        patient,
      });
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get patient by phone number
   */
  async getPatientByPhone(req, res) {
    try {
      const { phone } = req.query;

      if (!phone) {
        return res.status(400).json({
          success: false,
          error: "Phone number is required",
        });
      }

      const patient = this.tokenService.isDatabaseAsync()
        ? await this.db.getPatientByPhone(phone)
        : this.db.getPatientByPhone(phone);

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: "Patient not found",
        });
      }

      return res.json({
        success: true,
        patient,
      });
    } catch (error) {
      console.error("Error fetching patient by phone:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Update patient information
   */
  async updatePatient(req, res) {
    try {
      const { patientId } = req.params;
      const updateData = req.body;

      const patient = this.tokenService.isDatabaseAsync()
        ? await this.db.updatePatient(patientId, updateData)
        : this.db.updatePatient(patientId, updateData);

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: "Patient not found",
        });
      }

      return res.json({
        success: true,
        message: "Patient updated successfully",
        patient,
      });
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get patient token history
   */
  async getPatientHistory(req, res) {
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
      console.error("Error fetching patient history:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

module.exports = PatientController;
