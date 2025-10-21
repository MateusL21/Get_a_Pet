const express = require("express");
const cors = require("cors");
const User = require("./models/User");
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
  res.json({ message: "Backend API is running!" });
});

// Routes
const UserRoutes = require("./routes/UserRoutes");
const PetRoutes = require("./routes/PetRoutes");

app.use("/users", UserRoutes);
app.use("/pets", PetRoutes);

app.listen(5000, () => {
  console.log("Server running on port 3000");
});
