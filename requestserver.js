const islandReq = require("./island.js");
const islandWorkerReq = require("./islandWorker.js");
const islandDataReq = require("./islandData.js");
const sessionReq = require("./session.js");
const nameserverReq = require("./nameserver.js");

let Island = islandReq.Island;

let Session = sessionReq.Session;
let getSession = sessionReq.getSession;
let createSession = sessionReq.createSession;
let persistSessions = sessionReq.persistSessions;
let persistIsland = islandDataReq.persistIsland;
let getInitData = islandWorkerReq.getInitData;
let getIslandData = islandWorkerReq.getIslandData;
let getMovesData = islandWorkerReq.getMovesData;
let getIslandsList = islandWorkerReq.getIslandsList;
let connectIsland = islandWorkerReq.connectIsland;

let NameServer = nameserverReq.NameServer;

let islandH = 12;
let islandL = 12;
let counter = 0;

let debug = true;
let deepDebug = false;

let nameserver = new NameServer(30, 10, false);

const createResponse = async (url, params, sessionId, counterId) => {
  let session = null;

  if (debug)
    console.log(
      "requestserver.js - createResponse: url= " +
        url +
        " sessionId= " +
        sessionId +
        " counterId= " +
        counterId
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
        // resetPenguinsPos(session);
        return createInitData(session, counterId);
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

        // resetPenguinsPos(session);
        return createInitData(session, counterId);
      }

      case "/moves": {
        let renew = Number.parseInt(params.renew, 10);
        let followId = Number.parseInt(params.followId, 10);

        if (renew !== 0) resetPenguinsPos(session);
        return await getMovesData(session, counterId, followId, renew);
      }

      case "/islandmoves": {
        let renew = Number.parseInt(params.renew, 10);
        let followId = Number.parseInt(params.followId, 10);

        if (renew !== 0) resetPenguinsPos(session);
        return await getIslandData(session, counterId, followId, renew);
      }

      case "/islands": {
        let islands = await getIslandsList();

        // console.dir(islands);

        return { islands: islands, session: session.id };
      }

      case "/setTile": {
        let hpos = Number.parseInt(params.hpos, 10);
        let lpos = Number.parseInt(params.lpos, 10);
        return await getIslandData(session, counterId, 0, 0, hpos, lpos);
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
        island.registerSession(session);

        persistIsland(island, true);
        persistSessions(session);

        if (debug) {
          console.log(
            "index.js - createResponse/island : Building an new island for session " +
              sessionId
          );
        }

        return await getInitData(island, session, counterId);
      }

      case "/islands": {
        let islands = await getIslandsList();

        // console.dir(islands);

        return { islands: islands, session: 0 };
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
