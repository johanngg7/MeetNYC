const { dbConnection, closeConnection } = require("../config/mongoConnection");

const seed = async () => {
  await dbConnection();
  console.log("Seeding database...");

  console.log("Done seeding.");
  await closeConnection();
};

seed();
