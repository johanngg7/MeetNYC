const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  return res.redirect("/login");
};

const ensureNotAuthenticated = (req, res, next) => {
  if (!req.session.user) return next();
  return res.redirect("/");
};

const ensureAdmin = (req, res, next) => {
  if (req.session.user?.role === "admin") return next();
  return res.status(403).send("Forbidden");
};

module.exports = { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin };
