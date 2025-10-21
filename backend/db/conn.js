const mongoose = require("mongoose");

async function main() {
  const mongoURI = process.env.MONGODB_URI;

  console.log("MongoDB URI:", mongoURI ? "PRESENT" : "MISSING");

  if (!mongoURI) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB Atlas...");

  try {
    await mongoose.connect(mongoURI, {
      dbName: "getapet",
      serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
      socketTimeoutMS: 45000, // Timeout de socket
    });

    console.log("✅ Connected to MongoDB Atlas successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection FAILED:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.name === "MongooseServerSelectionError") {
      console.error(
        "🔒 IP WHITELIST ISSUE - Check MongoDB Atlas Network Access"
      );
    }

    process.exit(1);
  }
}

// Event listeners para debug
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error event:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

main().catch(console.error);

module.exports = mongoose;
