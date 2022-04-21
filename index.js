const penguinReq = require("./penguin.js");
const islandReq = require("./island.js");
const landReq = require("./land.js");
const sessionReq = require("./session.js");
// const axios = require("axios");

let Penguin = penguinReq.Penguin;
let Island = islandReq.Island;
let Land = landReq.Land;
let Session = sessionReq.Session;

const port = 3001;
const sessions = [];
const useexpress = false;

let session = null, island = null;

const args = process.argv.slice(2);

// console.log(process.env);

args.forEach((arg) => {
  console.log(arg);
});

let islandL = Number.parseInt(args[0], 10);
if (!islandL) islandL = 12;
let islandH = islandL;

let mode = Number.parseInt(args[1], 10);
if (!mode) mode = 1;

let debug = Number.parseInt(args[2], 10);
debug = false;

const getSession = (sessionId) => {

  console.log("looking for sessionId " + sessionId);

  if (sessionId) {
    session = sessions.find(session => {
      return session.getId() === sessionId
    });
  }

  if (session) {
    session.isAlive();
  }
};

const createResponse = (url) => {

  switch(url) {

    case "/island" : {
      if (! session) {
        island = null;
        island = new Island(islandH,islandL);
        session = new Session(island);

        if (debug) {
          sessions[0] = null;
          sessions[0] = session;
          console.log("Building an island of size " + islandH + " * " + islandL);
          console.log(island.getAscii(mode,islandH,islandL));
        } else {
          sessions.push(session);
        }

      }   else {
        island = session.getIsland();
      }
      return {island : island.getImg(mode,islandH,islandL),
        weather : island.getWeather(),
        penguins : island.getPenguins(),
        session : session.getId(),
        artifacts: island.getArtifacts(),
        tiles: session.getTiles(),
        fishes: session.getFishes()};
    }

    case "/new-island" : {
      if (session) {
        island = new Island(islandH,islandL);
        session.reset();
        session.setIsland(island);
        if (debug) {
          console.log("Renewing an island of size " + islandH + " * " + islandL);
          console.log(island.getAscii(mode,islandH,islandL));
        }
        return {island : island.getImg(mode,islandH,islandL),
          weather : island.getWeather(),
          penguins : island.getPenguins(),
          session : session.getId(),
          artifacts: island.getArtifacts(),
          tiles: session.getTiles(),
          fishes: session.getFishes()};
      } else {
        console.log("No island found");
      }
    }

    case "/penguins" : {
      if (session) {
        let island = session.getIsland();
        return {penguins : island.getPenguins(),
          artifacts : island.getArtifacts()};
      }
    }

    case "/sessions" : {
      if (session) {
        return {sessions : sessions, session : session.getId()};
      } else {
        return {sessions : sessions};
      }
    }

    case "/setTile" : {
      if (session) {
        let island = session.getIsland();
        let hpos = Number.parseInt(req.query.hpos,10);
        let lpos = Number.parseInt(req.query.lpos,10);

        if (island.setTile(lpos,hpos,session)) {
          return {result : "true",
          island : island.getImg(mode,islandH,islandL),
          weather : island.getWeather(),
          artifacts: island.getArtifacts(),
          session : session.getId(),
          tiles: session.getTiles(),
          fishes: session.getFishes()};
        } else {
          return {result : "false"};
        }
      }
    }

    default : {
      return {};
    }

  }
};


if (useexpress) {

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
      getSession(sessionId);

      console.log("Receiving a request at " + req.path + " for session " + sessionId);

      return res.json(createResponse(req.path));
    });

    app.listen(port, () => {
      console.log(`Little island listening at port: ${port}`);
    });

    app.on('error', (e) => {
      console.log("app " + e.code);
    });

    process.on('error', (e) => {
      console.log("process" + e.code);
    });

    setInterval(() => {
      sessions.forEach(session=> {
        let island = session.getIsland();
        island.makePenguinsOlder();
        island.movePenguins();
        island.setWeather();
        island.smelt();
      });

    }, 1000);


  } catch(error) {
     console.error("problem " + error);
  }

} else {

  const http = require('http');

  // const requestListener = function (req, res) {
  //   res.writeHead(200);
  //   res.end('Hello, World!');
  // }
  //
  // const server = http.createServer(requestListener);
  // server.listen(3001);

  http.createServer((req, res) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000, // 30 days
      /** add other headers as per requirement */
    };

    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers);
      res.end();
      return;
    }

    if (['GET', 'POST'].indexOf(req.method) > -1) {

      const urlsplit = req.url.split("?");

      console.log("===>" + urlsplit[0] + "<===>" + urlsplit[1]);

      if (urlsplit[1] && urlsplit[1].startsWith("sessionId")) {
        getSession(urlsplit[1].substring(10));
      }

      let response = JSON.stringify(createResponse(urlsplit[0]));

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200, headers);
      res.end(response);
      return;
    }

    res.writeHead(405, headers);
    res.end(`${req.method} is not allowed for the request.`);
  }).listen(port);

}
