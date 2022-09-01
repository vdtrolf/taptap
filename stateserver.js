var http = require("http");

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

// If simulate = true, then there will be an incode "pulser" that will regularly call the state engine
// simulateRate tells how often that must happen
let simulate = true;
let simulateRate = 1728; // 864; // 3428;

let debug = false;
let deepdebug = true;
let counter = 0;
let local = true;

//create a server object:
http
  .createServer(function (req, res) {
    setState();
    res.write("State updated !"); //write a response to the client
    res.end(); //end the response
  })
  .listen(3003); //the server object listens on port 3003

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

// For test purpose - simulates a pulsar function
if (simulate) {
  setInterval(() => {
    if (debug) console.log("stateserver - simulates a state change request");
    setState();
  }, simulateRate);
}
