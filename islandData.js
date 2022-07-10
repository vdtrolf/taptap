const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
// const dbhelperReq = require("./dynamohelper.js");
const dbhelperReq = require("./acebasehelper.js");
const sessionReq = require("./session.js");
const islandReq = require("./island.js");
const session = require("./session.js");

let Island = islandReq.Island;
let Penguin = penguinReq.Penguin;
let Land = landReq.Land;
let putItem = dbhelperReq.putItem;
let putAsyncItem = dbhelperReq.putAsyncItem;
let deleteItem = dbhelperReq.deleteItem;
let getItems = dbhelperReq.getItems;
let initiateSessions = sessionReq.initiateSessions;
let addIsland = islandReq.addIsland;

const islands = [];
const debug = true;
const maxAge = 3600000; // one hour
let counter = 0;

const persistIsland = async (island, force = false) => {
  
  counter++;
  
  if (debug) console.log( "islandData.js - persistIsland : persisting island " + island.id + " counter: " + counter);

  sessionsList = [];
  island.sessions.forEach((session) => sessionsList.push(session.id));

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

  await putItem(
    "island",
    {
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
      followId: island.followId,
      sessions: sessionsList,
      lands: lands,
      penguins: penguins,
      counter: counter
    },
    island.id
  );
};

const persistIslandData = async (island) => {
  
  counter++;
  
  if (debug) console.log( "islandData.js - persistIslandData : persisting island " + island.id + " counter: " + counter);
 
  await putItem(
    "island",
    {
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
      followId: island.followId,
      sessions: island.sessions,
      lands: island.lands,
      penguins: island.penguins,
      counter: counter
    },
    island.id
  );
};


const initiateIslands = () => {
  if (debug)
    console.log("islandData.js - initiateIslands: getting islands out of DB");
  getItems("island", loadIslands);
};

const loadIslands = (theIslands) => {
  if (debug)
    console.log(
      "islandData.js - loadIslands: found " + theIslands.length + " islands"
    );

  let currentTime = new Date().getTime();

  try {
    theIslands.forEach((anIsland) => {
      let age = currentTime - Number.parseInt(anIsland.lastInvocation);

      if (anIsland.lastInvocation > 0 && (age < maxAge || anIsland.running)) {
        let island = new Island(
          anIsland.sizeH,
          anIsland.sizeL,
          null, // anIsland.session ? anIsland.session : null,
          false,
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

        anIsland.lands.forEach((aLand) => {
          let land = new Land(
            aLand.hpos,
            aLand.lpos,
            false,
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

        let penguins = [];

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

        island.penguins = penguins;

        islands.push(island);

        if (debug) {
          console.log(
            "islandData.js - loadIslands: Loaded island " +
              anIsland.name +
              "-" +
              anIsland.id +
              " age " +
              age +
              " runnning " +
              anIsland.running
          );
        }
      } else {
        if (debug) {
          console.log(
            "islandData.js - loadIslands: Could not load island " +
              anIsland.id +
              " age " +
              age +
              " runnning " +
              anIsland.running
          );
        }
        deleteItem("island", anIsland.id);
      }
    });
  } catch (error) {
    console.error("problem", error);
  }
};

const loadLands = (theLands) => {
  // Sanity check => are all land pieces present ?
  // for (let i = 0; i < island.sizeH; i++) {
  //   for (let j = 0; j < island.sizeL; j++) {
  //     try {
  //       island.territory[i][j].getType();
  //     } catch (error) {
  //       if (debug)
  //         console.log(
  //           "islandData.js - loadLands: missing land at " + i + "/" + j
  //         );
  //       island.territory[i][j] = new Land(i, j, false, island.id);
  //     }
  //   }
  // }
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  persistIsland: persistIsland,
  persistIslandData: persistIslandData,
  initiateIslands: initiateIslands,
};
