const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGINFO = loggerReq.LOGINFO;
const LOGERR = loggerReq.LOGERR;
const LOGDATA = loggerReq.LOGDATA;

const realm = "db";
const source = "dynamohelper.js";

const https = require("https");
const agent = new https.Agent({
  keepAlive: true,
});

const debug = false;
const deepdebug = false;
let dynamodb = null;

const createDb = (local) => {
  if (local) {
    dynamodb = new AWS.DynamoDB({
      endpoint: new AWS.Endpoint("http://localhost:8000"),
    });
    log(realm, source, "createDb", "connected to local");
    if (deepdebug) {
      dynamodb.listTables({ Limit: 10 }, (err, data) => {
        if (err) {
          log(realm, source, "createDb", "Could not list tables" + err, LOGERR);
        } else {
          log(realm, source, "createDb", data.TableNames, LOGINFO, LOGDATA);
        }
      });
    }
  } else {
    dynamodb = new AWS.DynamoDB({
      httpOptions: {
        agent,
      },
    });
    log(realm, source, "createDb", "connected");
    if (deepdebug) {
      dynamodb.listTables({ Limit: 10 }, (err, data) => {
        if (err) {
          log(realm, source, "createDb", "Could not list tables" + err, LOGERR);
        } else {
          log(realm, source, "createDb", data.TableNames, LOGINFO, LOGDATA);
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

  log(realm, source, "putItem", params, LOGINFO, LOGDATA);

  dynamodb.putItem(params, (err, data) => {
    if (err) {
      log(
        realm,
        source,
        "putItem Could not put data in " + TableName,
        err,
        LOGERR
      );
      return false;
    } else {
      log(realm, source, "putItem", "Success with puting data in " + TableName);
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

  log(realm, source, "getItem params", queryparams, LOGINFO, LOGDATA);

  const awsRequest = await dynamodb.scan(queryparams);
  const result = await awsRequest.promise();

  let cleanItem = AWS.DynamoDB.Converter.unmarshall(result.Items[0]);

  log(realm, source, "getItem result", cleanItem, LOGINFO, LOGDATA);

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
  log(
    realm,
    source,
    "getItems",
    "table=" + tableName + " filter=" + filterIdx + filterComparator + filterVal
  );

  const fval = `${filterVal}`;
  const scanparams = {
    ExpressionAttributeValues: {
      ":id": { N: fval },
    },
    FilterExpression: `${filterIdx} ${filterComparator} :id`,
    TableName: tableName,
  };

  log(realm, source, "getItems", scanparams, LOGINFO, LOGDATA);

  dynamodb.scan(scanparams, function (err, data) {
    if (err) {
      log(realm, source, "getItems", err, LOGERR);
    } else {
      const cleanItems = [];
      data.Items.forEach(function (item, index, array) {
        let cleanItem = AWS.DynamoDB.Converter.unmarshall(item);

        log(realm, source, "getItems", cleanItem, LOGINFO, LOGDATA);

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
  log(
    realm,
    source,
    "getAsyncItems",
    "table=" + tableName + " filter=" + filterIdx + filterComparator + filterVal
  );

  const fval = `${filterVal}`;
  const scanparams = {
    ExpressionAttributeValues: {
      ":id": { N: fval },
    },
    FilterExpression: `${filterIdx} ${filterComparator} :id`,
    TableName: tableName,
  };

  log(realm, source, "getAsyncItems params", scanparams, LOGINFO, LOGDATA);

  const awsRequest = await dynamodb.scan(scanparams);
  const result = await awsRequest.promise();

  let cleanItems = [];
  for (let i = 0; i < result.Items.length; i++) {
    cleanItems.push(AWS.DynamoDB.Converter.unmarshall(result.Items[i]));
  }

  log(realm, source, "getAsyncItems results", cleanItems, LOGINFO, LOGDATA);

  return cleanItems;
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
      log(realm, source, "deleteItem", err, LOGERR);
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
