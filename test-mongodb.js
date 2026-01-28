#!/usr/bin/env node

/**
 * MongoDB Integration Test Script
 * Validates MongoDB setup and API endpoints
 * Usage: node test-mongodb.js
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";
const tests = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseData });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test function
async function test(name, fn) {
  process.stdout.write(`⏳ ${name}... `);
  try {
    await fn();
    console.log("✅ PASS");
    passedTests++;
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}`);
    failedTests++;
  }
}

// Main test suite
async function runTests() {
  console.log("\n🧪 OPD Token Allocation Engine - MongoDB Integration Tests\n");
  console.log(`Testing: ${BASE_URL}\n`);

  // Test 1: Server Health
  await test("Server Health Check", async () => {
    const res = await makeRequest("GET", "/api/health");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.status) throw new Error("No status field");
  });

  // Test 2: Database Status
  await test("Database Connection Status", async () => {
    const res = await makeRequest("GET", "/api/db-status");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.database) throw new Error("No database field");
  });

  // Test 3: Get All Doctors (should be empty initially)
  await test("Get All Doctors (initial)", async () => {
    const res = await makeRequest("GET", "/api/admin/doctors");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.body.doctors)) throw new Error("Doctors not an array");
  });

  // Test 4: Add Doctor
  let doctorId;
  await test("Add Doctor", async () => {
    doctorId = `D_${Date.now()}`;
    const res = await makeRequest("POST", "/api/admin/doctors", {
      doctorId,
      name: "Dr. Test Sharma",
      specialization: "General Medicine",
      contactNumber: "9876543210",
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.body.success) throw new Error("Operation not successful");
  });

  // Test 5: Verify Doctor Added
  await test("Verify Doctor Added", async () => {
    const res = await makeRequest("GET", "/api/admin/doctors");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const found = res.body.doctors.find((d) => d.doctorId === doctorId);
    if (!found) throw new Error("Doctor not found in list");
  });

  // Test 6: Add Time Slot
  let slotStartTime, slotEndTime;
  await test("Add Time Slot", async () => {
    slotStartTime = Date.now();
    slotEndTime = Date.now() + 3600000; // 1 hour later
    const res = await makeRequest("POST", "/api/admin/time-slots", {
      doctorId,
      startTime: slotStartTime,
      endTime: slotEndTime,
      capacity: 20,
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.body.success) throw new Error("Operation not successful");
  });

  // Test 7: Get Time Slots
  await test("Get Doctor's Time Slots", async () => {
    const res = await makeRequest("GET", `/api/admin/time-slots/${doctorId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.body.slots)) throw new Error("Slots not an array");
    if (res.body.count === 0) throw new Error("No slots found");
  });

  // Test 8: Book Token
  let tokenId;
  await test("Book Token", async () => {
    const patientId = `P_${Date.now()}`;
    const res = await makeRequest("POST", "/api/tokens/book", {
      patientId,
      patientName: "Test Patient",
      patientPhone: "9876543210",
      doctorId,
      slotStartTime,
      slotEndTime,
      source: "online_booking",
      isFollowUp: false,
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.body.success) throw new Error("Booking not successful");
    tokenId = res.body.tokenId;
    if (!tokenId) throw new Error("No tokenId in response");
  });

  // Test 9: Get Token Details
  await test("Get Token Details", async () => {
    const res = await makeRequest("GET", `/api/tokens/${tokenId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.token) throw new Error("No token in response");
  });

  // Test 10: Call Token
  await test("Call Token", async () => {
    const res = await makeRequest("POST", `/api/tokens/${tokenId}/call`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.token.status !== "called")
      throw new Error("Token not marked as called");
  });

  // Test 11: Complete Token
  await test("Complete Token", async () => {
    const res = await makeRequest("POST", `/api/tokens/${tokenId}/complete`, {
      notes: "Test consultation completed",
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.token.status !== "completed")
      throw new Error("Token not marked as completed");
  });

  // Test 12: Emergency Token
  let emergencyTokenId;
  await test("Insert Emergency Token", async () => {
    const res = await makeRequest("POST", "/api/emergency/insert", {
      patientId: `P_EMERGENCY_${Date.now()}`,
      patientName: "Emergency Patient",
      doctorId,
      phone: "9876543210",
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.body.success) throw new Error("Emergency token not inserted");
    emergencyTokenId = res.body.tokenId;
  });

  // Test 13: Get System Status
  await test("Get System Status", async () => {
    const res = await makeRequest("GET", "/api/admin/system-status");
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.doctors) throw new Error("No doctors count");
  });

  // Test 14: Get Queue Status
  await test("Get Queue Status", async () => {
    const res = await makeRequest("GET", `/api/admin/queue/${doctorId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.body.queue)) throw new Error("Queue not an array");
  });

  // Test 15: Get Analytics
  await test("Get Doctor Analytics", async () => {
    const res = await makeRequest("GET", `/api/admin/analytics/${doctorId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.analytics) throw new Error("No analytics in response");
  });

  // Test 16: Bulk Setup
  await test("Bulk Setup (Doctors & Slots)", async () => {
    const res = await makeRequest("POST", "/api/admin/bulk-setup", {
      doctors: [
        { doctorId: `D_${Date.now()}_2`, name: "Dr. Test 2" },
        { doctorId: `D_${Date.now()}_3`, name: "Dr. Test 3" },
      ],
      timeSlots: [],
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.body.success) throw new Error("Bulk setup failed");
  });

  // Summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (failedTests === 0) {
    console.log("🎉 All tests passed! MongoDB integration is working correctly.\n");
    console.log("Next steps:");
    console.log("1. Check MongoDB for saved data: mongosh");
    console.log("2. Query tokens: db.tokens.find()");
    console.log("3. Query doctors: db.doctors.find()");
    console.log("4. Deploy to production\n");
    process.exit(0);
  } else {
    console.log("⚠️  Some tests failed. Check MongoDB connection and server status.\n");
    process.exit(1);
  }
}

// Run tests with error handling
runTests().catch((error) => {
  console.error("\n❌ Fatal error during testing:");
  console.error(error.message);
  console.error(
    "\nMake sure:");
  console.error("1. MongoDB is running (mongod)");
  console.error("2. Server is running (npm start)");
  console.error("3. Server is on port 3000 or update BASE_URL in this script\n");
  process.exit(1);
});
