// DB stuff
const dbhelperReq = require("./dynamohelper.js"); 
// const dbhelperReq = require("./acebasehelper.js");

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;
const LOGDUMP = loggerReq.LOGDUMP;

const realm = "state";
const source = "stateserver.js";

const islandReq = require("./island.js");
const islandDataReq = require("./islandData.js");
const islandasciiReq = require("./islandascii.js");

let createDb = dbhelperReq.createDb;
let getIslands = islandReq.getIslands;
let cleanIslands = islandReq.cleanIslands;
let persistIsland = islandDataReq.persistIsland;
let initiateIslands = islandDataReq.initiateIslands;
let getAsciiImg  = islandasciiReq.getAsciiImg;

// If it receives 'local' as argument, it runs in local mode
// which means, then there will be an incode "pulser" that will regularly call the state engine
let local = false;
let cleandb = false;
let stateCounter = 0;

// simulateRate tells how often that must happen
let simulateRate = 2000; // 1500; // 864; // 3428;

// debug variables
let deepdebug = true;
let counter = 0;

// State engine = changes the state of all the running islands
const setState = async (local,iceTiles=true) => {
  // createDb(local);

  let initiate = await initiateIslands(); // (getTheIslands);

  // console.log("-------- INITIATE ---- " + initiate);

  let running = false;

  if (initiate) {
    // Call-back after the islands have been loaded
    // const getTheIslands = () => {

   let lastInvocation = Math.floor(Date.now() / 1000) % 10000;

    getIslands().forEach((island) => {
      // console.log(">>>> found " + island.id + "(" + lastInvocation + '/' + island.lastInvocation + ")" )
      if ((island.running && lastInvocation - island.lastInvocation < 20) || island.runonce) {
        running = true;

        // console.log(">>>> running " + island.id + "(" + lastInvocation + '/' + island.lastInvocation + ")" )

        if (deepdebug) {
          let img = getAsciiImg(island);
          img.forEach((line) => log(realm, source, "", line, LOGVERB, LOGDUMP));
        }

        island.calculateNeighbours();
        island.movePenguins();
        island.moveFishes();
        island.addStuff(iceTiles);
        island.makePenguinsOlder();
        island.smelt();
        island.setWeather();

        island.runonce = false;

        persistIsland(island, false);
      }
    });
    
    cleanIslands();
    
  }
  return running;
};

// For test purpose - simulates a pulsar function if the state server is running locally
const startLocalStateEngine = (local,iceTiles=false) => {
  setInterval(() => {
    log(realm, source, "", "simulates a state change request " + counter);
    counter += 1;
    setState(local,iceTiles);
  }, simulateRate);
};

module.exports = {
  setState: setState,
  startLocalStateEngine: startLocalStateEngine,
};
