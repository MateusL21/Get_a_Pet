const mongoose = require("mongoose");

// Configurações globais do Mongoose
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", true);

let isConnected = false;

async function main() {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  const mongoURI = process.env.MONGODB_URI;

  console.log("🔗 Connecting to MongoDB...");

  try {
    await mongoose.connect(mongoURI, {
      dbName: "getapet",
      serverSelectionTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: "majority",
    });

    isConnected = true;
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection FAILED:", error.message);
    isConnected = false;
    throw error;
  }
}

// Event listeners para gerenciar conexão
mongoose.connection.on("connected", () => {
  console.log("📊 MongoDB connected");
  isConnected = true;
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
  isConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 MongoDB disconnected");
  isConnected = false;
});

// Reconectar automaticamente
mongoose.connection.on("disconnected", () => {
  console.log("🔄 Attempting to reconnect...");
  setTimeout(() => {
    if (!isConnected) {
      main().catch(console.error);
    }
  }, 5000);
});

// Iniciar conexão
main().catch(console.error);

module.exports = mongoose;
