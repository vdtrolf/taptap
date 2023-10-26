// DB stuff
// const dbhelperReq = require("./dynamohelper.js"); 
const dbhelperReq = require("./acebasehelper.js");

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
const islandReq = require("./island.js");
const fishReq = require("./fish.js");
const garbageReq = require("./garbage.js");

let Island = islandReq.Island;
let Penguin = penguinReq.Penguin;
let Land = landReq.Land;
let Fish = fishReq.Fish;
let Garbage = garbageReq.Garbage;

let putItem = dbhelperReq.putItem;
let deleteItem = dbhelperReq.deleteItem;
let getAsyncItems = dbhelperReq.getAsyncItems;
let addIsland = islandReq.addIsland;
let getIslands = islandReq.getIslands;

const maxAge = 3600000; // one hour

const persistIsland = async (island) => {
  island.counter += 1;

  log(
    realm,
    source,
    "persistIsland",
    "persisting island " + island.id + " counter: " + island.counter
  );

  let lands = [];

  for (let i = 0; i < island.sizeH; i++) {
    for (let j = 0; j < island.sizeL; j++) {
      let land = island.territory[i][j];

      const aLand={id: land.id,
        islandId: land.islandId,
        hpos: land.hpos,
        lpos: land.lpos,
        nature: land.nature,
        smeltLevel: land.smeltLevel,
        tileAngle: land.tileAngle,
        hasCross: land.hasCross,
        crossAge: land.crossAge,
        hasFood: land.hasFood,
        hasFish: land.hasFish,
        fishAge: land.fishAge,
        hasGarbage: land.hasGarbage,
        hasIce: land.hasIce,
        iceAge: land.iceAge,
        hasFill: land.hasFill,
        fillAge: land.fillAge
      };
      
      lands.push(aLand);
    }
  }

  // lands.forEach((land) => { console.log("---" + land.hpos + "/" + land.lpos + ":" + land.hasFill) });

  
  let penguins = [];
  
  island.penguins.forEach((penguin) => {
    
    const aPenguin = {
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
      eating: penguin.eating,
      moving: penguin.moving,
      diging: penguin.diging,
      digTime: penguin.digTime,
      digDirection: penguin.digDirection,
      filling: penguin.filling,
      fillTime: penguin.fillTime,
      fillDirection: penguin.fillDirection,
      hasLoved: penguin.hasLoved,
      fatherId: penguin.fatherId,
      motherId: penguin.motherId,
      partnerId: penguin.partnerId,
      moveDirection: penguin.moveDirection,
      strategyShort: penguin.strategyShort,
      strategyWord: penguin.strategyWord,
      building: penguin.building,
      buildingDirection: penguin.buildingDirection,
      targetHPos: penguin.targetHPos,
      targetLPos: penguin.targetLPos,
      targetAction: penguin.targetAction,
      knownWorld: penguin.knownWorld,
      targetDirections: penguin.targetDirections,
      path: penguin.path
    };
    penguins.push(aPenguin);
  });
  
  let fishes = [];
  
  island.fishes.forEach((fish) => {
    
    const aFish = {
      id: fish.id,
      islandId: fish.islandId,
      num: fish.num,
      hpos: fish.hpos,
      lpos: fish.lpos,
      specie: fish.specie,
      moving: fish.moving,
      staying: fish.staying,
      onHook: fish.onHook,
      hookAge: fish.hookAge,
      fishDirection: fish.fishDirection
    };
    fishes.push(aFish);
  });

  let garbages = [];
  
  island.garbages.forEach((garbage) => {
    
    const aGarbage = {
      id: garbage.id,
      islandId: garbage.islandId,
      num: garbage.num,
      hpos: garbage.hpos,
      lpos: garbage.lpos,
      kind: garbage.kind
    };
    garbages.push(aGarbage);
  });

  putItem("island", {
    id: island.id,
    name: island.name,
    sizeH: island.sizeH,
    sizeL: island.sizeL,
    year: island.year,
    weather: island.weather,
    weatherCount: island.weatherCount,
    temperature: island.temperature,
    plasticControl: island.plasticControl,
    oceanTemperature: island.oceanTemperature,
    numPeng: island.numPeng,
    tiles: island.tiles,
    landSize: island.landSize,
    food: island.food,
    points: island.points,
    running: island.running,
    runonce: island.runonce,
    lastInvocation: island.lastInvocation,
    followId: island.followId ? island.followId : 0,
    lands: lands,
    penguins: penguins,
    fishes: fishes,
    garbages: garbages,
    counter: island.counter,
  }, island.id);
  
};

const persistIslandData = async (island) => {
  island.counter += 1;

  log(
    realm,
    source,
    "persistIslandData",
    "persisting island " +
      island.id +
      " followId " +
      island.followId +
      " counter: " +
      island.counter
  );
  let lastInvocation = Math.floor(Date.now() / 1000) % 10000;
  
  await putItem("island", {
    id: island.id,
    name: island.name,
    sizeH: island.sizeH,
    sizeL: island.sizeL,
    year: island.year,
    weather: island.weather,
    weatherCount: island.weatherCount,
    temperature: island.temperature,
    plasticControl: island.plasticControl,
    oceanTemperature: island.oceanTemperature,
    numPeng: island.numPeng,
    tiles: island.tiles,
    landSize: island.landSize,
    food: island.food,
    points: island.points,
    running: island.running,
    runonce: island.runonce,
    lastInvocation: lastInvocation,
    followId: island.followId ? island.followId : 0,
    lands: island.lands,
    penguins: island.penguins,
    fishes: island.fishes,
    garbages: island.garbages,
    counter: island.counter,
  },island.id);
};

const initiateIslands = async (islandParam=null) => {
  
  let running = false; //  getIslands().length > 0 ;

  // if (! running) {
    // console.log("---------- GETTING ISLANDS --------------")
    log(realm, source, "initiateIslands", "getting islands out of DB");

    let theIslands = islandParam?[islandParam]:await getAsyncItems("island", "id", ">", 0);

    if (theIslands && theIslands.length > 0) {
      running = true;
      
      // cleanIslands();

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
              anIsland.id,
              anIsland.name,
              anIsland.year,
              anIsland.weather,
              anIsland.weatherCount,
              anIsland.temperature,
              anIsland.plasticControl,
              anIsland.oceanTemperature,
              anIsland.numPeng,
              anIsland.tiles,
              anIsland.landSize,
              anIsland.food,
              anIsland.points,
              anIsland.running,
              anIsland.runonce,
              anIsland.lastInvocation,
              anIsland.followId,
              anIsland.counter
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
                  aLand.nature,
                  aLand.smeltLevel,
                  aLand.tileAngle,
                  aLand.hasCross,
                  aLand.crossAge,
                  aLand.hasFood,
                  aLand.hasFish,
                  aLand.fishAge,
                  aLand.hasGarbage,
                  aLand.hasIce,
                  aLand.iceAge,
                  aLand.hasFill,
                  aLand.fillAge
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
                  aPenguin.eating,
                  aPenguin.moving,
                  aPenguin.diging,
                  aPenguin.digTime,
                  aPenguin.digDirection,
                  aPenguin.filling,
                  aPenguin.fillTime,
                  aPenguin.fillDirection,
                  aPenguin.hasLoved,
                  aPenguin.partnerId,
                  aPenguin.moveDirection,
                  aPenguin.strategyShort,
                  aPenguin.strategyWord,
                  aPenguin.building,
                  aPenguin.buildingDirection,
                  aPenguin.targetHPos,
                  aPenguin.targetLPos,
                  aPenguin.targetAction,
                  aPenguin.knownWorld,
                  aPenguin.targetDirections,
                  aPenguin.path
                );
                penguins.push(penguin);
                
              });
            }
            island.penguins = penguins;

            let fishes = [];

            if (anIsland.fishes) {
              anIsland.fishes.forEach((aFish) => {
                let fish = new Fish(
                  aFish.num,
                  aFish.hpos,
                  aFish.lpos,
                  island.id,
                  aFish.id,
                  aFish.specie,
                  aFish.moving,
                  aFish.staying,
                  aFish.onHook, 
                  aFish.hookAge,
                  aFish.fishDirection
                );
                fishes.push(fish);
                  
              });
            }
            island.fishes = fishes;

            let garbages = [];

            if (anIsland.garbages) {
              anIsland.garbages.forEach((aGarbage) => {
                let garbage = new Garbage(
                  aGarbage.num,
                  aGarbage.hpos,
                  aGarbage.lpos,
                  island.id,
                  aGarbage.id,
                  aGarbage.kind,
                );
                garbages.push(garbage);
                  
              });
            }
            island.garbages = garbages;



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

  // }

  return running;
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  persistIsland: persistIsland,
  persistIslandData: persistIslandData,
  initiateIslands: initiateIslands,
};