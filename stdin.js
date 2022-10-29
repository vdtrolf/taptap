// DB stuff
const dbhelperReq = require("./dynamohelper.js"); 
// const dbhelperReq = require("./acebasehelper.js");

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
var islandList = [0];
var penguinList = [0];
var context = 0;


colors.enable()

const print = (msg) => {
  console.log(msg)
}

const printList = (islands) => {

  var cnt =0;
  islandList = [0]
  print('');
  print("+---- ISLANDS ----------------------------------------------+");
  islands.forEach(island => {
    line = "| " + ++cnt + " " + island.id + " " + island.name + " " + (island.running?"(running) ":"(stopped) ") + island.points + " points " + island.penguins.length + " penguins                                                             ";
    print(line.substring(0,60) + "|");
    islandList[cnt] = island.id
  });
  print("+-----------------------------------------------------------+");
}

const printIsland = (island) => {

  initiateIslands(island);
  const islandObj = getIsland(island.id);
  islandObj.getAsciiImg().forEach(line=>print(line));

}


const checkInput = (input) => {
  
  
  
  const number=parseInt(input.substring(0,2));


  if (number>0 && context>0) {
    islandId=islandList[number];
  } else if (input.includes("=")) {
    const inputargs = input.toLowerCase().split("=");
    if (inputargs[0] === "id") {
      islandId = (inputargs[1]<=islandList.length)?islandList[inputargs[1]]:inputargs[1]
    } else if (inputargs[0] === "get") {
      getItem("island",inputargs[1])
      .then(value => printIsland(value))
    } 
  } else {
    if(input==="l" || input==="list") {
      context=1;
      getAsyncItems("island","id",">",0)
      .then(value => printList(value))
    } else if(input==="g" || input==="get") {
      context=2;
      getItem("island",islandId)
      .then(value => printIsland(value))
    } else if(input==="r" || input==="refresh" ) {
      context=2;
      createResponse("/state", "", islandId, true).then(
        (responseBody) => {
        }
      );
      getItem("island",islandId)
      .then(value => printIsland(value))
    } else if(input==="a" && islandId > 0 ) {
      for(let cnt =0;cnt<5;cnt++) {
        setTimeout(() => {
          createResponse("/state", "", islandId, true)
          .then((responseBody) => {});
          getItem("island",islandId)
          .then(value => printIsland(value))
          process.stdout.write(">> " + islandId + " >>")
        }, 2000);
      }
          
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
      checkInput(input)
    }
    print('')
    process.stdout.write(">> " + islandId + " >>")
  })
  process.stdout.write(">>")
}






module.exports = {
  createTerminal: createTerminal,
};
