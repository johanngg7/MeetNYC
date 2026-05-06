const express = require("express");
const router = express.Router();
const userData = require("../data/users");
const eventData = require("../data/events");
const { ensureAuthenticated } = require("../middleware/auth");

const fetchEvents = async (ids) => {
  const list = [];
  for (const eid of ids || []) {
    try {
      const ev = await eventData.getById(eid.toString());
      list.push(ev);
    } catch (e) {}
  }
  return list;
};

router.get("/profile", ensureAuthenticated, async (req, res) => {
  try {
    const u = await userData.getById(req.session.user._id);
    const created = await fetchEvents(u.createdEvents);
    const rsvped = await fetchEvents(u.rsvpedEvents);
    const saved = await fetchEvents(u.savedEvents);
    res.render("user/profile", {
      title: "My Profile",
      user: u,
      createdEvents: created,
      rsvpedEvents: rsvped,
      savedEvents: saved,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
