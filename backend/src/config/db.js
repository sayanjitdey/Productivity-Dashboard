const mongoose = require("mongoose");

async function connectDb() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in environment");
  }

  await mongoose.connect(mongoUri);
}

module.exports = { connectDb };

