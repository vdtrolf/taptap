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

// createDb();
// initiateIslands();

//create a server object:
http
  .createServer(function(req, res) {
    setState();
    res.write("State updated !"); //write a response to the client
    res.end(); //end the response
  })
  .listen(3002); //the server object listens on port 8080


const setState = () => {
  
  console.log("setting state");
  
  createDb();
  initiateIslands();
  getIslands().forEach((island) => {
    
    console.log("island : " + island.id);
    
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

