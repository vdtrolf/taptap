const AWS = require("aws-sdk");
const stepFunctions = new AWS.StepFunctions();

const startStateSteps = () => {
  const params = {
    stateMachineArn:
      "arn:aws:states:us-east-1:778787439795:stateMachine:Taptap_state_engine",
    input: "",
    name: "ExecutionLambda",
  };

  console.log("==========> Going to start engine");

  stepFunctions.startExecution(params, (err, data) => {
    if (err) {
      console.log(err);

      const response = {
        statusCode: 500,
        body: JSON.stringify({
          message: "There was an error",
        }),
      };
      // callback(null, response);
    } else {
      console.log(data);

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: "Step function worked",
        }),
      };
      // callback(null, response);
    }
  });
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  startStateSteps,
};
