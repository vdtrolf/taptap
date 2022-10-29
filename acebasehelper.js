const { AceBase } = require("acebase");

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;
const LOGINFO = loggerReq.LOGINFO;
const LOGERR = loggerReq.LOGERR;
const LOGDATA = loggerReq.LOGDATA;

const realm = "db";
const source = "acebasehelper.js";


let db = null;
const debug = false;

const createDb = () => {
  if (db === null) {
    const options = { logLevel: "err" }; //   'verbose'};
    db = new AceBase("my_db", options);
  }
};

const cleanDb = () => {
  if (db && db.ready()) {
    db.query("island").take(1000).remove();
  }
};

const putItem = (tableName, Item, uniqueId) => {
  
  log(realm, source, "putItem", 
          "table " +
          tableName +
          " id: " +
          uniqueId,LOGINFO, LOGDATA);

  
  if (db && db.ready()) {
    db.ref(`${tableName}/${uniqueId}`).set(Item);
 
    
    //console.log("================ put ======");
    //console.dir(Item);
    //console.log("================ put ======");

    return true;
  } else {
    return false;
  }
};

const getItem = async (tableName, uniqueId) => {

  log(realm, source, "getItem", 
          "table " +
          tableName +
          " id: " +
          uniqueId,LOGINFO, LOGDATA);

  if (db && db.ready()) {
    const data = await db.ref(`${tableName}/${uniqueId}`).get();
    if (data.exists) {
      return data.val();
    } else {  
      return "no data";
    }
  } else {
    return "no db";
  }

};

const getAsyncItems = async (
    tableName,
    filterIdx = "id",
    filterComparator = ">",
    filterVal = 0
  ) => {

  log(realm, source, "getAsyncItems", 
        "table " +
        tableName +
        " filter " +
        filterIdx +
        filterComparator +
        filterVal);

  if (db && db.ready()) {

    const snapshots = await db.query(tableName)
      .filter(filterIdx, filterComparator, filterVal)
      .get();
      
    // console.log("================ getAsyncItems ======");
    // console.dir(snapshots.getValues());
    // console.log("================ getAsyncItems ======");

    return snapshots.getValues();

  } else {
    return "no db"
  }
};
  

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
  getAsyncItems,
  putItem,
  getItem,
  deleteItem,
  createDb,
  cleanDb
};

