const { v4: uuidv4 } = require("uuid");

/**
 * Token Allocation Algorithm Service
 * Handles dynamic allocation, reallocation, and prioritization
 * Works with both in-memory and MongoDB databases
 */
class TokenAllocationService {
  constructor(database) {
    this.db = database;
    this.PRIORITY_LEVELS = {
      emergency: 1,
      follow_up: 2,
      paid_priority: 3,
      walk_in: 4,
      online_booking: 5,
    };
    // Check if this is a MongoDB service (has async methods)
    this.isAsync = database && typeof database.getSystemStatus === 'function';
  }

  /**
   * Determine if database is MongoDB or in-memory
   */
  isDatabaseAsync() {
    return this.isAsync;
  }

  /**
   * Wrapper for both sync and async database operations
   */
  async dbGetTimeSlot(doctorId, startTime, endTime) {
    if (this.isDatabaseAsync()) {
      const slots = await this.db.getTimeSlots(doctorId);
      return slots ? slots.find(s => s.startTime === startTime && s.endTime === endTime) : null;
    }
    return this.db.getTimeSlot(doctorId, startTime, endTime);
  }

  async dbGetAllTokensByDoctor(doctorId) {
    if (this.isDatabaseAsync()) {
      return await this.db.getTokensByDoctor(doctorId);
    }
    return this.db.getTokensByDoctor(doctorId);
  }

  async dbGetToken(tokenId) {
    if (this.isDatabaseAsync()) {
      return await this.db.getToken(tokenId);
    }
    return this.db.getToken(tokenId);
  }

  async dbUpdateTokenStatus(tokenId, newStatus, notes = '') {
    if (this.isDatabaseAsync()) {
      return await this.db.updateTokenStatus(tokenId, newStatus, notes);
    }
    return this.db.updateTokenStatus(tokenId, newStatus, notes);
  }

  /**
   * Primary booking flow - allocate token to a patient
   */
  async bookToken(bookingRequest) {
    try {
      const { patientId, doctorId, slotStartTime, slotEndTime, source, isFollowUp } = bookingRequest;

      // Validate inputs
      if (!this.validateBookingRequest(bookingRequest)) {
        return { success: false, error: "Invalid booking request" };
      }

      // Get the time slot
      const slot = await this.dbGetTimeSlot(doctorId, slotStartTime, slotEndTime);
      if (!slot) {
        return { success: false, error: "Time slot not found" };
      }

      // Check slot availability
      const currentUtilization = await this.getSlotUtilization(doctorId, slotStartTime, slotEndTime);
      if (currentUtilization.allocated >= slot.capacity) {
        // Slot is full, check if reallocation is possible
        const reallocationResult = await this.attemptReallocation(
          doctorId,
          slotStartTime,
          slotEndTime,
          source
        );

        if (!reallocationResult.success) {
          return {
            success: false,
            error: "Slot capacity full and no reallocation possible",
            waitlist: true,
          };
        }
      }

      // Determine priority
      let priority = this.PRIORITY_LEVELS[source] || 5;
      if (isFollowUp) {
        priority = this.PRIORITY_LEVELS.follow_up;
      }

      // Create token object
      const tokenData = {
        patientId,
        doctorId,
        slotStartTime,
        slotEndTime,
        source,
        priority,
        status: "allocated",
        isFollowUp: isFollowUp || false,
        allocatedAt: new Date(),
        calledAt: null,
        completedAt: null,
        cancelledAt: null,
        noShowAt: null,
        remarks: "",
      };

      // For in-memory database
      if (!this.isDatabaseAsync()) {
        const newToken = this.db.generateToken(tokenData);
        this.db.addToQueue(doctorId, newToken);
        this.sortQueueByPriority(doctorId);

        return {
          success: true,
          token: newToken,
          queuePosition: this.db.getQueuePosition(doctorId, newToken.id),
        };
      } else {
        // For MongoDB - use service directly
        const newToken = await this.db.addToken(
          `TKN-${Date.now()}-${uuidv4().substring(0, 8)}`,
          patientId,
          doctorId,
          slotStartTime,
          slotEndTime,
          source,
          priority,
          isFollowUp,
          false
        );

        return {
          success: true,
          token: newToken,
          tokenId: newToken.tokenId
        };
      }
    } catch (error) {
      console.error("Error booking token:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate booking request
   */
  validateBookingRequest(request) {
    const required = ['patientId', 'doctorId', 'slotStartTime', 'slotEndTime', 'source'];
    return required.every(field => request[field] !== undefined && request[field] !== null);
  }

  /**
   * Attempt to reallocate tokens from lower priority sources
   */
  async attemptReallocation(doctorId, slotStartTime, slotEndTime, newSource) {
    try {
      const tokens = await this.dbGetAllTokensByDoctor(doctorId);
      const relevantTokens = tokens.filter(t => 
        t.slotStartTime === slotStartTime && 
        t.slotEndTime === slotEndTime &&
        (t.status === "allocated" || t.status === "called")
      );

      const newSourcePriority = this.PRIORITY_LEVELS[newSource] || 5;

      // Find tokens with lower priority (higher number = lower priority)
      const candidatesForReallocation = relevantTokens.filter((token) => {
        return token.priority > newSourcePriority && token.status === "allocated";
      });

      if (candidatesForReallocation.length > 0) {
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error("Error attempting reallocation:", error);
      return { success: false };
    }
  }

  /**
   * Handle emergency insertion
   */
  async handleEmergency(bookingRequest) {
    try {
      const { patientId, doctorId, slotStartTime, slotEndTime } = bookingRequest;

      const slot = await this.dbGetTimeSlot(doctorId, slotStartTime, slotEndTime);
      if (!slot && !this.isDatabaseAsync()) {
        return { success: false, error: "Time slot not found" };
      }

      if (this.isDatabaseAsync()) {
        const newToken = await this.db.addToken(
          `EMG-${Date.now()}-${uuidv4().substring(0, 8)}`,
          patientId,
          doctorId,
          slotStartTime || Date.now(),
          slotEndTime || Date.now() + 1800000,
          "emergency",
          this.PRIORITY_LEVELS.emergency,
          false,
          true
        );

        return {
          success: true,
          token: newToken,
          tokenId: newToken.tokenId,
          capacityOverride: true,
        };
      } else {
        // In-memory database
        const token = {
          patientId,
          doctorId,
          slotStartTime,
          slotEndTime,
          source: "emergency",
          priority: this.PRIORITY_LEVELS.emergency,
          status: "allocated",
          isFollowUp: false,
          isEmergency: true,
          allocatedAt: new Date(),
          remarks: "EMERGENCY - OVERRIDE CAPACITY",
        };

        const newToken = this.db.generateToken(token);
        this.db.addToQueue(doctorId, newToken);
        this.sortQueueByPriority(doctorId);

        return {
          success: true,
          token: newToken,
          queuePosition: this.db.getQueuePosition(doctorId, newToken.id),
          capacityOverride: true,
        };
      }
    } catch (error) {
      console.error("Error handling emergency:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel token
   */
  async cancelToken(tokenId, reason) {
    try {
      const token = await this.dbGetToken(tokenId);
      if (!token) {
        return { success: false, error: "Token not found" };
      }

      if (token.status === "completed" || token.status === "cancelled") {
        return { success: false, error: `Cannot cancel token with status: ${token.status}` };
      }

      const updatedToken = await this.dbUpdateTokenStatus(tokenId, "cancelled", reason);

      if (this.isDatabaseAsync()) {
        // Remove from MongoDB queue
        await this.db.removeTokenFromQueue(token.doctorId, tokenId);
      } else {
        this.db.removeFromQueue(token.doctorId, tokenId);
      }

      return {
        success: true,
        token: updatedToken,
      };
    } catch (error) {
      console.error("Error cancelling token:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark token as called
   */
  async callToken(tokenId, consultationStartTime) {
    try {
      const token = await this.dbGetToken(tokenId);
      if (!token || (token.status !== "allocated" && token.status !== "called")) {
        return { success: false, error: "Token cannot be called" };
      }

      const updatedToken = await this.dbUpdateTokenStatus(
        tokenId,
        "called",
        ""
      );

      return { success: true, token: updatedToken };
    } catch (error) {
      console.error("Error calling token:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark token as completed
   */
  async completeToken(tokenId, consultationNotes) {
    try {
      const token = await this.dbGetToken(tokenId);
      if (!token) {
        return { success: false, error: "Token not found" };
      }

      const updatedToken = await this.dbUpdateTokenStatus(
        tokenId,
        "completed",
        consultationNotes || ""
      );

      if (this.isDatabaseAsync()) {
        await this.db.removeTokenFromQueue(token.doctorId, tokenId);
      } else {
        this.db.removeFromQueue(token.doctorId, tokenId);
      }

      return { success: true, token: updatedToken };
    } catch (error) {
      console.error("Error completing token:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark token as no-show
   */
  async markNoShow(tokenId, reason) {
    try {
      const token = await this.dbGetToken(tokenId);
      if (!token) {
        return { success: false, error: "Token not found" };
      }

      const updatedToken = await this.dbUpdateTokenStatus(
        tokenId,
        "no_show",
        reason || "No-show"
      );

      if (this.isDatabaseAsync()) {
        await this.db.removeTokenFromQueue(token.doctorId, tokenId);
      } else {
        this.db.removeFromQueue(token.doctorId, tokenId);
      }

      return { success: true, token: updatedToken };
    } catch (error) {
      console.error("Error marking no-show:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get slot utilization
   */
  async getSlotUtilization(doctorId, slotStartTime, slotEndTime) {
    try {
      const slot = await this.dbGetTimeSlot(doctorId, slotStartTime, slotEndTime);
      if (!slot) return { allocated: 0, capacity: 0, utilization: 0 };

      const tokens = await this.dbGetAllTokensByDoctor(doctorId);
      const slotTokens = tokens.filter(
        t => t.slotStartTime === slotStartTime &&
             t.slotEndTime === slotEndTime &&
             (t.status === "allocated" || t.status === "called")
      );

      return {
        capacity: slot.capacity,
        allocated: slotTokens.length,
        utilization: (slotTokens.length / slot.capacity) * 100,
      };
    } catch (error) {
      console.error("Error getting slot utilization:", error);
      return { allocated: 0, capacity: 0, utilization: 0 };
    }
  }

  /**
   * Sort queue by priority
   */
  sortQueueByPriority(doctorId) {
    const queue = this.db.getQueue(doctorId);
    queue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get queue status
   */
  async getQueueStatus(doctorId) {
    try {
      if (this.isDatabaseAsync()) {
        const queue = await this.db.getQueue(doctorId);
        return (queue.tokens || []).map((token, index) => ({
          position: index + 1,
          tokenId: token.tokenId,
          priority: token.priority,
          status: token.status,
        }));
      } else {
        const queue = this.db.getQueue(doctorId);
        return queue.map((token, index) => ({
          position: index + 1,
          tokenId: token.id,
          patientId: token.patientId,
          source: token.source,
          priority: token.priority,
          status: token.status,
          isFollowUp: token.isFollowUp,
          slotStartTime: token.slotStartTime,
          slotEndTime: token.slotEndTime,
        }));
      }
    } catch (error) {
      console.error("Error getting queue status:", error);
      return [];
    }
  }

  /**
   * Get day analytics
   */
  async getDayAnalytics(doctorId) {
    try {
      if (this.isDatabaseAsync()) {
        const tokens = await this.db.getTokensByDoctor(doctorId);
        
        // Build source breakdown
        const sourceBreakdown = {
          online_booking: tokens.filter(t => t.source === "online_booking").length,
          walk_in: tokens.filter(t => t.source === "walk_in").length,
          paid_priority: tokens.filter(t => t.source === "paid_priority").length,
          emergency: tokens.filter(t => t.source === "emergency").length,
        };
        
        // Build slot utilization
        const slotUtilization = {};
        const allSlots = await this.db.getTimeSlots(doctorId);
        if (allSlots) {
          allSlots.forEach(slot => {
            const slotTokens = tokens.filter(t => t.slotStartTime === slot.startTime && t.slotEndTime === slot.endTime);
            const activeTokens = slotTokens.filter(t => t.status === "allocated" || t.status === "called");
            const slotKey = `${slot.startTime}-${slot.endTime}`;
            slotUtilization[slotKey] = {
              capacity: slot.capacity,
              allocated: activeTokens.length,
              utilization: (activeTokens.length / slot.capacity) * 100,
            };
          });
        }
        
        return {
          doctorId,
          totalTokensAllocated: tokens.filter(t => t.status === "allocated").length,
          totalTokensCalled: tokens.filter(t => t.status === "called").length,
          totalTokensCompleted: tokens.filter(t => t.status === "completed").length,
          totalNoShows: tokens.filter(t => t.status === "no_show").length,
          totalCancellations: tokens.filter(t => t.status === "cancelled").length,
          totalEmergencies: tokens.filter(t => t.isEmergency).length,
          totalFollowUps: tokens.filter(t => t.isFollowUp).length,
          sourceBreakdown,
          slotUtilization,
        };
      } else {
        const tokens = this.db.getTokensByDoctor(doctorId);
        
        // Build source breakdown
        const sourceBreakdown = {
          online_booking: tokens.filter(t => t.source === "online_booking").length,
          walk_in: tokens.filter(t => t.source === "walk_in").length,
          paid_priority: tokens.filter(t => t.source === "paid_priority").length,
          emergency: tokens.filter(t => t.source === "emergency").length,
        };
        
        // Build slot utilization
        const slotUtilization = {};
        const allSlots = this.db.getTimeSlotsByDoctor(doctorId);
        allSlots.forEach(slot => {
          const slotTokens = tokens.filter(t => t.slotStartTime === slot.startTime && t.slotEndTime === slot.endTime);
          const activeTokens = slotTokens.filter(t => t.status === "allocated" || t.status === "called");
          const slotKey = `${slot.startTime}-${slot.endTime}`;
          slotUtilization[slotKey] = {
            capacity: slot.capacity,
            allocated: activeTokens.length,
            utilization: (activeTokens.length / slot.capacity) * 100,
          };
        });
        
        return {
          doctorId,
          totalTokensAllocated: tokens.filter(t => t.status === "allocated").length,
          totalTokensCalled: tokens.filter(t => t.status === "called").length,
          totalTokensCompleted: tokens.filter(t => t.status === "completed").length,
          totalNoShows: tokens.filter(t => t.status === "no_show").length,
          totalCancellations: tokens.filter(t => t.status === "cancelled").length,
          totalEmergencies: tokens.filter(t => t.isEmergency).length,
          totalFollowUps: tokens.filter(t => t.isFollowUp).length,
          sourceBreakdown,
          slotUtilization,
        };
      }
    } catch (error) {
      console.error("Error getting day analytics:", error);
      return {};
    }
  }
}

module.exports = TokenAllocationService;
