const express = require('express');
const cors = require('cors');
const penguinReq = require("./penguin.js");
const islandReq = require("./island.js");
const landReq = require("./land.js");
const sessionReq = require("./session.js");
const axios = require("axios");
const readline = require('readline')
const strings = require('./strings')

let Penguin = penguinReq.Penguin;
let Island = islandReq.Island;
let Land = landReq.Land;
let Session = sessionReq.Session;

const sessions = [];

const app = express();
const port = 3001;
app.use(cors())
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const args = process.argv.slice(2);

// console.log(process.env);

args.forEach((arg) => {
  console.log(arg);
});

let islandL = Number.parseInt(args[0], 10);
if (!islandL) islandL = 12;
let islandH = 12; // islandL / 2 ;

let mode = Number.parseInt(args[1], 10);
if (!mode) mode = 1;

let debug = Number.parseInt(args[2], 10);
debug = true;

listen = true;

if (listen) {

  app.get('/*', (req, res) => {
    let sessionId = Number.parseInt(req.query.sessionId,10);
    let session = null, island = null;
    if (sessionId) {
      session = sessions.find(session => {
        return session.getId() === sessionId
      });
    }

    if (session) {
      session.isAlive();
    }

    console.log("Receiving a request at " + req.path + " for session " + sessionId);

    switch(req.path) {

      case "/island-ascii" : {
        if (! session) {
          island = new Island(islandH,islandL);
          session = new Session(island);
          sessions.push(session);
          if (debug) {
            console.log("Building an island of size " + islandH + " * " + islandL);
            console.log(island.getAscii(mode,islandH,islandL));
          }
        } else {
          island = session.getIsland();
        }
        return res.json( {island : island.getImg(mode,islandH,islandL),penguins : island.getPenguins(), session : session.getId()});
      }

      case "/new-island" : {
        if (session) {
          island = new Island(islandH,islandL);
          session.setIsland(island);
          if (debug) {
            console.log("Renewing an island of size " + islandH + " * " + islandL);
            console.log(island.getAscii(mode,islandH,islandL));
          }
          return res.json( {island : island.getImg(mode,islandH,islandL),penguins : island.getPenguins(),session : session.getId()});
        } else {
          console.log("No island found");
        }
      }

      case "/penguins" : {
        if (session) {
          let island = session.getIsland();
          return res.json({penguins : island.getPenguins()});
        }
      }
    }

  });

  app.listen(port, () => {
    console.log(`Little island listening at port: ${port}`);
  });
}

setInterval(() => {
    sessions.forEach(session=> {
      let island = session.getIsland();
      island.makePenguinsOlder();
      island.movePenguins();
      island.smelt();
    });
}, 2000);
