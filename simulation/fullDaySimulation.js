const Database = require("../src/models/Database");
const TokenAllocationService = require("../src/services/TokenAllocationService");
const moment = require("moment");

/**
 * OPD Simulation - Full Day Scenario
 * Simulates a complete day with 3 doctors, multiple token sources, and real-world events
 */

class OPDSimulation {
  constructor() {
    this.database = new Database();
    this.tokenService = new TokenAllocationService(this.database);
    this.simulationEvents = [];
    this.doctors = [];
    this.patients = [];
    this.simulationStartTime = new Date();
  }

  /**
   * Initialize simulation with doctors and time slots
   */
  setupSimulation() {
    console.log("\n========================================");
    console.log("🏥 OPD TOKEN ALLOCATION SYSTEM");
    console.log("📅 Simulation Setup");
    console.log("========================================\n");

    // Clear previous data
    this.database.clear();

    // Setup Doctors
    this.doctors = [
      {
        id: "DOC-001",
        name: "Dr. Sharma",
        specialization: "Cardiology",
        contactNumber: "+91-9876-543210",
      },
      {
        id: "DOC-002",
        name: "Dr. Patel",
        specialization: "Neurology",
        contactNumber: "+91-9876-543211",
      },
      {
        id: "DOC-003",
        name: "Dr. Gupta",
        specialization: "General Medicine",
        contactNumber: "+91-9876-543212",
      },
    ];

    // Register doctors
    this.doctors.forEach((doc) => {
      this.database.addDoctor(doc);
      console.log(`✓ Doctor registered: ${doc.name} (${doc.specialization})`);
    });

    console.log("\n📋 Setting up Time Slots...\n");

    // Setup Time Slots
    // Each doctor has 4 slots: 9-10, 10-11, 11-12, 12-1
    const slotConfigs = [
      { start: 900, end: 1000, capacity: 20 },
      { start: 1000, end: 1100, capacity: 20 },
      { start: 1100, end: 1200, capacity: 20 },
      { start: 1200, end: 1300, capacity: 20 },
    ];

    this.doctors.forEach((doctor) => {
      slotConfigs.forEach((slot) => {
        this.database.addTimeSlot({
          doctorId: doctor.id,
          startTime: slot.start,
          endTime: slot.end,
          capacity: slot.capacity,
          isActive: true,
        });
        console.log(
          `  ✓ ${doctor.name}: ${slot.start / 100}:00-${slot.end / 100}:00 (Capacity: ${slot.capacity})`
        );
      });
    });

    // Create pool of patients
    console.log("\n👥 Creating Patient Pool...\n");
    this.createPatientPool();

    console.log("\n✅ Simulation setup complete!\n");
  }

  /**
   * Create a pool of patients for the simulation
   */
  createPatientPool() {
    const patientNames = [
      "Rajesh Kumar",
      "Priya Singh",
      "Amit Sharma",
      "Neha Verma",
      "Vikram Patel",
      "Anjali Gupta",
      "Suresh Reddy",
      "Meera Dutta",
      "Arjun Nair",
      "Divya Krishnan",
      "Rohit Mishra",
      "Sunita Bansal",
      "Arun Mehta",
      "Pooja Saxena",
      "Nikhil Joshi",
      "Kavya Singh",
      "Ramesh Yadav",
      "Sneha Kapoor",
      "Sanjay Bhat",
      "Akshara Pillai",
      "Deepak Sharma",
      "Isha Desai",
      "Vivek Nambiar",
      "Harini Iyer",
      "Abhishek Sharma",
      "Shruti Malhotra",
      "Gaurav Singh",
      "Ananya Reddy",
      "Rohan Gupta",
      "Zara Khan",
      "Manoj Kumar",
      "Ritika Verma",
      "Siddharth Patel",
      "Priya Sharma",
      "Ashok Nair",
      "Neelam Singh",
      "Varun Kapoor",
      "Sakshi Rao",
      "Nitin Desai",
      "Hema Iyer",
      "Sameer Bhat",
      "Disha Pillai",
      "Ravi Reddy",
      "Chandni Joshi",
      "Harsh Saxena",
      "Lavanya Singh",
      "Akash Mishra",
      "Shreya Bansal",
      "Sushant Mehta",
      "Tanvi Kapoor",
    ];

    patientNames.slice(0, 50).forEach((name, index) => {
      const patient = {
        id: `PAT-${String(index + 1).padStart(4, "0")}`,
        name: name,
        phone: `989${String(1000000 + index).slice(-7)}`,
        isFollowUp: Math.random() < 0.15,
        createdAt: new Date(),
      };
      this.patients.push(patient);
      this.database.addPatient(patient);
    });

    console.log(`✓ Created ${this.patients.length} patients`);
  }

  /**
   * Run the full day simulation
   */
  async runSimulation() {
    console.log("\n========================================");
    console.log("🚀 STARTING SIMULATION");
    console.log("========================================\n");

    const startTime = new Date();

    // Phase 1: Online bookings (before OPD opens)
    console.log("📱 PHASE 1: Online Pre-Bookings (7:00 AM)\n");
    await this.simulateOnlineBookings();

    // Phase 2: OPD opening and walk-ins
    console.log("\n🏥 PHASE 2: OPD Opening & Walk-ins (9:00 AM)\n");
    await this.simulateWalkIns();

    // Phase 3: Paid priority bookings
    console.log("\n💰 PHASE 3: Paid Priority Bookings (9:30 AM)\n");
    await this.simulatePaidPriorityBookings();

    // Phase 4: Emergency insertion
    console.log("\n🚨 PHASE 4: Emergency Case (10:15 AM)\n");
    await this.simulateEmergencyInsertion();

    // Phase 5: Token processing (calling, completion, no-shows)
    console.log("\n👨‍⚕️ PHASE 5: Token Processing (10:30 AM - 1:00 PM)\n");
    await this.simulateTokenProcessing();

    // Phase 6: Late cancellations and reallocations
    console.log("\n❌ PHASE 6: Cancellations & Reallocations (12:00 PM)\n");
    await this.simulateCancellations();

    // Phase 7: Analytics and reports
    console.log("\n📊 PHASE 7: End-of-Day Analytics\n");
    await this.generateFinalAnalytics();

    const endTime = new Date();
    console.log("\n✅ Simulation complete!");
    console.log(`⏱️  Execution time: ${endTime - startTime}ms\n`);
  }

  /**
   * Simulate online bookings before OPD opens
   */
  async simulateOnlineBookings() {
    const bookingsPerDoctor = 15;
    let totalBookings = 0;
    let successCount = 0;

    for (const doctor of this.doctors) {
      console.log(`\n📱 ${doctor.name} - Online Bookings:`);

      for (let i = 0; i < bookingsPerDoctor; i++) {
        const patient = this.getRandomPatient();
        const slot = this.getRandomSlot(doctor.id);

        const result = await this.tokenService.bookToken({
          patientId: patient.id,
          doctorId: doctor.id,
          slotStartTime: slot.startTime,
          slotEndTime: slot.endTime,
          source: "online_booking",
          isFollowUp: patient.isFollowUp,
        });

        totalBookings++;

        if (result.success) {
          successCount++;
          console.log(
            `  ✓ ${patient.name}: Token ${result.token.id} (Slot: ${slot.startTime / 100}:00-${
              slot.endTime / 100
            }:00, Queue Pos: ${result.queuePosition})`
          );
        } else {
          console.log(
            `  ✗ ${patient.name}: ${result.error} ${result.waitlist ? "[Waitlisted]" : ""}`
          );
        }
      }
    }

    console.log(`\n📊 Online Bookings Summary: ${successCount}/${totalBookings} successful`);
    this.simulationEvents.push({
      phase: "Online Bookings",
      total: totalBookings,
      successful: successCount,
    });
  }

  /**
   * Simulate walk-in patients
   */
  async simulateWalkIns() {
    const walkInsPerDoctor = 8;
    let totalWalkIns = 0;
    let successCount = 0;

    for (const doctor of this.doctors) {
      console.log(`\n🚶 ${doctor.name} - Walk-in Patients:`);

      for (let i = 0; i < walkInsPerDoctor; i++) {
        const patient = this.getRandomPatient();
        const slot = this.getRandomSlot(doctor.id);

        const result = await this.tokenService.bookToken({
          patientId: patient.id,
          doctorId: doctor.id,
          slotStartTime: slot.startTime,
          slotEndTime: slot.endTime,
          source: "walk_in",
          isFollowUp: false,
        });

        totalWalkIns++;

        if (result.success) {
          successCount++;
          console.log(
            `  ✓ ${patient.name}: Token ${result.token.id} (Queue Pos: ${result.queuePosition})`
          );
        } else {
          console.log(
            `  ✗ ${patient.name}: ${result.error} ${result.waitlist ? "[Waitlisted]" : ""}`
          );
        }
      }
    }

    console.log(`\n📊 Walk-in Summary: ${successCount}/${totalWalkIns} successful`);
    this.simulationEvents.push({
      phase: "Walk-ins",
      total: totalWalkIns,
      successful: successCount,
    });
  }

  /**
   * Simulate paid priority bookings
   */
  async simulatePaidPriorityBookings() {
    const paidBookingsPerDoctor = 3;
    let totalPaidBookings = 0;
    let successCount = 0;

    for (const doctor of this.doctors) {
      console.log(`\n💎 ${doctor.name} - Paid Priority Bookings:`);

      for (let i = 0; i < paidBookingsPerDoctor; i++) {
        const patient = this.getRandomPatient();
        const slot = this.getRandomSlot(doctor.id);

        const result = await this.tokenService.bookToken({
          patientId: patient.id,
          doctorId: doctor.id,
          slotStartTime: slot.startTime,
          slotEndTime: slot.endTime,
          source: "paid_priority",
          isFollowUp: false,
        });

        totalPaidBookings++;

        if (result.success) {
          successCount++;
          console.log(
            `  ✓ ${patient.name}: Token ${result.token.id} (Premium) (Queue Pos: ${result.queuePosition})`
          );
        } else {
          console.log(`  ✗ ${patient.name}: ${result.error}`);
        }
      }
    }

    console.log(
      `\n📊 Paid Priority Summary: ${successCount}/${totalPaidBookings} successful`
    );
    this.simulationEvents.push({
      phase: "Paid Priority",
      total: totalPaidBookings,
      successful: successCount,
    });
  }

  /**
   * Simulate emergency case insertion
   */
  async simulateEmergencyInsertion() {
    const doctor = this.doctors[0]; // First doctor
    const patient = this.getRandomPatient();
    const slot = this.getRandomSlot(doctor.id);

    console.log(`\n🚨 EMERGENCY CASE for ${doctor.name}`);
    console.log(`Patient: ${patient.name}`);
    console.log(`Requested Slot: ${slot.startTime / 100}:00-${slot.endTime / 100}:00\n`);

    // Get current utilization before emergency
    const beforeUtilization = await this.tokenService.getSlotUtilization(
      doctor.id,
      slot.startTime,
      slot.endTime
    );
    console.log(
      `Before Emergency: ${beforeUtilization.allocated}/${beforeUtilization.capacity} tokens allocated`
    );

    const result = await this.tokenService.handleEmergency({
      patientId: patient.id,
      doctorId: doctor.id,
      slotStartTime: slot.startTime,
      slotEndTime: slot.endTime,
    });

    if (result.success) {
      console.log(`✓ Emergency token allocated: ${result.token.id}`);
      console.log(`📍 Queue Position: ${result.queuePosition}`);
      console.log(`⚠️  Capacity Override: ${result.capacityOverride}`);

      const afterUtilization = this.tokenService.getSlotUtilization(
        doctor.id,
        slot.startTime,
        slot.endTime
      );
      console.log(
        `After Emergency: ${afterUtilization.allocated}/${afterUtilization.capacity} tokens allocated`
      );
    }

    this.simulationEvents.push({
      phase: "Emergency",
      total: 1,
      successful: result.success ? 1 : 0,
    });
  }

  /**
   * Simulate token processing (calling, completion, no-shows)
   */
  async simulateTokenProcessing() {
    let callCount = 0;
    let completeCount = 0;
    let noShowCount = 0;

    for (const doctor of this.doctors) {
      const tokens = this.database.getTokensByDoctor(doctor.id);
      const allocatedTokens = tokens.filter((t) => t.status === "allocated");

      console.log(`\n👨‍⚕️  ${doctor.name} - Processing Tokens:`);

      // Process tokens
      for (let i = 0; i < Math.min(allocatedTokens.length, 12); i++) {
        const token = allocatedTokens[i];

        // Random action: call, complete, or no-show
        const action = Math.random();

        if (action < 0.7) {
          // 70% probability: Call and complete
          await this.tokenService.callToken(token.id);
          await this.tokenService.completeToken(
            token.id,
            `Consultation completed. Prescribed treatment plan.`
          );
          console.log(
            `  ✓ ${token.id}: COMPLETED (Patient: ${this.database.getPatient(token.patientId).name})`
          );
          completeCount++;
          callCount++;
        } else if (action < 0.85) {
          // 15% probability: Call but no-show
          await this.tokenService.callToken(token.id);
          await this.tokenService.markNoShow(token.id, "Patient did not arrive");
          console.log(
            `  ⚠️  ${token.id}: NO-SHOW (Patient: ${this.database.getPatient(token.patientId).name})`
          );
          noShowCount++;
          callCount++;
        } else {
          // 15% probability: Just call (still in consultation)
          await this.tokenService.callToken(token.id);
          console.log(`  → ${token.id}: CALLED (Under consultation)`);
          callCount++;
        }
      }
    }

    console.log(`\n📊 Token Processing Summary:`);
    console.log(`  ✓ Completed: ${completeCount}`);
    console.log(`  ⚠️  No-shows: ${noShowCount}`);
    console.log(`  → Called: ${callCount}`);

    this.simulationEvents.push({
      phase: "Token Processing",
      completed: completeCount,
      noShows: noShowCount,
      called: callCount,
    });
  }

  /**
   * Simulate cancellations and demonstrate reallocation
   */
  async simulateCancellations() {
    let cancellationCount = 0;
    let reallocations = [];

    for (const doctor of this.doctors) {
      const tokens = this.database.getTokensByDoctor(doctor.id);
      const allocatedTokens = tokens.filter((t) => t.status === "allocated");

      // Cancel 1-2 tokens per doctor
      const cancelCount = Math.min(Math.floor(Math.random() * 2) + 1, allocatedTokens.length);

      for (let i = 0; i < cancelCount; i++) {
        const token = allocatedTokens[Math.floor(Math.random() * allocatedTokens.length)];

        console.log(
          `\n❌ Cancelling Token: ${token.id} (Patient: ${this.database.getPatient(token.patientId).name})`
        );

        const result = await this.tokenService.cancelToken(token.id, "Patient cancelled appointment");

        if (result.success) {
          console.log(`  ✓ Token cancelled`);
          cancellationCount++;

          if (result.reallocations && result.reallocations.length > 0) {
            console.log(`  🔄 Reallocations made:`);
            result.reallocations.forEach((realloc) => {
              console.log(
                `    - Patient ${realloc.patientId} allocated to Token ${realloc.newTokenId}`
              );
              reallocations.push(realloc);
            });
          }
        }
      }
    }

    console.log(`\n📊 Cancellation Summary:`);
    console.log(`  ❌ Total Cancellations: ${cancellationCount}`);
    console.log(`  🔄 Reallocations: ${reallocations.length}`);

    this.simulationEvents.push({
      phase: "Cancellations",
      cancellations: cancellationCount,
      reallocations: reallocations.length,
    });
  }

  /**
   * Generate end-of-day analytics
   */
  async generateFinalAnalytics() {
    console.log("📈 END-OF-DAY ANALYTICS\n");
    console.log("=".repeat(80));

    for (const doctor of this.doctors) {
      const analytics = await this.tokenService.getDayAnalytics(doctor.id);

      console.log(`\n${doctor.name} (${doctor.specialization})`);
      console.log("-".repeat(80));

      console.log(`\nToken Statistics:`);
      console.log(`  📝 Total Allocated: ${analytics.totalTokensAllocated}`);
      console.log(`  📞 Called: ${analytics.totalTokensCalled}`);
      console.log(`  ✅ Completed: ${analytics.totalTokensCompleted}`);
      console.log(`  ⚠️  No-shows: ${analytics.totalNoShows}`);
      console.log(`  ❌ Cancellations: ${analytics.totalCancellations}`);
      console.log(`  🚨 Emergencies: ${analytics.totalEmergencies}`);
      console.log(`  🔄 Follow-ups: ${analytics.totalFollowUps}`);

      console.log(`\nSource Breakdown:`);
      const totalSourceTokens = Object.values(analytics.sourceBreakdown).reduce((a, b) => a + b, 0) || 1;
      Object.entries(analytics.sourceBreakdown).forEach(([source, count]) => {
        if (count > 0) {
          const percentage = ((count / totalSourceTokens) * 100).toFixed(1);
          console.log(`  • ${source}: ${count} (${percentage}%)`);
        }
      });

      console.log(`\nSlot Utilization:`);
      Object.entries(analytics.slotUtilization).forEach(([slotTime, util]) => {
        if (util && util.allocated > 0) {
          const utilizationPercent = util.utilization.toFixed(1);
          const barLength = Math.round(util.utilization / 5);
          const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
          console.log(
            `  ${slotTime}: ${util.allocated}/${util.capacity} [${bar}] ${utilizationPercent}%`
          );
        }
      });

      console.log(`\nPerformance Metrics:`);
      const totalProcessed = analytics.totalTokensCompleted + analytics.totalNoShows + analytics.totalCancellations;
      const completionRate = totalProcessed > 0 ? (
        (analytics.totalTokensCompleted / totalProcessed) * 100
      ).toFixed(1) : '0';
      const noShowRate = totalProcessed > 0 ? (
        (analytics.totalNoShows / totalProcessed) * 100
      ).toFixed(1) : '0';
      
      // Calculate average slot utilization
      const slotUtils = Object.values(analytics.slotUtilization);
      const avgUtilization = slotUtils.length > 0 ? (
        slotUtils.reduce((sum, util) => sum + util.utilization, 0) / slotUtils.length
      ).toFixed(1) : '0';

      console.log(`  ✅ Completion Rate: ${completionRate}%`);
      console.log(`  ⚠️  No-show Rate: ${noShowRate}%`);
      console.log(`  📊 Avg Utilization: ${avgUtilization}%`);
    }

    // Overall statistics
    console.log(`\n${"=".repeat(80)}`);
    console.log(`\n🏥 OVERALL STATISTICS\n`);

    const allTokens = this.database.getAllTokens();
    const totalAllocated = allTokens.filter((t) => t.status === "allocated").length;
    const totalCompleted = allTokens.filter((t) => t.status === "completed").length;
    const totalNoShows = allTokens.filter((t) => t.status === "no_show").length;
    const totalCancellations = allTokens.filter((t) => t.status === "cancelled").length;

    console.log(`Total Tokens Allocated: ${allTokens.length}`);
    console.log(`Total Patients Served: ${totalCompleted}`);
    console.log(`Total No-shows: ${totalNoShows}`);
    console.log(`Total Cancellations: ${totalCancellations}`);
    console.log(`Pending Consultations: ${totalAllocated}`);

    // Reallocation statistics
    const reallocatedTokens = allTokens.filter((t) => t.reallocatedAt);
    console.log(`\nDynamic Reallocations: ${reallocatedTokens.length}`);

    console.log(`\n${"=".repeat(80)}`);
  }

  /**
   * Helper: Get random patient
   */
  getRandomPatient() {
    return this.patients[Math.floor(Math.random() * this.patients.length)];
  }

  /**
   * Helper: Get random slot for a doctor
   */
  getRandomSlot(doctorId) {
    const slots = this.database.getTimeSlotsByDoctor(doctorId);
    return slots[Math.floor(Math.random() * slots.length)];
  }
}

// Run simulation
if (require.main === module) {
  const simulation = new OPDSimulation();
  simulation.setupSimulation();
  simulation.runSimulation().catch(err => {
    console.error("Simulation error:", err);
    process.exit(1);
  });
}

module.exports = OPDSimulation;
