const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    flaggedEvents: [],
    flaggedComments: [],
  });
});

module.exports = router;
