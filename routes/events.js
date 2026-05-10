const express = require("express");
const router = express.Router();
const eventData = require("../data/events");
const userData = require("../data/users");
const { ensureAuthenticated } = require("../middleware/auth");

const getSavedIds = async (req) => {
  if (!req.session.user) return [];
  const u = await userData.getById(req.session.user._id);
  return (u.savedEvents || []).map((x) => x.toString());
};

router.get("/", async (req, res) => {
  try {
    const list = await eventData.getAll();
    const savedEventIds = await getSavedIds(req);
    res.render("events/browseEvents", {
      title: "Browse Events",
      events: list,
      savedEventIds,
    });
  } catch (e) {
    res.status(500).render("events/browseEvents", {
      title: "Browse Events",
      events: [],
      savedEventIds: [],
      error: e.message,
    });
  }
});

router.get("/search", async (req, res) => {
  try {
    const list = await eventData.search(req.query);
    const savedEventIds = await getSavedIds(req);
    res.render("events/searchResults", {
      title: "Search Results",
      events: list,
      filters: req.query,
      savedEventIds,
    });
  } catch (e) {
    res.status(400).render("events/searchResults", {
      title: "Search Results",
      events: [],
      savedEventIds: [],
      error: e.message,
    });
  }
});

router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("events/createEvent", { title: "Create Event" });
});

router.post("/create", ensureAuthenticated, async (req, res) => {
  try {
    const ev = await eventData.create(req.body, req.session.user._id);
    res.redirect("/events/" + ev._id.toString());
  } catch (e) {
    res.status(400).render("events/createEvent", {
      title: "Create Event",
      error: e.message,
      form: req.body,
    });
  }
});

router.get("/random", async (req, res) => {
  try {
    const list = await eventData.getAll();
    if (!list || list.length === 0) return res.redirect("/events");
    const pick = list[Math.floor(Math.random() * list.length)];
    res.redirect("/events/" + pick._id.toString());
  } catch (e) {
    res.redirect("/events");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ev = await eventData.getById(req.params.id);
    const uid = req.session.user ? req.session.user._id : null;
    const isOwner = uid && ev.createdBy.toString() === uid;
    const isAttending =
      uid && (ev.attendees || []).some((a) => a.userId.toString() === uid);
    let isSaved = false;
    if (uid) {
      const u = await userData.getById(uid);
      isSaved = (u.savedEvents || []).some((e) => e.toString() === req.params.id);
    }
    const similarEvents = await eventData.getSimilar(req.params.id, 4);
    const savedEventIds = await getSavedIds(req);
    res.render("events/eventDetails", {
      title: ev.title,
      event: ev,
      isOwner,
      isAttending,
      isSaved,
      attendeeCount: (ev.attendees || []).length,
      similarEvents,
      savedEventIds,
    });
  } catch (e) {
    res.status(404).render("error", {
      title: "Event Not Found",
      status: 404,
      message: e.message,
    });
  }
});

router.get("/:id/edit", ensureAuthenticated, async (req, res) => {
  try {
    const ev = await eventData.getById(req.params.id);
    if (ev.createdBy.toString() !== req.session.user._id) {
      return res.status(403).render("error", {
        title: "Forbidden",
        status: 403,
        message: "Forbidden",
      });
    }
    res.render("events/editEvent", { title: "Edit Event", event: ev });
  } catch (e) {
    res.status(404).render("error", {
      title: "Event Not Found",
      status: 404,
      message: e.message,
    });
  }
});

router.post("/:id/edit", ensureAuthenticated, async (req, res) => {
  try {
    const ev = await eventData.update(
      req.params.id,
      req.session.user._id,
      req.body
    );
    res.redirect("/events/" + ev._id.toString());
  } catch (e) {
    res.status(400).render("events/editEvent", {
      title: "Edit Event",
      event: { _id: req.params.id, ...req.body },
      error: e.message,
    });
  }
});

router.post("/:id/delete", ensureAuthenticated, async (req, res) => {
  try {
    await eventData.remove(req.params.id, req.session.user._id);
    res.redirect("/events");
  } catch (e) {
    res.status(400).render("error", {
      title: "Error",
      status: 400,
      message: e.message,
    });
  }
});

router.post("/:id/save", ensureAuthenticated, async (req, res) => {
  try {
    const uid = req.session.user._id;
    const u = await userData.getById(uid);
    const saved = (u.savedEvents || []).some((e) => e.toString() === req.params.id);
    if (saved) {
      await userData.removeEventFrom(uid, "savedEvents", req.params.id);
      return res.json({ status: "unsaved" });
    }
    await eventData.getById(req.params.id);
    await userData.addEventTo(uid, "savedEvents", req.params.id);
    return res.json({ status: "saved" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/report", ensureAuthenticated, async (req, res) => {
  try {
    await eventData.flagEvent(req.params.id);
    res.json({ reported: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/rsvp", ensureAuthenticated, async (req, res) => {
  try {
    const ev = await eventData.getById(req.params.id);
    const uid = req.session.user._id;
    const attending = (ev.attendees || []).some((a) => a.userId.toString() === uid);
    let status;
    if (attending) {
      await eventData.removeAttendee(req.params.id, uid);
      status = "removed";
    } else {
      const name = req.session.user.firstName + " " + req.session.user.lastName;
      await eventData.addAttendee(req.params.id, uid, name);
      status = "added";
    }
    const after = await eventData.getById(req.params.id);
    return res.json({
      status,
      count: after.attendeeCount,
      spotsLeft: after.spotsLeft,
      isFull: after.isFull,
      attendanceCap: after.attendanceCap,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/comments", ensureAuthenticated, async (req, res) => {
  try {
    const name = req.session.user.firstName + " " + req.session.user.lastName;
    const cm = await eventData.addComment(
      req.params.id,
      req.session.user._id,
      name,
      req.body.comment
    );
    res.json({ comment: { ...cm, _id: cm._id.toString(), userId: cm.userId.toString() } });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/comments/:cid/report", ensureAuthenticated, async (req, res) => {
  try {
    await eventData.flagComment(req.params.id, req.params.cid);
    res.json({ reported: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/comments/:cid/delete", ensureAuthenticated, async (req, res) => {
  try {
    await eventData.removeComment(
      req.params.id,
      req.params.cid,
      req.session.user._id,
      !!req.session.user.isAdmin
    );
    res.json({ deleted: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/reviews", ensureAuthenticated, async (req, res) => {
  try {
    const name = req.session.user.firstName + " " + req.session.user.lastName;
    const out = await eventData.addReview(
      req.params.id,
      req.session.user._id,
      name,
      req.body.rating,
      req.body.review
    );
    res.json({
      review: {
        ...out.review,
        _id: out.review._id.toString(),
        userId: out.review.userId.toString(),
      },
      averageRating: out.averageRating,
      count: out.count,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/reviews/:rid/delete", ensureAuthenticated, async (req, res) => {
  try {
    const out = await eventData.removeReview(
      req.params.id,
      req.params.rid,
      req.session.user._id,
      !!req.session.user.isAdmin
    );
    res.json({ deleted: true, averageRating: out.averageRating, count: out.count });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
