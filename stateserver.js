var http = require("http");

const dbhelperReq = require("./acebasehelper.js");
const islandReq = require("./island.js");
const islandDataReq = require("./islandData.js");
const sessionReq = require("./session.js");

let createDb = dbhelperReq.createDb;
let getIslands = islandReq.getIslands;
let persistSessions = sessionReq.persistSessions;
let persistIsland = islandDataReq.persistIsland;
let initiateIslands = islandDataReq.initiateIslands;

// If simulate = true, then there will be an incode "pulser" that will regularly call the state engine 
// simulateRate tells how often that must happen
let simulate = true;
let simulateRate = 3428;

let debug = false;
let counter = 0;

//create a server object:
http
  .createServer(function(req, res) {
    setState();
    res.write("State updated !"); //write a response to the client
    res.end(); //end the response
  })
  .listen(3002); //the server object listens on port 3002

// State engine = changes the state of all the running islands
const setState = () => {
  
  createDb();
  initiateIslands();
  getIslands().forEach((island) => {
    
    if (debug) console.log("stateserver.js - setState: island = " + island.id);
    
    if (island.running) {
      island.calculateNeighbours();
      island.movePenguins();
      island.addSwims();
      island.makePenguinsOlder();
      island.smelt();
      island.setWeather();
      persistIsland(island, false, counter++);
    }
  });
  persistSessions();
  
}

// For test purpose - simulates a pulsar function 
if (simulate ) {

  setInterval(() => {
    if (debug) console.log("stateserver - simulates a state change request");
    setState();
  }, simulateRate);

}


