let executionName = "taptap_run_" + new Date().getTime();

// starts the steps function

function startStateSteps() {
  var AWS = require("aws-sdk");

  var stepfunctions = new AWS.StepFunctions();

  var params = {
    stateMachineArn:
      "arn:aws:states:us-east-1:778787439795:stateMachine:TapTap_steps_functions",
    input: '{"Dummy":666}',
    name: executionName,
  };

  //stepfunctions.startExecution(params, function (err, data) {
  //  if (err) console.log(err, err.stack); // an error occurred
  //  else console.log(data); // successful response
  //});
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
  startStateSteps,
};
