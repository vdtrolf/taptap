// const penguinReq = require("./penguin.js");
const islandReq = require("./island.js");
// const landReq = require("./land.js");
const sessionReq = require("./session.js");
const nameserverReq = require("./nameserver.js");

// let Penguin = penguinReq.Penguin;
let Island = islandReq.Island;
// let Land = landReq.Land;
let Session = sessionReq.Session;
let NameServer = nameserverReq.NameServer;

const intervalTime = 864; // 864; // 648;  // 1728; //864
let islandH = 12;
let islandL = 12;
let mode = 1;
let islands = [];
let sessions = [];
const baseTime = new Date().getTime();

// console.log(process.env);

debug = false;
procesdebug = false;

let nameserver = new NameServer(30, 10, false);

const createInitData = (session, island, moves) => {
  let theMoves = moves ? moves : [];

  return {
    session: session.getId(),
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
    session: session.getId(),
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
    session: session.getId(),
    points: island.points,
    islandSize: island.landSize,
    moves: theMoves,
  };
};

const createResponse = (url, params, sessionId) => {
  let session = null;
  let island = null;

  if (debug)
    console.log(
      "in createResponse url: >" + url + "< sessionId: >" + sessionId + "<"
    );

  if (sessionId > 0) {
    session = sessions.find((session) => session.getId() === sessionId);
    if (session != null) {
      island = islands.find((island) => island.hasSession(session.getId()));
    }
  }

  switch (url) {
    case "/island": {
      if (!session) {
        session = new Session();
        island = new Island(islandH, islandL, session, debug);
        islands.push(island);

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
        sessions.push(session);
      }

      return createInitData(session, island, session.getInitMoveLog(island));
    }

    case "/new-island": {
      if (session) {
        if (island) {
          island.unregisterSession(session);
        }

        island = new Island(islandH, islandL, session, debug);
        islands.push(island);
        session.reset();

        if (debug) {
          timeTag = new Date().getTime() - baseTime;
          console.log(
            timeTag +
              "index.js - createResponse/new-island : Renewing an island of size " +
              islandH +
              " * " +
              islandL
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
      if (session) {
        if (island) {
          island.unregisterSession(session);
        }

        let islandId = Number.parseInt(params.islandId, 10);
        island = islands.find((island) => island.getId() === islandId);
        session.reset();
        island.registerSession(session);

        if (debug) {
          timeTag = new Date().getTime() - baseTime;
          console.log(
            timeTag +
              "index.js - createResponse/connect-island : Connecting to island  " +
              island.getName()
          );
        }

        return createInitData(session, island, session.getInitMoveLog(island));
      } else {
        console.log("index.js - createResponse :No island found");
      }
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
        return { islands: islands, session: session.getId() };
      } else {
        return { islands: islands };
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
  islands.forEach((island) => {
    if (island.running) {
      island.calculateNeighbours();
      island.movePenguins();
      if (doAll) {
        island.addSwims();
        island.makePenguinsOlder();
        island.smelt();
        island.setWeather();
      }
      doAll = !doAll;
      island.persist();
    }
  });
}, intervalTime);

// now we export the class, so other modules can create Penguin objects
module.exports = {
  createResponse: createResponse,
};
