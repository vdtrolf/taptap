const dynamoReq = require("@aws-sdk/client-dynamodb");

let DynamoDB = dynamoReq.DynamoDBClient;
let CreateTableCommand = dynamoReq.CreateTableCommand;
let UpdateTableCommand = dynamoReq.UpdateTableCommand;
let ListTablesCommand = dynamoReq.ListTablesCommand;

const dynamodb = new DynamoDB({ region: "us-east-1" });

const islanddefs = {
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "N" },
    { AttributeName: "name", AttributeType: "S" },
  ],
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },
    { AttributeName: "name", KeyType: "RANGE" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: "island",
};

const islandupdatedefs = {
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "N" },
    { AttributeName: "name", AttributeType: "S" },
  ],
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },
    { AttributeName: "name", KeyType: "RANGE" },
  ],
  TableName: "island",
};

const penguindefs = {
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "N" },
    { AttributeName: "islandId", AttributeType: "N" },
  ],
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },
    { AttributeName: "islandId", KeyType: "RANGE" },
  ],
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
  ],
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },
    { AttributeName: "islandId", KeyType: "RANGE" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: "land",
  StreamSpecification: {
    StreamEnabled: false,
  },
};

(async function () {
  let tables = {};
  try {
    tables = await dynamodb.send(new ListTablesCommand({}));
    console.log(tables.TableNames);
  } catch (err) {
    console.log("dynamocreator.js : Could not list tables", err);
  }

  if (tables.TableNames.includes("island")) {
    try {
      let data = await dynamodb.send(new UpdateTableCommand(islanddefs));
      console.log("dynamocreator.js : Upated island table");
    } catch (err) {
      console.log("dynamocreator.js : island defnitions are up to date");
    }
  } else {
    try {
      let data = await dynamodb.send(new CreateTableCommand(islanddefs));
      console.log("dynamocreator.js : Created island table");
    } catch (err) {
      console.log("dynamocreator.js : Error while creating island", err);
    }
  }

  if (tables.TableNames.includes("penguin")) {
    try {
      let data = await dynamodb.send(new UpdateTableCommand(penguindefs));
      console.log("dynamocreator.js : Upated penguin table");
    } catch (err) {
      console.log("dynamocreator.js : penguin table defnitions are up to date");
    }
  } else {
    try {
      data = await dynamodb.send(new CreateTableCommand(penguindefs));
      console.log("dynamocreator.js : Created penguin table");
    } catch (err) {
      console.log("dynamocreator.js : Error", err);
    }
  }

  if (tables.TableNames.includes("land")) {
    try {
      let data = await dynamodb.send(new UpdateTableCommand(landdefs));
      console.log("dynamocreator.js : Upated land table");
    } catch (err) {
      console.log("dynamocreator.js : land table defnitions are up to date");
    }
  } else {
    try {
      data = await dynamodb.send(new CreateTableCommand(landdefs));
      console.log("dynamocreator.js : Created land table");
    } catch (err) {
      console.log("dynamocreator.js : Error", err);
    }
  }
})();
