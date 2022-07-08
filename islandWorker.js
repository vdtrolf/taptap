const dbhelperReq = require("./dynamohelper.js");

let getAsyncItem = dbhelperReq.getAsyncItem;
let getAsyncItems = dbhelperReq.getAsyncItems;
let putItem = dbhelperReq.putItem;

let debug = false;
let deepdebug = false;

const weathers = ["sun", "rain", "snow", "cold", "endgame"];

// To be used when the island has been persisted
// Creates a result set based on the island data in the DB

const getIslandData = async (
  islandId,
  sessionId,
  theMoves = null,
  tileHpos = 0,
  tileLpos = 0
) => {
  result = {};

  let islandData = await getAsyncItem("island", islandId);
  if (islandData) {
    if (debug) {
      console.log(
        "islandWorker.js - getIslandData: found island " + islandData.id
      );
    } else if (deepdebug) {
      console.log("islandWorker.js - getIslandData -- island -----------");
      console.dir(islandData);
      console.log("islandWorker.js - getIslandData -- island -----------");
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
      let changed = false;

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
          putItem("island", islandData, islandData.id);
        }
      }
    }

    let penguins = [];
    islandData.penguins.forEach((penguin) => penguins.push(penguin));

    result = {
      session: sessionId,
      island: getImg(territory, islandData.sizeH, islandData.sizeL),
      penguins: penguins,
      weather: weathers[islandData.weather],
      artifacts: getArtifacts(territory, islandData.sizeH, islandData.sizeL),
      tiles: islandData.tiles,
      fishes: islandData.fishes,
      points: islandData.points,
      islandName: islandData.name,
      islandId: islandData.id,
      islandSize: islandData.landSize,
    };

    if (theMoves) {
      let moves = { moves: theMoves };
      result = { ...result, ...moves };
    }
    //   }
  } else {
    console.log("islandWorker.js - getIslandData: no island data found  ");
  }

  return result;
};

// To be used just after the island was created - while the island object is still in memory
// Creates a result set based on the island object

const getInitData = async (island, sessionId, theMoves = null) => {
  result = {
    session: sessionId,
    island: getImg(island.territory, island.sizeH, island.sizeL),
    penguins: island.getPenguins(),
    weather: weathers[island.weather],
    artifacts: getArtifacts(island.territory, island.sizeH, island.sizeL),
    tiles: island.tiles,
    fishes: island.fishes,
    points: island.points,
    islandName: island.name,
    islandId: island.id,
    islandSize: island.landSize,
  };

  if (theMoves) {
    let moves = { moves: theMoves };
    result = { ...result, ...moves };
  }

  return result;
};

const getMovesData = async (islandId, sessionId, moves) => {
  result = {};

  let islandData = await getAsyncItem("island", islandId);
  if (islandData) {
    if (debug) {
      console.log(
        "islandWorker.js - getIslandData ------------------------------"
      );
      console.dir(islandData);
      console.log(
        "islandWorker.js - getIslandData -----------------------------"
      );
    }
    result = {
      session: sessionId,
      points: islandData.points,
      islandSize: islandData.landSize,
      moves: moves,
    };
  } else {
    console.log(
      "islandWorker.js - getMovesData: no island data found for " + islandId
    );
  }

  return result;
};

const getAsyncIslands = async () => {
  let theIslands = await getAsyncItems("island", "id", ">", 0);
  return theIslands;
};

const connectIsland = async (sessionId, islandId) => {
  let theIslands = await getAsyncItems("island", "id", ">", 0);
  if (theIslands) {
    theIslands.forEach((island) => {
      let sessions = island.sessions;
      console.dir(sesssions);

      //if (sessions.some(sessionid => sessionId == ))
      // island.sessions = sessions.map(session => sessionId !== sessionId);
    });
  }
};

const resetPenguinsPos = async (session) => {
  let islandData = await getAsyncItem("island", session.islandId);
  if (islandData && islandData.penguins) {
    islandData.penguins.forEach((penguin) => {
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
      penguin.waiting = 0;

      putItem("penguin", penguin, penguin.id);
    });

    putItem("session", session, session.id);
  }
};

const getImg = (territory, islandH, islandL) => {
  let result = [];
  for (let i = 1; i < islandH - 1; i++) {
    for (let j = 1; j < islandL - 1; j++) {
      let id = i + "-" + j;
      let tile =
        territory[i][j].type +
        "-" +
        territory[i][j].conf +
        "-" +
        territory[i][j].var;
      result.push({
        li: i,
        id: id,
        ti: tile,
      });
    }
  }
  return result;
};

// returns the list of artifacts
const getArtifacts = (territory, islandH, islandL) => {
  let result = ``;
  for (let i = 0; i < islandH; i++) {
    let h = i * 48 + 16; //  + 16;
    for (let j = 0; j < islandL; j++) {
      let l = j * 48 + 16; // + 16 ;
      let land = territory[i][j];
      if (land) {
        if (land.hasCross) {
          if (land.type === 0) {
            result += `<img class="cross" src="./tiles/wreath.gif" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
          } else {
            result += `<img class="cross" src="./tiles/cross.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
          }
        } else if (land.hasFish) {
          result += `<img class="fish" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
        } else if (land.hasSwim) {
          let transp = 0.6; // ((Math.floor(Math.random() * 2) / 10))  + 0.3;
          result += `<img class="swim" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute; opacity:${transp}" width="48" height="48" >\n`;
        } else if (land.hasIce) {
          result += `<img class="fish" src="./tiles/ice.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
        }
      }
    }
  }
  return result + ``;
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  getIslandData: getIslandData,
  getInitData: getInitData,
  getMovesData: getMovesData,
  getAsyncIslands: getAsyncIslands,
  connectIsland: connectIsland,
  resetPenguinsPos: resetPenguinsPos,
};
