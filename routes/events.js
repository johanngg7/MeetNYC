const express = require("express");
const router = express.Router();
const eventData = require("../data/events");
const { ensureAuthenticated } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const list = await eventData.getAll();
    res.render("events/browseEvents", { title: "Browse Events", events: list });
  } catch (e) {
    res.status(500).render("events/browseEvents", {
      title: "Browse Events",
      events: [],
      error: e.message,
    });
  }
});

router.get("/search", async (req, res) => {
  try {
    const list = await eventData.search(req.query);
    res.render("events/searchResults", {
      title: "Search Results",
      events: list,
      filters: req.query,
    });
  } catch (e) {
    res.status(400).render("events/searchResults", {
      title: "Search Results",
      events: [],
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

router.get("/:id", async (req, res) => {
  try {
    const ev = await eventData.getById(req.params.id);
    const uid = req.session.user ? req.session.user._id : null;
    const isOwner = uid && ev.createdBy.toString() === uid;
    const isAttending =
      uid && (ev.attendees || []).some((a) => a.userId.toString() === uid);
    res.render("events/eventDetails", {
      title: ev.title,
      event: ev,
      isOwner,
      isAttending,
      attendeeCount: (ev.attendees || []).length,
    });
  } catch (e) {
    res.status(404).render("events/eventDetails", {
      title: "Event",
      event: null,
      error: e.message,
    });
  }
});

router.get("/:id/edit", ensureAuthenticated, async (req, res) => {
  try {
    const ev = await eventData.getById(req.params.id);
    if (ev.createdBy.toString() !== req.session.user._id) {
      return res.status(403).send("Forbidden");
    }
    res.render("events/editEvent", { title: "Edit Event", event: ev });
  } catch (e) {
    res.status(404).send(e.message);
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
    res.status(400).send(e.message);
  }
});

router.post("/:id/rsvp", ensureAuthenticated, async (req, res) => {
  try {
    const ev = await eventData.getById(req.params.id);
    const uid = req.session.user._id;
    const attending = (ev.attendees || []).some((a) => a.userId.toString() === uid);
    if (attending) {
      await eventData.removeAttendee(req.params.id, uid);
      return res.json({ status: "removed", count: (ev.attendees || []).length - 1 });
    }
    const name = req.session.user.firstName + " " + req.session.user.lastName;
    await eventData.addAttendee(req.params.id, uid, name);
    return res.json({ status: "added", count: (ev.attendees || []).length + 1 });
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
