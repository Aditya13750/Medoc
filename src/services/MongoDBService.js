const { Doctor, TimeSlot, Token, Patient, Queue } = require('../models/MongoDBModels');

/**
 * MongoDB Service Layer
 * Replaces in-memory Database class with MongoDB async operations
 */
class MongoDBService {
  
  // ==================== DOCTOR OPERATIONS ====================

  async addDoctor(doctorId, name, specialization = 'General', contactNumber = 'N/A') {
    try {
      const doctor = new Doctor({
        doctorId,
        name,
        specialization,
        contactNumber,
        isActive: true
      });
      await doctor.save();
      return doctor;
    } catch (error) {
      throw new Error(`Error adding doctor: ${error.message}`);
    }
  }

  async getDoctor(doctorId) {
    try {
      return await Doctor.findOne({ doctorId });
    } catch (error) {
      throw new Error(`Error getting doctor: ${error.message}`);
    }
  }

  async getAllDoctors() {
    try {
      return await Doctor.find({ isActive: true }).lean();
    } catch (error) {
      throw new Error(`Error getting all doctors: ${error.message}`);
    }
  }

  async updateDoctorStatus(doctorId, isActive) {
    try {
      return await Doctor.findOneAndUpdate(
        { doctorId },
        { isActive },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating doctor status: ${error.message}`);
    }
  }

  // ==================== TIME SLOT OPERATIONS ====================

  async addTimeSlot(doctorId, startTime, endTime, capacity = 20) {
    try {
      const slot = new TimeSlot({
        doctorId,
        startTime,
        endTime,
        capacity,
        isActive: true
      });
      await slot.save();
      return slot;
    } catch (error) {
      throw new Error(`Error adding time slot: ${error.message}`);
    }
  }

  async getTimeSlots(doctorId) {
    try {
      return await TimeSlot.find({ doctorId, isActive: true }).lean();
    } catch (error) {
      throw new Error(`Error getting time slots: ${error.message}`);
    }
  }

  async getAllTimeSlots() {
    try {
      return await TimeSlot.find({ isActive: true }).lean();
    } catch (error) {
      throw new Error(`Error getting all time slots: ${error.message}`);
    }
  }

  async getTimeSlotById(slotId) {
    try {
      return await TimeSlot.findById(slotId).lean();
    } catch (error) {
      throw new Error(`Error getting time slot by id: ${error.message}`);
    }
  }

  // ==================== TOKEN OPERATIONS ====================

  async addToken(tokenId, patientId, doctorId, slotStartTime, slotEndTime, source, priority, isFollowUp = false, isEmergency = false) {
    try {
      const token = new Token({
        tokenId,
        patientId,
        doctorId,
        slotStartTime,
        slotEndTime,
        source,
        priority,
        isFollowUp,
        isEmergency,
        status: 'allocated',
        allocatedAt: new Date()
      });
      await token.save();
      return token;
    } catch (error) {
      throw new Error(`Error adding token: ${error.message}`);
    }
  }

  async getToken(tokenId) {
    try {
      return await Token.findOne({ tokenId }).lean();
    } catch (error) {
      throw new Error(`Error getting token: ${error.message}`);
    }
  }

  async getTokensByDoctor(doctorId) {
    try {
      return await Token.find({ doctorId }).sort({ priority: -1 }).lean();
    } catch (error) {
      throw new Error(`Error getting tokens by doctor: ${error.message}`);
    }
  }

  async getTokensByPatient(patientId) {
    try {
      return await Token.find({ patientId }).sort({ createdAt: -1 }).lean();
    } catch (error) {
      throw new Error(`Error getting tokens by patient: ${error.message}`);
    }
  }

  async getTokensByStatus(status) {
    try {
      return await Token.find({ status }).lean();
    } catch (error) {
      throw new Error(`Error getting tokens by status: ${error.message}`);
    }
  }

  async getTokensByDoctorAndStatus(doctorId, status) {
    try {
      return await Token.find({ doctorId, status }).sort({ priority: -1 }).lean();
    } catch (error) {
      throw new Error(`Error getting tokens: ${error.message}`);
    }
  }

  async updateTokenStatus(tokenId, newStatus, notes = '') {
    try {
      const updateData = { status: newStatus };
      
      if (newStatus === 'called') {
        updateData.calledAt = new Date();
      } else if (newStatus === 'completed') {
        updateData.completedAt = new Date();
      } else if (newStatus === 'cancelled') {
        updateData.cancelledAt = new Date();
      } else if (newStatus === 'no_show') {
        updateData.noShowAt = new Date();
      }

      if (notes) {
        updateData.consultationNotes = notes;
      }

      return await Token.findOneAndUpdate(
        { tokenId },
        updateData,
        { new: true }
      ).lean();
    } catch (error) {
      throw new Error(`Error updating token status: ${error.message}`);
    }
  }

  async getAllocatedTokens(doctorId) {
    try {
      return await Token.find({
        doctorId,
        status: { $in: ['allocated', 'called'] }
      }).sort({ priority: -1 }).lean();
    } catch (error) {
      throw new Error(`Error getting allocated tokens: ${error.message}`);
    }
  }

  async deleteToken(tokenId) {
    try {
      return await Token.findOneAndDelete({ tokenId });
    } catch (error) {
      throw new Error(`Error deleting token: ${error.message}`);
    }
  }

  async updateTokenDoctor(tokenId, newDoctorId, newSlotStartTime, newSlotEndTime) {
    try {
      return await Token.findOneAndUpdate(
        { tokenId },
        {
          doctorId: newDoctorId,
          slotStartTime: newSlotStartTime,
          slotEndTime: newSlotEndTime,
          reallocatedAt: new Date()
        },
        { new: true }
      ).lean();
    } catch (error) {
      throw new Error(`Error reallocating token: ${error.message}`);
    }
  }

  // ==================== PATIENT OPERATIONS ====================

  async addPatient(patientId, name, phone, email = '', age = null, gender = null, address = '', isFollowUp = false) {
    try {
      const patient = new Patient({
        patientId,
        name,
        phone,
        email,
        age,
        gender,
        address,
        isFollowUp
      });
      await patient.save();
      return patient;
    } catch (error) {
      throw new Error(`Error adding patient: ${error.message}`);
    }
  }

  async getPatient(patientId) {
    try {
      return await Patient.findOne({ patientId }).lean();
    } catch (error) {
      throw new Error(`Error getting patient: ${error.message}`);
    }
  }

  async getPatientByPhone(phone) {
    try {
      return await Patient.findOne({ phone }).lean();
    } catch (error) {
      throw new Error(`Error getting patient by phone: ${error.message}`);
    }
  }

  async getAllPatients() {
    try {
      return await Patient.find().lean();
    } catch (error) {
      throw new Error(`Error getting all patients: ${error.message}`);
    }
  }

  async updatePatient(patientId, updates) {
    try {
      return await Patient.findOneAndUpdate(
        { patientId },
        updates,
        { new: true }
      ).lean();
    } catch (error) {
      throw new Error(`Error updating patient: ${error.message}`);
    }
  }

  // ==================== QUEUE OPERATIONS ====================

  async getQueue(doctorId) {
    try {
      let queue = await Queue.findOne({ doctorId }).lean();
      if (!queue) {
        queue = { doctorId, tokens: [] };
      }
      return queue;
    } catch (error) {
      throw new Error(`Error getting queue: ${error.message}`);
    }
  }

  async updateQueue(doctorId, tokens) {
    try {
      return await Queue.findOneAndUpdate(
        { doctorId },
        { tokens },
        { upsert: true, new: true }
      ).lean();
    } catch (error) {
      throw new Error(`Error updating queue: ${error.message}`);
    }
  }

  async addTokenToQueue(doctorId, tokenId, priority, position) {
    try {
      let queue = await Queue.findOne({ doctorId });
      if (!queue) {
        queue = new Queue({ doctorId, tokens: [] });
      }
      
      queue.tokens.push({ tokenId, position, priority });
      await queue.save();
      return queue;
    } catch (error) {
      throw new Error(`Error adding token to queue: ${error.message}`);
    }
  }

  async removeTokenFromQueue(doctorId, tokenId) {
    try {
      return await Queue.findOneAndUpdate(
        { doctorId },
        { $pull: { tokens: { tokenId } } },
        { new: true }
      ).lean();
    } catch (error) {
      throw new Error(`Error removing token from queue: ${error.message}`);
    }
  }

  // ==================== BULK OPERATIONS ====================

  async clearAllData() {
    try {
      await Doctor.deleteMany({});
      await TimeSlot.deleteMany({});
      await Token.deleteMany({});
      await Patient.deleteMany({});
      await Queue.deleteMany({});
      return { success: true, message: 'All data cleared' };
    } catch (error) {
      throw new Error(`Error clearing data: ${error.message}`);
    }
  }

  async getSystemStatus() {
    try {
      const doctors = await Doctor.countDocuments();
      const patients = await Patient.countDocuments();
      const tokens = await Token.countDocuments();
      const allocatedTokens = await Token.countDocuments({ status: 'allocated' });
      const completedTokens = await Token.countDocuments({ status: 'completed' });

      return {
        doctors,
        patients,
        tokens,
        allocatedTokens,
        completedTokens,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Error getting system status: ${error.message}`);
    }
  }
}

module.exports = new MongoDBService();
