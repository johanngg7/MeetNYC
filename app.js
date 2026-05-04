const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const { connectDB, mongoUrl } = require("./config/mongoConnection");
const configRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Handlebars engine
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "meetnyc-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Make session data available to templates
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.isAdmin = req.session.user?.role === "admin";
  res.locals.user = req.session.user || null;
  next();
});

// Routes
configRoutes(app);

// Start server
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
