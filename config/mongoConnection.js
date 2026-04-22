const mongoose = require("mongoose");

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/meetnyc";

const connectDB = async () => {
  await mongoose.connect(mongoUrl);
  console.log("MongoDB connected");
};

module.exports = { connectDB, mongoUrl };
