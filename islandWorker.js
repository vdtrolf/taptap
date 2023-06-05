
// DB stuff
const dbhelperReq = require("./dynamohelper.js"); 
// const dbhelperReq = require("./acebasehelper.js");

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
let getIslands = islandReq.getIslands;
let initiateDb = dbhelperReq.initiateDb;
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
    fishes: island.getFishes(),
    garbages: island.getGarbages(),
    weather: weathers[island.weather],
    temperature: island.temperature,
    plasticControl: island.plasticControl,
    oceanTemperature: island.oceanTemperature,
    year: island.year,
    tiles: island.tiles,
    food: island.food,
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

  // const islands = getIslands() ;

  // if (islands.length === 0) {


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

    for (let h = 0; h < islandData.sizeH; h++) {
      let line = [];
      for (let l = 0; l < islandData.sizeL; l++) {
        line.push({});
      }
      territory.push(line);
    }

    islandData.lands.forEach((land) => {territory[land.hpos][land.lpos]=land});

    if (
      (tileHpos > 0 || tileLpos > 0 ) &&  
      tileHpos < islandData.sizeH  &&
      tileLpos < islandData.sizeL 
    ) {
     
      let land = islandData.lands.find((aLand) => aLand.hpos === tileHpos && aLand.lpos === tileLpos);
 
      // console.dir(land); 

      if (land) {
        if (land.nature === 0 && islandData.tiles > 0 && ! land.hasFish
          // && (territory[tileHpos -1 ][tileLpos] > 0 || 
          //     territory[tileHpos +1 ][tileLpos] > 0 ||
          //      territory[tileHpos][tileLpos -1] > 0|| 
          //      territory[tileHpos][tileLpos + 1] > 0)
          ) {
          land.nature = 0;
          land.smeltLevel= 0;
          land.hasFill = true;          // land.changed = true;
          islandData.tiles -= islandData.tiles > 0 ? 1 : 0;
          changed = true;
        } else if (land.nature > 0) {
          if (land.hasIce) {
            land.hasIce =false;
            changed = true;
          } else if (islandData.food > 0) {
            land.hasFood = true;
            islandData.food -= islandData.food > 0 ? 1 : 0;
            changed = true;
          }
        }
      }
    }

    if (penguinFollowId && penguinFollowId > 0) {
      islandData.followId = penguinFollowId;
      changed=true;
    }

    // if (changed) {
      await persistIslandData(islandData);
    // }

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

    let penguins = [];
    islandData.penguins.forEach((penguin) => penguins.push(penguin));

    result = {
      island: getImg(territory, islandData.sizeH, islandData.sizeL),
      penguins: penguins,
      fishes: islandData.fishes,
      garbages: islandData.garbages,
      weather: weathers[islandData.weather],
      temperature: islandData.temperature,
      plasticControl: islandData.plasticControl,
      oceanTemperature: islandData.oceanTemperature,
      year: islandData.year,
      tiles: islandData.tiles,
      food: islandData.food,
      points: islandData.points,
      islandName: islandData.name,
      islandId: islandData.id,
      islandSize: islandData.landSize,
      counter: islandData.counter,
      running: islandData.running,
      runonce: islandData.runonce,
      islands: islands
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
      fishes: islandData.fishes,
      garbages: islandData.garbages,
      counter: islandData.counter,
      temperature: islandData.temperature,
      oceanTemperature: islandData.oceanTemperature,
      plasticControl: islandData.plasticControl,
      year: islandData.year,
    };

    log(realm, source, "getMovesData", result, LOGVERB, LOGDATA);

    if (penguinFollowId && penguinFollowId > 0) {
      islandData.followId = penguinFollowId;
    }
      
    await persistIslandData(islandData);

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

// delete an island

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

const initiateData = async () => {
  
  await initiateDb();
  return true;
};



// returns an 'image' of the isalnd in the form of an array of objects
const getImg = (territory, islandH, islandL) => {
  let result = [];
  for (let i = 0; i < islandH; i++) {
    for (let j = 0; j < islandL; j++) {
      let land = territory[i][j];
      let artifact = 0;
      let age = 0;
      if (land) {
        if (land.hasCross) {
          if (land.nature === 0) {
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
          age = land.iceAge;
        } else if (land.hasFill) {
          artifact = 7;
          age = land.fillAge;
        }
      }
      let tile =
         territory[i][j].nature +
         "-" +
         territory[i][j].smeltLevel+
         "-" +
         territory[i][j].tileAngle;

      result.push({
        li: i,
        col: j,
        ti: tile,
        nat: land.nature,
        age: age,
        sml: land.smeltLevel,
        ta: land.tileAngle,
        art: artifact,
      });

    }
  }
  return result;
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  getIslandData: getIslandData,
  getInitData: getInitData,
  getMovesData: getMovesData,
  getIslandsList: getIslandsList,
  deleteIsland: deleteIsland,
  setRunningState: setRunningState,
  runonce: runonce,
  initiateData: initiateData, 
};