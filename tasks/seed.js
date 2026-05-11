const { dbConnection, closeConnection } = require("../config/mongoConnection");
const { events, venues, users } = require("../config/mongoCollections");
const bcrypt = require("bcryptjs");

const PARKS_URL =
  "https://data.cityofnewyork.us/resource/6v4b-5gp4.json?$limit=100&$order=date_and_time%20DESC";
const PERM_URL =
  "https://data.cityofnewyork.us/resource/tvpp-9vvx.json?$limit=100&$order=start_date_time%20DESC";

const SEED_USER = {
  firstName: "NYC",
  lastName: "OpenData",
  email: "nycdata@meetnyc.local",
  handle: "nyc_data",
  hashedPassword: "seeded",
  borough: "Manhattan",
  profilePicture: "",
  isAdmin: false,
  isVerified: true,
  createdEvents: [],
  rsvpedEvents: [],
  savedEvents: [],
  createdAt: new Date(),
};

const ADMIN_PASSWORD = "AdminPass1!";

const ADMIN_USER = {
  firstName: "Meet",
  lastName: "Admin",
  email: "admin@meetnyc.local",
  handle: "admin",
  borough: "Manhattan",
  profilePicture: "",
  isAdmin: true,
  isVerified: true,
  createdEvents: [],
  rsvpedEvents: [],
  savedEvents: [],
  createdAt: new Date(),
};

const DEMO_PASSWORD = "DemoPass1!";

const DEMO_USER = {
  firstName: "Demo",
  lastName: "User",
  email: "demo@meetnyc.local",
  handle: "demo",
  borough: "Brooklyn",
  profilePicture: "",
  isAdmin: false,
  isVerified: false,
  createdEvents: [],
  rsvpedEvents: [],
  savedEvents: [],
  createdAt: new Date(),
};

const boros = {
  manhattan: "Manhattan",
  brooklyn: "Brooklyn",
  queens: "Queens",
  bronx: "Bronx",
  "staten island": "Staten Island",
};

const normBoro = (s) => {
  if (!s || typeof s !== "string") return null;
  return boros[s.trim().toLowerCase()] || null;
};

const ymd = (d) => {
  if (!(d instanceof Date) || isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + dd;
};

const hm = (d) => {
  if (!(d instanceof Date) || isNaN(d.getTime())) return null;
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return h + ":" + min;
};

const addHours = (d, hours) => new Date(d.getTime() + hours * 60 * 60 * 1000);

const ensureSeedUser = async () => {
  const col = await users();
  const hash = await bcrypt.hash("OpenData1!", 10);
  const ex = await col.findOne({ handle: SEED_USER.handle });
  if (ex) {
    await col.updateOne(
      { _id: ex._id },
      { $set: { ...SEED_USER, hashedPassword: hash, createdEvents: [] } }
    );
    return ex._id;
  }
  const r = await col.insertOne({ ...SEED_USER, hashedPassword: hash });
  return r.insertedId;
};

const ensureAdminUser = async () => {
  const col = await users();
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const ex = await col.findOne({ handle: ADMIN_USER.handle });
  if (ex) {
    await col.updateOne(
      { _id: ex._id },
      { $set: { ...ADMIN_USER, hashedPassword: hash } }
    );
    return ex._id;
  }
  const r = await col.insertOne({ ...ADMIN_USER, hashedPassword: hash });
  return r.insertedId;
};

const ensureDemoUser = async () => {
  const col = await users();
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const ex = await col.findOne({ handle: DEMO_USER.handle });
  if (ex) {
    await col.updateOne(
      { _id: ex._id },
      { $set: { ...DEMO_USER, hashedPassword: hash } }
    );
    return ex._id;
  }
  const r = await col.insertOne({ ...DEMO_USER, hashedPassword: hash });
  return r.insertedId;
};

const getOrCreateVenue = async (name, borough, locationType) => {
  const col = await venues();
  const ex = await col.findOne({ name, borough });
  if (ex) return ex._id;
  const r = await col.insertOne({
    name,
    borough,
    locationType: locationType || null,
    location: name,
    createdAt: new Date(),
  });
  return r.insertedId;
};

const insertEvent = async (doc, userId) => {
  const evCol = await events();
  const r = await evCol.insertOne(doc);
  const userCol = await users();
  await userCol.updateOne(
    { _id: userId },
    { $addToSet: { createdEvents: r.insertedId } }
  );
  return r.insertedId;
};

const seedParks = async (userId) => {
  const res = await fetch(PARKS_URL);
  if (!res.ok) throw new Error("parks fetch failed: " + res.status);
  const rows = await res.json();
  let count = 0;
  for (const row of rows) {
    try {
      const boro = normBoro(row.borough);
      if (!boro) continue;
      if (!row.event_name || !row.date_and_time) continue;
      const start = new Date(row.date_and_time);
      if (isNaN(start.getTime())) continue;
      const end = addHours(start, 2);
      const venueName = (row.location || "Unknown").trim();
      const venueId = await getOrCreateVenue(venueName, boro, row.location_type);
      const doc = {
        title: row.event_name.trim(),
        description: "",
        category: row.category ? row.category.trim() : "Arts/Culture",
        borough: boro,
        venueName,
        venueId,
        location: venueName,
        startDate: ymd(start),
        endDate: ymd(start),
        startTime: hm(start),
        endTime: hm(end),
        isPermitted: false,
        isFlagged: false,
        createdBy: userId,
        creator: "NYC OpenData",
        photos: [],
        comments: [],
        reviews: [],
        attendees: [],
        createdAt: new Date(),
      };
      await insertEvent(doc, userId);
      count++;
    } catch (e) {
      console.error("parks row failed:", e.message);
    }
  }
  return count;
};

const seedPermitted = async (userId) => {
  const res = await fetch(PERM_URL);
  if (!res.ok) throw new Error("permitted fetch failed: " + res.status);
  const rows = await res.json();
  let count = 0;
  for (const row of rows) {
    try {
      const boro = normBoro(row.event_borough);
      if (!boro) continue;
      if (!row.event_name || !row.start_date_time || !row.end_date_time) continue;
      const start = new Date(row.start_date_time);
      const end = new Date(row.end_date_time);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
      const venueName = (row.event_location || "Unknown").trim();
      const venueId = await getOrCreateVenue(venueName, boro, null);
      const doc = {
        title: row.event_name.trim(),
        description: "",
        category: row.event_type ? row.event_type.trim() : "Festival",
        borough: boro,
        venueName,
        venueId,
        location: venueName,
        startDate: ymd(start),
        endDate: ymd(end),
        startTime: hm(start),
        endTime: hm(end),
        isPermitted: true,
        isFlagged: false,
        createdBy: userId,
        creator: "NYC OpenData",
        photos: [],
        comments: [],
        reviews: [],
        attendees: [],
        createdAt: new Date(),
      };
      await insertEvent(doc, userId);
      count++;
    } catch (e) {
      console.error("permitted row failed:", e.message);
    }
  }
  return count;
};

const { ObjectId } = require("mongodb");

const seedDemoEvent = async (demoId) => {
  const evCol = await events();
  const today = new Date();
  const future = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
  const startDate = ymd(future);
  const doc = {
    title: "Brooklyn Pickup Soccer Game",
    description: "Friendly pickup soccer at Prospect Park. All skill levels welcome.",
    category: "Sport",
    borough: "Brooklyn",
    venueName: "Prospect Park - Long Meadow",
    venueId: null,
    location: "Prospect Park - Long Meadow",
    startDate,
    endDate: startDate,
    startTime: "14:00",
    endTime: "16:00",
    isPermitted: false,
    isFlagged: false,
    createdBy: demoId,
    creator: "Demo User",
    photos: [],
    comments: [],
    reviews: [],
    attendees: [],
    attendanceCap: 12,
    createdAt: new Date(),
  };
  const r = await evCol.insertOne(doc);
  return r.insertedId;
};

const seedDemoActivity = async (demoId) => {
  const evCol = await events();
  const userCol = await users();

  const sample = await evCol.find({ createdBy: { $ne: demoId } }).limit(6).toArray();
  if (sample.length === 0) return;

  const rsvpEvents = sample.slice(0, 3);
  const savedEvents = sample.slice(3, 5);
  const commentEvent = sample[0];
  const reviewEvent = sample[1];

  const demo = await userCol.findOne({ _id: demoId });
  const userName = demo.firstName + " " + demo.lastName;

  const demoEventId = await seedDemoEvent(demoId);

  const rsvpedIds = [];
  for (const ev of rsvpEvents) {
    const att = {
      _id: new ObjectId(),
      userId: demoId,
      userName,
      status: "going",
      rsvpedAt: new Date(),
    };
    await evCol.updateOne(
      { _id: ev._id, "attendees.userId": { $ne: demoId } },
      { $push: { attendees: att } }
    );
    rsvpedIds.push(ev._id);
  }

  const savedIds = savedEvents.map((e) => e._id);

  await userCol.updateOne(
    { _id: demoId },
    { $set: { rsvpedEvents: rsvpedIds, savedEvents: savedIds, createdEvents: [demoEventId] } }
  );

  if (commentEvent) {
    await evCol.updateOne(
      { _id: commentEvent._id },
      {
        $push: {
          comments: {
            _id: new ObjectId(),
            userId: demoId,
            userName,
            text: "Looking forward to this one — anyone want to meet up beforehand?",
            isFlagged: false,
            postedAt: new Date(),
          },
        },
      }
    );
  }

  if (reviewEvent) {
    await evCol.updateOne(
      { _id: reviewEvent._id, "reviews.userId": { $ne: demoId } },
      {
        $push: {
          reviews: {
            _id: new ObjectId(),
            userId: demoId,
            userName,
            rating: 4,
            text: "Solid event, well organized. Would attend again.",
            postedAt: new Date(),
          },
        },
      }
    );
  }
};

const seed = async () => {
  await dbConnection();
  console.log("Seeding...");

  const evCol = await events();
  const vCol = await venues();
  await evCol.deleteMany({});
  await vCol.deleteMany({});
  console.log("wiped events and venues");

  const userId = await ensureSeedUser();
  console.log("seed user ready");

  await ensureAdminUser();
  console.log("admin user ready");

  const demoId = await ensureDemoUser();
  console.log("demo user ready");

  const a = await seedParks(userId);
  console.log("parks events seeded:", a);

  const b = await seedPermitted(userId);
  console.log("permitted events seeded:", b);

  await seedDemoActivity(demoId);
  console.log("demo activity seeded");

  console.log("Done seeding. Total:", a + b);
  await closeConnection();
};

seed().catch((e) => {
  console.error(e);
  closeConnection().finally(() => process.exit(1));
});
