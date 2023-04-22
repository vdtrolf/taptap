const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

//const dynamodb = new AWS.DynamoDB({
//  endpoint: new AWS.Endpoint("http://localhost:8000"),
// });
const dynamodb = new AWS.DynamoDB();

const islanddefs = {
  AttributeDefinitions: [{ AttributeName: "id", AttributeType: "N" }],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: "island",
};


(async function () {
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
})();
