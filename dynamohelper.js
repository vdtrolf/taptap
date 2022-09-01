const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const debug = true;
let dynamodb = null;

const createDb = (local) => {
  if (local) {
    dynamodb = new AWS.DynamoDB({
      endpoint: new AWS.Endpoint("http://localhost:8000"),
    });
    if (debug) {
      console.log("dynamohelper.js - createDb - connected to local");
      dynamodb.listTables({ Limit: 10 }, (err, data) => {
        if (err) {
          console.log("dynamohelper.js : Could not list tables", err);
        } else {
          console.log(data.TableNames);
        }
      });
    }
  } else {
    dynamodb = new AWS.DynamoDB();
    if (debug) {
      console.log("dynamohelper.js - createDb - connected");
      dynamodb.listTables({ Limit: 10 }, (err, data) => {
        if (err) {
          console.log("dynamohelper.js : Could not list tables", err);
        } else {
          console.log(data.TableNames);
        }
      });
    }
  }
};

const cleanDb = () => {};

const putItem = (TableName, anItem, uniqueId) => {
  let Item = AWS.DynamoDB.Converter.marshall(anItem);
  let params = {
    Item,
    TableName,
  };

  if (debug) {
    console.log("dynamohelper.js -- putItem ----->");
    console.log(params);
    console.log("---------------->");
  }

  dynamodb.putItem(params, (err, data) => {
    if (err) {
      console.log("dynamohelper.js : Could not put data in " + TableName, err);
      if (debug) {
        console.dir(params);
      }
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

const getItem = async (tableName, uniqueId) => {
  let id = new Date().getTime() % 100;
  const fid = `${uniqueId}`;

  var queryparams = {
    FilterExpression: "#tagname = :id",
    ExpressionAttributeNames: { "#tagname": "id" },
    ExpressionAttributeValues: {
      ":id": { N: fid },
    },
    TableName: tableName,
  };

  if (debug) {
    console.log("dynamohelper.js -- getItem -----> " + id + "<---");
    console.log(queryparams);
    console.log("---------------->");
  }

  const awsRequest = await dynamodb.scan(queryparams);
  const result = await awsRequest.promise();

  let cleanItem = AWS.DynamoDB.Converter.unmarshall(result.Items[0]);

  if (debug) {
    console.log("dynamohelper.js -- getItem result  -----> " + id + "<---");
    console.dir(cleanItem);
    console.log("---------------->");
  }

  return cleanItem; // <<--- Your results are here
};

const getAsyncItem = async (tableName, uniqueId) => {
  return getItem(tableName, uniqueId);
};

const getItems = async (
  tableName,
  callbackFunction,
  filterIdx = "id",
  filterComparator = ">",
  filterVal = 0,
  secondCallBack
) => {
  if (debug) {
    console.log(
      "dynamohelper.js - getItems: table=" +
        tableName +
        " filter=" +
        filterIdx +
        filterComparator +
        filterVal
    );
  }

  const fval = `${filterVal}`;
  const scanparams = {
    ExpressionAttributeValues: {
      ":id": { N: fval },
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
          console.log("dynamohelper.js getItems " + tableName + " ----> ");
          console.dir(cleanItem);
          console.log("---------------->");
        }

        // small check to avoid old dirt in the island table

        if (tableName !== "island" || cleanItem.sizeH) {
          cleanItems.push(cleanItem);
        }
      });
      callbackFunction(cleanItems, secondCallBack);
    }
  });
};

const getAsyncItems = async (
  tableName,
  filterIdx = "id",
  filterComparator = ">",
  filterVal = 0
) => {
  if (debug) {
    console.log(
      "dynamohelper.js - getAsyncItems: table=" +
        tableName +
        " filter=" +
        filterIdx +
        filterComparator +
        filterVal
    );
  }
  const fval = `${filterVal}`;
  const scanparams = {
    ExpressionAttributeValues: {
      ":id": { N: fval },
    },
    FilterExpression: `${filterIdx} ${filterComparator} :id`,
    TableName: tableName,
  };

  if (debug) {
    console.log("-- getAsyncItems ----->");
    console.dir(scanparams);
    console.log("---------------->");
  }

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
      return cleanItems;
    }
  });
};

const deleteItem = (tableName, uniqueId) => {
  const fval = `${uniqueId}`;
  var deleteparams = {
    Key: {
      id: { N: fval },
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
  getItem,
  getItems,
  deleteItem,
  createDb,
  cleanDb,
};
