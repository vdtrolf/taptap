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
    const options = { logLevel: "verbose" }; //   'err'};
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
    db.ref(`${tableName}/${uniqueId}`).set(JSON.stringify(Item));
 
    
    //console.log("================ put ======");
    //console.dir(Item);
    //console.log("================ land ======");

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

  var returnValues = undefined; 

  if (db && db.ready()) {
    returnValues = await db.ref(`${tableName}/${uniqueId}`).get((data) => {
      if (data.exists) {
        return data.val();
      } else {  
        return undefined;
      }
    });
  } 

  return returnValues;

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
      try {

        const snapshots = await db.query(tableName)
          .filter(filterIdx, filterComparator, filterVal)
          .get()
          
        log(realm, source, "getAsyncItems", snapshots.getValues(), LOGVERB, LOGDATA);
        
        //console.log("-------------------");  
        console.dir(snapshots.getValues());
        //console.log("-------------------");  
        
        return snapshots.getValues();

      } catch (error) {
        console.error("acebasehelpers.js - getAsyncItems: ", error);
      }
    }
  };
  
  
const getAllItems = async (tableName) => {

  log(realm, source, "getAllItems", 
          "table " +
          tableName,LOGINFO, LOGDATA);


  if (db) {
    // db.ref(`${tableName}`).get((data) => {
    const count = await db.query('island')
    .filter('id', '>', 0)
    .count();
    
    
    
    
    //.get(snapshot => {
      // if (snapshot.exists()) {
    console.log("===>>>" + count);
      // } else {
      //  console.log("no data")
      // }
    // });


  } else {
    return undefined;
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
  getAllItems,
  putItem,
  getItem,
  deleteItem,
  createDb,
  cleanDb
};

// 
//   putItem,
//   getItem,
//   deleteItem,
//   createDb,
//   cleanDb,