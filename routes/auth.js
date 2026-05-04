const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Sign In" });
});

router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register" });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
