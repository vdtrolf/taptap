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
const stephelperReq = require("./stephelper.js");
const stateserverReq = require("./stateserver.js");

let setState = stateserverReq.setState;
let Island = islandReq.Island;

let Session = sessionReq.Session;
let createSession = sessionReq.createSession;
let persistIsland = islandDataReq.persistIsland;
let getInitData = islandWorkerReq.getInitData;
let getIslandData = islandWorkerReq.getIslandData;
let getMovesData = islandWorkerReq.getMovesData;
let getIslandsList = islandWorkerReq.getIslandsList;
let startStateSteps = stephelperReq.startStateSteps;

let NameServer = nameserverReq.NameServer;

let islandH = 12;
let islandL = 12;
let counter = 0;

let nameserver = new NameServer(30, 10, false);

const createResponse = async (
  url,
  params,
  counterId,
  islandId = 0,
  oldIslandId = 0,
  local = true
) => {
  log(
    realm,
    source,
    "createResponse",
    ": url= " +
      url +
      " counterId= " +
      counterId +
      " islandId= " +
      islandId +
      " old islandId= " +
      oldIslandId
  );

  if (islandId > 0) {
    switch (url) {
      case "/new-island": {
        let island = new Island(islandH, islandL, []);
        persistIsland(island, true);

        log(
          realm,
          source,
          "createResponse/new-island",
          "Renewing an island of size " + islandH + " * " + islandL
        );

        return await getInitData(island, counterId);
      }

      case "/state": {
        log(realm, source, "Handler", "/state event received ");
        let isRunning = await setState(1);
        return { running: isRunning };
      }

      case "/moves": {
        let followId = Number.parseInt(params.followId, 10);
        return await getMovesData(islandId, counterId, followId);
      }

      case "/islandmoves": {
        let followId = Number.parseInt(params.followId, 10);
        return await getIslandData(islandId, counterId, followId);
      }

      case "/islands": {
        let islands = await getIslandsList();
        return { islands: islands };
      }

      case "/setTile": {
        let hpos = Number.parseInt(params.hpos, 10);
        let lpos = Number.parseInt(params.lpos, 10);
        return await getIslandData(islandId, counterId, 0, hpos, lpos);
      }

      default: {
        return {};
      }
    }
  } else {
    // No session

    switch (url) {
      case "/island": {
        let island = new Island(islandH, islandL);
        persistIsland(island, true);

        log(realm, source, "createResponse/island", "Building an new island");
        if (!local) {
          startStateSteps();
        }
        return await getInitData(island, counterId);
      }

      case "/islands": {
        let islands = await getIslandsList();

        return { islands: islands };
      }

      case "/stateengine": {
        startStateSteps();
        return { result: "state engine started" };
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
