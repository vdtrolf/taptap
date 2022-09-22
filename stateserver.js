// DB stuff
const dbhelperReq = require("./dynamohelper.js"); // require("./acebasehelper.js");

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;
const LOGDUMP = loggerReq.LOGDUMP;

const realm = "state";
const source = "stateserver.js";

const islandReq = require("./island.js");
const islandDataReq = require("./islandData.js");
const sessionReq = require("./session.js");

let createDb = dbhelperReq.createDb;
let getIslands = islandReq.getIslands;
let persistIsland = islandDataReq.persistIsland;
let initiateIslands = islandDataReq.initiateIslands;

// If it receives 'local' as argument, it runs in local mode
// which means, then there will be an incode "pulser" that will regularly call the state engine
let local = false;
let cleandb = false;
let stateCounter = 0;

// simulateRate tells how often that must happen
let simulateRate = 2000; // 864; // 3428;

// debug variables
let deepdebug = false;
let counter = 0;

// State engine = changes the state of all the running islands
const setState = async (local) => {
  createDb(local);

  let initiate = await initiateIslands(); // (getTheIslands);
  let running = false;

  if (initiate) {
    // Call-back after the islands have been loaded
    // const getTheIslands = () => {

    getIslands().forEach((island) => {
      if (island.running) {
        running = true;

        if (deepdebug) {
          let img = island.getAsciiImg();
          img.forEach((line) => log(realm, source, "", line, LOGVERB, LOGDUMP));
        }

        island.calculateNeighbours();
        island.movePenguins();
        island.addSwims();
        island.makePenguinsOlder();
        island.smelt();
        island.setWeather();
        persistIsland(island, false);
      }
    });
  }
  return running;
};

// For test purpose - simulates a pulsar function if the state server is running locally
const startLocalStateEngine = (local) => {
  setInterval(() => {
    log(realm, source, "", "simulates a state change request " + counter);
    counter += 1;
    setState(local);
  }, simulateRate);
};

module.exports = {
  setState: setState,
  startLocalStateEngine: startLocalStateEngine,
};
