const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const debug = false;
let dynamodb = null;


const createDb = (local) => {
  if (local) {
    dynamodb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000')});
  } else {
    dynamodb = new AWS.DynamoDB();
  }
};

const cleanDb = () => {};

const putItem = (TableName, anItem, uniqueId) => {
  
  let Item = AWS.DynamoDB.Converter.marshall(anItem);
  let params = {
    Item,
    TableName,
  };
  dynamodb.putItem(params, (err, data) => {
    if (err) {
      console.log("dynamohelper.js : Could not put data in " + TableName, err);
      if (debug) {
        console.dir(params);
      } 
      return false;
    } else {
      //if (debug)
        //console.log(
        //  "dynamohelper.js : Success with puting data in " + TableName,
        //  data
        //);
      return true;
    }
  });
};

const getAsyncItem = async (tableName, uniqueId) => {

  if (debug) console.log("dynamohelper.js - getAsyncItem: table=" + tableName + " id=" + uniqueId)
  
  
  try { 
    
    const fval = `${uniqueId}`
    const queryparams = {
      ExpressionAttributeValues: {
        ':id': {N: fval}
      },
      KeyConditionExpression: `id = :id`,
      TableName: tableName,
    };

    // if (debug) console.dir(queryparams);

    let data = await dynamodb.query(queryparams).promise();
    let unmarshalled = AWS.DynamoDB.Converter.unmarshall(data.Items[0]);
    if (debug) {
      console.log("================================");
      console.dir(unmarshalled);
      console.log("================================");
    }
    return unmarshalled;

  } catch(err) {
    console.dir(err);
  }
};

const getItem = (tableName, uniqueId) => {

  var queryparams = {
    ExpressionAttributeValues: {
      ":id": uniqueId,
    },
    KeyConditionExpression: `id = :id`,
    TableName: tableName,
  };

  dynamodb.query(queryparams, function (err, data) {
    if (err) {
      console.log("Error", err);
      return null;
    } else {
      console.log("Success", data.Items);
      return data.Items[0];
    }
  });
};

const getAsyncItems = async (
  tableName,
  filterIdx = "id",
  filterComparator = ">",
  filterVal = 0
) => {

  if (debug) { console.log("dynamohelper.js - getAsyncItems: table=" + tableName + " filter=" + filterIdx + filterComparator + filterVal)}

  try { 
    
    const fval = `${filterVal}`
    const scanparams = {
      ExpressionAttributeValues: {
        ':id': {N: fval}
      },
      FilterExpression: `${filterIdx} ${filterComparator} :id`,
      TableName: tableName,
    };

    if (debug) console.dir(scanparams);

    let data = await dynamodb.scan(scanparams).promise();

    const cleanItems = [];
    data.Items.forEach(function (item, index, array) {
      let cleanItem = AWS.DynamoDB.Converter.unmarshall(item);
      if (debug) {
          console.log("===== " + tableName + " ====================");
          console.dir(cleanItem);
          console.log("===== " + tableName + " ====================");
      }
      cleanItems.push(cleanItem);
    });

    return cleanItems;

  } catch(err) {
    console.dir(err);
  }

};



const getItems = (
  tableName,
  callbackFunction,
  filterIdx = "id",
  filterComparator = ">",
  filterVal = 0
) => {

  if (debug) { console.log("dynamohelper.js - getItems: table=" + tableName + " filter=" + filterIdx + filterComparator + filterVal)}

  const fval = `${filterVal}`
  const scanparams = {
    ExpressionAttributeValues: {
      ':id': {N: fval}
    },
    FilterExpression: `${filterIdx} ${filterComparator} :id`,
    TableName: tableName,
  };

  if (debug) console.dir(scanparams);

  dynamodb.scan(scanparams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      const cleanItems = [];
      data.Items.forEach(function (item, index, array) {
        let cleanItem = AWS.DynamoDB.Converter.unmarshall(item);
       
        if (debug) {
            console.log("===== " + tableName + " ====================");
            console.dir(cleanItem);
        }

        // small check to avoid old dirt in the island table

        if (tableName !== "island" || cleanItem.sizeH) {
          cleanItems.push(cleanItem);
        }
        
      });
      callbackFunction(cleanItems);
    }
  });
};


const deleteItem = (tableName, uniqueId) => {
  const fval = `${uniqueId}`
  var deleteparams = {
    Key:  {
      id: {N: fval}
    },
    TableName: tableName,
  };

  dynamodb.deleteItem(deleteparams, function (err, data) {
    if (err) {
      console.log("Error", err);
      return null;
    } else {
      return data;
    }
  });


};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  getAsyncItem,
  getAsyncItems,
  putItem,
  getItems,
  deleteItem,
  createDb,
  cleanDb,
};
