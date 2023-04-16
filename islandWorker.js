// DB stuff
// const dbhelperReq = require("./dynamohelper.js"); 
const dbhelperReq = require("./acebasehelper.js");

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;
const LOGERR = loggerReq.LOGERR;
const LOGDATA = loggerReq.LOGDATA;

const realm = "worker";
const source = "islandWorker.js";

const islandDataReq = require("./islandData.js");
const islandReq = require("./island.js");

let Island = islandReq.Island;
let getItem = dbhelperReq.getItem;
let deleteItem = dbhelperReq.deleteItem;
let getAsyncItems = dbhelperReq.getAsyncItems;
let persistIslandData = islandDataReq.persistIslandData;

const weathers = ["sun", "rain", "snow", "cold", "endgame"];

// To be used just after the island was created - while the island object is still in memory
// Creates a result set based on the island object

const getInitData = async (island) => {
  log(realm, source, "getinitData", "is=" + island.id, LOGVERB);

  let result = {
    island: getImg(island.territory, island.sizeH, island.sizeL),
    penguins: island.getPenguins(),
    weather: weathers[island.weather],
    tiles: island.tiles,
    foodes: island.foodes,
    points: island.points,
    islandName: island.name,
    islandId: island.id,
    islandSize: island.landSize,
  };

  log(realm, source, "getInitData", result, LOGVERB, LOGDATA);

  return result;
};


// To switch the running state from the island on/off

const setRunningState = async (islandId, runningState) => {

  let islandData = await getItem("island", islandId);

 // console.log(">>>>> set Running state for " + islandId + " to " + runningState + " was " + islandData.running)

  islandData.running =  runningState;
  await persistIslandData(islandData);

  return true;
}

// To run the island state once

const runonce = async (islandId) => {
  let islandData = await getItem("island", islandId);

  // console.log(">>>>> runOnce " + islandId + " was " + islandData.runonce);

  if (! islandData.runonce) {
    islandData.runonce = true;
    await persistIslandData(islandData);
  }

  return true;
}

// To be used when the island has been persisted
// Creates a result set based on the island data in the DB

const getIslandData = async (
  islandId,
  penguinFollowId,
  tileHpos = 0,
  tileLpos = 0
) => {
  log(
    realm,
    source,
    "getIslandData",
    "is=" +
      islandId +
      " fId=" +
      penguinFollowId +
      " ti=" +
      tileHpos +
      "/" +
      tileLpos
  );

  let result = {};
  let changed = false;

  let islandData = await getItem("island", islandId);

  if (islandData && islandData.lands) {
    log(
      realm,
      source,
      "getIslandData",
      "found is=" + islandData.id + " fId=" + penguinFollowId
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

    if (
      tileHpos > 0 &&
      tileLpos > 0 &&
      tileHpos < islandData.sizeH - 1 &&
      tileLpos < islandData.sizeL - 1
    ) {
      let land = territory[tileHpos][tileLpos];

      if (land) {
        if (land.type === 0 && islandData.tiles > 0) {
          if (land.hasFish) {
            land.hasFish = false;
            land.hasFood = true;
          }
          land.type = 1;
          land.conf = 0;
          land.changed = true;
          islandData.tiles -= islandData.tiles > 0 ? 1 : 0;
          changed = true;
        } else if (land.type > 0) {
          if (land.hasIce) {
            land.hasIce =false;
            land.changed = true;
            changed = true;
          } else if (islandData.foodes > 0) {
            land.hasFood = true;
            land.changed = true;
            islandData.foodes -= islandData.foodes > 0 ? 1 : 0;
            changed = true;
          }
        }

        if (changed) {
          let lands = [];
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
      islandData.followId = penguinFollowId;
      changed=true;
    }

    if (changed) {
      await persistIslandData(islandData);
    }

    let penguins = [];
    islandData.penguins.forEach((penguin) => penguins.push(penguin));

    result = {
      island: getImg(territory, islandData.sizeH, islandData.sizeL),
      penguins: penguins,
      weather: weathers[islandData.weather],
      tiles: islandData.tiles,
      foodes: islandData.foodes,
      points: islandData.points,
      islandName: islandData.name,
      islandId: islandData.id,
      islandSize: islandData.landSize,
      counter: islandData.counter,
      running: islandData.running,
      runonce: islandData.runonce
    };

    log(realm, source, "getIslandData", result, LOGVERB, LOGDATA);
  } else {
    log(realm, source, "getIslandData", "no island data found  ", LOGERR);
  }

  return result;
};

// function getMovesData
// To be used when the island has been persisted
// Creates a result set based on the island data in the DB

const getMovesData = async (islandId, penguinFollowId) => {
  log(
    realm,
    source,
    "getMovesData",
    "is=" + islandId + " fId=" + penguinFollowId,
    LOGVERB
  );

  result = {};

  let islandData = await getItem("island", islandId);

  if (islandData) {
    log(
      realm,
      source,
      "getMovesData",
      "found is=" + islandData.id + " fId=" + islandData.penguinFollowId
    );

    result = {
      points: islandData.points,
      islandSize: islandData.landSize,
      penguins: islandData.penguins,
      counter: islandData.counter,
    };

    log(realm, source, "getMovesData", result, LOGVERB, LOGDATA);

    if (penguinFollowId && penguinFollowId > 0) {
      islandData.followId = penguinFollowId;
      await persistIslandData(islandData);
      
    }
  } else {
    log(
      realm,
      source,
      "getMovesData",
      "no island data found for " + islandId,
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

// returns the list of islands

const deleteIsland = async (islandId) => {
  let islands = [];

  deleteItem("island", islandId);
  let fullIslands = [...(await getAsyncItems("island", "id", ">", 0))];

  if (fullIslands && fullIslands.length > 0) {
    fullIslands.forEach((island) => {
      if( island.id !== islandId ) {
        islands.push({
          id: island.id,
          name: island.name,
          points: island.points,
          running: island.running,
        });
      }  
    });
  }

  return islands;
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
        } else if (land.hasFood) {
          artifact = 3;
        } else if (land.hasFish) {
          artifact = land.fishAge > 0?6:4;  
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
      // result.push({
      //   li: i,
      //   col: j,
      //   ti: tile,
      //   art: artifact,
      // });

      result.push({
        li: i,
        col: j,
        ti: tile,
        type: territory[i][j].type,
        age: territory[i][j].iceAge,
        num: territory[i][j].conf,
        var: territory[i][j].var,
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
//         } else if (land.hasFood) {
//           result += `<img class="fish" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
//         } else if (land.hasFish) {
//           let transp = 0.6; // ((Math.floor(Math.random() * 2) / 10))  + 0.3;
//           result += `<img class="fish" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute; opacity:${transp}" width="48" height="48" >\n`;
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
  getMovesData: getMovesData,
  getIslandsList: getIslandsList,
  deleteIsland: deleteIsland,
  setRunningState: setRunningState,
  runonce: runonce
};