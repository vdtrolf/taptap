// DB stuff
const dbhelperReq = require("./dynamohelper.js"); 
// const dbhelperReq = require("./acebasehelper.js");

const readline = require('readline')
const colors = require('colors/safe')

const islandH = 12;
const islandL = 12; 

const requestserverReq = require("./requestserver.js");
const islandDataReq = require("./islandData.js");
const islandWorkerReq = require("./islandWorker.js");
const islandReq = require("./island.js");

let createResponse = requestserverReq.createResponse;
let getItem = dbhelperReq.getItem;
let getAsyncItems = dbhelperReq.getAsyncItems;
let initiateIslands = islandDataReq.initiateIslands;
let getIsland = islandReq.getIsland;
let Island = islandReq.Island;
let persistIsland = islandDataReq.persistIsland;
let getInitData = islandWorkerReq.getInitData;
let deleteIsland = islandWorkerReq.deleteIsland;
let getIslandData = islandWorkerReq.getIslandData;
let initiateData = islandWorkerReq.initiateData;

var islandId = 0;
var penguinId = 0;
var islandList = [0];
var penguinList = [0];
var fishList = [0];
var knowWorldLines= [];
var context = 0;

colors.enable()

const print = (msg) => {
  console.log(msg)
}

const printList = async (islands) => {

  var cnt =0;
  islandList = [0]
  print('');
  print("+---- ISLANDS ----------------------------------------------+");
  islands.forEach(island => {
    line = "| " + ++cnt + " " + island.id + " " + island.name + " " + (island.running?island.counter:"end") + " "+ island.points + " pts " + island.penguins.length + " penguins follow: " + island.followId + "                                                            ";
    print(line.substring(0,60) + "|");
    islandList[cnt] = island.id
  });
  print("+-----------------------------------------------------------+");
}

const printIsland = (island) => {
  var cnt =0;
  penguinList = [0]
  knowWorldLines= [];

  initiateIslands(island);
  const islandObj = getIsland(island.id);  
  islandObj.getPenguins().forEach(penguin => {
    penguinList[++cnt] = penguin.id
    // if (penguin.id === penguinId) makeKnowWorld(penguin.knownWorld)
  })
  islandObj.getAsciiImg().forEach(line=>print(line));
  //for (let i=0; i<knowWorldLines.length; i++) {
  //  print(knowWorldLines[i])
  //}
}

const printPenguins = (island) => {
  var cnt =0;
  penguinList  = [0]
  
  initiateIslands(island);
  const islandObj = getIsland(island.id);
  
  print('');
  print("+---- PENGUINS ---------------------------------------------+");  
  islandObj.getPenguins().forEach(penguin => { 
    if (penguin.alive) {
      var fatburn = Math.floor(penguin.fat / 3) + 1
      var tag=" ";
      if (islandObj.followId === penguin.id) tag=">";
      line = "| " + tag + ++cnt + " " + penguin.id + " " + penguin.name + "  burning " + fatburn + "                                                           ";
      print(line.substring(0,60) + "|");
      penguinList[cnt] = penguin.id;
    }
  });
  print("+-----------------------------------------------------------+");
  
}

const printFishes = (island) => {
  var cnt =0;
  penguinList  = [0]
  
  initiateIslands(island);
  const islandObj = getIsland(island.id);
  
  print('');
  print("+---- FISHES -----------------------------------------------+");  
  islandObj.getFishes().forEach(fish => { 
    line = "| " + ++cnt + " " + fish.id + " " + fish.hpos + "/" + fish.lpos + " onHook: " + fish.onHook + "(" + fish.hookAge + ")                                                                        ";   
    print(line.substring(0,60) + "|");
    fishList[cnt] = fish.id;
  });
  print("+-----------------------------------------------------------+");
  
}

// Converts A,B,C to 9.10.11


const convertPos = (val) => {
  switch (val.toUpperCase()) {
    case "A" :
      return 9;
    case "B" :
      return 10;
    case "A" :
      return 11;
  }
  return val -1; 
}



const createIsland = async () => {
  let island = new Island(islandH, islandL);
  persistIsland(island, true);
  await getInitData(island);
  getAsyncItems("island","id",">",0)
      .then(value => printList(value));
}

const islandDetails = (island) => {
  for (const [key, value] of Object.entries(island)) {
    if (key==="fishes" || key==="lands" || key==="penguins") {
      console.log(`${key}: ${value.length}`);
    } else {
      console.log(`${key}: ${value}`);
    }
  }
}

const makeKnowWorld = (knownWorld) => {
  result = [];
  const world = [];
  knownWorld.forEach(cell => knowWorldLines.push("li:" + cell.line + " co:" + cell.col + " soil:" + cell.soil + " art:" + cell.art + " warm" + cell.warm))  
  
}

const printHelp = () => {
  print('');
  print("+---- HELP -------------------------------------------------+");
  print("| l-ist p-enguin g-et r-efresh c-reate m-ore d-elete q-uit  |")
  print("+-----------------------------------------------------------+");
}

const checkInput = (input) => {
  
  const number=parseInt(input.substring(0,2));


  if (input.length === 1 && number>0 && context==1) {
    islandId=islandList[number];
    penguinId=0;
    context =0;
  }  else if (input.length === 1 && number>0 && context==2) {
    penguinId=penguinList[number];
    const params = {followId:penguinId}
    createResponse("/moves",params, islandId, true).then(responseBody => {});
    context = 0;
  } else if (input.length === 2) {
   
     console.log("%%%% " + islandId + "..." + convertPos(input[0]) + "/" + convertPos(input[1])) 
   
    if (islandId > 0) {
      console.log("%%%% 2") 
      getIslandData(islandId, 0, convertPos(input[0]), convertPos(input[1]))
      .then((island) => persistIsland(island, true))
      .then(getItem("island",islandId)
        .then(value => printIsland(value)))
      
    }
      
  } else if (input.includes("=")) {
    const inputargs = input.toLowerCase().split("=");
    if (inputargs[0] === "id") {
      islandId = (inputargs[1]<=islandList.length)?islandList[inputargs[1]]:inputargs[1]
    } else if (inputargs[0] === "get") {
      getItem("island",inputargs[1])
      .then(value => printIsland(value))
    } 
  } else {
    if (input==="h" || input==="help") {
      printHelp();
    } else if (input==="c" || input==="create") {
      createIsland();
      context=1;
    } else if (input==="i" || input==="initiate") {
      initiateData();
      console.log("state: done");
    } else if (input==="m" || input==="more") {
      if(islandId) { 
        getItem("island",islandId).then(value => islandDetails(value));
        context=1;  
      }
    } else if (input==="d" || input==="delete") {
      if(islandId) { 
        deleteIsland(islandId)
        .then(getAsyncItems("island","id",">",0).then(value => printList(value)))
        context= 2;
        penguinId = 0;
      } 
    } else if(input==="f" || input==="fish") {
      context=3;
      getItem("island",islandId)
      .then(value => printFishes(value))
    } else if(input==="l" || input==="list") {
      context=1;
      getAsyncItems("island","id",">",0)
      .then(value => printList(value))
    } else if(input==="p" || input==="penguin") {
      context=2;
      getItem("island",islandId)
      .then(value => printPenguins(value))
    } else if(input==="g" || input==="get") {
      context=2;
      getItem("island",islandId)
      .then(value => printIsland(value))
    } else if(input==="q" || input==="quit") {
      return false;
    } else if(input.length ===0 || input==="r" || input==="refresh" ) {
      if (islandId > 0) {
        context=2;
        createResponse("/state", "", islandId, true).then(
          (responseBody) => {
          }
        );
        getItem("island",islandId)
        .then(value => printIsland(value))
      }
    }
    // } else if(input==="a" && islandId > 0 ) {
    //   for(let cnt =0;cnt<5;cnt++) {
    //     setTimeout(() => {
    //       createResponse("/state", "", islandId, true)
    //       .then((responseBody) => {});
    //       getItem("island",islandId)
    //       .then(value => printIsland(value))
    //       process.stdout.write(">> " + islandId + " >>")
    //     }, 2000);
    //   }
  }
  return true;
}

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

const createTerminal =  () => {
  rl.on('line', (line) => {
    var input = line.replace(/\0/g, '')
    if  (! checkInput(input)) {
      console.log("closing");
      rl.close();
      process.exit();
    } else {
      console.log("\033[2J\033[0f")
      if (input.length > 0 ) {
        if (islandId > 0 ) {
          process.stdout.write(">> " + islandId + "-" + penguinId + " >>")
        } else {
          process.stdout.write(">>")
        }
      }
    }
  })
  process.stdout.write(">>")
}


module.exports = {
  createTerminal: createTerminal,
};
