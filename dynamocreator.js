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

const penguindefs = {
  AttributeDefinitions: [{ AttributeName: "id", AttributeType: "N" }],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: "penguin",
  StreamSpecification: {
    StreamEnabled: false,
  },
};

const landdefs = {
  AttributeDefinitions: [{ AttributeName: "id", AttributeType: "N" }],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: "land",
  StreamSpecification: {
    StreamEnabled: false,
  },
};

const sessiondefs = {
  AttributeDefinitions: [{ AttributeName: "id", AttributeType: "N" }],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: "session",
  StreamSpecification: {
    StreamEnabled: false,
  },
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

      if (data?.TableNames.includes("penguin")) {
        dynamodb.deleteTable(penguindefs, function (err, data) {
          console.log("Table penguin deleting");
          dynamodb.waitFor("tableNotExists", penguindefs, function (err, data) {
            dynamodb.createTable(penguindefs, function (err, data) {});
            console.log("Table penguin created");
          });
        });
      } else {
        dynamodb.createTable(penguindefs, function (err, data) {
          if (err) {
            console.log("Error in creating table penguin ", err);
          } else {
            console.log("Table penguin created");
          }
        });
      }

      if (data?.TableNames.includes("land")) {
        dynamodb.deleteTable(landdefs, function (err, data) {
          console.log("Table land deleting");
          dynamodb.waitFor("tableNotExists", landdefs, function (err, data) {
            dynamodb.createTable(landdefs, function (err, data) {});
            console.log("Table land created");
          });
        });
      } else {
        dynamodb.createTable(landdefs, function (err, data) {
          if (err) {
            console.log("Error in creating table land ", err);
          } else {
            console.log("Table land created");
          }
        });
      }

      if (data?.TableNames.includes("session")) {
        dynamodb.deleteTable(sessiondefs, function (err, data) {
          console.log("Table session deleting");
          dynamodb.waitFor("tableNotExists", sessiondefs, function (err, data) {
            dynamodb.createTable(sessiondefs, function (err, data) {});
            console.log("Table session created");
          });
        });
      } else {
        dynamodb.createTable(sessiondefs, function (err, data) {
          if (err) {
            console.log("Error in creating table session ", err);
          } else {
            console.log("Table session created");
          }
        });
      }
    }
  });
})();
