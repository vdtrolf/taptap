let db = null;
const debug = false;
const deepdebug = false;

const createDb = () => {
  if (db === null) {
    const { AceBaseClient } = require("acebase-client");
    const dbname = "my_db";
    db = new AceBaseClient({
      host: "localhost",
      port: 5757,
      dbname: "my_db",
      https: false,
      logLevel: "info",
    });
    db.ready(() => {
      console.log("Connected!");
    });
  }
};

const cleanDb = () => {
  if (db && db.ready()) {
    db.query("island").take(1000).remove();
    db.query("session").take(1000).remove();
  }
};

const putItem = async (tableName, Item, uniqueId) => {
  if (debug)
    console.log(
      "acebasehelper.js - putItem : " + tableName + " (" + uniqueId + ")"
    );

  if (deepdebug && tableName === "session") {
    logMoves(Item,"PUT ITEMS");
  }

  try {
    if (db && db.ready()) {
      await db.ref(`${tableName}/${uniqueId}`).transaction((value) => {
        return Item; // tableName/uniqueId will be set to return value
      });
    }
  } catch (error) {
    console.error("BLA BLA BLA");
  }
};

const getItem = async (tableName, uniqueId) => {
  if (debug)
    console.log(
      "acebasehelper.js - getItem: table " + tableName + " id " + uniqueId
    );

  let result = undefined;

  if (db && db.ready()) {
    let data = await db.ref(`${tableName}/${uniqueId}`).get();
    if (data.exists()) {
      let id = data.val().id;
      if (debug)
        console.log(
          "acebasehelper.js - getItem: found " +
            tableName +
            " with id " +
            data.val().id
        );
      result = data.val();
    } else {
      console.log(
        "acebasehelper.js - getItem: problem getting data for " +
          tableName +
          "/" +
          uniqueId
      );
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
  filterVal = 0,
  secondCallBack
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
             
           if (deepdebug && tableName === "session") {
             let sessions = snapshots.getValues();
             sessions.forEach(session => logMoves(session,"GET ITEMS"));
           }
          
           callbackFunction(snapshots.getValues(), secondCallBack);
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
    let data = await db
      .query(tableName)
      .filter(filterIdx, filterComparator, filterVal)
      .get();
    if (data) {

      // console.log("==========> > > 1")
      // console.dir(data.getValues());
      // console.log("==========> > > 1")
      
      result = data.getValues();
    } else {
      console.log(
        "acebasehelper.js - getAsyncItems: problem getting data for " +
          tableName
      );
      result = {};
    }
  } else {
    console.log("acebasehelper.js - getAsyncItems: no db");
  }

      // console.log("==========> > > 2")
      // console.dir(result);
      // console.log("==========> > > 2")


  return result;
  
};

const deleteItem = (tableName, uniqueId) => {
  if (db && db.ready()) {
    db.ref(`${tableName}/${uniqueId}`).remove();
    return true;
  } else {
    return false;
  }
};

// Creates a readable log of the moveLog 

const logMoves = (session, origin) => {
  if (session.moveLog && session.moveLog.length > 0) {
    console.log("============== " + origin + " =====================================");
    aSession.moveLog.forEach(move => {
      console.log("move " +
      move.moveid +
      " id= " +
      move.id +
      " type= " +
      move.moveType +
      " (" +
      move.state +
      ")");
      if (move.movements && move.movements.length > 0 ) {
        move.movements.forEach(movmt => console.log (
          "-> id " + movmt. movmtid + 
          " dir: " + movmt.moveDir +
          " orig: " + movmt.origH +
          "/" + movmt.origL +
          " new: " + movmt.newH +
          "/" + movmt.newL
        ));
      }
    });
    console.log("============== " + origin +" =====================================");
  }
}



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
