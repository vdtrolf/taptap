const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
//const dbhelperReq = require("./dynamohelper.js");
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
const debug = false;
const maxAge = 300000; // 5 minutes   3600000; // one hour

const persistIsland = async (island, force = false) => {
  let sessionsList = [];
  island.sessions.forEach((session) => sessionsList.push(session.id));

  if (debug)
    console.log(
      "islandData.js - persistIsland : persisting island " +
        island.id +
        " with sessions " +
        sessionsList.length
    );

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
    },
    island.id
  );

  for (let i = 0; i < island.sizeH; i++) {
    for (let j = 0; j < island.sizeL; j++) {
      let land = island.territory[i][j];

      if (force || land.changed) {
        // console.log ("land changed at " + land.hpos + "/" + land.lpos + ": " + land.changed)

        putItem(
          "land",
          {
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
          },
          land.id
        );
        land.changed = false;
      }
    }
  }

  island.penguins.forEach((penguin) => {
    putItem(
      "penguin",
      {
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
      },
      penguin.id
    );
  });
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

        islands.push(island);
        getItems("land", loadLands, "islandId", "=", anIsland.id);
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
        getItems("land", deleteLands, "islandId", "=", anIsland.id);
        getItems("penguin", deletePenguins, "islandId", "=", anIsland.id);
        deleteItem("island", anIsland.id);
      }
    });
  } catch (error) {
    console.error("problem", error);
  }
};

const loadLands = (theLands) => {
  let island = null;

  try {
    theLands.forEach((aLand) => {
      if (!island) {
        island = islands.find((island) => island.id === aLand.islandId);
        if (island) {
          for (let i = 0; i < island.sizeH; i++) {
            let line = [];
            for (let j = 0; j < island.sizeL; j++) {
              line.push([]);
            }
            island.territory.push(line);
          }
        }
      }

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

    // Sanity check => are all land pieces present ?
    if (island) {
      for (let i = 0; i < island.sizeH; i++) {
        for (let j = 0; j < island.sizeL; j++) {
          try {
            island.territory[i][j].getType();
          } catch (error) {
            if (debug)
              console.log(
                "islandData.js - loadLands: missing land at " + i + "/" + j
              );
            island.territory[i][j] = new Land(i, j, false, island.id);
          }
        }
      }
      getItems("penguin", loadPenguins, "islandId", "=", island.id);
    }

    if (debug)
      console.log(
        "islandData.js - loadLands: found " +
          theLands.length +
          " lands for island " +
          island.id
      );
  } catch (error) {
    console.error("islandData.js - loadLands: problem", error);
  }
};

const loadPenguins = (thePenguins) => {
  let island = null;
  let penguins = [];

  try {
    thePenguins.forEach((aPenguin) => {
      if (!island)
        island = islands.find((island) => island.id === aPenguin.islandId);

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
  } catch (error) {
    console.error("problem", error);
  }

  if (debug)
    console.log(
      "islandData.js - loadPenguins: found " +
        thePenguins.length +
        " penguins for island " +
        island.id
    );

  islands.forEach((island) => addIsland(island));
  // initiateSessions();
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  persistIsland: persistIsland,
  initiateIslands: initiateIslands,
};
