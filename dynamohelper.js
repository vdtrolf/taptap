const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

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
 let client = null;

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
   if (!client) {
     if (local) {
       client = new DynamoDB({
        endpoint: 'http://localhost:8000'
       });

       console.log("---------- DB CLIENT CREATED --------------")


       log(realm, source, "createDb", "connected to local");
       if (deepdebug) {
         client.listTables({ Limit: 10 }, (err, data) => {
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

       client = new DynamoDB({  httpOptions: {agent,},region: "us-east-1" });

       console.log("---------- DB CLIENT CREATED --------------")

       log(realm, source, "createDb", "connected");
       if (deepdebug) {
         client.listTables({ Limit: 10 }, (err, data) => {
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

   client.listTables({ Limit: 10 }, (err, data) => {
     if (err) {
       log(realm, source, "cleanDb", "Could not list tables" + err, LOGERR);
     } else {
       log(realm, source, "cleanDb", data.TableNames);
       if (data?.TableNames.includes("island")) {
         client.deleteTable(islanddefs, function (err, data) {
           log(realm, source, "cleanDb", "Table island deleting");
           client.waitFor("tableNotExists", islanddefs, function (err, data) {
             client.createTable(islanddefs, function (err, data) {});
             log(realm, source, "cleanDb", "Table island created");
           });
         });
       } else {
         client.createTable(islanddefs, function (err, data) {
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

  client.listTables({ Limit: 10 }, (err, data) => {
    if (err) {
      console.log("dynamohelper.js : Could not list tables", err);
    } else {
      console.log(data.TableNames);
      
      if (data?.TableNames.includes("island")) {
        client.deleteTable(islanddefs, function (err, data) {
          console.log("Table island deleting");
          client.waitFor("tableNotExists", islanddefs, function (err, data) {
            client.createTable(islanddefs, function (err, data) {});
            console.log("Table island created");
          });
        });
      } else {
        client.createTable(islanddefs, function (err, data) {
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
   let Item = marshall(anItem);
   let params = {
     Item,
     TableName,
   };

   log(realm, source, "putItem", params, LOGINFO, LOGDATA);

   client.putItem(params, (err, data) => {
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

   const awsRequest = await client.query(queryparams);
   // const result = await awsRequest.promise();

   let cleanItem  = {};

   if ( awsRequest.Items  && awsRequest.Items[0] !== {} ) {
      try {
        cleanItem = unmarshall(awsRequest.Items[0]);
      } catch {
         console.log("==>>" + awsRequest.Items[0] + "<<")
      }
   }

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

   const awsRequest = await client.scan(scanparams);
   // const result = await awsRequest.promise();

   let cleanItems = [];
   for (let i = 0; i < awsRequest.Items.length; i++) {
     cleanItems.push(unmarshall(awsRequest.Items[i]));
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

   client.deleteItem(deleteparams, function (err, data) {
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
