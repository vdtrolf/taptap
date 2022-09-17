// DB stuff
const dbhelperReq = require("./dynamohelper.js"); // require("./acebasehelper.js");

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;
const LOGINFO = loggerReq.LOGINFO;
const LOGERR = loggerReq.LOGERR;
const LOGDATA = loggerReq.LOGDATA;

const realm = "data";
const source = "islandData.js";

const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
const sessionReq = require("./session.js");
const islandReq = require("./island.js");

let Island = islandReq.Island;
let Penguin = penguinReq.Penguin;
let Land = landReq.Land;
let Session = sessionReq.Session;
let putItem = dbhelperReq.putItem;
let deleteItem = dbhelperReq.deleteItem;
let getItems = dbhelperReq.getItems;
let getAsyncItems = dbhelperReq.getAsyncItems;
let cleanIslands = islandReq.cleanIslands;
let addIsland = islandReq.addIsland;

const maxAge = 3600000; // one hour
let counter = 0;

const persistIsland = (island) => {
  counter++;

  log(
    realm,
    source,
    "persistIsland",
    "persisting island " + island.id + " counter: " + counter
  );

  let lands = [];

  for (let i = 0; i < island.sizeH; i++) {
    for (let j = 0; j < island.sizeL; j++) {
      let land = island.territory[i][j];

      lands.push({
        id: land.id,
        islandId: land.islandId,
        hpos: land.hpos,
        lpos: land.lpos,
        type: land.type,
        conf: land.conf,
        var: land.var,
        hasCross: land.hasCross,
        crossAge: land.crossAge,
        hasFish: land.hasFish,
        hasSwim: land.hasSwim,
        swimAge: land.swimAge,
      });
    }
  }

  let penguins = [];

  island.penguins.forEach((penguin) => {
    penguins.push({
      id: penguin.id,
      islandId: penguin.islandId,
      num: penguin.num,
      hpos: penguin.hpos,
      lpos: penguin.lpos,
      age: penguin.age,
      fat: penguin.fat,
      maxcnt: penguin.maxcnt,
      vision: penguin.vision,
      wealth: penguin.wealth,
      hungry: penguin.hungry,
      alive: penguin.alive,
      gender: penguin.gender,
      cat: penguin.cat,
      name: penguin.name,
      loving: penguin.loving,
      waiting: penguin.waiting,
      fishTime: penguin.fishTime,
      fishDirection: penguin.fishDirection,
      moving: penguin.moving,
      hasLoved: penguin.hasLoved,
      fatherId: penguin.fatherId,
      motherId: penguin.motherId,
      partnerId: penguin.partnerId,
    });
  });

  let sessions = [];

  island.sessions.forEach((session) => {
    // console.log("------------------ SAVE -----");
    // console.dir(session);
    // console.log("------------------ SAVE -----");

    sessions.push({
      id: session.id,
      lastInvocation: session.lastInvocation,
      moveCounter: session.moveCounter,
      moveLog: session.moveLog,
    });
  });

  putItem("island", {
    id: island.id,
    name: island.name,
    sizeH: island.sizeH,
    sizeL: island.sizeL,
    weather: island.weather,
    weatherCount: island.weatherCount,
    numPeng: island.numPeng,
    tiles: island.tiles,
    landSize: island.landSize,
    fishes: island.fishes,
    points: island.points,
    running: island.running,
    lastInvocation: island.lastInvocation,
    followId: island.followId ? island.followId : 0,
    sessions: sessions,
    lands: lands,
    penguins: penguins,
    counter: counter,
  });
};

const persistIslandData = async (island) => {
  counter++;

  log(
    realm,
    source,
    "persistIslandData",
    "persisting island " +
      island.id +
      " followId " +
      island.followId +
      " counter: " +
      counter
  );

  await putItem("island", {
    id: island.id,
    name: island.name,
    sizeH: island.sizeH,
    sizeL: island.sizeL,
    weather: island.weather,
    weatherCount: island.weatherCount,
    numPeng: island.numPeng,
    tiles: island.tiles,
    landSize: island.landSize,
    fishes: island.fishes,
    points: island.points,
    running: island.running,
    lastInvocation: island.lastInvocation,
    followId: island.followId ? island.followId : 0,
    sessions: island.sessions,
    lands: island.lands,
    penguins: island.penguins,
    counter: counter,
  });
};

const initiateIslands = async () => {
  let running = false;

  log(realm, source, "initiateIslands", "getting islands out of DB");
  let theIslands = await getAsyncItems("island", "id", ">", 0);

  if (theIslands && theIslands.length > 0) {
    cleanIslands();

    log(
      realm,
      source,
      "initiatieIslands",
      "found " + theIslands.length + " islands"
    );
    log(realm, source, "initiateIslands", theIslands, LOGVERB, LOGDATA);

    let currentTime = new Date().getTime();

    try {
      theIslands.forEach((anIsland) => {
        let age = currentTime - Number.parseInt(anIsland.lastInvocation);

        if (anIsland.lastInvocation > 0 && (age < maxAge || anIsland.running)) {
          running = true;

          let island = new Island(
            anIsland.sizeH,
            anIsland.sizeL,
            [],
            anIsland.id,
            anIsland.name,
            anIsland.weather,
            anIsland.weatherCount,
            anIsland.numPeng,
            anIsland.tiles,
            anIsland.landSize,
            anIsland.fishes,
            anIsland.points,
            anIsland.running,
            anIsland.lastInvocation,
            anIsland.followId
          );

          for (let i = 0; i < island.sizeH; i++) {
            let line = [];
            for (let j = 0; j < island.sizeL; j++) {
              line.push([]);
            }
            island.territory.push(line);
          }

          if (anIsland.lands) {
            anIsland.lands.forEach((aLand) => {
              let land = new Land(
                aLand.hpos,
                aLand.lpos,
                island.id,
                aLand.id,
                aLand.type,
                aLand.conf,
                aLand.var,
                aLand.hasCross,
                aLand.crossAge,
                aLand.hasFish,
                aLand.hasSwim,
                aLand.swimAge
              );
              island.territory[aLand.hpos][aLand.lpos] = land;
            });
          }

          let penguins = [];

          if (anIsland.penguins) {
            anIsland.penguins.forEach((aPenguin) => {
              let penguin = new Penguin(
                aPenguin.num,
                aPenguin.hpos,
                aPenguin.lpos,
                [],
                island.id,
                aPenguin.fatherId,
                aPenguin.motherId,
                aPenguin.id,
                aPenguin.age,
                aPenguin.fat,
                aPenguin.maxcnt,
                aPenguin.vision,
                aPenguin.wealth,
                aPenguin.hungry,
                aPenguin.alive,
                aPenguin.gender,
                aPenguin.cat,
                aPenguin.name,
                aPenguin.loving,
                aPenguin.waiting,
                aPenguin.fishTime,
                aPenguin.fishDirection,
                aPenguin.moving,
                aPenguin.hasLoved,
                aPenguin.partnerId
              );
              penguins.push(penguin);
            });
          }
          island.penguins = penguins;

          let sessions = [];

          if (anIsland.sessions) {
            anIsland.sessions.forEach((aSession) => {
              // console.log("------------------ LOAD -----");
              // console.dir(aSession);
              // console.log("------------------ LOAD -----");

              let session = new Session(
                aSession.id,
                aSession.lastInvocation,
                aSession.moveCounter,
                aSession.moveLog
              );
              sessions.push(session);
            });
          }
          island.sessions = sessions;

          addIsland(island);

          log(
            realm,
            source,
            "initiateIslands",
            "Loaded island " +
              anIsland.name +
              "-" +
              anIsland.id +
              " age " +
              age +
              " runnning " +
              anIsland.running
          );
        } else {
          log(
            realm,
            source,
            "initiateIslands",
            "Could not load island " +
              anIsland.id +
              " age " +
              age +
              " runnning " +
              anIsland.running
          );

          deleteItem("island", anIsland.id);
        }
      });
    } catch (error) {
      log(realm, source, "initiateIslands", error, LOGERR);
    }
  }

  return running;
};

// Loads the list of islands and returns them to the callback function (loadIslands)
// const initiateIslands = (callBack) => {
//   log(realm, source, "initiateIslands", "getting islands out of DB");
//   getItems("island", loadIslands, "id", ">", 0, callBack);
// };

// // Loads the data into the various objects
// const loadIslands = async (theIslands, callBack) => {
//   if (theIslands && theIslands.length > 0) {
//     cleanIslands();

//     log(
//       realm,
//       source,
//       "loadIslands",
//       "found " + theIslands.length + " islands"
//     );
//     log(realm, source, "loadIslands", theIslands, LOGVERB, LOGDATA);

//     let currentTime = new Date().getTime();

//     try {
//       theIslands.forEach((anIsland) => {
//         let age = currentTime - Number.parseInt(anIsland.lastInvocation);

//         if (anIsland.lastInvocation > 0 && (age < maxAge || anIsland.running)) {
//           let island = new Island(
//             anIsland.sizeH,
//             anIsland.sizeL,
//             [],
//             anIsland.id,
//             anIsland.name,
//             anIsland.weather,
//             anIsland.weatherCount,
//             anIsland.numPeng,
//             anIsland.tiles,
//             anIsland.landSize,
//             anIsland.fishes,
//             anIsland.points,
//             anIsland.running,
//             anIsland.lastInvocation,
//             anIsland.followId
//           );

//           for (let i = 0; i < island.sizeH; i++) {
//             let line = [];
//             for (let j = 0; j < island.sizeL; j++) {
//               line.push([]);
//             }
//             island.territory.push(line);
//           }

//           if (anIsland.lands) {
//             anIsland.lands.forEach((aLand) => {
//               let land = new Land(
//                 aLand.hpos,
//                 aLand.lpos,
//                 island.id,
//                 aLand.id,
//                 aLand.type,
//                 aLand.conf,
//                 aLand.var,
//                 aLand.hasCross,
//                 aLand.crossAge,
//                 aLand.hasFish,
//                 aLand.hasSwim,
//                 aLand.swimAge
//               );
//               island.territory[aLand.hpos][aLand.lpos] = land;
//             });
//           }

//           // anIsland.lands.forEach((aLand) => {
//           //   if (aLand.hpos === 1 && aLand.lpos === 1) {
//           //     log(realm,source,"loadIslands - land",aLand,LOGVERB,LOGDATA);
//           //   }
//           // });

//           let penguins = [];

//           if (anIsland.penguins) {
//             anIsland.penguins.forEach((aPenguin) => {
//               let penguin = new Penguin(
//                 aPenguin.num,
//                 aPenguin.hpos,
//                 aPenguin.lpos,
//                 [],
//                 island.id,
//                 aPenguin.fatherId,
//                 aPenguin.motherId,
//                 aPenguin.id,
//                 aPenguin.age,
//                 aPenguin.fat,
//                 aPenguin.maxcnt,
//                 aPenguin.vision,
//                 aPenguin.wealth,
//                 aPenguin.hungry,
//                 aPenguin.alive,
//                 aPenguin.gender,
//                 aPenguin.cat,
//                 aPenguin.name,
//                 aPenguin.loving,
//                 aPenguin.waiting,
//                 aPenguin.fishTime,
//                 aPenguin.fishDirection,
//                 aPenguin.moving,
//                 aPenguin.hasLoved,
//                 aPenguin.partnerId
//               );
//               penguins.push(penguin);
//             });
//           }
//           island.penguins = penguins;

//           let sessions = [];

//           if (anIsland.sessions) {
//             anIsland.sessions.forEach((aSession) => {
//               // console.log("------------------ LOAD -----");
//               // console.dir(aSession);
//               // console.log("------------------ LOAD -----");

//               let session = new Session(
//                 aSession.id,
//                 aSession.lastInvocation,
//                 aSession.moveCounter,
//                 aSession.moveLog
//               );
//               sessions.push(session);
//             });
//           }
//           island.sessions = sessions;

//           addIsland(island);

//           log(
//             realm,
//             source,
//             "loadIslands",
//             "Loaded island " +
//               anIsland.name +
//               "-" +
//               anIsland.id +
//               " age " +
//               age +
//               " runnning " +
//               anIsland.running
//           );
//         } else {
//           log(
//             realm,
//             source,
//             "loadIslands",
//             "Could not load island " +
//               anIsland.id +
//               " age " +
//               age +
//               " runnning " +
//               anIsland.running
//           );

//           deleteItem("island", anIsland.id);
//         }
//       });

//       callBack();
//     } catch (error) {
//       log(realm, source, "loadIslands", error, LOGERR);
//     }
//   }
// };

// now we export the class, so other modules can create Penguin objects
module.exports = {
  persistIsland: persistIsland,
  persistIslandData: persistIslandData,
  initiateIslands: initiateIslands,
};
