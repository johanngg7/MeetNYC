const { ObjectId } = require("mongodb");
const { events } = require("../config/mongoCollections");
const userData = require("./users");
const v = require("../helpers");

const slots = ["morning", "afternoon", "evening", "night"];

const imageSets = {
  "Academic/Out of School time": [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
  ],
  "Arts/Culture": [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  ],
  "Family Festival": [
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  ],
  Fitness: [
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
  ],
  "Mobile Unit": [
    "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1525186402429-b4ff38bedec6?auto=format&fit=crop&w=900&q=80",
  ],
  Performance: [
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=900&q=80",
  ],
  Sport: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
  ],
};

const titleImageSets = [
  {
    words: ["wedding"],
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    words: ["picnic"],
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    words: ["career", "school", "academic"],
    images: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    words: ["dance", "disco", "music", "concert"],
    images: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    words: ["basketball", "pool", "pickle", "tournament", "run", "sport", "snl", "saturday night lights"],
    images: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const boroughImages = {
  Manhattan: [
    "https://www.civitatis.com/f/estados-unidos/nueva-york/free-tour-midtown-manhattan-589x392.jpg",
    "https://azure-na-images.contentstack.com/v3/assets/blt738d1897c3c93fa6/bltfa5d0fb785639f6f/685040c8f7cdb0fdfa0e6392/MG_1_1_New_York_City_1.webp",
  ],
  Brooklyn: [
    "https://thumbs.6sqft.com/wp-content/uploads/2022/06/23011308/View_of_Manhattan_Bridge_from_Washington_Street_in_DUMBO_Brooklyn.jpg?w=1560&format=webp",
    "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=900&q=80",
  ],
  Queens: [
    "https://blog.urbanadventures.com/wp-content/uploads/2018/07/resize-LIC-Julienne-Schaer_08-copy-2-e1532552058540.jpg",
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80",
  ],
  Bronx: [
    "https://www.nyctourism.com/_next/image/?url=https%3A%2F%2Fimages.ctfassets.net%2F1aemqu6a6t65%2F6ENKHSdVNw35xoA4YncFzz%2Fa64951cf51cf5acd9d68fe0f00cd9f7d%2FArthur_Avenue_Bronx_NYC_Photo_Lucia_Vazquez-201.jpg%3Fh%3D1280%26w%3D1920%26fit%3Dfill%26f%3Dcenter%26q%3D75%26fm%3Dwebp&w=3840&q=75",
    "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=900&q=80",
  ],
  "Staten Island": [
    "https://www.civitatis.com/f/estados-unidos/nueva-york/guia/staten-island-m.jpg",
    "https://images.unsplash.com/photo-1523374228107-6e44bd2b524e?auto=format&fit=crop&w=900&q=80",
  ],
};

const norm = (s) => {
  if (!s) return "";
  return s.toString().replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
};

const keyText = (s) => norm(s).replace(/[^a-z0-9]+/g, "");

const seriesText = (s) => {
  return norm(s)
    .split(" ")
    .map((w) => {
      if (w.length > 3 && w.endsWith("s")) return w.slice(0, -1);
      return w;
    })
    .join("")
    .replace(/[^a-z0-9]+/g, "");
};

const displayCategory = (ev) => {
  const cat = ev.category || "";
  if (v.categories.includes(cat)) return cat;
  const txt = norm((ev.title || "") + " " + cat);
  if (txt.includes("academic") || txt.includes("school") || txt.includes("career")) return "Academic/Out of School time";
  if (txt.includes("family") || txt.includes("festival") || txt.includes("celebration") || txt.includes("picnic") || txt.includes("wedding") || txt.includes("special event")) return "Family Festival";
  if (txt.includes("mobile")) return "Mobile Unit";
  if (txt.includes("dance") || txt.includes("music") || txt.includes("concert") || txt.includes("jazz") || txt.includes("art") || txt.includes("culture")) return "Arts/Culture";
  if (txt.includes("performance") || txt.includes("theater") || txt.includes("show")) return "Performance";
  if (txt.includes("fitness") || txt.includes("run") || txt.includes("yoga") || txt.includes("walk")) return "Fitness";
  if (txt.includes("sport") || txt.includes("pool") || txt.includes("pickle") || txt.includes("tournament") || txt.includes("saturday night lights") || txt.includes("snl")) return "Sport";
  return cat || "Community";
};

const eventImage = (ev, pos) => {
  if (ev.image) return ev.image;
  if (Array.isArray(ev.photos) && ev.photos[0]) return ev.photos[0];
  const txt = norm((ev.title || "") + " " + (ev.category || ""));
  for (const item of titleImageSets) {
    if (item.words.some((w) => txt.includes(w))) {
      return item.images[pos % item.images.length];
    }
  }
  const cat = displayCategory(ev);
  const list = imageSets[cat] || boroughImages[ev.borough] || boroughImages.Manhattan;
  return list[pos % list.length];
};

const eventLocation = (ev) => {
  return ev.location || ev.venueName || "";
};

const eventMapUrl = (ev) => {
  const loc = eventLocation(ev);
  if (!loc) return "";
  const q = [loc, ev.borough, "NYC"].filter(Boolean).join(", ");
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
};

const prepEvent = (ev, pos) => {
  if (!ev) return ev;
  const attendees = ev.attendees || [];
  const reviews = ev.reviews || [];
  let averageRating = 0;
  if (reviews.length > 0) {
    let sum = 0;
    for (const r of reviews) sum += Number(r.rating) || 0;
    averageRating = Number((sum / reviews.length).toFixed(1));
  }
  const cap = (typeof ev.attendanceCap === "number" && ev.attendanceCap > 0) ? ev.attendanceCap : null;
  const spotsLeft = cap === null ? null : Math.max(0, cap - attendees.length);
  return {
    ...ev,
    displayCategory: displayCategory(ev),
    image: eventImage(ev, pos),
    locationText: eventLocation(ev),
    mapUrl: eventMapUrl(ev),
    attendeeCount: attendees.length,
    averageRating,
    attendanceCap: cap,
    spotsLeft,
    isFull: cap !== null && spotsLeft === 0,
  };
};

const prepList = (list) => {
  const seen = new Set();
  const out = [];
  for (const ev of list) {
    const loc = ev.location || ev.venueName || "";
    let k = keyText(ev.title) + "|" + ev.startDate + "|" + keyText(loc);
    if (ev.creator === "NYC OpenData") {
      k = seriesText(ev.title);
    }
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(prepEvent(ev, out.length));
  }
  return out;
};

const inSlot = (time, slot) => {
  if (slot === "morning") return time >= "06:00" && time < "12:00";
  if (slot === "afternoon") return time >= "12:00" && time < "17:00";
  if (slot === "evening") return time >= "17:00" && time < "21:00";
  if (slot === "night") return time >= "21:00" || time < "06:00";
  return true;
};

const create = async (input, userId) => {
  if (!input || typeof input !== "object") throw new Error("Event input required");
  const uid = v.isId(userId);

  const title = v.isLen(input.title, "title", 3, 100);
  const borough = v.isBorough(input.borough);
  const location = v.isLen(input.location, "location", 2, 100);
  const category = v.isCategory(input.category);
  const date = v.isDate(input.date);
  const startTime = v.isTime(input.startTime, "startTime");
  const endTime = v.isTime(input.endTime, "endTime");
  if (startTime >= endTime) throw new Error("End time must be after start time");

  let description = "";
  if (input.description && typeof input.description === "string" && input.description.trim()) {
    description = v.isLen(input.description, "description", 1, 300);
  }

  let attendanceCap = null;
  if (input.attendanceCap !== undefined && input.attendanceCap !== null && String(input.attendanceCap).trim() !== "") {
    attendanceCap = v.isPosInt(input.attendanceCap, "attendanceCap", 100000);
  }

  const u = await userData.getById(uid);
  const creator = u.firstName + " " + u.lastName;

  const doc = {
    title: v.clean(title),
    description: v.clean(description),
    category,
    borough,
    venueName: v.clean(location),
    venueId: null,
    location: v.clean(location),
    startDate: date,
    endDate: date,
    startTime,
    endTime,
    isPermitted: false,
    isFlagged: false,
    createdBy: new ObjectId(uid),
    creator: v.clean(creator),
    photos: [],
    comments: [],
    reviews: [],
    attendees: [],
    attendanceCap,
    createdAt: new Date(),
  };

  const col = await events();
  const r = await col.insertOne(doc);
  if (!r.acknowledged) throw new Error("Failed to create event");
  doc._id = r.insertedId;

  await userData.addEventTo(uid, "createdEvents", r.insertedId.toString());
  return doc;
};

const getAll = async () => {
  const col = await events();
  const list = await col.find({}).sort({ startDate: 1 }).toArray();
  return prepList(list);
};

const getById = async (id) => {
  const ok = v.isId(id);
  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(ok) });
  if (!ev) throw new Error("Event not found");
  if (ev.reviews && ev.reviews.length > 0) {
    let sum = 0;
    for (const r of ev.reviews) sum += Number(r.rating) || 0;
    ev.averageRating = (sum / ev.reviews.length).toFixed(1);
  }
  return prepEvent(ev);
};

const getSimilar = async (id, limit) => {
  const ok = v.isId(id);
  const max = typeof limit === "number" && limit > 0 ? Math.min(limit, 12) : 4;
  const col = await events();
  const self = await col.findOne({ _id: new ObjectId(ok) });
  if (!self) return [];
  const list = await col.find({
    _id: { $ne: new ObjectId(ok) },
    $or: [
      { borough: self.borough },
      { category: self.category },
    ],
  }).sort({ startDate: 1 }).limit(max * 3).toArray();
  return prepList(list).slice(0, max);
};

const search = async (filters) => {
  const q = {};
  let slot = "";
  let category = "";
  if (filters && typeof filters === "object") {
    if (filters.borough) {
      const b = v.isBorough(filters.borough);
      q.borough = b;
    }
    if (filters.category) {
      category = v.isCategory(filters.category);
    }
    if (filters.date) {
      const d = v.isDate(filters.date);
      q.startDate = d;
    }
    if (filters.time) {
      slot = v.isStr(filters.time, "time").toLowerCase();
      if (!slots.includes(slot)) throw new Error("invalid time");
    }
  }
  const col = await events();
  let list = await col.find(q).sort({ startDate: 1 }).toArray();
  if (slot) list = list.filter((ev) => inSlot(ev.startTime, slot));
  if (category) list = list.filter((ev) => displayCategory(ev) === category);
  return prepList(list);
};

const update = async (id, userId, input) => {
  const ok = v.isId(id);
  const uid = v.isId(userId);
  if (!input || typeof input !== "object") throw new Error("Event input required");

  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(ok) });
  if (!ev) throw new Error("Event not found");
  if (ev.createdBy.toString() !== uid) throw new Error("Not your event");

  const title = v.isLen(input.title, "title", 3, 100);
  const borough = v.isBorough(input.borough);
  const location = v.isLen(input.location, "location", 2, 100);
  const category = v.isCategory(input.category);
  const date = v.isDate(input.date);
  const startTime = v.isTime(input.startTime, "startTime");
  const endTime = v.isTime(input.endTime, "endTime");
  if (startTime >= endTime) throw new Error("End time must be after start time");

  let description = "";
  if (input.description && typeof input.description === "string" && input.description.trim()) {
    description = v.isLen(input.description, "description", 1, 300);
  }

  let attendanceCap = null;
  if (input.attendanceCap !== undefined && input.attendanceCap !== null && String(input.attendanceCap).trim() !== "") {
    attendanceCap = v.isPosInt(input.attendanceCap, "attendanceCap", 100000);
    const currentCount = (ev.attendees || []).length;
    if (attendanceCap < currentCount) {
      throw new Error("attendanceCap cannot be less than current attendees (" + currentCount + ")");
    }
  }

  const set = {
    title: v.clean(title),
    description: v.clean(description),
    category,
    borough,
    venueName: v.clean(location),
    location: v.clean(location),
    startDate: date,
    endDate: date,
    startTime,
    endTime,
    attendanceCap,
  };

  const r = await col.updateOne({ _id: new ObjectId(ok) }, { $set: set });
  if (r.matchedCount === 0) throw new Error("Event not found");
  return await col.findOne({ _id: new ObjectId(ok) });
};

const remove = async (id, userId) => {
  const ok = v.isId(id);
  const uid = v.isId(userId);

  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(ok) });
  if (!ev) throw new Error("Event not found");
  if (ev.createdBy.toString() !== uid) throw new Error("Not your event");

  const r = await col.deleteOne({ _id: new ObjectId(ok) });
  if (r.deletedCount === 0) throw new Error("Failed to delete event");

  await userData.removeEventFromAll(ok);
  return { _id: ok, deleted: true };
};

const addAttendee = async (eventId, userId, userName) => {
  const eid = v.isId(eventId);
  const uid = v.isId(userId);
  const name = v.isStr(userName, "userName");

  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(eid) });
  if (!ev) throw new Error("Event not found");

  const already = (ev.attendees || []).some((a) => a.userId.toString() === uid);
  if (already) throw new Error("Already attending");

  if (typeof ev.attendanceCap === "number" && ev.attendanceCap > 0 && (ev.attendees || []).length >= ev.attendanceCap) {
    throw new Error("Event is full");
  }

  const att = {
    _id: new ObjectId(),
    userId: new ObjectId(uid),
    userName: v.clean(name),
    status: "going",
    rsvpedAt: new Date(),
  };
  await col.updateOne(
    { _id: new ObjectId(eid) },
    { $push: { attendees: att } }
  );
  await userData.addEventTo(uid, "rsvpedEvents", eid);
  return att;
};

const removeAttendee = async (eventId, userId) => {
  const eid = v.isId(eventId);
  const uid = v.isId(userId);

  const col = await events();
  const r = await col.updateOne(
    { _id: new ObjectId(eid) },
    { $pull: { attendees: { userId: new ObjectId(uid) } } }
  );
  if (r.matchedCount === 0) throw new Error("Event not found");
  await userData.removeEventFrom(uid, "rsvpedEvents", eid);
  return true;
};

const addComment = async (eventId, userId, userName, text) => {
  const eid = v.isId(eventId);
  const uid = v.isId(userId);
  const name = v.isStr(userName, "userName");
  const t = v.isLen(text, "comment", 3, 500);

  const col = await events();
  const cm = {
    _id: new ObjectId(),
    userId: new ObjectId(uid),
    userName: v.clean(name),
    text: v.clean(t),
    postedAt: new Date(),
  };
  const r = await col.updateOne(
    { _id: new ObjectId(eid) },
    { $push: { comments: cm } }
  );
  if (r.matchedCount === 0) throw new Error("Event not found");
  return cm;
};

const removeComment = async (eventId, commentId, userId, isAdmin) => {
  const eid = v.isId(eventId);
  const cid = v.isId(commentId);
  const uid = v.isId(userId);

  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(eid) });
  if (!ev) throw new Error("Event not found");

  const cm = (ev.comments || []).find((c) => c._id.toString() === cid);
  if (!cm) throw new Error("Comment not found");
  if (!isAdmin && cm.userId.toString() !== uid) throw new Error("Not your comment");

  await col.updateOne(
    { _id: new ObjectId(eid) },
    { $pull: { comments: { _id: new ObjectId(cid) } } }
  );
  return true;
};

const addReview = async (eventId, userId, userName, rating, text) => {
  const eid = v.isId(eventId);
  const uid = v.isId(userId);
  const name = v.isStr(userName, "userName");

  const r = parseInt(rating, 10);
  if (isNaN(r) || r < 1 || r > 5) throw new Error("Rating must be 1-5");

  let cleanText = "";
  if (text && typeof text === "string" && text.trim()) {
    cleanText = v.isLen(text, "review", 10, 500);
  }

  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(eid) });
  if (!ev) throw new Error("Event not found");

  const endDt = new Date(ev.endDate + "T" + ev.endTime + ":00");
  if (endDt > new Date()) throw new Error("Reviews can only be submitted after the event has ended");

  const exists = (ev.reviews || []).some((rv) => rv.userId.toString() === uid);
  if (exists) throw new Error("You already reviewed this event");

  const review = {
    _id: new ObjectId(),
    userId: new ObjectId(uid),
    userName: v.clean(name),
    rating: r,
    text: v.clean(cleanText),
    postedAt: new Date(),
  };
  await col.updateOne(
    { _id: new ObjectId(eid) },
    { $push: { reviews: review } }
  );

  const after = await col.findOne({ _id: new ObjectId(eid) });
  let sum = 0;
  for (const x of after.reviews) sum += Number(x.rating) || 0;
  const avg = (sum / after.reviews.length).toFixed(1);

  return { review, averageRating: avg, count: after.reviews.length };
};

const removeReview = async (eventId, reviewId, userId, isAdmin) => {
  const eid = v.isId(eventId);
  const rid = v.isId(reviewId);
  const uid = v.isId(userId);

  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(eid) });
  if (!ev) throw new Error("Event not found");

  const rv = (ev.reviews || []).find((x) => x._id.toString() === rid);
  if (!rv) throw new Error("Review not found");
  if (!isAdmin && rv.userId.toString() !== uid) throw new Error("Not your review");

  await col.updateOne(
    { _id: new ObjectId(eid) },
    { $pull: { reviews: { _id: new ObjectId(rid) } } }
  );

  const after = await col.findOne({ _id: new ObjectId(eid) });
  let avg = null;
  if (after.reviews && after.reviews.length > 0) {
    let sum = 0;
    for (const x of after.reviews) sum += Number(x.rating) || 0;
    avg = (sum / after.reviews.length).toFixed(1);
  }
  return { averageRating: avg, count: (after.reviews || []).length };
};

const flagEvent = async (eventId) => {
  const eid = v.isId(eventId);
  const col = await events();
  const r = await col.updateOne(
    { _id: new ObjectId(eid) },
    { $set: { isFlagged: true } }
  );
  if (r.matchedCount === 0) throw new Error("Event not found");
  return true;
};

const unflagEvent = async (eventId) => {
  const eid = v.isId(eventId);
  const col = await events();
  const r = await col.updateOne(
    { _id: new ObjectId(eid) },
    { $set: { isFlagged: false } }
  );
  if (r.matchedCount === 0) throw new Error("Event not found");
  return true;
};

const getFlagged = async () => {
  const col = await events();
  return await col.find({ isFlagged: true }).sort({ createdAt: -1 }).toArray();
};

const getFlaggedComments = async () => {
  const col = await events();
  const all = await col
    .find({ "comments.isFlagged": true })
    .toArray();
  const result = [];
  for (const ev of all) {
    for (const cm of ev.comments || []) {
      if (cm.isFlagged) {
        result.push({
          ...cm,
          eventId: ev._id,
          eventTitle: ev.title,
        });
      }
    }
  }
  return result;
};

const flagComment = async (eventId, commentId) => {
  const eid = v.isId(eventId);
  const cid = v.isId(commentId);
  const col = await events();
  const r = await col.updateOne(
    { _id: new ObjectId(eid), "comments._id": new ObjectId(cid) },
    { $set: { "comments.$.isFlagged": true } }
  );
  if (r.matchedCount === 0) throw new Error("Event or comment not found");
  return true;
};

const unflagComment = async (eventId, commentId) => {
  const eid = v.isId(eventId);
  const cid = v.isId(commentId);
  const col = await events();
  const r = await col.updateOne(
    { _id: new ObjectId(eid), "comments._id": new ObjectId(cid) },
    { $set: { "comments.$.isFlagged": false } }
  );
  if (r.matchedCount === 0) throw new Error("Event or comment not found");
  return true;
};

const adminRemoveEvent = async (eventId) => {
  const eid = v.isId(eventId);
  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(eid) });
  if (!ev) throw new Error("Event not found");
  await col.deleteOne({ _id: new ObjectId(eid) });
  await userData.removeEventFromAll(eid);
  return { _id: eid, deleted: true };
};

module.exports = {
  create,
  getAll,
  getById,
  getSimilar,
  search,
  update,
  remove,
  addAttendee,
  removeAttendee,
  addComment,
  removeComment,
  addReview,
  removeReview,
  flagEvent,
  unflagEvent,
  getFlagged,
  getFlaggedComments,
  flagComment,
  unflagComment,
  adminRemoveEvent,
};
