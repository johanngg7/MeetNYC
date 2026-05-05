const { dbConnection } = require("./mongoConnection");

const getCol = (name) => {
  let _col;
  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = db.collection(name);
    }
    return _col;
  };
};

module.exports = {
  users: getCol("users"),
  events: getCol("events"),
  venues: getCol("venues"),
};
