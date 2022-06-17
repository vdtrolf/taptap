const { AceBase } = require('acebase');

let db = null;

const createDb = () => {
  const options = { logLevel: 'err'};
  db = new AceBase('my_db',options);
} 

const putItem = (tableName, Item, uniqueId) => {

  if (db && db.ready()) {
    db.ref(`${tableName}/${uniqueId}`).set(Item);
    return true;
  } else {
    return false;
  }
};

const getItem = (tableName, uniqueId) => {

  if (db && db.ready()) {
    db.ref(`${tableName}/${uniqueId}`).get( (data) =>  {
      try {
        let id = data.val().id;
        return data.val();
      } catch (error) {
        console.err("acebasehelper.js - getItem: problem setting data for " + tableName + "/" + uniqueId, err);
        return undefined;
      }
    });
  } else {
    return undefined;
  }
};

const getItems = (tableName) => {

  if (db && db.ready()) {
    db.query(tableName)
      .get(snapshots => {
      const items = snapshots.getValues();
      // console.dir(items);
      return items;
    });
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
  putItem,
  getItems,
  deleteItem,
  createDb
};
