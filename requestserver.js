const islandReq = require("./island.js");
const islandDataReq = require("./islandData.js");
const sessionReq = require("./session.js");
const nameserverReq = require("./nameserver.js");

let Island = islandReq.Island;
let getIslands = islandReq.getIslands;

let Session = sessionReq.Session;
let getSession = sessionReq.getSession;
let createSession = sessionReq.createSession;
let persistSessions = sessionReq.persistSessions;
let persistIsland = islandDataReq.persistIsland;

let NameServer = nameserverReq.NameServer;

const intervalTime = 846; // 3456; //864; // 864; // 648;  // 1728; //864
let islandH = 12;
let islandL = 12;
let mode = 1;
const baseTime = new Date().getTime();

// console.log(process.env);

debug = false;
procesdebug = false;

let nameserver = new NameServer(30, 10, false);

const createInitData = (session, island, moves) => {
  let theMoves = moves ? moves : [];

  return {
    session: session.id,
    island: island.getImg(mode, islandH, islandL),
    penguins: island.getPenguins(),
    weather: island.getWeather(),
    artifacts: island.getArtifacts(),
    tiles: island.tiles,
    fishes: island.fishes,
    points: island.points,
    islandName: island.name,
    islandId: island.id,
    islandSize: island.landSize,
    moves: theMoves,
  };
};

const createIslandData = (session, island) => {
  return {
    session: session.id,
    island: island.getImg(mode, islandH, islandL),
    penguins: island.getPenguins(),
    weather: island.getWeather(),
    artifacts: island.getArtifacts(),
    tiles: island.tiles,
    fishes: island.fishes,
    islandName: island.name,
    islandId: island.id,
    islandSize: island.landSize,
  };
};

// the parameter followId indicates that penguin must be followed in the console

const createMovesData = (session, island, moves, followId) => {
  let theMoves = moves ? moves : [];

  island.setFollowId(followId);

  return {
    session: session.id,
    points: island.points,
    islandSize: island.landSize,
    moves: theMoves,
  };
};

const createResponse = (url, params, sessionId) => {
  let session = null;
  let island = null;
  let islands = getIslands();

  if (debug && url !== "/islands")
    console.log(
      "in createResponse url: >" + url + "< sessionId: >" + sessionId + "<"
    );

  if (sessionId > 0) {
    session = getSession(sessionId);
    if (session != null) {
      island = islands.find((island) => island.hasSession(session.id));
    }
    //    session = sessions.find((session) => session.getId() === sessionId);
  }

  switch (url) {
    case "/island": {
      if (!session) {
        session = createSession();
        island = new Island(islandH, islandL, session, debug);
        // islands.push(island);

        if (debug) {
          timeTag = new Date().getTime() - baseTime;
          console.log(
            timeTag +
              "index.js - createResponse/island : Building an island of size " +
              islandH +
              " * " +
              islandL
          );
        }
      }

      return createInitData(session, island, session.getInitMoveLog(island));
    }

    case "/new-island": {
      if (session) {
        if (island) {
          island.unregisterSession(session);
        }

        island = new Island(islandH, islandL, session, debug);
        // islands.push(island);
        session.reset();

        if (debug) {
          timeTag = new Date().getTime() - baseTime;
          console.log(
            timeTag +
              "index.js - createResponse/new-island : Renewing an island of size " +
              islandH +
              " * " +
              island
          );
        }

        return createInitData(session, island, session.getInitMoveLog(island));
      } else {
        if (debug) {
          console.log("index.js - createResponse : No island found");
        }
      }
    }

    case "/connect-island": {
      if (!session) {
        session = createSession();
      } else {
        session.reset();
      }

      getIslands().forEach((island) => island.unregisterSession(session));

      let islandId = Number.parseInt(params.islandId, 10);
      island = islands.find((island) => island.id === islandId);
      island.registerSession(session);

      if (debug) {
        timeTag = new Date().getTime() - baseTime;
        console.log(
          timeTag +
            "index.js - createResponse/connect-island : Connecting to island  " +
            island.name +
            "( id " +
            island.id +
            ")"
        );
      }

      return createInitData(session, island, session.getInitMoveLog(island));

    }

    case "/penguins": {
      if (session && island) {
        return createData(false);
      }
    }

    // return the moves - is the renew parameter is on 1, then returns an initial move log
    // the parameter renew indicates the movement log must reinitiated withe 'placeament' moves (moveDir =0)
    // the parameter followId indicates that penguin must be followed in the console

    case "/moves": {
      if (session && island) {
        let renew = Number.parseInt(params.renew, 10);
        let followId = Number.parseInt(params.followId, 10);

        let moves =
          renew === 0 ? session.getMoveLog() : session.getInitMoveLog(island);

        return createMovesData(session, island, moves, followId);
      }
    }

    case "/islandmoves": {
      if (session && island) {
        let renew = Number.parseInt(params.renew, 10);
        return createIslandData(session, island);
      }
    }

    case "/islands": {
      if (session) {
        return { islands: getIslands(), session: session.getId() };
      } else {
        return { islands: getIslands() };
      }
    }

    case "/setTile": {
      if (session && island) {
        let hpos = Number.parseInt(params.hpos, 10);
        let lpos = Number.parseInt(params.lpos, 10);

        if (island.setTile(lpos, hpos, session)) {
          return createIslandData(session, island, false);
        } else {
          return { result: "false" };
        }
      }
    }

    default: {
      return {};
    }
  }
};

// Main interval loop - for each session triggers the penguin events

let doAll = true;

setInterval(() => {

  getIslands().forEach((island) => {
    if (island.running) {
      island.calculateNeighbours();
      island.movePenguins();
      if (doAll) {
        island.addSwims();
        island.makePenguinsOlder();
        island.smelt();
        island.setWeather();
        persistIsland(island);
      }
    }
  });
  persistSessions();
  doAll = !doAll;
}, intervalTime);

// now we export the class, so other modules can create Penguin objects
module.exports = {
  createResponse: createResponse,
};
