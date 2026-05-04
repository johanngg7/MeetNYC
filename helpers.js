const xss = require("xss");
const { ObjectId } = require("mongodb");

const boroughs = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

const isStr = (s, name) => {
  if (typeof s !== "string") throw new Error(name + " must be a string");
  const t = s.trim();
  if (!t) throw new Error(name + " cannot be empty");
  return t;
};

const isName = (s, name) => {
  const t = isStr(s, name);
  if (t.length < 2 || t.length > 25) throw new Error(name + " must be 2-25 chars");
  if (!/^[a-zA-Z]+$/.test(t)) throw new Error(name + " must be letters only");
  return t;
};

const isEmail = (s) => {
  const t = isStr(s, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) throw new Error("invalid email");
  return t;
};

const isHandle = (s) => {
  const t = isStr(s, "handle").toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(t)) {
    throw new Error("handle must be 3-20 chars, letters/numbers/underscore only");
  }
  return t;
};

const isPwd = (s) => {
  if (typeof s !== "string") throw new Error("password must be a string");
  if (s.length < 8) throw new Error("password must be at least 8 chars");
  if (!/[A-Z]/.test(s)) throw new Error("password must have an uppercase letter");
  if (!/[0-9]/.test(s)) throw new Error("password must have a number");
  if (!/[^a-zA-Z0-9]/.test(s)) throw new Error("password must have a special char");
  if (/\s/.test(s)) throw new Error("password cannot have spaces");
  return s;
};

const isBorough = (s) => {
  const t = isStr(s, "borough");
  if (!boroughs.includes(t)) throw new Error("borough must be one of " + boroughs.join(", "));
  return t;
};

const isId = (s) => {
  const t = isStr(s, "id");
  if (!ObjectId.isValid(t)) throw new Error("invalid id");
  return t;
};

const clean = (s) => xss(s);

module.exports = { isStr, isName, isEmail, isHandle, isPwd, isBorough, isId, clean, boroughs };
