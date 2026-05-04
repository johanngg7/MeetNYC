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
  if (dupEmail) throw new Error("email already used");
  const dupHandle = await col.findOne({ handle: hd });
  if (dupHandle) throw new Error("handle already used");

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
  if (!r.acknowledged) throw new Error("failed to create user");
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
  if (!u) throw new Error("user not found");
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
    throw new Error("password required");
  }
  const col = await users();
  const u = await col.findOne({ email: em });
  if (!u) throw new Error("invalid email or password");
  const ok = await bcrypt.compare(password, u.hashedPassword);
  if (!ok) throw new Error("invalid email or password");
  delete u.hashedPassword;
  return u;
};

const update = async (id, updates) => {
  throw new Error("Not implemented");
};

const remove = async (id) => {
  throw new Error("Not implemented");
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
};
