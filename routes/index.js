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

  app.use((req, res) => {
    res.status(404).render("error", {
      title: "Page Not Found",
      status: 404,
      message: "Page not found.",
    });
  });

  app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = status === 500 ? "Something went wrong." : err.message;
    res.status(status).render("error", {
      title: "Error",
      status,
      message,
    });
  });
};

module.exports = configRoutes;
