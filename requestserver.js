// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;

const realm = "req";
const source = "requestserver.js";

// imports
const islandReq = require("./island.js");
const islandWorkerReq = require("./islandWorker.js");
const islandDataReq = require("./islandData.js");
const nameserverReq = require("./nameserver.js");
const stephelperReq = require("./stephelper.js");
const stateserverReq = require("./stateserver.js");

let setState = stateserverReq.setState;
let Island = islandReq.Island;

let persistIsland = islandDataReq.persistIsland;
let getInitData = islandWorkerReq.getInitData;
let getIslandData = islandWorkerReq.getIslandData;
let getMovesData = islandWorkerReq.getMovesData;
let getIslandsList = islandWorkerReq.getIslandsList;
let deleteIsland = islandWorkerReq.deleteIsland;
let startStateSteps = stephelperReq.startStateSteps;

let NameServer = nameserverReq.NameServer;

let islandH = 12;
let islandL = 12;
let counter = 0;

let nameserver = new NameServer(30, 10, false);

const createResponse = async (url, params, islandId = 0, local = true) => {
  
  log(
    realm,
    source,
    "createResponse",
    "path= " + url + " islandId= " + islandId
  );

  if (islandId > 0) {
    switch (url) {
      case "/new-island": {
        let island = new Island(islandH, islandL);
        persistIsland(island, true);

        log(
          realm,
          source,
          "createResponse",
          "case new-island - renewing an island of size " +
            islandH +
            " * " +
            islandL
        );

        return await getInitData(island);
      }

      case "/state": {
        log(realm, source, "createResponse", "case state - event received ");
        let isRunning = await setState(1);
        return { running: isRunning };
      }

      case "/moves": {
        let followId = Number.parseInt(params.followId, 10);
        return await getMovesData(islandId, followId);
      }

      case "/islandmoves": {
        let followId = Number.parseInt(params.followId, 10);
        return await getIslandData(islandId, followId);
      }

      case "/islands": {
        let islands = await getIslandsList();
        return { islands: islands };
      }

      case "/deleteIsland": {
        let islandId = Number.parseInt(params.islandId, 10);
        let islands = await deleteIsland(islandId);
        return { islands: islands };
      }

      case "/setTile": {
        let hpos = Number.parseInt(params.hpos, 10);
        let lpos = Number.parseInt(params.lpos, 10);
        return await getIslandData(islandId, 0, hpos, lpos);
      }

      default: {
        return {};
      }
    }
  } else {
    // No island

    switch (url) {
      case "/island": {
        let island = new Island(islandH, islandL);
        persistIsland(island, true);

        log(
          realm,
          source,
          "createResponse",
          "case island - Building an new island"
        );
        if (!local) {
          startStateSteps();
        }
        return await getInitData(island);
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
