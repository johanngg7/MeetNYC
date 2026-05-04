const { MongoClient } = require("mongodb");

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/meetnyc";

let _client;
let _db;

const dbConnection = async () => {
  if (!_db) {
    _client = await MongoClient.connect(mongoUrl);
    _db = _client.db();
  }
  return _db;
};

const closeConnection = async () => {
  if (_client) await _client.close();
};

module.exports = { dbConnection, closeConnection, mongoUrl };
