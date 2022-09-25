// DB stuff
const dbhelperReq = require("./dynamohelper.js"); // require("./acebasehelper.js");

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
let setLogLevel = loggerReq.setLogLevel;
const LOGVERB = loggerReq.LOGVERB;
const LOGINFO = loggerReq.LOGINFO;
const LOGERR = loggerReq.LOGERR;
const LOGTEXT = loggerReq.LOGTEXT;
const LOGDATA = loggerReq.LOGDATA;
const LOGDUMP = loggerReq.LOGDUMP;

const realm = "index";
const source = "index.js";

const requestserverReq = require("./requestserver.js");
const stateserverReq = require("./stateserver.js");
let setState = stateserverReq.setState;
let startLocalStateEngine = stateserverReq.startLocalStateEngine;
let createResponse = requestserverReq.createResponse;
let createDb = dbhelperReq.createDb;
let cleanDb = dbhelperReq.cleanDb;

let local = false;
let cleandb = false;

// read the command-line arguments - is it local and which debug level ?
const args = process.argv.slice(2);
args.forEach((arg) => {
  switch (arg.toLowerCase()) {
    case "local":
      local = true;
      break;
    case "cleandb":
      cleandb = true;
      break;
    case "debug":
      setLogLevel("all", LOGINFO);
      break;
    case "verbose":
      setLogLevel("all", LOGVERB);
      break;
    default:
      if (arg.includes("=")) {
        const logargs = arg.toLowerCase().split("=");
        if (logargs[1] === "info") {
          setLogLevel(logargs[0], LOGINFO);
        } else if (logargs[1] === "verbose") {
          setLogLevel(logargs[0], LOGVERB);
        }
      } else {
        setLogLevel(arg.toLowerCase(), LOGINFO);
      }
      break;
  }
});

// setLogLevel("db", LOGINFO);
setLogLevel("index", LOGINFO);
// setLogLevel("worker", LOGINFO);
// setLogLevel("data", LOGINFO);

const debug = false;

// initiate the DB - local means a local DB for dynamo. Acebase is always local
// if the argument 'cleandb' was given, then the island dataset will be (re)created
createDb(local);
if (cleandb) cleanDb();

if (local) {
  startLocalStateEngine(local);
}

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
      let islandId = Number.parseInt(req.query.islandId, 10);

      log(realm, source, "Express", req.path + " islandId = " + islandId);
      createResponse(req.path, req.query, islandId, local).then(
        (responseBody) => {
          // console.dir(responseBody);
          return res.json(responseBody);
        }
      );
    });
    app.listen(port, () => {
      log(realm, source, "Express", `Little island listening at port: ${port}`);
    });
    app.on("error", (e) => {
      log(realm, source, "Express", "app error " + e.code, LOGERR);
    });
    process.on("error", (e) => {
      log(realm, source, "Express", "process error " + e.code, LOGERR);
    });
  } catch (error) {
    log(realm, source, "Express", " problem " + error, LOGERR);
  }
} else {
  // Starting the handler for handling of lambda requests
  log(realm, source, "Handler", "Little island function listening on Lambda");

  // Handler for the Lambda - it may be either
  // - a SNS event - in which case the state is updated
  // - a message originated from the API gateway in which case the request is processed

  exports.handler = async (event, context, callback) => {
    log(realm, source, "Handler", "request : " + JSON.stringify(event));

    if (event.Records && event.Records[0]) {
      var message = event.Records[0].Sns.Message;
      log(realm, source, "Handler", "Message received from SNS:" + message);
      let running = await setState();
      callback(null, { running: running });
    } else if (event.path === "/state") {
      log(realm, source, "Handler", "/state event received ");
      let isRunning = await setState();

      const aresponse = {
        StatusCode: 200,
        headers: {
          "x-custom-header": "little island",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ running: isRunning }),
        isBase64Encoded: false,
      };

      // tata

      log(
        realm,
        source,
        "Handler",
        "response is now : " + JSON.stringify(aresponse)
      );

      return aresponse;
    } else {
      let islandId = 0;

      if (event.queryStringParameters && event.queryStringParameters.islandId) {
        islandId = event.queryStringParameters.islandId;
      }

      const responseBody = await createResponse(
        event.path,
        event.queryStringParameters,
        islandId,
        local
      );

      log(
        realm,
        source,
        "Handler",
        "responseBody : " + JSON.stringify(responseBody)
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

      log(realm, source, "Handler", "response : " + JSON.stringify(aresponse));

      return aresponse;
    }
  };
}
