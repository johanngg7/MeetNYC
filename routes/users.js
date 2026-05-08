const express = require("express");
const router = express.Router();
const userData = require("../data/users");
const eventData = require("../data/events");
const { ensureAuthenticated } = require("../middleware/auth");

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
    const savedIds = (u.savedEvents || []).map((x) => x.toString());
    res.render("user/profile", {
      title: "My Profile",
      user: u,
      createdEvents: created,
      rsvpedEvents: rsvped,
      savedEvents: saved,
      savedEventIds: savedIds,
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/profile/edit", ensureAuthenticated, async (req, res) => {
  try {
    const u = await userData.getById(req.session.user._id);
    res.render("user/editProfile", {
      title: "Edit Profile",
      form: u,
    });
  } catch (e) {
    res.status(500).render("error", {
      title: "Error",
      status: 500,
      message: e.message,
    });
  }
});

router.post("/profile/edit", ensureAuthenticated, async (req, res) => {
  const { firstName, lastName, email, handle, borough, password, confirmPassword } = req.body;
  try {
    const updates = { firstName, lastName, email, handle, borough };
    if (password || confirmPassword) {
      if (password !== confirmPassword) throw new Error("passwords do not match");
      updates.password = password;
    }
    const u = await userData.update(req.session.user._id, updates);
    setSession(req, u);
    res.redirect("/user/profile");
  } catch (e) {
    res.status(400).render("user/editProfile", {
      title: "Edit Profile",
      error: e.message,
      form: { firstName, lastName, email, handle, borough },
    });
  }
});

router.post("/profile/delete", ensureAuthenticated, async (req, res) => {
  try {
    if (req.session.user.isAdmin) throw new Error("Admin accounts cannot be deleted here");
    const uid = req.session.user._id;
    const u = await userData.getById(uid);
    for (const eid of u.createdEvents || []) {
      try {
        await eventData.remove(eid.toString(), uid);
      } catch (e) {}
    }
    for (const eid of u.rsvpedEvents || []) {
      try {
        await eventData.removeAttendee(eid.toString(), uid);
      } catch (e) {}
    }
    await userData.remove(uid);
    req.session.destroy(() => {
      res.redirect("/");
    });
  } catch (e) {
    res.status(400).render("error", {
      title: "Error",
      status: 400,
      message: e.message,
    });
  }
});

module.exports = router;
