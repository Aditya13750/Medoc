/**
 * Admin Controller - Handles admin and system operations
 */
class AdminController {
  constructor(database, tokenService) {
    this.db = database;
    this.tokenService = tokenService;
  }

  /**
   * Add a new time slot
   */
  async addTimeSlot(req, res) {
    try {
      const { doctorId, startTime, endTime, capacity } = req.body;

      if (!doctorId || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: doctorId, startTime, endTime",
        });
      }

      const slot = this.tokenService.isDatabaseAsync()
        ? await this.db.addTimeSlot(doctorId, startTime, endTime, capacity || 20)
        : this.db.addTimeSlot({
            doctorId,
            startTime,
            endTime,
            capacity: capacity || 20,
            isActive: true,
            createdAt: new Date(),
          });

      return res.status(201).json({
        success: true,
        message: "Time slot added successfully",
        slot,
      });
    } catch (error) {
      console.error("Error adding time slot:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  /**
   * Get time slots for a doctor
   */
  async getTimeSlots(req, res) {
    try {
      const { doctorId } = req.params;

      const slots = this.tokenService.isDatabaseAsync()
        ? await this.db.getTimeSlots(doctorId)
        : this.db.getTimeSlots(doctorId);

      return res.json({
        success: true,
        doctorId,
        count: slots.length,
        slots,
      });
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get queue status for a doctor
   */
  async getQueueStatus(req, res) {
    try {
      const { doctorId } = req.params;

      const queue = this.tokenService.isDatabaseAsync()
        ? await this.db.getQueue(doctorId)
        : this.db.getQueue(doctorId);

      if (!queue) {
        return res.json({
          success: true,
          doctorId,
          queueLength: 0,
          tokens: [],
        });
      }

      return res.json({
        success: true,
        doctorId,
        queueLength: queue.tokens ? queue.tokens.length : 0,
        tokens: queue.tokens || [],
      });
    } catch (error) {
      console.error("Error fetching queue status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get doctor analytics
   */
  async getDoctorAnalytics(req, res) {
    try {
      const { doctorId } = req.params;

      const tokens = this.tokenService.isDatabaseAsync()
        ? await this.db.getTokensByDoctor(doctorId)
        : this.db.getTokensByDoctor(doctorId);

      const analytics = {
        doctorId,
        totalTokens: tokens.length,
        allocated: tokens.filter((t) => t.status === "allocated").length,
        called: tokens.filter((t) => t.status === "called").length,
        completed: tokens.filter((t) => t.status === "completed").length,
        cancelled: tokens.filter((t) => t.status === "cancelled").length,
        noShow: tokens.filter((t) => t.status === "no_show").length,
        emergencies: tokens.filter((t) => t.priority === 1).length,
        followUps: tokens.filter((t) => t.isFollowUp).length,
        averageWaitTime: this.calculateAverageWaitTime(tokens),
      };

      return res.json({
        success: true,
        analytics,
      });
    } catch (error) {
      console.error("Error fetching doctor analytics:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(req, res) {
    try {
      const doctors = this.tokenService.isDatabaseAsync()
        ? await this.db.getAllDoctors()
        : this.db.getAllDoctors();

      const tokens = this.tokenService.isDatabaseAsync()
        ? await this.db.getAllocatedTokens()
        : this.db.getAllTokens();

      const patients = this.tokenService.isDatabaseAsync()
        ? await this.db.getAllPatients()
        : this.db.getAllPatients();

      const status = {
        timestamp: new Date(),
        doctors: {
          total: doctors.length,
          active: doctors.filter((d) => d.isActive !== false).length,
        },
        tokens: {
          total: tokens.length,
          allocated: tokens.filter((t) => t.status === "allocated").length,
          called: tokens.filter((t) => t.status === "called").length,
          completed: tokens.filter((t) => t.status === "completed").length,
          cancelled: tokens.filter((t) => t.status === "cancelled").length,
          noShow: tokens.filter((t) => t.status === "no_show").length,
          emergencies: tokens.filter((t) => t.priority === 1).length,
        },
        patients: {
          total: patients.length,
        },
        database: this.tokenService.isDatabaseAsync() ? "MongoDB" : "In-Memory",
      };

      return res.json({
        success: true,
        status,
      });
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Clear all data (with confirmation)
   */
  async clearAllData(req, res) {
    try {
      const { confirmationToken } = req.body;

      // Safety measure: require a specific token to clear data
      if (confirmationToken !== "CONFIRM_CLEAR_ALL_DATA_2024") {
        return res.status(403).json({
          success: false,
          error: "Invalid confirmation token. Data not cleared.",
        });
      }

      if (this.tokenService.isDatabaseAsync()) {
        await this.db.clearAllData();
      } else {
        this.db.clearAllData();
      }

      return res.json({
        success: true,
        message: "All data has been cleared",
      });
    } catch (error) {
      console.error("Error clearing data:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Bulk setup - create sample data
   */
  async bulkSetup(req, res) {
    try {
      const { doctors, slots } = req.body;

      if (!doctors || !Array.isArray(doctors)) {
        return res.status(400).json({
          success: false,
          error: "doctors array is required",
        });
      }

      const createdDoctors = [];
      const createdSlots = [];

      // Create doctors
      for (const doctorData of doctors) {
        const doctor = this.tokenService.isDatabaseAsync()
          ? await this.db.addDoctor(
              doctorData.doctorId,
              doctorData.name,
              doctorData.specialization || "General",
              doctorData.contactNumber || "N/A"
            )
          : this.db.addDoctor(doctorData);

        createdDoctors.push(doctor);

        // Create time slots if provided
        if (doctorData.slots && Array.isArray(doctorData.slots)) {
          for (const slotData of doctorData.slots) {
            const slot = this.tokenService.isDatabaseAsync()
              ? await this.db.addTimeSlot(
                  doctorData.doctorId,
                  slotData.startTime,
                  slotData.endTime,
                  slotData.capacity || 20
                )
              : this.db.addTimeSlot(slotData);

            createdSlots.push(slot);
          }
        }
      }

      return res.status(201).json({
        success: true,
        message: "Bulk setup completed",
        doctors: createdDoctors.length,
        slots: createdSlots.length,
      });
    } catch (error) {
      console.error("Error during bulk setup:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  /**
   * Helper: Calculate average wait time
   */
  calculateAverageWaitTime(tokens) {
    if (tokens.length === 0) return 0;

    const completedTokens = tokens.filter(
      (t) => t.completedAt && t.allocatedAt
    );

    if (completedTokens.length === 0) return 0;

    const totalWaitTime = completedTokens.reduce((sum, token) => {
      const wait =
        new Date(token.completedAt) - new Date(token.allocatedAt);
      return sum + wait;
    }, 0);

    const averageMs = totalWaitTime / completedTokens.length;
    return Math.round(averageMs / 60000); // Convert to minutes
  }
}

module.exports = AdminController;
