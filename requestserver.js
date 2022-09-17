// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;

const realm = "req";
const source = "requestserver.js";

// imports
const islandReq = require("./island.js");
const islandWorkerReq = require("./islandWorker.js");
const islandDataReq = require("./islandData.js");
const sessionReq = require("./session.js");
const nameserverReq = require("./nameserver.js");

let Island = islandReq.Island;

let Session = sessionReq.Session;
let createSession = sessionReq.createSession;
let persistIsland = islandDataReq.persistIsland;
let getInitData = islandWorkerReq.getInitData;
let getConnectData = islandWorkerReq.getConnectData;
let getRenewData = islandWorkerReq.getRenewData;
let getIslandData = islandWorkerReq.getIslandData;
let getMovesData = islandWorkerReq.getMovesData;
let getIslandsList = islandWorkerReq.getIslandsList;

let NameServer = nameserverReq.NameServer;

let islandH = 12;
let islandL = 12;
let counter = 0;

let nameserver = new NameServer(30, 10, false);

const createResponse = async (
  url,
  params,
  sessionId,
  counterId,
  islandId = 0,
  oldIslandId = 0
) => {
  log(
    realm,
    source,
    "createResponse",
    ": url= " +
      url +
      " sessionId= " +
      sessionId +
      " counterId= " +
      counterId +
      " islandId= " +
      islandId +
      " old islandId= " +
      oldIslandId
  );

  if (sessionId > 0) {
    switch (url) {
      case "/new-island": {
        log(
          realm,
          source,
          "createResponse/new-island",
          "Renewing an island of size " + islandH + " * " + islandL
        );
        return await getRenewData(
          islandId,
          oldIslandId,
          sessionId,
          counterId,
          islandH,
          islandL
        );
      }

      case "/connect-island": {
        if (islandId > 0 && oldIslandId > 0) {
          log(
            realm,
            source,
            "createResponse/connect island",
            "Connecting island " + islandId + " to session " + sessionId
          );
          return await getConnectData(
            islandId,
            oldIslandId,
            sessionId,
            counterId
          );
        }
      }

      case "/moves": {
        let renew = Number.parseInt(params.renew, 10);
        let followId = Number.parseInt(params.followId, 10);
        return await getMovesData(
          islandId,
          sessionId,
          counterId,
          followId,
          renew
        );
      }

      case "/islandmoves": {
        let renew = Number.parseInt(params.renew, 10);
        let followId = Number.parseInt(params.followId, 10);
        return await getIslandData(
          islandId,
          sessionId,
          counterId,
          followId,
          renew
        );
      }

      case "/islands": {
        let islands = await getIslandsList();
        return { islands: islands, session: sessionId };
      }

      case "/setTile": {
        let hpos = Number.parseInt(params.hpos, 10);
        let lpos = Number.parseInt(params.lpos, 10);
        return await getIslandData(
          islandId,
          sessionId,
          counterId,
          0,
          0,
          hpos,
          lpos
        );
      }

      default: {
        return {};
      }
    }
  } else {
    // No session

    switch (url) {
      case "/island": {
        let session = createSession();
        sessionId = session.id;
        let island = new Island(islandH, islandL, [session]);
        persistIsland(island, true);

        log(
          realm,
          source,
          "createResponse/island",
          "Building an new island for session " + sessionId
        );
        return await getInitData(island, sessionId, counterId);
      }

      case "/islands": {
        let islands = await getIslandsList();

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
