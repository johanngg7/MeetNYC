const homeRoutes = require("./home");
const authRoutes = require("./auth");
const eventRoutes = require("./events");
const userRoutes = require("./users");
const adminRoutes = require("./admin");

const configRoutes = (app) => {
  app.use("/", homeRoutes);
  app.use("/", authRoutes);
  app.use("/events", eventRoutes);
  app.use("/user", userRoutes);
  app.use("/admin", adminRoutes);
};

module.exports = configRoutes;
