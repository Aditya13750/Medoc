const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Database = require("./models/Database");
const MongoDBService = require("./services/MongoDBService");
const TokenAllocationService = require("./services/TokenAllocationService");
const errorHandler = require("./middlewares/errorHandler");

// Routes
const tokenRoutes = require("./routes/tokenRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Initialize
const app = express();

// Database instance (in-memory) - kept for backward compatibility with simulation
let database = null;
let mongoDBService = null;
let tokenService = null;

// Determine which database to use
const USE_MONGODB = process.env.USE_MONGODB === "true";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/opd_system";

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize databases and services based on configuration
async function initializeDatabases() {
  try {
    if (USE_MONGODB) {
      // Connect to MongoDB
      await mongoose.connect(MONGODB_URI);
      console.log("✓ MongoDB connected successfully");
      mongoDBService = require("./services/MongoDBService");
      // Use MongoDB service directly with routes
    }

    // Always initialize in-memory database for simulation and backward compatibility
    database = new Database();
    console.log("✓ In-memory database initialized (for simulation)");

    // Initialize Token Allocation Service with MongoDB if available
    if (USE_MONGODB) {
      // Create a wrapper for MongoDB that adapts to the TokenAllocationService
      tokenService = new TokenAllocationService(mongoDBService);
      console.log("✓ Token Allocation Service initialized with MongoDB");
    } else {
      tokenService = new TokenAllocationService(database);
      console.log("✓ Token Allocation Service initialized with in-memory database");
    }

    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// Routes setup
function setupRoutes() {
  const activeDatabase = USE_MONGODB ? mongoDBService : database;

  // Mount all route modules
  app.use("/api/tokens", tokenRoutes(activeDatabase, tokenService));
  app.use("/api/doctors", doctorRoutes(activeDatabase, tokenService));
  app.use("/api/patients", patientRoutes(activeDatabase, tokenService));
  app.use("/api/emergency", emergencyRoutes(activeDatabase, tokenService));
  app.use("/api/admin", adminRoutes(activeDatabase, tokenService));
}

// Database status endpoint
app.get("/api/db-status", async (req, res) => {
  try {
    if (USE_MONGODB) {
      const status = await mongoDBService.getSystemStatus();
      res.json({
        database: "MongoDB",
        connected: mongoose.connection.readyState === 1,
        uri: MONGODB_URI,
        status
      });
    } else {
      res.json({
        database: "In-Memory",
        status: {
          doctors: database.doctors.size,
          patients: database.patients.size,
          tokens: database.tokens.size,
          queues: database.queues.size
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "OPD Token Allocation Engine is running",
    database: USE_MONGODB ? "MongoDB" : "In-Memory",
    timestamp: new Date(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "OPD Token Allocation Engine",
    version: "2.0.0 (MongoDB Edition)",
    database: USE_MONGODB ? "MongoDB" : "In-Memory (Simulation Mode)",
    endpoints: {
      tokens: "/api/tokens",
      doctors: "/api/doctors",
      patients: "/api/patients",
      emergency: "/api/emergency",
      admin: "/api/admin",
      health: "/api/health",
      dbStatus: "/api/db-status",
    },
  });
});

// Error handling
app.use(errorHandler);

// Export for testing and external use
module.exports = { 
  app, 
  database, 
  mongoDBService, 
  tokenService,
  initializeDatabases,
  setupRoutes
};
