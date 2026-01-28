const express = require("express");
const router = express.Router();

module.exports = (database, tokenService) => {
  /**
   * POST /api/admin/doctors
   * Register a new doctor
   */
  router.post("/doctors", (req, res) => {
    try {
      const { id, name, specialization, contactNumber } = req.body;

      if (!id || !name) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields (id, name)",
        });
      }

      const doctor = {
        id,
        name,
        specialization: specialization || "General",
        contactNumber: contactNumber || "N/A",
        createdAt: new Date(),
        isActive: true,
      };

      database.addDoctor(doctor);

      res.status(201).json({
        success: true,
        doctor,
        message: "Doctor registered successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/admin/doctors
   * Get all doctors
   */
  router.get("/doctors", (req, res) => {
    try {
      const doctors = database.getAllDoctors();

      res.json({
        success: true,
        count: doctors.length,
        doctors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/admin/doctors/:doctorId
   * Get doctor details
   */
  router.get("/doctors/:doctorId", (req, res) => {
    try {
      const { doctorId } = req.params;
      const doctor = database.getDoctor(doctorId);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: "Doctor not found",
        });
      }

      const timeSlots = database.getTimeSlotsByDoctor(doctorId);

      res.json({
        success: true,
        doctor,
        timeSlots,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/admin/time-slots
   * Create a new time slot
   */
  router.post("/time-slots", (req, res) => {
    try {
      const { doctorId, startTime, endTime, capacity } = req.body;

      if (!doctorId || !startTime || !endTime || !capacity) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      // Check if doctor exists
      const doctor = database.getDoctor(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: "Doctor not found",
        });
      }

      const slot = {
        doctorId,
        startTime,
        endTime,
        capacity,
        createdAt: new Date(),
        isActive: true,
      };

      database.addTimeSlot(slot);

      res.status(201).json({
        success: true,
        slot,
        message: "Time slot created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/admin/time-slots
   * Get all time slots
   */
  router.get("/time-slots", (req, res) => {
    try {
      const { doctorId } = req.query;

      let slots = database.getAllTimeSlots();

      if (doctorId) {
        slots = slots.filter((s) => s.doctorId === doctorId);
      }

      res.json({
        success: true,
        count: slots.length,
        slots,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/admin/queue/:doctorId
   * Get queue status for a doctor
   */
  router.get("/queue/:doctorId", (req, res) => {
    try {
      const { doctorId } = req.params;

      const doctor = database.getDoctor(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: "Doctor not found",
        });
      }

      const queueStatus = tokenService.getQueueStatus(doctorId);

      res.json({
        success: true,
        doctorId,
        queueCount: queueStatus.length,
        queue: queueStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/admin/analytics/:doctorId
   * Get analytics for a doctor
   */
  router.get("/analytics/:doctorId", (req, res) => {
    try {
      const { doctorId } = req.params;

      const doctor = database.getDoctor(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: "Doctor not found",
        });
      }

      const analytics = tokenService.getDayAnalytics(doctorId);

      res.json({
        success: true,
        analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/admin/slot-utilization/:doctorId
   * Get slot utilization details
   */
  router.get("/slot-utilization/:doctorId", (req, res) => {
    try {
      const { doctorId } = req.params;

      const slots = database.getTimeSlotsByDoctor(doctorId);
      const utilization = [];

      for (const slot of slots) {
        const util = tokenService.getSlotUtilization(
          doctorId,
          slot.startTime,
          slot.endTime
        );
        if (util) {
          utilization.push({
            slotTime: `${slot.startTime}-${slot.endTime}`,
            ...util,
          });
        }
      }

      res.json({
        success: true,
        doctorId,
        slotUtilization: utilization,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/admin/patients
   * Get all patients
   */
  router.get("/patients", (req, res) => {
    try {
      const patients = database.getAllPatients();

      res.json({
        success: true,
        count: patients.length,
        patients,
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
