
const dbhelperReq = require("./dynamohelper.js");

let getAsyncItem = dbhelperReq.getAsyncItem;
let getAsyncItems = dbhelperReq.getAsyncItems;

let debug = false;

const weathers = ["sun", "rain", "snow", "cold", "endgame"];

const getIslandData = async (sessionId, withMoves = false) => {

  result = {};

  let sessionData = await getAsyncItem("session",sessionId);
  if (sessionData) {

    console.log("islandWorker.js - getIslandData ---------------------------------------");
    console.dir(islandData);
    console.log("islandWorker.js - getIslandData ---------------------------------------");


    let islandData = await getAsyncItem("island",sessionData.islandId);
    if (islandData) {

      if (debug) {
        console.log("islandWorker.js - getIslandData ---------------------------------------");
        console.dir(islandData);
        console.log("islandWorker.js - getIslandData ---------------------------------------");
      }

      let theLands = await getAsyncItems("land","islandId","=",islandData.id);
      if (theLands)  {
        if (debug) console.log("islandWorker.js - getIslandData: found " + theLands.length + " islands");
        
        let thePenguins = await getAsyncItems("penguin","islandId","=",islandData.id);
        
        if (debug) console.log("islandWorker.js - getIslandData: found " + thePenguins.length + " penguins");
        
        let territory = [];
        for (let i = 0; i < islandData.sizeH; i++) {
          let line = [];
          for (let j = 0; j < islandData.sizeL; j++) {
            line.push([]);
          }
          territory.push(line);
        }

        theLands.forEach(land => {territory[land.hpos][land.lpos] = land});
        
        let penguins = [];
        thePenguins.forEach(penguin => penguins.push({Penguin:penguin})); 

        result =  {
          session: sessionId,
          island: getImg(territory,islandData.sizeH,islandData.sizeL),
          penguins: penguins,
          weather: weathers[islandData.weather],
          artifacts: getArtifacts(territory,islandData.sizeH,islandData.sizeL),
          tiles: islandData.tiles,
          fishes: islandData.fishes,
          points: islandData.points,
          islandName: islandData.name,
          islandId: islandData.id,
          islandSize: islandData.landSize
        } 

        if (withMoves) {
          let moves = {moves: sessionData.moveLog}
          result = {...result,...moves}
        }
      }
    } else {
      console.log("islandWorker.js - getIslandData: no island data found for " + islandId);
    }  
  } else {
    console.log("islandWorker.js - getIslandData: no session data found for " + sessionId);
  }  

  return result;
}

const getMovesData = async (sessionId) => {

  result = {};

  let sessionData = await getAsyncItem("session",sessionId);
  if (sessionData) {

    let islandData = await getAsyncItem("island",sessionData.islandId);
    if (islandData) {

      if (debug) {
        console.log("islandWorker.js - getIslandData ---------------------------------------");
        console.dir(islandData);
        console.log("islandWorker.js - getIslandData ---------------------------------------");
      }
      result =  {
        session: sessionId,
        points: islandData.points,
        islandSize: islandData.landSize,
        moves: sessionData.moveLog
      } 
 
    } else {
      console.log("islandWorker.js - getIslandData: no island data found for " + islandId);
    }  
  } else {
    console.log("islandWorker.js - getIslandData: no session data found for " + sessionId);
  }  

  return result;
}




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
}

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
}




// now we export the class, so other modules can create Penguin objects
module.exports = {
  getIslandData: getIslandData,
  getMovesData: getMovesData
};
