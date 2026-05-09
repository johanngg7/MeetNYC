const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  return res.redirect("/login");
};

const ensureNotAuthenticated = (req, res, next) => {
  if (!req.session.user) return next();
  return res.redirect("/");
};

const ensureAdmin = (req, res, next) => {
  if (req.session.user?.isAdmin === true) return next();
  return res.status(403).render("error", {
    title: "Forbidden",
    status: 403,
    message: "Forbidden",
  });
};

module.exports = { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin };
