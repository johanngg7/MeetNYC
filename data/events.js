const { ObjectId } = require("mongodb");
const { events } = require("../config/mongoCollections");
const userData = require("./users");
const v = require("../helpers");

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
  return await col.find({}).sort({ startDate: 1 }).toArray();
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
  return ev;
};

const search = async (filters) => {
  const q = {};
  if (filters && typeof filters === "object") {
    if (filters.borough) {
      const b = v.isBorough(filters.borough);
      q.borough = b;
    }
    if (filters.category) {
      const c = v.isCategory(filters.category);
      q.category = c;
    }
    if (filters.date) {
      const d = v.isDate(filters.date);
      q.startDate = d;
    }
  }
  const col = await events();
  return await col.find(q).sort({ startDate: 1 }).toArray();
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

  await userData.removeEventFrom(uid, "createdEvents", ok);
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

module.exports = {
  create,
  getAll,
  getById,
  search,
  update,
  remove,
  addAttendee,
  removeAttendee,
  addComment,
  removeComment,
  addReview,
  removeReview,
};
