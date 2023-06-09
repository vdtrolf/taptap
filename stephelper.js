// Unique execution id

let executionName = "taptap_run_" + new Date().getTime();

// function definition - no in our out paramsn

function startStateSteps() {
  var AWS = require("aws-sdk");

  var stepfunctions = new AWS.StepFunctions();

  console.log("setphelper.js - startStateSterps :  Starting steps");

  var params = {
    stateMachineArn:
      "arn:aws:states:us-east-1:778787439795:stateMachine:TapTap_steps_functions",
    input: '{"Dummy":666}',
    name: executionName,
  };

  // starting the steps functions

  // stepfunctions.startExecution(params, function (err, data) {
  //    if (err) console.log(err, err.stack); // an error occurred
  //    else console.log(data); // successful response
  //  });
}

// now we export the class, so other modules can use it
module.exports = {
  startStateSteps,
};
