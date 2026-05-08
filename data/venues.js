const { ObjectId } = require("mongodb");
const { venues } = require("../config/mongoCollections");
const v = require("../helpers");

const create = async (venueObj) => {
  if (!venueObj || typeof venueObj !== "object") throw new Error("Venue input required");
  const name = v.isLen(venueObj.name, "name", 2, 200);
  const borough = v.isBorough(venueObj.borough);

  const col = await venues();
  const existing = await col.findOne({ name, borough });
  if (existing) return existing;

  const doc = {
    name: v.clean(name),
    borough,
    locationType: venueObj.locationType ? v.clean(v.isStr(venueObj.locationType, "locationType")) : null,
    location: v.clean(name),
    createdAt: new Date(),
  };
  const r = await col.insertOne(doc);
  if (!r.acknowledged) throw new Error("Failed to create venue");
  doc._id = r.insertedId;
  return doc;
};

const getAll = async () => {
  const col = await venues();
  return await col.find({}).sort({ name: 1 }).toArray();
};

const getById = async (id) => {
  const ok = v.isId(id);
  const col = await venues();
  const venue = await col.findOne({ _id: new ObjectId(ok) });
  if (!venue) throw new Error("Venue not found");
  return venue;
};

const getByBorough = async (borough) => {
  const bo = v.isBorough(borough);
  const col = await venues();
  return await col.find({ borough: bo }).sort({ name: 1 }).toArray();
};

module.exports = { create, getAll, getById, getByBorough };
