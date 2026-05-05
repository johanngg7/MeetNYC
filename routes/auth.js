const express = require("express");
const router = express.Router();
const userData = require("../data/users");

const setSession = (req, u) => {
  req.session.user = {
    _id: u._id.toString(),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    handle: u.handle,
    borough: u.borough,
    isAdmin: u.isAdmin,
  };
};

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/user/profile");
  res.render("auth/login", { title: "Sign In" });
});

router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/user/profile");
  res.render("auth/register", { title: "Register" });
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, handle, password, confirmPassword, borough } = req.body;
  try {
    if (password !== confirmPassword) throw new Error("passwords do not match");
    const u = await userData.create(firstName, lastName, email, handle, password, borough);
    setSession(req, u);
    return res.redirect("/user/profile");
  } catch (e) {
    return res.status(400).render("auth/register", {
      title: "Register",
      error: e.message,
      firstName,
      lastName,
      email,
      handle,
      borough,
    });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const u = await userData.verify(email, password);
    setSession(req, u);
    return res.redirect("/user/profile");
  } catch (e) {
    return res.status(400).render("auth/login", {
      title: "Sign In",
      error: e.message,
      email,
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
