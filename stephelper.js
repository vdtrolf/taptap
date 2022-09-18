let executionName = "taptap" + new Date().getTime();

function startStateSteps() {
  var AWS = require('aws-sdk');

  var stepfunctions = new AWS.StepFunctions();

  var params = {
    stateMachineArn: 'arn:aws:states:us-east-1:778787439795:stateMachine:Taptap_state_engine',
    input: '{"OrderID":266}',
    name: '00002'
  };

  stepfunctions.startExecution(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}


// const startStateSteps = () => {
//   const params = {
//     stateMachineArn:
//       "arn:aws:states:us-east-1:778787439795:stateMachine:Taptap_state_engine",
//     input: "{}",
//     name: executionName
//   };

//   console.log("==========> Going to start engine at " + executionName);

//   try {
//     let result = stepFunctions.startExecution(params, function(err, data) {
//       if (err) {
//         console.log(err);

//         // const response = {
//         //   statusCode: 500,
//         //   body: JSON.stringify({
//         //     message: "There was an error",
//         //   }),
//         // };

//         // return response;
        
//       } else {
//         console.log(data);

//         // const response = {
//         //   statusCode: 200,
//         //   body: JSON.stringify({
//         //     message: "Step function worked",
//         //   }),
//         // };

//         // return response;

//       }
//     });
//     console.log("==========> result <======");
//     console.dir(result);
//     console.log("==========> result <======");

//   } catch {
//     console.err("Error while starting step", err);
//   }
// };

// now we export the class, so other modules can create Penguin objects
module.exports = {
  startStateSteps,
};
