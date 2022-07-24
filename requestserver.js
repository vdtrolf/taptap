const islandReq = require("./island.js");
const islandWorkerReq = require("./islandWorker.js");
const islandDataReq = require("./islandData.js");
const sessionReq = require("./session.js");
const nameserverReq = require("./nameserver.js");
//const dbhelperReq = require("./dynamohelper.js");
const dbhelperReq = require("./acebasehelper.js");
const { resetPenguinsPos } = require("./islandWorker.js");

let Island = islandReq.Island;

let Session = sessionReq.Session;
let getSession = sessionReq.getSession;
let createSession = sessionReq.createSession;
let persistSessions = sessionReq.persistSessions;
let persistIsland = islandDataReq.persistIsland;
let getInitData = islandWorkerReq.getInitData;
let getIslandData = islandWorkerReq.getIslandData;
let getMovesData = islandWorkerReq.getMovesData;
let getAsyncIslands = islandWorkerReq.getAsyncIslands;
let connectIsland = islandWorkerReq.connectIsland;

let NameServer = nameserverReq.NameServer;

const intervalTime = 1728; // 648;  // 1728; //864
let islandH = 12;
let islandL = 12;
const baseTime = new Date().getTime();
let counter = 0;

let debug = false;
let deepDebug = false;

let nameserver = new NameServer(30, 10, false);

const createInitData = (island, session, moves) => {
  // let data = await getIslandData(session.islandId, session.id, moves);
  let data = getInitData(island, session.id, moves);

  if (debug) {
    console.log(
      "requestserver.js - createInitData: get data for session  " + session.id
    );
  } else if (deepDebug) {
    console.log("requestserver.js - createInitData ----------");
    console.dir(data);
    console.log("requestserver.js - createInitData ----------");
  }

  return data;
};

const createIslandData = async (
  session,
  moves = [],
  followId,
  tileHpos,
  tileLpos
) => {
  let data = await getIslandData(
    session.islandId,
    session.id,
    moves,
    followId,
    tileHpos,
    tileLpos
  );

  if (debug) {
    console.log(
      "requestserver.js - createIslandData : get data for session " +
        data.session
    );
  } else if (deepDebug) {
    console.log("requestserver.js - createIslandData ----------");
    console.dir(data);
    console.log("requestserver.js - createIslandData ----------");
  }

  return data;
};

// the parameter followId indicates that penguin must be followed in the console

const createMovesData = async (session, moves, followId) => {
  let data = await getMovesData(session.islandId, session.id, moves, followId);

  if (debug) {
    console.log(
      "requestserver.js - createMovesData: moves = " + data.moves.length
    );
  } else if (deepDebug) {
    console.log("requestserver.js - createMovesData ----------");
    console.dir(data.moves);
    console.log("requestserver.js - createMovesData ----------");
  }

  return data;
};

const createResponse = async (url, params, sessionId) => {
  let session = null;

  if (debug && url !== "/islands")
    console.log(
      "requestserver.js - createResponse: url= " +
        url +
        " sessionId= " +
        sessionId
    );

  if (sessionId > 0) {
    session = await getSession(sessionId);
    switch (url) {
      case "/new-island": {
        // if (island) {
        //   island.unregisterSession(session);
        // }

        // island = new Island(islandH, islandL, session, debug);
        // // islands.push(island);
        // session.reset();
        // session.setIsland(island.id);
        // persistSessions(session);
        // persistIsland(island);

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
        resetPenguinsPos(session);
        return createInitData(session, session.getMoveLog());
      }

      case "/connect-island": {
        // getIslands().forEach((island) => island.unregisterSession(session));

        connectIsland(sessionId, Number.parseInt(params.islandId, 10));

        // let islandId = Number.parseInt(params.islandId, 10);
        // island = islands.find((island) => island.id === islandId);
        // island.registerSession(session);

        if (debug) {
          console.log(
            "index.js - createResponse/connect-island : Connecting to island  " +
              Number.parseInt(params.islandId, 10)
          );
        }

        resetPenguinsPos(session);
        return createInitData(session, session.getMoveLog());
      }

      // return the moves - is the renew parameter is on 1, then returns an initial move log
      // the parameter renew indicates the movement log must reinitiated withe 'placeament' moves (moveDir =0)
      // the parameter followId indicates that penguin must be followed in the console
      case "/moves": {
        let renew = Number.parseInt(params.renew, 10);
        let followId = Number.parseInt(params.followId, 10);

        // island.setFollowId(followId);

        if (renew !== 0) resetPenguinsPos(session);
        return createMovesData(session, session.getMoveLog(), followId);
      }

      case "/islandmoves": {
        let renew = Number.parseInt(params.renew, 10);
        let followId = Number.parseInt(params.followId, 10);

        // island.setFollowId(followId);

        if (renew !== 0) resetPenguinsPos(session);
        return createIslandData(session, session.getMoveLog(), followId);
      }

      case "/islands": {
        let islands = getAsyncIslands();
        return { islands: islands, session: session.id };
      }

      case "/setTile": {
        let hpos = Number.parseInt(params.hpos, 10);
        let lpos = Number.parseInt(params.lpos, 10);
        return createIslandData(session, [], 0, hpos, lpos);
      }

      default: {
        return {};
      }
    }
  } else {
    // No session

    switch (url) {
      case "/island": {
        session = createSession();
        sessionId = session.id;
        let island = new Island(islandH, islandL, [session], debug);
        session.setIsland(island.id);
        persistSessions(session);
        persistIsland(island, true);

        if (debug) {
          console.log(
            "index.js - createResponse/island : Building an new island"
          );
        }
        resetPenguinsPos(session);
        return createInitData(island, session, session.getInitMoveLog(island));
      }

      case "/islands": {
        session = createSession();
        sessionId = session.id;
        persistSessions(session);
        let islands = getAsyncIslands();
        return { islands: islands, session: session.id };
      }

      default: {
        return {};
      }
    }
  }
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  createResponse: createResponse,
};
