"use strict";

const dbhelperReq = require("./dynamohelper.js");
// const dbhelperReq = require("./acebasehelper.js");
const requestserverReq = require("./requestserver.js");

let createResponse = requestserverReq.createResponse;
let createDb = dbhelperReq.createDb;

let local = false;
const args = process.argv.slice(2);
local = args[0] && args[0].toLowerCase() === "local";

let debug = false;
let requestcounter = 0;

// initiate the DB - local means a local DB for dynamo. Acebase is always local

createDb(local);

// Starting the express server for handling of local requests

if (local) {
  const port = 3001;
  let app = null;

  const express = require("express");
  const cors = require("cors");

  app = express();
  app.use(cors());
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  try {
    app.get("/*", (req, res) => {
      let sessionId = Number.parseInt(req.query.sessionId, 10);
      let counterId = Number.parseInt(req.query.counterId, 10);
      if (!counterId) counterId = 0;

      if (debug) {
        console.log(
          " index.js : Processing " +
            req.path +
            " for session " +
            sessionId +
            " renew = " +
            req.query.renew +
            " counterId = " +
            counterId
        );
      }

      createResponse(req.path, req.query, sessionId, counterId).then(
        (responseBody) => {
          // if (debug) console.dir(responseBody);
          return res.json(responseBody);
        }
      );
    });

    app.listen(port, () => {
      console.log(`index.js : Little island listening at port: ${port}`);
    });

    app.on("error", (e) => {
      console.log("index.js : app error " + e.code);
    });

    process.on("error", (e) => {
      console.log("index.js : process error " + e.code);
    });
  } catch (error) {
    console.error("index.js : problem " + error);
  }
} else {
  console.log("index.js : Little island function listening on Lambda");
}

// Handler for the Lambda

exports.handler = async (event) => {
  let sessionId = 0;
  let counterId = 0;
  let responseCode = 200;
  requestcounter += 1;

  if (debug)
    console.log(
      "index.js - handler : request " +
        requestcounter +
        " : " +
        JSON.stringify(event)
    );

  if (event.queryStringParameters && event.queryStringParameters.sessionId) {
    sessionId = event.queryStringParameters.sessionId;
  }

  if (event.queryStringParameters && event.queryStringParameters.counterId) {
    counterId = event.queryStringParameters.counterId;
  }

  const responseBody = await createResponse(
    event.path,
    event.queryStringParameters,
    sessionId,
    counterId
  );

  const aresponse = {
    statusCode: 200,
    headers: {
      "x-custom-header": "little island",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(responseBody),
    isBase64Encoded: false,
  };

  if (debug) console.log("index.js - response : " + JSON.stringify(aresponse));

  return aresponse;
};
