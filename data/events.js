const { ObjectId } = require("mongodb");
const { events } = require("../config/mongoCollections");
const userData = require("./users");
const v = require("../helpers");

const create = async (input, userId) => {
  if (!input || typeof input !== "object") throw new Error("event input required");
  const uid = v.isId(userId);

  const title = v.isLen(input.title, "title", 3, 100);
  const borough = v.isBorough(input.borough);
  const location = v.isLen(input.location, "location", 2, 100);
  const category = v.isCategory(input.category);
  const date = v.isDate(input.date);
  const startTime = v.isTime(input.startTime, "startTime");
  const endTime = v.isTime(input.endTime, "endTime");
  if (startTime >= endTime) throw new Error("endTime must be after startTime");

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
  if (!r.acknowledged) throw new Error("failed to create event");
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
  if (!ev) throw new Error("event not found");
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
  if (!input || typeof input !== "object") throw new Error("event input required");

  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(ok) });
  if (!ev) throw new Error("event not found");
  if (ev.createdBy.toString() !== uid) throw new Error("not your event");

  const title = v.isLen(input.title, "title", 3, 100);
  const borough = v.isBorough(input.borough);
  const location = v.isLen(input.location, "location", 2, 100);
  const category = v.isCategory(input.category);
  const date = v.isDate(input.date);
  const startTime = v.isTime(input.startTime, "startTime");
  const endTime = v.isTime(input.endTime, "endTime");
  if (startTime >= endTime) throw new Error("endTime must be after startTime");

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
  if (r.matchedCount === 0) throw new Error("event not found");
  return await col.findOne({ _id: new ObjectId(ok) });
};

const remove = async (id, userId) => {
  const ok = v.isId(id);
  const uid = v.isId(userId);

  const col = await events();
  const ev = await col.findOne({ _id: new ObjectId(ok) });
  if (!ev) throw new Error("event not found");
  if (ev.createdBy.toString() !== uid) throw new Error("not your event");

  const r = await col.deleteOne({ _id: new ObjectId(ok) });
  if (r.deletedCount === 0) throw new Error("failed to delete event");

  await userData.removeEventFrom(uid, "createdEvents", ok);
  return { _id: ok, deleted: true };
};

module.exports = { create, getAll, getById, search, update, remove };
