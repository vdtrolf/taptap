// DB stuff
// const dbhelperReq = require("./dynamohelper.js"); 
const dbhelperReq = require("./acebasehelper.js");

const readline = require('readline')
const colors = require('colors/safe')

const requestserverReq = require("./requestserver.js");
const islandDataReq = require("./islandData.js");
const islandReq = require("./island.js");

let createResponse = requestserverReq.createResponse;
let getItem = dbhelperReq.getItem;
let getAsyncItems = dbhelperReq.getAsyncItems;
let initiateIslands = islandDataReq.initiateIslands;
let getIsland = islandReq.getIsland;

var islandId = 0;


colors.enable()

const print = (msg) => {
  console.log(msg)
}

const printList = (islands) => {

  print('');
  print("+---- ISLANDS ----------------------------------------------+");
  islands.forEach(island => {
    line = "| " + island.id + " " + island.name + " " + (island.running?"(running) ":"(stopped) ") + island.points + " points " + island.penguins.length + " penguins                                                             ";
    print(line.substring(0,60) + "|");
  });
  print("+-----------------------------------------------------------+");
}

const printIsland = (island) => {

  initiateIslands(island);
  const islandObj = getIsland(island.id);

  islandObj.getAsciiImg().forEach(line=>print(line));
  print('');

}


const checkInput = (input) => {

  if (input.includes("=")) {
    const inputargs = input.toLowerCase().split("=");
    if (inputargs[0] === "id") {
      islandId = inputargs[1];
    } else if (inputargs[0] === "get") {
      getItem("island",inputargs[1])
      .then(value => printIsland(value))
    } 
  } else {
    if(input==="list") {
      getAsyncItems("island","id",">",0)
      .then(value => printList(value))
    }  if(input==="get") {
      getItem("island",islandId)
      .then(value => printIsland(value))
    } else {
      createResponse(input, "", islandId, true).then(
        (responseBody) => {
          // console.dir(responseBody);
          print(responseBody);
        }
      );
    }
  }
}

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

const createTerminal =  async () => {
  rl.on('line', (line) => {
    var input = line.replace(/\0/g, '')
    if (input.length > 0) {
      // print('\r')
      checkInput(input)
    }
    print('')
    process.stdout.write(">> " + islandId + " >>")
  })

  print('')
  process.stdout.write(">>")
}






module.exports = {
  createTerminal: createTerminal,
};
