const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
// const dbhelperReq = require("./dynamohelper.js");
const dbhelperReq = require("./acebasehelper.js");
const sessionReq = require("./session.js");
const islandReq = require("./island.js");

let Island = islandReq.Island;
let Penguin = penguinReq.Penguin;
let Land = landReq.Land;
let putItem = dbhelperReq.putItem;
let deleteItem = dbhelperReq.deleteItem;
let getItems = dbhelperReq.getItems;
let initiateSessions = sessionReq.initiateSessions;
let setIslands = islandReq.setIslands;

const islands = [];
const debug = false;

const persistIsland = (island) => {
  putItem(
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
      lastInvocatIon: island.lastInvocation,
      followId: island.followId,
    },
    island.id
  );

  for (let i = 0; i < island.sizeH; i++) {
    for (let j = 0; j < island.sizeL; j++) {
      let land = island.territory[i][j];
      putItem(
        "lands",
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
    }
  }

  island.penguins.forEach((penguin) => {
    putItem(
      "penguins",
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
      if (currentTime - anIsland.lastInvocation > 300000 || anIsland.running) {
        let island = new Island(
          anIsland.sizeH,
          anIsland.sizeL,
          anIsland.session ? anIsland.session : null,
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
          anIsland.lastInvocation ? anIsland.lastInvocation : 0,
          anIsland.followId
        );

        islands.push(island);

        getItems("lands", loadLands, "islandId", "==", anIsland.id);
      }
    });
  } catch (error) {
    console.error("problem", error);
  }

  initiateSessions();
};

const loadLands = (theLands) => {
  if (debug)
    console.log(
      "islandData.js - loadLands: found " + theLands.length + " lands"
    );

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

    getItems("penguins", loadPenguins, "islandId", "==", island.id);
  } catch (error) {
    console.error("islandData.js - loadLands: problem", error);
  }
};

const loadPenguins = (thePenguins) => {
  if (debug)
    console.log(
      "islandData.js - loadPenguins: found " + thePenguins.length + " penguins"
    );

  // console.dir(thePenguins);

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

  setIslands(islands);
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  persistIsland: persistIsland,
  initiateIslands: initiateIslands,
};
