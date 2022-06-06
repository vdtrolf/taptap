'use strict';

const requestserverReq = require("./requestserver.js");
let createResponse = requestserverReq.createResponse;

console.log('Loading tap tap function');

const port = 3001;
let debug = false;
let startExpress = true;

// Starting the express server

if (startExpress) {

  let app = null;

  const express = require('express');
  const cors = require('cors');

  app = express();
  app.use(cors())
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  try {
    app.get('/*', (req, res) => {

      let sessionId = Number.parseInt(req.query.sessionId,10);

      if (debug ) {
        timeTag = new Date().getTime() - baseTime;
        console.log(timeTag + " index.js : Processing " + req.path + " for session " + sessionId + " renew = "+ req.query.renew)
      };

      return res.json(createResponse(req.path,req.query, sessionId));
    });

    app.listen(port, () => {
      console.log(`index.js : Little island listening at port: ${port}`);
    });

    app.on('error', (e) => {
      console.log("index.js : app error " + e.code);
    });

    process.on('error', (e) => {
      console.log("index.js : process error " + e.code);
    });

  } catch(error) {
     console.error("index.js : problem " + error);
  }

}


exports.handler = async (event) => {
    let sessionId = "";
    let responseCode = 200;
    console.log("request: " + JSON.stringify(event));

    if (event.queryStringParameters && event.queryStringParameters.sessionId) {
        console.log("Received sessionId: " + event.queryStringParameters.sessionId);
        sessionId = event.queryStringParameters.sessionId;
    }

    let responseBody = createResponse(event.pathParameters, event.queryStringParameters, sessionId);

    let response = {
        statusCode: responseCode,
        headers: {
            "x-custom-header" : "tap tap header value"
        },
        body: JSON.stringify(responseBody)
    };
    console.log("response: " + JSON.stringify(response))
    return response;
};
