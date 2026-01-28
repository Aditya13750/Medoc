/**
 * Doctor Controller - Handles doctor-related operations
 */
class DoctorController {
  constructor(database, tokenService) {
    this.db = database;
    this.tokenService = tokenService;
  }

  /**
   * Add a new doctor
   */
  async addDoctor(req, res) {
    try {
      const { doctorId, name, specialization, contactNumber } = req.body;

      if (!doctorId || !name) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: doctorId and name",
        });
      }

      const doctor = this.tokenService.isDatabaseAsync()
        ? await this.db.addDoctor(
            doctorId,
            name,
            specialization || "General",
            contactNumber || "N/A"
          )
        : this.db.addDoctor({
            doctorId,
            name,
            specialization: specialization || "General",
            contactNumber: contactNumber || "N/A",
            createdAt: new Date(),
          });

      return res.status(201).json({
        success: true,
        message: "Doctor added successfully",
        doctor,
      });
    } catch (error) {
      console.error("Error adding doctor:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  /**
   * Get all doctors
   */
  async getAllDoctors(req, res) {
    try {
      const doctors = this.tokenService.isDatabaseAsync()
        ? await this.db.getAllDoctors()
        : this.db.getAllDoctors();

      return res.json({
        success: true,
        count: doctors.length,
        doctors,
      });
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get doctor by ID
   */
  async getDoctor(req, res) {
    try {
      const { doctorId } = req.params;

      const doctor = this.tokenService.isDatabaseAsync()
        ? await this.db.getDoctor(doctorId)
        : this.db.getDoctor(doctorId);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: "Doctor not found",
        });
      }

      return res.json({
        success: true,
        doctor,
      });
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Update doctor status
   */
  async updateDoctorStatus(req, res) {
    try {
      const { doctorId } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({
          success: false,
          error: "isActive field is required",
        });
      }

      const doctor = this.tokenService.isDatabaseAsync()
        ? await this.db.updateDoctorStatus(doctorId, isActive)
        : this.db.updateDoctorStatus(doctorId, isActive);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: "Doctor not found",
        });
      }

      return res.json({
        success: true,
        message: "Doctor status updated",
        doctor,
      });
    } catch (error) {
      console.error("Error updating doctor status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

module.exports = DoctorController;
