const express = require("express");
const cors = require("cors");
const conn = require("./db/conn");

const app = express();

// Middleware para verificar conexão com DB
app.use((req, res, next) => {
  if (conn.connection.readyState !== 1) {
    console.log("🔄 Database connection lost, reconnecting...");
    require("./db/conn").catch(() => {
      return res.status(503).json({
        error: "Database temporarily unavailable",
        message: "Trying to reconnect to database...",
      });
    });
  }
  next();
});
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
  res.json({
    message: "Backend API is running!",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
});

// Routes
const UserRoutes = require("./routes/UserRoutes");
const PetRoutes = require("./routes/PetRoutes");

app.use("/users", UserRoutes);
app.use("/pets", PetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
