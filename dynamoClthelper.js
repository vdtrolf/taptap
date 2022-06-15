const dynamoReq = require("@aws-sdk/client-dynamodb");

let DynamoDB = dynamoReq.DynamoDBClient;
let PutItemCommand = dynamoReq.PutItemCommand;
let QueryCommand = dynamoReq.QueryCommand;
let ScanCommand = dynamoReq.ScanCommand;

const dynamodb = new DynamoDB({ region: "us-east-1" });

const params = {
  TableName: "island",
  Item: {
    id: { N: "1241" },
    name: { S: "test test" },
    otherattrib: { S: "test value 1241" },
  },
};

const queryparams = {
  ExpressionAttributeValues: {
    ":id": { N: "1236" },
  },
  KeyConditionExpression: "id = :id",
  TableName: "island",
};

const scanparams = {
  ExpressionAttributeValues: {
    ":id": { N: "0" },
  },
  FilterExpression: "id > :id",
  TableName: "island",
};

(async function () {
  try {
    const data = await dynamodb.send(new PutItemCommand(params));
    console.log(data);
  } catch (err) {
    console.error("Error in put ", err);
  }

  try {
    const data = await dynamodb.send(new QueryCommand(queryparams));
    data.Items.forEach(function (island, index, array) {
      console.log(
        island.id.N + " : " + island.name.S + " (" + island.otherattrib.S + ")"
      );
    });
  } catch (err) {
    console.error("Error in query ", err);
  }

  try {
    const data = await dynamodb.send(new ScanCommand(scanparams));
    data.Items.forEach(function (island, index, array) {
      console.log(
        island.id.N + " : " + island.name.S + " (" + island.otherattrib.S + ")"
      );
    });
  } catch (err) {
    console.error("Error in scan ", err);
  }
})();
