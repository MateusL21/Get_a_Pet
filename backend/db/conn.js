const mongoose = require("mongoose");
// REMOVA: require('dotenv').config(); ← Isso só é necessário localmente

async function main() {
  const mongoURI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/getapet";

  console.log("🔗 Connecting to MongoDB...");

  try {
    await mongoose.connect(mongoURI, {
      dbName: "getapet",
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection FAILED:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);

module.exports = mongoose;
