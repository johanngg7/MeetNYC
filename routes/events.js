const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("events/browseEvents", { title: "Browse Events", events: [] });
});

router.get("/create", (req, res) => {
  res.render("events/createEvent", { title: "Create Event" });
});

router.get("/search", (req, res) => {
  res.render("events/searchResults", { title: "Search Results", events: [] });
});

router.get("/:id", (req, res) => {
  res.render("events/eventDetails", {
    title: "Event Details",
    event: {
      _id: req.params.id,
      title: "Sample Event",
      category: "",
      borough: "",
      date: "",
      startTime: "",
      endTime: "",
      attendees: [],
      comments: [],
      reviews: [],
    },
  });
});

module.exports = router;
