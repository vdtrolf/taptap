// DB stuff
const dbhelperReq = require("./dynamohelper.js"); // require("./acebasehelper.js");

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;
const LOGERR = loggerReq.LOGERR;
const LOGDATA = loggerReq.LOGDATA;

const realm = "worker";
const source = "islandWorker.js";

const sessionReq = require("./session.js");
const islandDataReq = require("./islandData.js");
const islandReq = require("./island.js");

let Island = islandReq.Island;
let getItem = dbhelperReq.getItem;
let getAsyncItems = dbhelperReq.getAsyncItems;
let persistIsland = islandDataReq.persistIsland;
let persistIslandData = islandDataReq.persistIslandData;
let getSession = sessionReq.getSession;

const weathers = ["sun", "rain", "snow", "cold", "endgame"];

// To be used just after the island was created - while the island object is still in memory
// Creates a result set based on the island object

const getInitData = async (island, sessionId, movesCounterId) => {
  log(
    realm,
    source,
    "getinitData",
    "is=" + island.id + " ss=" + sessionId + " ct=" + movesCounterId,
    LOGVERB
  );

  let result = {
    session: sessionId,
    island: getImg(island.territory, island.sizeH, island.sizeL),
    penguins: island.getPenguins(),
    weather: weathers[island.weather],
    tiles: island.tiles,
    fishes: island.fishes,
    points: island.points,
    islandName: island.name,
    islandId: island.id,
    islandSize: island.landSize,
  };

  let session = island.sessions.find((session) => session.id === sessionId);
  let theMoves = resetPenguinsPos(session, island);

  let moves = { moves: theMoves };
  result = { ...result, ...moves };

  log(realm, source, "getInitData", result, LOGVERB, LOGDATA);

  return result;
};

// To be used when the island has been persisted
// Creates a result set based on the island data in the DB

const getIslandData = async (
  islandId,
  sessionId,
  movesCounterId,
  penguinFollowId,
  renewMoves,
  tileHpos = 0,
  tileLpos = 0
) => {
  log(
    realm,
    source,
    "getIslandData",
    "is=" +
      islandId +
      " sid=" +
      sessionId +
      " cid=" +
      movesCounterId +
      " fId=" +
      penguinFollowId +
      " rw=" +
      renewMoves +
      " ti=" +
      tileHpos +
      "/" +
      tileLpos
  );

  let result = {};
  let changed = false;

  let islandData = await getItem("island", islandId);

  if (islandData) {
    // console.dir(islandData);

    log(
      realm,
      source,
      "getIslandData",
      "found is=" +
        islandData.id +
        " fId=" +
        penguinFollowId +
        " (#lands " +
        islandData.lands.length +
        ")"
    );

    let session = islandData.sessions.find(
      (session) => session.id === sessionId
    );

    let moves = [];
    if (session) {
      moves = session.moveLog
        ? session.moveLog.filter((move) => move.moveid > movesCounterId)
        : [];
    } else {
      console.log("++++ No session found for " + islandData.id);
    }

    let territory = [];
    for (let i = 0; i < islandData.sizeH; i++) {
      let line = [];
      for (let j = 0; j < islandData.sizeL; j++) {
        line.push([]);
      }
      territory.push(line);
    }

    islandData.lands.forEach((land) => {
      territory[land.hpos][land.lpos] = land;
    });

    if (
      tileHpos > 0 &&
      tileLpos > 0 &&
      tileHpos < islandData.sizeH - 1 &&
      tileLpos < islandData.sizeL - 1
    ) {
      let land = territory[tileHpos][tileLpos];

      if (land) {
        if (land.type === 0 && islandData.tiles > 0) {
          if (land.hasSwim) {
            land.hasSwim = false;
            land.hasFish = true;
          }
          land.type = 1;
          land.conf = 0;
          land.changed = true;
          islandData.tiles -= islandData.tiles > 0 ? 1 : 0;
          changed = true;
        } else if (land.type > 0 && islandData.fishes > 0) {
          land.hasFish = true;
          land.changed = true;
          islandData.fishes -= islandData.fishes > 0 ? 1 : 0;
          changed = true;
        }

        if (changed) {
          lands = [];
          for (let i = 0; i < islandData.sizeH; i++) {
            for (let j = 0; j < islandData.sizeL; j++) {
              lands.push(territory[i][j]);
            }
          }
          islandData.lands = lands;
        }
      }
    }

    if (penguinFollowId && penguinFollowId > 0) {
      islandData.penguinFollowId = penguinFollowId;
    }

    if (changed) {
      await persistIslandData(islandData);
    }

    let penguins = [];
    islandData.penguins.forEach((penguin) => penguins.push(penguin));

    result = {
      session: sessionId,
      island: getImg(territory, islandData.sizeH, islandData.sizeL),
      penguins: penguins,
      weather: weathers[islandData.weather],
      tiles: islandData.tiles,
      fishes: islandData.fishes,
      points: islandData.points,
      islandName: islandData.name,
      islandId: islandData.id,
      islandSize: islandData.landSize,
      moves: moves,
    };

    log(realm, source, "getIslandData", result, LOGVERB, LOGDATA);
  } else {
    log(realm, source, "getIslandData", "no island data found  ", LOGERR);
  }

  return result;
};

// To be used when the island has been persisted
// Creates a result set based on the island data in the DB

const getResetData = async (
  islandId,
  oldIslandId,
  sessionId,
  movesCounterId
) => {
  log(
    realm,
    source,
    "getResetData",
    "is=" + islandId + " sid=" + sessionId + " cid=" + movesCounterId
  );

  let result = {};
  let session = {};

  // First go to the "old island", get the session and remove the reference to it

  let oldIslandData = await getItem("island", oldIslandId);

  if (oldIslandData) {
    log(realm, source, "getResetData", "found old is=" + oldIslandData.id);

    session = oldIslandData.sessions.find(
      (aSession) => aSession.id === sessionId
    );

    oldIslandData.sessions = oldIslandData.sessions.filter(
      (aSession) => aSession.id !== sessionId
    );
  }

  // Go to the new island and construct a new moveLog

  let islandData = await getItem("island", islandId);

  if (islandData) {
    log(
      realm,
      source,
      "getResetData",
      "found is=" + islandData.id + " (# " + islandData.counter + ")"
    );

    let territory = [];
    for (let i = 0; i < islandData.sizeH; i++) {
      let line = [];
      for (let j = 0; j < islandData.sizeL; j++) {
        line.push([]);
      }
      territory.push(line);
    }

    islandData.lands.forEach((land) => {
      territory[land.hpos][land.lpos] = land;
    });

    let penguins = [];
    islandData.penguins.forEach((penguin) => penguins.push(penguin));

    result = {
      session: sessionId,
      island: getImg(territory, islandData.sizeH, islandData.sizeL),
      penguins: penguins,
      weather: weathers[islandData.weather],
      tiles: islandData.tiles,
      fishes: islandData.fishes,
      points: islandData.points,
      islandName: islandData.name,
      islandId: islandData.id,
      islandSize: islandData.landSize,
    };

    let tempSession = await getSession(
      sessionId,
      session.lastInvocation,
      session.moveCounter
    );

    let theMoves = resetPenguinsPos(tempSession, islandData);
    let moves = { moves: theMoves };
    result = { ...result, ...moves };

    session.moveLog = theMoves;

    islandData.sessions.map((aSession) =>
      aSession.id === session.id ? session : aSession
    );

    // console.dir(islandData);

    await persistIslandData(islandData);
    await persistIslandData(oldIslandData);

    log(realm, source, "getResetData", result, LOGVERB, LOGDATA);
  } else {
    log(realm, source, "getResetData", "no island data found  ", LOGERR);
  }

  return result;
};

// To be used when a new island is created for an existing session
// Creates a result set based on the the new island

const getRenewData = async (
  islandId,
  oldIslandId,
  sessionId,
  movesCounterId,
  islandH,
  islandL
) => {
  log(
    realm,
    source,
    "getRenewData",
    "is=" + islandId + " sid=" + sessionId + " cid=" + movesCounterId
  );

  let result = {};

  // First go to the "old island", get the session and remove the reference to it

  console.log("======>>> 00");

  let oldIslandData = await getItem("island", islandId);

  if (oldIslandData) {
    log(realm, source, "getResetData", "found old is=" + oldIslandData.id);

    oldIslandData.sessions = oldIslandData.sessions.filter(
      (aSession) => aSession.id !== sessionId
    );
  }

  console.log("======>>> 0");

  let session = await getSession(sessionId, 0, 0);

  // Create a new island and construct a new moveLog

  console.log("======>>> 1");

  let island = new Island(islandH, islandL, [session]);
  console.log("======>>> 2");

  if (island) {
    log(
      realm,
      source,
      "getRenewData",
      "found is=" + island.id + " (# " + island.counter + ")"
    );

    result = {
      session: sessionId,
      island: getImg(island.territory, island.sizeH, island.sizeL),
      penguins: island.penguins,
      weather: weathers[island.weather],
      tiles: island.tiles,
      fishes: island.fishes,
      points: island.points,
      islandName: island.name,
      islandId: island.id,
      islandSize: island.landSize,
    };

    let theMoves = resetPenguinsPos(session, island);
    let moves = { moves: theMoves };
    result = { ...result, ...moves };

    session = { ...session, ...moves };
    island.sessions.push(session);

    await persistIsland(island);
    await persistIslandData(oldIslandData);

    log(realm, source, "getRenewData", result, LOGVERB, LOGDATA);
  } else {
    log(realm, source, "getRenewData", "no island data found  ", LOGERR);
  }

  return result;
};

// function getMovesData
// To be used when the island has been persisted
// Creates a result set based on the island data in the DB

const getMovesData = async (
  islandId,
  sessionId,
  movesCounterId,
  penguinFollowId,
  renewMoves
) => {
  log(
    realm,
    source,
    "getMovesData",
    "is=" +
      islandId +
      " sid=" +
      sessionId +
      " cid=" +
      movesCounterId +
      " fId=" +
      penguinFollowId +
      " rw=" +
      renewMoves,
    LOGVERB
  );

  result = {};

  let islandData = await getItem("island", islandId);

  if (islandData) {
    log(
      realm,
      source,
      "getMovesData",
      "found is=" +
        islandData.id +
        " fId=" +
        islandData.penguinFollowId +
        " ss=" +
        sessionId
    );

    console.log("========_____________";)
    console.dir(islandData.sessions);
    console.log("========_____________";)

    let session = islandData.sessions.find(
      (session) => session.id === sessionId
    );

    if (session) {
      if (session.moveLog) {
        let moves = session.moveLog.filter(
          (move) => move.moveid > movesCounterId
        );

        result = {
          session: session.id,
          points: islandData.points,
          islandSize: islandData.landSize,
          moves: moves,
        };

        log(realm, source, "getMovesData", result, LOGVERB, LOGDATA);

        if (penguinFollowId && penguinFollowId > 0) {
          islandData.penguinFollowId = penguinFollowId;
          await persistIslandData(islandData);
        }
      } else {
        log(
          realm,
          source,
          "getMovesData",
          "No moveLog found found is=" + islandData.id
        );
      }
    } else {
      log(
        realm,
        source,
        "getMovesData",
        "No session found found is=" + islandData.id
      );
    }
  } else {
    log(
      realm,
      source,
      "getMovesData",
      "no island data found for " + sessionData.islandId,
      LOGERR
    );
  }

  return result;
};

// returns the list of islands

const getIslandsList = async () => {
  let islands = [];

  let fullIslands = [...(await getAsyncItems("island", "id", ">", 0))];

  if (fullIslands && fullIslands.length > 0) {
    fullIslands.forEach((island) => {
      islands.push({
        id: island.id,
        name: island.name,
        points: island.points,
        running: island.running,
      });
    });
  }

  return islands;
};

// calculate and returns the initial moves

const resetPenguinsPos = (session, island) => {
  // let session = island.sessions.find((session) => session.id === sessionId);

  // console.dir(session);

  session.moveLog = [];

  island.penguins.forEach((penguin) => {
    session.addMoveLog(
      penguin.id,
      penguin.num,
      1,
      penguin.cat,
      "move",
      0,
      0,
      0,
      penguin.hpos,
      penguin.lpos
    );
    if (penguin.loving > 0) {
      session.addMoveLog(penguin.id, penguin.num, 4, penguin.cat, "love");
    }
    if (penguin.eating > 0) {
      session.addMoveLog(penguin.id, penguin.num, 3, penguin.cat, "eat");
    }
  });

  return session.moveLog;
};

// returns an 'image' of the isalnd in the form of an array of objects
const getImg = (territory, islandH, islandL) => {
  let result = [];
  for (let i = 1; i < islandH - 1; i++) {
    for (let j = 1; j < islandL - 1; j++) {
      let land = territory[i][j];
      let artifact = 0;
      if (land) {
        if (land.hasCross) {
          if (land.type === 0) {
            artifact = 1;
          } else {
            artifact = 2;
          }
        } else if (land.hasFish) {
          artifact = 3;
        } else if (land.hasSwim) {
          artifact = 4;
        } else if (land.hasIce) {
          artifact = 5;
        }
      }
      let tile =
        territory[i][j].type +
        "-" +
        territory[i][j].conf +
        "-" +
        territory[i][j].var;
      result.push({
        li: i,
        col: j,
        ti: tile,
        art: artifact,
      });
    }
  }
  return result;
};

// returns the list of artifacts
// const getArtifacts = (territory, islandH, islandL) => {
//   let result = ``;
//   for (let i = 0; i < islandH; i++) {
//     let h = i * 48 + 16; //  + 16;
//     for (let j = 0; j < islandL; j++) {
//       let l = j * 48 + 16; // + 16 ;
//       let land = territory[i][j];
//       if (land) {
//         if (land.hasCross) {
//           if (land.type === 0) {
//             result += `<img class="cross" src="./tiles/wreath.gif" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
//           } else {
//             result += `<img class="cross" src="./tiles/cross.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
//           }
//         } else if (land.hasFish) {
//           result += `<img class="fish" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
//         } else if (land.hasSwim) {
//           let transp = 0.6; // ((Math.floor(Math.random() * 2) / 10))  + 0.3;
//           result += `<img class="swim" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute; opacity:${transp}" width="48" height="48" >\n`;
//         } else if (land.hasIce) {
//           result += `<img class="fish" src="./tiles/ice.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
//         }
//       }
//     }
//   }
//   return result + ``;
// };

// now we export the class, so other modules can create Penguin objects
module.exports = {
  getIslandData: getIslandData,
  getInitData: getInitData,
  getResetData: getResetData,
  getRenewData: getRenewData,
  getMovesData: getMovesData,
  getIslandsList: getIslandsList,
  resetPenguinsPos: resetPenguinsPos,
};
