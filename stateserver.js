// DB stuff
const dbhelperReq = require("./dynamohelper.js"); // require("./acebasehelper.js");

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
let setLogLevel = loggerReq.setLogLevel;
const LOGVERB = loggerReq.LOGVERB;
const LOGINFO = loggerReq.LOGINFO;
const LOGALL = loggerReq.LOGALL;
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
// let registerSessions = sessionReq.registerSessions;

// If it receives 'local' as argument, it runs in local mode
// which means, then there will be an incode "pulser" that will regularly call the state engine
let local = false;

// read the command-line arguments - is it local and which debug level ?
const args = process.argv.slice(2);
args.forEach((arg) => {
  switch (arg.toLowerCase()) {
    case "local":
      local = true;
      break;
    case "debug":
      setLogLevel("all", LOGINFO);
      break;
    case "verbose":
      setLogLevel("all", LOGVERB);
      break;
    default:
      setLogLevel(arg.toLowerCase(), LOGINFO);
      break;
  }
});

// simulateRate tells how often that must happen
let simulateRate = 1728; // 864; // 3428;

// debug variables
let deepdebug = false;
let counter = 0;

// State engine = changes the state of all the running islands
const setState = () => {
  createDb(local);
  initiateIslands(getTheIslands);
};

// Call-back after the islands have been loaded
const getTheIslands = () => {
  getIslands().forEach((island) => {
    if (island.running) {
      if (deepdebug) {
        let img = island.getAsciiImg();
        img.forEach((line) => log(realm, source, "", line, LOGALL, LOGDUMP));
      }

      island.calculateNeighbours();
      island.movePenguins();
      island.addSwims();
      island.makePenguinsOlder();
      island.smelt();
      island.setWeather();
      persistIsland(island, false, counter++);
    }
  });
};

// For test purpose - simulates a pulsar function if the state server is running locally
if (local) {
  setInterval(() => {
    log(realm, source, "", "simulates a state change request");
    setState();
  }, simulateRate);
}

module.exports = {
  setState: setState,
};
