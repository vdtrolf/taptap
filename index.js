const requestserverReq = require("./requestserver.js");

let createResponse = requestserverReq.createResponse;

const port = 3001;
debug = false;

// Starting the express server

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
