const { app, initializeDatabases, setupRoutes } = require("./src/server");
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize databases
    await initializeDatabases();
    
    // Setup routes after databases are initialized
    setupRoutes();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🏥 OPD Token Allocation Engine running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📍 API Root: http://localhost:${PORT}/`);
      console.log(`📍 DB Status: http://localhost:${PORT}/api/db-status`);
      console.log(`\n💾 Database Mode: ${process.env.USE_MONGODB === "true" ? "MongoDB" : "In-Memory"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
