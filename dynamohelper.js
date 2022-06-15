const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const dynamodb = new AWS.DynamoDB.DocumentClient();

const params = {
  Item: {
    id: 1243,
    name: "test me",
    otherattrib: "test value 1236",
  },
  TableName: "island",
};

var queryparams = {
  ExpressionAttributeValues: {
    ":id": 1236, //Not
  },
  KeyConditionExpression: "id = :id",
  TableName: "island",
};

var scanparams = {
  ExpressionAttributeValues: {
    ":id": 1000, //Not
  },
  FilterExpression: "id > :id",
  TableName: "island",
};

(async function () {
  dynamodb.put(params, (err, data) => {
    if (err) {
      console.log("dynamohelper.js : Could not put data", err);
    } else {
      console.log("dynamohelper.js : Could put data", data);
    }
  });

  dynamodb.query(queryparams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      //console.log("Success", data.Items);
      data.Items.forEach(function (island, index, array) {
        console.log(
          island.id + " : " + island.name + " (" + island.otherattrib + ")"
        );
      });
    }
  });

  dynamodb.scan(scanparams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      //console.log("Success", data.Items);
      data.Items.forEach(function (island, index, array) {
        console.log(
          island.id + " : " + island.name + " (" + island.otherattrib + ")"
        );
      });
    }
  });
})();

const putItem = (TableName, Item) => {
  let params = {
    Item,
    TableName,
  };
  dynamodb.put(params, (err, data) => {
    if (err) {
      console.log("dynamohelper.js : Could not put data in " + TableName, err);
      return false;
    } else {
      //console.log(
      //  "dynamohelper.js : Success with puting data in " + TableName,
      //  data
      //);
      return true;
    }
  });
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  putItem,
};
