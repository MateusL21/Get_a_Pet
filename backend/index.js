const express = require("express");
const cors = require("cors");
const conn = require("./db/conn");

const app = express();

// config JSON response
app.use(express.json());

// Solve CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://adopt-a-pet-by-mleonel21.vercel.app",
      "https://adopt-a-pet-by-mleonel21-backend.vercel.app",
    ],
    credentials: true,
  })
);

// Public folder for images
app.use(express.static("public"));

// Rota raiz para health check
app.get("/", (req, res) => {
  const dbStatus =
    conn.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    message: "Backend API is running!",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Rota de teste do banco
app.get("/test-db", (req, res) => {
  const status = conn.connection.readyState;
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  res.json({
    dbStatus: states[status],
    message: status === 1 ? "✅ DB Connected" : "❌ DB Not connected",
  });
});

// Routes
const UserRoutes = require("./routes/UserRoutes");
const PetRoutes = require("./routes/PetRoutes");

app.use("/users", UserRoutes);
app.use("/pets", PetRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
