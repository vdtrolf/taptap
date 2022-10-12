const { AceBase } = require("acebase");

let db = null;
const debug = true;

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
  if (db && db.ready()) {
    db.ref(`${tableName}/${uniqueId}`).set(Item);
    
    console.log("================ put ======");
    console.dir(Item);
    console.log("================ land ======");

    return true;
  } else {
    return false;
  }
};

const getItem = (tableName, uniqueId) => {
  if (debug)
    console.log(
      "acebasehelper.js - getItem: table " + tableName + " id " + uniqueId
    );

  if (db && db.ready()) {
    db.ref(`${tableName}/${uniqueId}`).get((data) => {
      try {
        let id = data.val().id;
        return data.val();
      } catch (error) {
        console.err(
          "acebasehelper.js - getItem: problem setting data for " +
            tableName +
            "/" +
            uniqueId,
          err
        );
        return undefined;
      }
    });
  } else {
    return undefined;
  }
};

const getAsyncItems = async (
    tableName,
    filterIdx = "id",
    filterComparator = ">",
    filterVal = 0
  ) => {
    if (debug)
      console.log(
        "acebasehelper.js - getAsyncItems: table " +
          tableName +
          " filter " +
          filterIdx +
          filterComparator +
          filterVal
      );
  
    if (db && db.ready()) {
      try {

        const snapshots = await db.query(tableName)
          .filter(filterIdx, filterComparator, filterVal)
          .get()
          
        console.log("-------------------");  
        console.dir(snapshots.getValues());
        console.log("-------------------");  
        
        return snapshots.getValues();

      } catch (error) {
        console.error("acebasehelpers.js - getAsyncItems: ", error);
      }
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

// 
//   putItem,
//   getItem,
//   deleteItem,
//   createDb,
//   cleanDb,