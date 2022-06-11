const dynamoReq = require('@aws-sdk/client-dynamodb');

let DynamoDB = dynamoReq.DynamoDBClient;
let CreateTableCommand = dynamoReq.CreateTableCommand;

const dynamodb = new DynamoDB({region: 'us-east-1'});

const params = {
  AttributeDefinitions: [
    {AttributeName: "Season", AttributeType: "N"},
    {AttributeName: "Episode", AttributeType: "N"},
  ],
  KeySchema: [
    {
      AttributeName: "Season", //ATTRIBUTE_NAME_1
      KeyType: "HASH",
    },
    {
      AttributeName: "Episode", //ATTRIBUTE_NAME_2
      KeyType: "RANGE",
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: "TEST_TABLE", //TABLE_NAME
  StreamSpecification: {
    StreamEnabled: false,
  },
};

(async function () {
      try{
           const data = await dynamodb.send(new CreateTableCommand(params));
           console.log("Success", data);
      }
      catch (err) {
           console.log("Error", err);
      }
})();
