const express = require("express");
const router = express.Router();

router.get("/profile", (req, res) => {
  res.render("user/profile", {
    title: "My Profile",
    user: req.session.user || { firstName: "Guest" },
    createdEvents: [],
    rsvpedEvents: [],
  });
});

module.exports = router;
