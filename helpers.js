const xss = require("xss");
const { ObjectId } = require("mongodb");

const boroughs = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

const categories = [
  "Academic/Out of School time",
  "Arts/Culture",
  "Family Festival",
  "Fitness",
  "Mobile Unit",
  "Performance",
  "Sport",
];

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

const cleanOpts = { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ["script", "style"] };
const clean = (s) => xss(s, cleanOpts);

const isLen = (s, name, min, max) => {
  const t = isStr(s, name);
  if (t.length < min || t.length > max) {
    throw new Error(name + " must be " + min + "-" + max + " chars");
  }
  return t;
};

const isCategory = (s) => {
  const t = isStr(s, "category");
  if (!categories.includes(t)) throw new Error("invalid category");
  return t;
};

const isDate = (s) => {
  const t = isStr(s, "date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) throw new Error("date must be YYYY-MM-DD");
  const parts = t.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const day = Number(parts[2]);
  const d = new Date(Date.UTC(y, m - 1, day));
  if (
    d.getUTCFullYear() !== y ||
    d.getUTCMonth() !== m - 1 ||
    d.getUTCDate() !== day
  ) {
    throw new Error("invalid date");
  }
  return t;
};

const isTime = (s, name) => {
  const t = isStr(s, name);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) throw new Error(name + " must be HH:MM");
  return t;
};

const isPosInt = (val, name, max) => {
  const n = typeof val === "string" ? Number(val.trim()) : Number(val);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    throw new Error(name + " must be a positive integer");
  }
  if (typeof max === "number" && n > max) {
    throw new Error(name + " must be at most " + max);
  }
  return n;
};

module.exports = {
  isStr,
  isName,
  isEmail,
  isHandle,
  isPwd,
  isBorough,
  isId,
  isLen,
  isCategory,
  isDate,
  isTime,
  isPosInt,
  clean,
  boroughs,
  categories,
};
