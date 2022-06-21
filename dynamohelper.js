const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const debug = true;

const createDb = () => {};

const cleanDb = () => {};

const putItem = (TableName, Item, uniqueId) => {
  let params = {
    Item,
    TableName,
  };
  dynamodb.put(params, (err, data) => {
    if (err) {
      console.log("dynamohelper.js : Could not put data in " + TableName, err);
      return false;
    } else {
      if (debug)
        console.log(
          "dynamohelper.js : Success with puting data in " + TableName,
          data
        );
      return true;
    }
  });
};

const getItem = (tableName, uniqueId) => {
  var queryparams = {
    ExpressionAttributeValues: {
      ":id": uniqueId,
    },
    KeyConditionExpression: `id = :filter`,
    TableName: tableName,
  };

  dynamodb.query(scanparams, function (err, data) {
    if (err) {
      console.log("Error", err);
      return null;
    } else {
      console.log("Success", data.Items);
      return data.Items[0];
    }
  });
};

const getItems = (
  tableName,
  callbackFunction,
  filterIdx = "id",
  filterComparator = ">",
  filterVal = 0
) => {
  var scanparams = {
    ExpressionAttributeValues: {
      ":filter": filterVal,
    },
    KeyConditionExpression: `${filterIdx} ${filterComparator} :filter`,
    TableName: tableName,
  };

  dynamodb.scan(scanparams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      // console.log("Success", data.Items);
      data.Items.forEach(function (item, index, array) {
        console.log("found in" + tableName + " " + item.id);
      });
      callbackFunction(data.Items);
    }
  });
};

const deleteItem = (tableName, uniqueId) => {};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  putItem,
  getItems,
  deleteItem,
  createDb,
  cleanDb,
};
