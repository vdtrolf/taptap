const dynamoReq = require("@aws-sdk/client-dynamodb");

let DynamoDB = dynamoReq.DynamoDBClient;
let CreateTableCommand = dynamoReq.CreateTableCommand;
let DeletTableCommand = dynamoReq.DeleteTableCommand;

const dynamodb = new DynamoDB({ region: "us-east-1" });

const islanddefs = {
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "N" },
    { AttributeName: "name", AttributeType: "S" },
    { AttributeName: "sizeH", AttributeType: "N" },
    { AttributeName: "sizeL", AttributeType: "N" },
    { AttributeName: "territory", AttributeType: "N" },
    { AttributeName: "weather", AttributeType: "N" },
    { AttributeName: "weatherCount", AttributeType: "N" },
    { AttributeName: "numPeng", AttributeType: "N" },
    { AttributeName: "tiles", AttributeType: "N" },
    { AttributeName: "landSize", AttributeType: "N" },
    { AttributeName: "fishes", AttributeType: "N" },
    { AttributeName: "turn", AttributeType: "N" },
    { AttributeName: "points", AttributeType: "N" },
    { AttributeName: "running", AttributeType: "N" },
    { AttributeName: "followId", AttributeType: "N" },
  ],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: "island",
  StreamSpecification: {
    StreamEnabled: false,
  },
};

const peguindefs = {
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "N" },
    { AttributeName: "islandId", AttributeType: "N" },
    { AttributeName: "num", AttributeType: "N" },
    { AttributeName: "hpos", AttributeType: "N" },
    { AttributeName: "lpos", AttributeType: "N" },
    { AttributeName: "age", AttributeType: "N" },
    { AttributeName: "fat", AttributeType: "N" },
    { AttributeName: "maxcnt", AttributeType: "N" },
    { AttributeName: "vision", AttributeType: "N" },
    { AttributeName: "wealth", AttributeType: "N" },
    { AttributeName: "hungry", AttributeType: "N" },
    { AttributeName: "alive", AttributeType: "N" },
    { AttributeName: "gender", AttributeType: "S" },
    { AttributeName: "cat", AttributeType: "S" },
    { AttributeName: "name", AttributeType: "S" },
    { AttributeName: "status", AttributeType: "N" },
    { AttributeName: "statustime", AttributeType: "N" },
    { AttributeName: "fishDirection", AttributeType: "N" },
    { AttributeName: "hasLoved", AttributeType: "N" },
    { AttributeName: "fatherId", AttributeType: "N" },
    { AttributeName: "motherId", AttributeType: "N" },
  ],
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
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "N" },
    { AttributeName: "islandId", AttributeType: "N" },
    { AttributeName: "hpos", AttributeType: "N" },
    { AttributeName: "lpos", AttributeType: "N" },
    { AttributeName: "type", AttributeType: "N" },
    { AttributeName: "conf", AttributeType: "N" },
    { AttributeName: "var", AttributeType: "S" },
    { AttributeName: "hasCross", AttributeType: "N" },
    { AttributeName: "crossAge", AttributeType: "N" },
    { AttributeName: "hasFish", AttributeType: "N" },
    { AttributeName: "hasSwim", AttributeType: "N" },
    { AttributeName: "swimAge", AttributeType: "N" },
    { AttributeName: "penguin", AttributeType: "N" },
  ],
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

export const params = {
  TableName: "CUSTOMER_LIST_NEW",
};
export const run = async () => {
  try {
    const data = await ddbClient.send(new DeleteTableCommand(params));
    console.log("Success, table deleted", data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

(async function () {
  try {
    const data = await dynamodb.send(new DeleteTableCommand(islanddefs));
    console.log("dynamocreator.js : Deleted island table", data);
  } catch (err) {
    console.log("dynamocreator.js : Could not delete island table", err);
  }

  try {
    const data = await dynamodb.send(new DeleteTableCommand(penguindefs));
    console.log("dynamocreator.js : Deleted penguin table", data);
  } catch (err) {
    console.log("dynamocreator.js : Could not delete penguin table", err);
  }

  try {
    const data = await dynamodb.send(new DeleteTableCommand(landdefs));
    console.log("dynamocreator.js : Deleted land table", data);
  } catch (err) {
    console.log("dynamocreator.js : Could not delete land table", err);
  }

  try {
    const data = await dynamodb.send(new CreateTableCommand(islanddefs));
    console.log("dynamocreator.js : Created island table", data);
    const data = await dynamodb.send(new CreateTableCommand(penguindefs));
    console.log("dynamocreator.js : Created penguin table", data);
    const data = await dynamodb.send(new CreateTableCommand(landdefs));
    console.log("dynamocreator.js : Created land table", data);
  } catch (err) {
    console.log("Error", err);
  }
})();
