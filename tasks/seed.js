const { connectDB } = require("../config/mongoConnection");
const mongoose = require("mongoose");

const seed = async () => {
  await connectDB();
  console.log("Seeding database...");

  // TODO: Add seed data here

  console.log("Done seeding.");
  await mongoose.connection.close();
};

seed();
