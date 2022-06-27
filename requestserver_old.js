const islandReq = require("./island.js");
const islandWorkerReq = require("./islandWorker.js");
const islandDataReq = require("./islandData.js");
const sessionReq = require("./session.js");
const nameserverReq = require("./nameserver.js");
const dbhelperReq = require("./dynamohelper.js");

let Island = islandReq.Island;
let getIslands = islandReq.getIslands;

let Session = sessionReq.Session;
let getSession = sessionReq.getSession;
let createSession = sessionReq.createSession;
let persistSessions = sessionReq.persistSessions;
let persistIsland = islandDataReq.persistIsland;
let getAsyncItem = dbhelperReq.getAsyncItem;
let getIslandData = islandWorkerReq.getIslandData;
let getMovesData = islandWorkerReq.getMovesData;

let NameServer = nameserverReq.NameServer;

const intervalTime = 846; // 3456; //864; // 864; // 648;  // 1728; //864
let islandH = 12;
let islandL = 12;
const baseTime = new Date().getTime();

let debug = false;
let deepDebug = false;

let nameserver = new NameServer(30, 10, false);

const createInitData = async (sessionId, moves) => {
  
  let data = await getIslandData(sessionId, true);
  
  if (deepDebug) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> 1 >>" )
    console.dir(data);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> 1 >>" )
  }

  return data;

};

const createIslandData = async (sessionId) => {

  let data = await getIslandData(sessionId);

  if (deepDebug) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> 2 >>" )
    console.dir(data);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> 2 >>" )
  }

  return data;
};

// the parameter followId indicates that penguin must be followed in the console

const createMovesData = async (sessionId, island, moves, followId) => {
  let theMoves = moves ? moves : [];

  let data = await getMovesData(sessionId);
  
  if (deepDebug) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> 3 >>" )
    console.dir(data);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> 3 >>" )
  }

  return data;
  
};

const createResponse = async (url, params, sessionId) => {
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
  }

  switch (url) {
    case "/island": {
      if (!session) {
        session = createSession();
        sessionId = session.id;
        island = new Island(islandH, islandL, session, debug);
        session.setIsland(island.id);
        persistSessions(session);
        persistIsland(island);
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

      return await createInitData(sessionId,  session.getInitMoveLog(island));
    }

    case "/new-island": {
      if (session) {
        if (island) {
          island.unregisterSession(session);
        }

        island = new Island(islandH, islandL, session, debug);
        // islands.push(island);
        session.reset();
        session.setIsland(island.id);
        persistSessions(session);
        persistIsland(island);

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

        return await createInitData(sessionId, session.getInitMoveLog(island));
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

      return await createInitData(sessionId, session.getInitMoveLog(island));

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

        island.setFollowId(followId);

        let moves =
          renew === 0 ? session.getMoveLog() : session.getInitMoveLog(island);

        return createMovesData(sessionId,  moves);
      }
    }

    case "/islandmoves": {
      if (session && island) {
        let renew = Number.parseInt(params.renew, 10);
        return await createIslandData(sessionId);
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
          return await createIslandData(sessionId, false);
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
