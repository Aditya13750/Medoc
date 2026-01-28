const express = require("express");
const router = express.Router();

module.exports = (database, tokenService) => {
  /**
   * POST /api/admin/doctors
   * Add a new doctor
   */
  router.post("/doctors", async (req, res) => {
    try {
      const { doctorId, name, specialization, contactNumber } = req.body;

      if (!doctorId || !name) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: doctorId and name",
        });
      }

      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const doctor = await database.addDoctor(
          doctorId,
          name,
          specialization || "General",
          contactNumber || "N/A"
        );

        return res.status(201).json({
          success: true,
          message: "Doctor added successfully",
          doctor,
        });
      } else {
        // In-memory
        const doctor = {
          doctorId,
          name,
          specialization: specialization || "General",
          contactNumber: contactNumber || "N/A",
          createdAt: new Date(),
        };
        database.addDoctor(doctor);

        return res.status(201).json({
          success: true,
          message: "Doctor added successfully",
          doctor,
        });
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  });

  /**
   * GET /api/admin/doctors
   * Get all doctors
   */
  router.get("/doctors", async (req, res) => {
    try {
      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const doctors = await database.getAllDoctors();
        return res.json({
          success: true,
          count: doctors.length,
          doctors,
        });
      } else {
        // In-memory
        const doctors = database.getAllDoctors();
        return res.json({
          success: true,
          count: doctors.length,
          doctors,
        });
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * POST /api/admin/time-slots
   * Add a new time slot for a doctor
   */
  router.post("/time-slots", async (req, res) => {
    try {
      const { doctorId, startTime, endTime, capacity } = req.body;

      if (!doctorId || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: doctorId, startTime, endTime",
        });
      }

      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const slot = await database.addTimeSlot(
          doctorId,
          startTime,
          endTime,
          capacity || 20
        );

        return res.status(201).json({
          success: true,
          message: "Time slot added successfully",
          slot,
        });
      } else {
        // In-memory
        const slot = {
          doctorId,
          startTime,
          endTime,
          capacity: capacity || 20,
          createdAt: new Date(),
        };
        database.addTimeSlot(slot);

        return res.status(201).json({
          success: true,
          message: "Time slot added successfully",
          slot,
        });
      }
    } catch (error) {
      console.error("Error adding time slot:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  });

  /**
   * GET /api/admin/time-slots/:doctorId
   * Get all time slots for a doctor
   */
  router.get("/time-slots/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;

      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const slots = await database.getTimeSlots(doctorId);
        return res.json({
          success: true,
          doctorId,
          count: slots ? slots.length : 0,
          slots: slots || [],
        });
      } else {
        // In-memory
        const slots = database.getTimeSlots(doctorId);
        return res.json({
          success: true,
          doctorId,
          count: slots.length,
          slots,
        });
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * GET /api/admin/queue/:doctorId
   * Get queue status for a doctor
   */
  router.get("/queue/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;

      const queueStatus = await tokenService.getQueueStatus(doctorId);

      return res.json({
        success: true,
        doctorId,
        queueLength: queueStatus.length,
        queue: queueStatus,
      });
    } catch (error) {
      console.error("Error fetching queue:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * GET /api/admin/analytics/:doctorId
   * Get analytics for a doctor
   */
  router.get("/analytics/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;

      const analytics = await tokenService.getDayAnalytics(doctorId);

      return res.json({
        success: true,
        doctorId,
        analytics,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * GET /api/admin/system-status
   * Get overall system status
   */
  router.get("/system-status", async (req, res) => {
    try {
      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        const status = await database.getSystemStatus();
        return res.json({
          success: true,
          database: "MongoDB",
          ...status,
        });
      } else {
        // In-memory
        const doctors = database.getAllDoctors();
        const patients = database.getAllPatients ? database.getAllPatients() : [];
        const tokens = database.getAllTokens();

        return res.json({
          success: true,
          database: "In-Memory",
          doctors: doctors.length,
          patients: patients.length,
          tokens: tokens.length,
          allocatedTokens: tokens.filter(t => t.status === "allocated").length,
          completedTokens: tokens.filter(t => t.status === "completed").length,
        });
      }
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * DELETE /api/admin/clear-data
   * Clear all data (use with caution!)
   */
  router.delete("/clear-data", async (req, res) => {
    try {
      const { confirm } = req.body;

      if (confirm !== "CONFIRM_DELETE_ALL") {
        return res.status(400).json({
          success: false,
          error: 'Confirmation required: pass { "confirm": "CONFIRM_DELETE_ALL" }',
        });
      }

      if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
        await database.clearAllData();
        return res.json({
          success: true,
          message: "All data cleared from MongoDB",
        });
      } else {
        // In-memory - no actual clear method, just return success
        return res.json({
          success: true,
          message: "All data cleared from in-memory database",
        });
      }
    } catch (error) {
      console.error("Error clearing data:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  /**
   * POST /api/admin/bulk-setup
   * Bulk setup doctors and time slots for testing
   */
  router.post("/bulk-setup", async (req, res) => {
    try {
      const { doctors, timeSlots } = req.body;

      if (!doctors || !Array.isArray(doctors)) {
        return res.status(400).json({
          success: false,
          error: "Invalid request: doctors array required",
        });
      }

      const results = {
        doctors: [],
        timeSlots: [],
      };

      // Add doctors
      for (const doctor of doctors) {
        try {
          let addedDoctor;
          if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
            addedDoctor = await database.addDoctor(
              doctor.doctorId,
              doctor.name,
              doctor.specialization || "General",
              doctor.contactNumber || "N/A"
            );
          } else {
            const doctorObj = {
              doctorId: doctor.doctorId,
              name: doctor.name,
              specialization: doctor.specialization || "General",
              contactNumber: doctor.contactNumber || "N/A",
              createdAt: new Date(),
            };
            database.addDoctor(doctorObj);
            addedDoctor = doctorObj;
          }
          results.doctors.push(addedDoctor);
        } catch (error) {
          console.error(`Error adding doctor ${doctor.doctorId}:`, error);
        }
      }

      // Add time slots if provided
      if (timeSlots && Array.isArray(timeSlots)) {
        for (const slot of timeSlots) {
          try {
            let addedSlot;
            if (tokenService.isDatabaseAsync && tokenService.isDatabaseAsync()) {
              addedSlot = await database.addTimeSlot(
                slot.doctorId,
                slot.startTime,
                slot.endTime,
                slot.capacity || 20
              );
            } else {
              const slotObj = {
                doctorId: slot.doctorId,
                startTime: slot.startTime,
                endTime: slot.endTime,
                capacity: slot.capacity || 20,
                createdAt: new Date(),
              };
              database.addTimeSlot(slotObj);
              addedSlot = slotObj;
            }
            results.timeSlots.push(addedSlot);
          } catch (error) {
            console.error(`Error adding time slot:`, error);
          }
        }
      }

      return res.status(201).json({
        success: true,
        message: "Bulk setup completed",
        results,
      });
    } catch (error) {
      console.error("Error in bulk setup:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  });

  return router;
};
