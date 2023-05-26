const AWS = require("aws-sdk");

 // const AWS =  require("aws-sdk/clients/dynamodb");
 // const dynamoDocumentClient = new dynamoDB.DocumentClient();


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
   keepAliveMsecs: 10000,
 });

 const debug = false;
 const deepdebug = true;
 let dynamodb = null;

 const islanddefs = {
   AttributeDefinitions: [{ AttributeName: "id", AttributeNature: "N" }],
   KeySchema: [{ AttributeName: "id", KeyNature: "HASH" }],
   //ProvisionedThroughput: {
   //  ReadCapacityUnits: 5,
   //  WriteCapacityUnits: 5,
   //},
   TableName: "island",
 };

 const createDb = (local) => {
   if (!dynamodb) {
     if (local) {
       dynamodb = new AWS.DynamoDB({
         endpoint: new AWS.Endpoint("http://localhost:8000"),
       });
       log(realm, source, "createDb", "connected to local");
       if (deepdebug) {
         dynamodb.listTables({ Limit: 10 }, (err, data) => {
           if (err) {
             log(
               realm,
               source,
               "createDb",
               "Could not list tables" + err,
               LOGERR
             );
           } else {
             log(realm, source, "createDb", data.TableNames, LOGINFO, LOGDATA);
           }
         });
       }
     } else {

       process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = 1;


       dynamodb = new AWS.DynamoDB({
         httpOptions: {
           agent,
         },
       });
       log(realm, source, "createDb", "connected");
       if (deepdebug) {
         dynamodb.listTables({ Limit: 10 }, (err, data) => {
           if (err) {
             log(
               realm,
               source,
               "createDb",
               "Could not list tables" + err,
               LOGERR
             );
           } else {
             log(realm, source, "createDb", data.TableNames, LOGINFO, LOGDATA);
           }
         });
       }
     }
   }
 };

 const cleanDb = () => {
   let tableNames = [];

   dynamodb.listTables({ Limit: 10 }, (err, data) => {
     if (err) {
       log(realm, source, "cleanDb", "Could not list tables" + err, LOGERR);
     } else {
       log(realm, source, "cleanDb", data.TableNames);
       if (data?.TableNames.includes("island")) {
         dynamodb.deleteTable(islanddefs, function (err, data) {
           log(realm, source, "cleanDb", "Table island deleting");
           dynamodb.waitFor("tableNotExists", islanddefs, function (err, data) {
             dynamodb.createTable(islanddefs, function (err, data) {});
             log(realm, source, "cleanDb", "Table island created");
           });
         });
       } else {
         dynamodb.createTable(islanddefs, function (err, data) {
           if (err) {
             log(
               realm,
               source,
               "cleanDb",
               "Error in creating table island " + err,
               LOGERR
             );
           } else {
             log(realm, source, "cleanDb", "Table island created");
           }
         });
       }
     }
   });
 };

const initiateDb = () => {
  let tableNames = [];

  dynamodb.listTables({ Limit: 10 }, (err, data) => {
    if (err) {
      console.log("dynamohelper.js : Could not list tables", err);
    } else {
      console.log(data.TableNames);
      
      if (data?.TableNames.includes("island")) {
        dynamodb.deleteTable(islanddefs, function (err, data) {
          console.log("Table island deleting");
          dynamodb.waitFor("tableNotExists", islanddefs, function (err, data) {
            dynamodb.createTable(islanddefs, function (err, data) {});
            console.log("Table island created");
          });
        });
      } else {
        dynamodb.createTable(islanddefs, function (err, data) {
          if (err) {
            console.log("Error in creating table island ", err);
          } else {
            console.log("Table island created");
          }
        });
      }
    }
  });
}

 // adds an item in the DB based on the table name and the unique id

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

 // get a specific item out od the Db based on an unique id

 const getItem = async (tableName, uniqueId) => {
   let id = new Date().getTime() % 100;
   const fid = `${uniqueId}`;

   // ExpressionAttributeNames: { "#tagname": "id" },

   var queryparams = {
     KeyConditionExpression: "id = :id",
     ExpressionAttributeValues: {
       ":id": { N: fid },
     },
     TableName: tableName,
   };

   log(realm, source, "getItem params", queryparams, LOGINFO, LOGDATA);

   const awsRequest = await dynamodb.query(queryparams);
   const result = await awsRequest.promise();

   let cleanItem = AWS.DynamoDB.Converter.unmarshall(result.Items[0]);

   log(realm, source, "getItem result", cleanItem, LOGINFO, LOGDATA);

   return cleanItem; // <<--- Your results are here
 };

 // directly gets items on an asynchronous way - based on a set of parameters

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

 // Delete an item based on an unique id

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
   getAsyncItems,
   putItem,
   getItem,
   deleteItem,
   createDb,
   cleanDb,
   initiateDb,
 };
