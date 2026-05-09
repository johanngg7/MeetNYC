const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { users } = require("../config/mongoCollections");
const v = require("../helpers");

const SALT = 10;

const create = async (firstName, lastName, email, handle, password, borough) => {
  const fn = v.isName(firstName, "firstName");
  const ln = v.isName(lastName, "lastName");
  const em = v.isEmail(email);
  const hd = v.isHandle(handle);
  v.isPwd(password);
  const bo = v.isBorough(borough);

  const col = await users();
  const dupEmail = await col.findOne({ email: em });
  if (dupEmail) throw new Error("Email already used");
  const dupHandle = await col.findOne({ handle: hd });
  if (dupHandle) throw new Error("Handle already used");

  const hash = await bcrypt.hash(password, SALT);
  const doc = {
    firstName: v.clean(fn),
    lastName: v.clean(ln),
    email: em,
    handle: hd,
    hashedPassword: hash,
    borough: bo,
    profilePicture: "",
    isAdmin: false,
    isVerified: false,
    createdEvents: [],
    rsvpedEvents: [],
    savedEvents: [],
    createdAt: new Date(),
  };
  const r = await col.insertOne(doc);
  if (!r.acknowledged) throw new Error("Failed to create user");
  doc._id = r.insertedId;
  delete doc.hashedPassword;
  return doc;
};

const getAll = async () => {
  const col = await users();
  const list = await col.find({}, { projection: { hashedPassword: 0 } }).toArray();
  return list;
};

const getById = async (id) => {
  const ok = v.isId(id);
  const col = await users();
  const u = await col.findOne(
    { _id: new ObjectId(ok) },
    { projection: { hashedPassword: 0 } }
  );
  if (!u) throw new Error("User not found");
  return u;
};

const getByEmail = async (email) => {
  const em = v.isEmail(email);
  const col = await users();
  const u = await col.findOne({ email: em });
  return u;
};

const getByHandle = async (handle) => {
  const hd = v.isHandle(handle);
  const col = await users();
  const u = await col.findOne(
    { handle: hd },
    { projection: { hashedPassword: 0 } }
  );
  return u;
};

const verify = async (email, password) => {
  const em = v.isEmail(email);
  if (typeof password !== "string" || !password) {
    throw new Error("Password required");
  }
  const col = await users();
  const u = await col.findOne({ email: em });
  if (!u) throw new Error("Invalid email or password");
  const ok = await bcrypt.compare(password, u.hashedPassword);
  if (!ok) throw new Error("Invalid email or password");
  delete u.hashedPassword;
  return u;
};

const update = async (id, updates) => {
  const ok = v.isId(id);
  if (!updates || typeof updates !== "object") throw new Error("Updates required");

  const set = {};
  if (updates.firstName !== undefined) set.firstName = v.clean(v.isName(updates.firstName, "firstName"));
  if (updates.lastName !== undefined) set.lastName = v.clean(v.isName(updates.lastName, "lastName"));
  if (updates.email !== undefined) {
    const em = v.isEmail(updates.email);
    const col = await users();
    const dup = await col.findOne({ email: em, _id: { $ne: new ObjectId(ok) } });
    if (dup) throw new Error("Email already used");
    set.email = em;
  }
  if (updates.handle !== undefined) {
    const hd = v.isHandle(updates.handle);
    const col = await users();
    const dup = await col.findOne({ handle: hd, _id: { $ne: new ObjectId(ok) } });
    if (dup) throw new Error("Handle already used");
    set.handle = hd;
  }
  if (updates.borough !== undefined) set.borough = v.isBorough(updates.borough);
  if (updates.password !== undefined) {
    v.isPwd(updates.password);
    set.hashedPassword = await bcrypt.hash(updates.password, SALT);
  }

  if (Object.keys(set).length === 0) throw new Error("No valid fields to update");

  const col = await users();
  const r = await col.updateOne({ _id: new ObjectId(ok) }, { $set: set });
  if (r.matchedCount === 0) throw new Error("User not found");
  return await getById(ok);
};

const remove = async (id) => {
  const ok = v.isId(id);
  const col = await users();
  const u = await col.findOne({ _id: new ObjectId(ok) });
  if (!u) throw new Error("User not found");
  const r = await col.deleteOne({ _id: new ObjectId(ok) });
  if (r.deletedCount === 0) throw new Error("Failed to delete user");
  return { _id: ok, deleted: true };
};

const lists = ["createdEvents", "rsvpedEvents", "savedEvents"];

const addEventTo = async (userId, listName, eventId) => {
  const uid = v.isId(userId);
  const eid = v.isId(eventId);
  if (!lists.includes(listName)) throw new Error("Invalid list name");
  const col = await users();
  const r = await col.updateOne(
    { _id: new ObjectId(uid) },
    { $addToSet: { [listName]: new ObjectId(eid) } }
  );
  if (r.matchedCount === 0) throw new Error("User not found");
  return true;
};

const removeEventFrom = async (userId, listName, eventId) => {
  const uid = v.isId(userId);
  const eid = v.isId(eventId);
  if (!lists.includes(listName)) throw new Error("Invalid list name");
  const col = await users();
  const r = await col.updateOne(
    { _id: new ObjectId(uid) },
    { $pull: { [listName]: new ObjectId(eid) } }
  );
  if (r.matchedCount === 0) throw new Error("User not found");
  return true;
};

const removeEventFromAll = async (eventId) => {
  const eid = v.isId(eventId);
  const oid = new ObjectId(eid);
  const col = await users();
  await col.updateMany(
    {},
    {
      $pull: {
        createdEvents: oid,
        rsvpedEvents: oid,
        savedEvents: oid,
      },
    }
  );
  return true;
};

const toggleAdmin = async (userId) => {
  const ok = v.isId(userId);
  const col = await users();
  const u = await col.findOne({ _id: new ObjectId(ok) });
  if (!u) throw new Error("User not found");
  const newVal = !u.isAdmin;
  await col.updateOne({ _id: new ObjectId(ok) }, { $set: { isAdmin: newVal } });
  return { ...u, isAdmin: newVal, hashedPassword: undefined };
};

module.exports = {
  create,
  getAll,
  getById,
  getByEmail,
  getByHandle,
  verify,
  update,
  remove,
  addEventTo,
  removeEventFrom,
  removeEventFromAll,
  toggleAdmin,
};
