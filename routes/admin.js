const express = require("express");
const router = express.Router();
const eventData = require("../data/events");
const userData = require("../data/users");
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");

router.get("/", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const flaggedEvents = await eventData.getFlagged();
    const flaggedComments = await eventData.getFlaggedComments();
    const allUsers = await userData.getAll();
    const users = allUsers.map(u => ({
      ...u,
      _id: u._id.toString(),
      isSelf: u._id.toString() === req.session.user._id,
    }));
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      flaggedEvents,
      flaggedComments,
      users,
    });
  } catch (e) {
    res.status(500).render("admin/dashboard", {
      title: "Admin Dashboard",
      flaggedEvents: [],
      flaggedComments: [],
      error: e.message,
    });
  }
});

router.post("/events/:id/flag", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await eventData.flagEvent(req.params.id);
    res.json({ flagged: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/events/:id/unflag", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await eventData.unflagEvent(req.params.id);
    res.json({ unflagged: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/events/:id/remove", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await eventData.adminRemoveEvent(req.params.id);
    res.json({ deleted: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/events/:id/comments/:cid/flag", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await eventData.flagComment(req.params.id, req.params.cid);
    res.json({ flagged: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/events/:id/comments/:cid/unflag", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await eventData.unflagComment(req.params.id, req.params.cid);
    res.json({ unflagged: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/events/:id/comments/:cid/delete", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await eventData.removeComment(req.params.id, req.params.cid, req.session.user._id, true);
    res.json({ deleted: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/users/:id/toggle-admin", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    if (req.params.id === req.session.user._id) {
      return res.status(400).json({ error: "Cannot toggle your own admin status" });
    }
    const u = await userData.toggleAdmin(req.params.id);
    res.json({ toggled: true, isAdmin: u.isAdmin });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
