const mongoose = require("mongoose");
require("dotenv").config();

async function main() {
  // DEBUG: Mostra o que está carregando
  console.log(
    "MONGODB_URI from env:",
    process.env.MONGODB_URI ? "LOADED" : "NOT LOADED"
  );

  const mongoURI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/getapet";

  console.log(
    "Connecting to:",
    mongoURI.includes("mongodb+srv") ? "MongoDB Atlas (Cloud)" : "Local MongoDB"
  );

  try {
    await mongoose.connect(mongoURI, {
      dbName: "getapet",
    });

    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

main().catch(console.error);

module.exports = mongoose;
