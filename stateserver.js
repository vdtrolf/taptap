// const dbhelperReq = require("./acebasehelper.js");
const dbhelperReq = require("./dynamohelper.js");
const islandReq = require("./island.js");
const islandDataReq = require("./islandData.js");
const sessionReq = require("./session.js");

let createDb = dbhelperReq.createDb;
let getIslands = islandReq.getIslands;
let persistSessions = sessionReq.persistSessions;
let persistIsland = islandDataReq.persistIsland;
let initiateIslands = islandDataReq.initiateIslands;
let initiateSessions = sessionReq.initiateSessions;
let registerSessions = sessionReq.registerSessions;

// If it receives 'local' as argument, it runs in local mode
// which means, then there will be an incode "pulser" that will regularly call the state engine
let local = false;
const args = process.argv.slice(2);
local = args[0] && args[0].toLowerCase() === "local";

// simulateRate tells how often that must happen
let simulateRate = 1728; // 864; // 3428;

// debug variables
let debug = true;
let deepdebug = true;
let counter = 0;

// State engine = changes the state of all the running islands
const setState = () => {
  createDb(local);
  initiateSessions(getTheSessions);
};

// Call-back after sessions have been loaded
const getTheSessions = () => {
  initiateIslands(getTheIslands);
};

// Call-back after the islands have been loaded
const getTheIslands = () => {
  registerSessions();
  getIslands().forEach((island) => {
    if (island.running) {
      if (deepdebug) {
        let img = island.getAsciiImg();
        img.forEach((line) => console.log(line));
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
  persistSessions("A");
};

// For test purpose - simulates a pulsar function if the state server is running locally
if (local) {
  setInterval(() => {
    if (debug) console.log("stateserver - simulates a state change request");
    setState();
  }, simulateRate);
}

module.exports = {
  setState: setState,
};
