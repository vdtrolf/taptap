let db = null;
const debug = false;

const createDb = () => {
  const { AceBase } = require("acebase");
  const options = { logLevel: "info" }; //   'verbose'};
  db = new AceBase("my_db", options);
};

const cleanDb = () => {
  if (db && db.ready()) {
    db.query("island").take(1000).remove();
    db.query("session").take(1000).remove();
  }
};

const putItem = async (tableName, Item, uniqueId) => {

  if (debug) console.log("acebasehelper.js - putItem : " + tableName + " (" + uniqueId + ")");


  if (db && db.ready()) {
    db.ref(`${tableName}/${uniqueId}`).transaction(value => {
      return Item ; // tableName/uniqueId will be set to return value
    });
  }
}

const getItem = async (tableName, uniqueId) => {
  if (debug) console.log( "acebasehelper.js - getItem: table " + tableName + " id " + uniqueId);

  let result = undefined;

  if (db && db.ready()) {
  
    let data = await db.ref(`${tableName}/${uniqueId}`).get();     
    if (data.exists()) {
      let id = data.val().id;
      if (debug) console.log( "acebasehelper.js - getItem: found " + tableName + " with id " + data.val().id);
      result = data.val();
    } else {
      console.err( "acebasehelper.js - getItem: problem getting data for " + tableName + "/" + uniqueId, err);
      result = {};
    }
  } else {
    console.log("acebasehelper.js - getItem: no db");
  }
  return result;
};

const getAsyncItem = async (tableName, uniqueId) => {
  return getItem(tableName, uniqueId);
};

const getItems = (
  tableName,
  callbackFunction,
  filterIdx = "id",
  filterComparator = ">",
  filterVal = 0
) => {
  if (debug)
    console.log(
      "acebasehelper.js - getItems: table " +
        tableName +
        " filter " +
        filterIdx +
        filterComparator +
        filterVal
    );

  if (db && db.ready()) {
    try {
      db.query(tableName)
        .filter(filterIdx, filterComparator, filterVal)
        .get((snapshots) => {
          callbackFunction(snapshots.getValues());
        });
    } catch (error) {
      console.error("acebasehelpers.js - getItems: ", error);
    }
  }
};

const getAsyncItems = async (
  tableName,
  filterIdx = "id",
  filterComparator = ">",
  filterVal = 0
) => {
  
  let result = null;
  
  if (db && db.ready()) {
    try {
      db.query(tableName)
        .filter(filterIdx, filterComparator, filterVal)
        .get((snapshots) => {
          result = snapshots.getValues();
        });
    } catch (error) {
      console.error("acebasehelpers.js - getItems: ", error);
    }
  }
  
  return result;
  
} 
  
const deleteItem = (tableName, uniqueId) => {
  if (db && db.ready()) {
    db.ref(`${tableName}/${uniqueId}`).remove();
    return true;
  } else {
    return false;
  }
};
  
// now we export the class, so other modules can create Penguin objects
module.exports = {
  getAsyncItem,
  getAsyncItems,
  putItem,
  getItem,
  getItems,
  deleteItem,
  createDb,
  cleanDb,
};
