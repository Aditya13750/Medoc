/**
 * In-memory database for OPD Token Allocation System
 * In production, replace with actual database (MongoDB, PostgreSQL, etc.)
 */

class Database {
  constructor() {
    this.doctors = new Map();
    this.timeSlots = new Map();
    this.tokens = new Map();
    this.patients = new Map();
    this.queue = new Map(); // tokenId -> QueueEntry
    this.tokenCounter = 1000;
  }

  // ==================== DOCTOR MANAGEMENT ====================
  addDoctor(doctor) {
    this.doctors.set(doctor.id, doctor);
    this.queue.set(doctor.id, []);
    return doctor;
  }

  getDoctor(doctorId) {
    return this.doctors.get(doctorId);
  }

  getAllDoctors() {
    return Array.from(this.doctors.values());
  }

  updateDoctor(doctorId, updates) {
    const doctor = this.doctors.get(doctorId);
    if (doctor) {
      const updated = { ...doctor, ...updates };
      this.doctors.set(doctorId, updated);
      return updated;
    }
    return null;
  }

  // ==================== TIME SLOT MANAGEMENT ====================
  addTimeSlot(slot) {
    const key = `${slot.doctorId}_${slot.startTime}_${slot.endTime}`;
    this.timeSlots.set(key, slot);
    return slot;
  }

  getTimeSlot(doctorId, startTime, endTime) {
    const key = `${doctorId}_${startTime}_${endTime}`;
    return this.timeSlots.get(key);
  }

  getTimeSlotsByDoctor(doctorId) {
    const slots = [];
    for (const slot of this.timeSlots.values()) {
      if (slot.doctorId === doctorId) {
        slots.push(slot);
      }
    }
    return slots;
  }

  updateTimeSlot(doctorId, startTime, endTime, updates) {
    const key = `${doctorId}_${startTime}_${endTime}`;
    const slot = this.timeSlots.get(key);
    if (slot) {
      const updated = { ...slot, ...updates };
      this.timeSlots.set(key, updated);
      return updated;
    }
    return null;
  }

  getAllTimeSlots() {
    return Array.from(this.timeSlots.values());
  }

  // ==================== TOKEN MANAGEMENT ====================
  generateToken(token) {
    const tokenId = `TK-${this.tokenCounter}`;
    this.tokenCounter++;
    const newToken = { ...token, id: tokenId, createdAt: new Date() };
    this.tokens.set(tokenId, newToken);
    return newToken;
  }

  getToken(tokenId) {
    return this.tokens.get(tokenId);
  }

  getTokensByDoctor(doctorId) {
    const doctorTokens = [];
    for (const token of this.tokens.values()) {
      if (token.doctorId === doctorId) {
        doctorTokens.push(token);
      }
    }
    return doctorTokens;
  }

  getTokensByTimeSlot(doctorId, startTime, endTime) {
    const slotTokens = [];
    for (const token of this.tokens.values()) {
      if (
        token.doctorId === doctorId &&
        token.slotStartTime === startTime &&
        token.slotEndTime === endTime
      ) {
        slotTokens.push(token);
      }
    }
    return slotTokens;
  }

  getTokensByStatus(status) {
    const statusTokens = [];
    for (const token of this.tokens.values()) {
      if (token.status === status) {
        statusTokens.push(token);
      }
    }
    return statusTokens;
  }

  updateToken(tokenId, updates) {
    const token = this.tokens.get(tokenId);
    if (token) {
      const updated = { ...token, ...updates };
      this.tokens.set(tokenId, updated);
      return updated;
    }
    return null;
  }

  updateTokenStatus(tokenId, newStatus, notes = '') {
    const token = this.tokens.get(tokenId);
    if (token) {
      const updates = { status: newStatus };
      if (notes) updates.remarks = notes;
      
      // Update status-specific timestamp
      if (newStatus === 'called') {
        updates.calledAt = new Date();
      } else if (newStatus === 'completed') {
        updates.completedAt = new Date();
      } else if (newStatus === 'cancelled') {
        updates.cancelledAt = new Date();
      } else if (newStatus === 'no_show') {
        updates.noShowAt = new Date();
      }
      
      const updated = { ...token, ...updates };
      this.tokens.set(tokenId, updated);
      return updated;
    }
    return null;
  }

  deleteToken(tokenId) {
    return this.tokens.delete(tokenId);
  }

  getAllTokens() {
    return Array.from(this.tokens.values());
  }

  // ==================== PATIENT MANAGEMENT ====================
  addPatient(patient) {
    this.patients.set(patient.id, patient);
    return patient;
  }

  getPatient(patientId) {
    return this.patients.get(patientId);
  }

  updatePatient(patientId, updates) {
    const patient = this.patients.get(patientId);
    if (patient) {
      const updated = { ...patient, ...updates };
      this.patients.set(patientId, updated);
      return updated;
    }
    return null;
  }

  getAllPatients() {
    return Array.from(this.patients.values());
  }

  // ==================== QUEUE MANAGEMENT ====================
  addToQueue(doctorId, token) {
    if (!this.queue.has(doctorId)) {
      this.queue.set(doctorId, []);
    }
    const doctorQueue = this.queue.get(doctorId);
    doctorQueue.push(token);
    return token;
  }

  getQueue(doctorId) {
    return this.queue.get(doctorId) || [];
  }

  removeFromQueue(doctorId, tokenId) {
    if (this.queue.has(doctorId)) {
      const doctorQueue = this.queue.get(doctorId);
      const index = doctorQueue.findIndex((t) => t.id === tokenId);
      if (index > -1) {
        const removed = doctorQueue.splice(index, 1);
        return removed[0];
      }
    }
    return null;
  }

  getQueuePosition(doctorId, tokenId) {
    const doctorQueue = this.getQueue(doctorId);
    return doctorQueue.findIndex((t) => t.id === tokenId) + 1;
  }

  // ==================== ANALYTICS ====================
  getTokensBySource(doctorId, startTime, endTime, source) {
    const tokens = this.getTokensByTimeSlot(doctorId, startTime, endTime);
    return tokens.filter((t) => t.source === source);
  }

  getSlotUtilization(doctorId, startTime, endTime) {
    const slot = this.getTimeSlot(doctorId, startTime, endTime);
    if (!slot) return null;

    const allocatedTokens = this.getTokensByTimeSlot(doctorId, startTime, endTime);
    const activeTokens = allocatedTokens.filter(
      (t) => t.status === "allocated" || t.status === "called"
    );

    return {
      capacity: slot.capacity,
      allocated: activeTokens.length,
      utilization: (activeTokens.length / slot.capacity) * 100,
    };
  }

  clear() {
    this.doctors.clear();
    this.timeSlots.clear();
    this.tokens.clear();
    this.patients.clear();
    this.queue.clear();
    this.tokenCounter = 1000;
  }
}

module.exports = Database;
