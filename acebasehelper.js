const { AceBase } = require('acebase');

let db = null;

const createDb = () => {
  const options = { logLevel: 'err'};  //   'verbose'};
  db = new AceBase('my_db',options);
} 

const cleanDb = () => {
  
  if (db && db.ready() ) {
    
    db.ref('land')
    .update({ 112517: null })
    .then(ref => console.log("done"));
    
    
    db.query('island')
    .take(1000)
    .remove();
    db.query('lands')
    .take(1000)
    .remove();
    db.query('penguins')
    .take(1000)
    .remove();
    db.query('session')
    .take(1000)
    .remove();
  }

} 

const remove = (path) => {
  
  console.log('going to remove ' + path);
  
     db.query(path)
    .remove(result => console.log(result));
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

const getItems = (tableName, callbackFunction, filter) => {
  
  console.log("acebasehelper.js - getItems: table " + tableName + " filter " + filter)
  
  if (db && db.ready() ) {
    
    try {
      db.query(tableName)
      .take(1000)
//      // .filter(filter)
      .get(snapshots => {
//        console.dir(snapshots.getValues());
//        (tableName + " values: " + snapshots.getValues().length
        callbackFunction(snapshots.getValues());
      })
    } catch (error) {
      console.error("acebasehelpers.js - getItems: ",error)
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
  putItem,
  getItems,
  deleteItem,
  createDb,
  cleanDb
};
