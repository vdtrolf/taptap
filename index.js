const penguinReq = require("./penguin.js");
const islandReq = require("./island.js");
const landReq = require("./land.js");
const sessionReq = require("./session.js");

let Penguin = penguinReq.Penguin;
let Island = islandReq.Island;
let Land = landReq.Land;
let Session = sessionReq.Session;

const port = 3001;
const sessions = [];

let session = null, island = null, sessionId = null;

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

const getSessionsList = () => {
  let sessionList = [];
  sessions.forEach( session => {
    sessionList.push({
      id : session.id,
      points : session.points,
      turn : session.turn,
      islandName : session.island.getName(),
      islandId : session.island.getId()
    });
  });
  return sessionList;
}

const getSession = (sessionId) => {

  //console.log("looking for sessionId ==>" + sessionId + "<==");

  let sId = Number.parseInt(sessionId,10);

  // console.log("looking for sessionId ==>" + sessionId + "<== is ==>" + sId + "<==");


  if (sessionId) {
    session = sessions.find(session => {
      return session.getId() === sId;
    });
  } else {
    session = null;
  }

  if (session) {
    //console.log("Found session =>" + session.getId() + "<=");
    session.isAlive();
  }
};

const createResponse = (url,params) => {

  // console.log("Creating a response for " + url);

  switch(url) {

    case "/island" : {
      if (! session) {
        island = null;
        island = new Island(islandH,islandL);
        session = new Session(island);
        island.addPenguins(session);

        if (debug) {
          sessions[0] = null;
          sessions[0] = session;
          console.log("Building an island of size " + islandH + " * " + islandL);
          console.log(island.getAscii(mode,islandH,islandL));
        } else {
          // console.log("Pushing session =>" + session.getId() + "<==");
          sessions.push(session);
        }

      } else {
        island = session.getIsland();
      }
      return {island : island.getImg(mode,islandH,islandL),
        islandName : island.getName(),
        weather : island.getWeather(),
        penguins : island.getPenguins(),
        session : session.getId(),
        artifacts: island.getArtifacts(),
        tiles: session.getTiles(),
        fishes: session.getFishes(),
        points: session.getPoints()};
    }

    case "/new-island" : {
      if (session) {
        island = new Island(islandH,islandL);
        session.reset();
        session.setIsland(island);
        island.addPenguins(session);
        if (debug) {
          console.log("Renewing an island of size " + islandH + " * " + islandL);
          console.log(island.getAscii(mode,islandH,islandL));
        }
        return {island : island.getImg(mode,islandH,islandL),
          islandName : island.getName(),
          weather : island.getWeather(),
          penguins : island.getPenguins(),
          session : session.getId(),
          artifacts: island.getArtifacts(),
          tiles: session.getTiles(),
          fishes: session.getFishes(),
          points: session.getPoints()};
      } else {
        console.log("No island found");
      }
    }

    case "/penguins" : {
      if (session) {
        let island = session.getIsland();

        return {session : session.getId(),
                islandName : island.getName(),
                weather : island.getWeather(),
                penguins : island.getPenguins(),
                artifacts: island.getArtifacts(),
                tiles: session.getTiles(),
                fishes: session.getFishes(),
                points: session.getPoints()};
      }
       // island : island.getImg(mode,islandH,islandL),
    }

    // return the moves - is the renew parameter is on 1, then returns an initial move log

    case "/moves" : {
      if (session) {

        let island = session.getIsland();
        let renew = Number.parseInt(params.renew,10);
        let moves = renew === 0? session.getMoveLog(): session.getInitMoveLog();

        return {session : session.getId(),
                island : island.getImg(mode,islandH,islandL),
                islandName : island.getName(),
                moves : moves,
                penguins : island.getPenguins(),
                weather : island.getWeather(),
                artifacts: island.getArtifacts(),
                tiles: session.getTiles(),
                fishes: session.getFishes(),
                points: session.getPoints()};
      }
    }

    case "/sessions" : {
      if (session) {
        return {sessions : getSessionsList(), session : session.getId()};
      } else {
        return {sessions : getSessionsList()};
      }
    }

    case "/setTile" : {
      if (session) {
        let island = session.getIsland();
        let hpos = Number.parseInt(params.hpos,10);
        let lpos = Number.parseInt(params.lpos,10);

        if (island.setTile(lpos,hpos,session)) {
          return {result : "true",
          islandName : island.getName(),
          island : island.getImg(mode,islandH,islandL),
          weather : island.getWeather(),
          artifacts: island.getArtifacts(),
          session : session.getId(),
          tiles: session.getTiles(),
          fishes: session.getFishes(),
          points: session.getPoints()};
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
    getSession(sessionId);

    if (debug ) {console.log("Processing " + req.path + " " + req.query.renew)};

    return res.json(createResponse(req.path,req.query));
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

} catch(error) {
   console.error("problem " + error);
}


// Main interval loop - for each session triggers the penguin events

setInterval(() => {
  sessions.forEach(session=> {
    let island = session.getIsland();
    island.makePenguinsOlder(session);
    island.movePenguins(session);
    island.setWeather(session);
    island.smelt();
  });

}, 1000);
