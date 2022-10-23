const readline = require('readline')
const colors = require('colors/safe')

const requestserverReq = require("./requestserver.js");
const stateserverReq = require("./stateserver.js");

let createResponse = requestserverReq.createResponse;
let setState = stateserverReq.setState;

var islandId = 0;


colors.enable()

const print = (msg) => {
  console.log(msg)
}

const checkInput = (input) => {

  if (input.includes("=")) {
    const inputargs = input.toLowerCase().split("=");
    if (inputargs[0] === "id") {
      islandId = inputargs[1];
    } 
  } else {
    createResponse(input, "", islandId, true).then(
      (responseBody) => {
          // console.dir(responseBody);
        return responseBody;
      }
    );
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

  print('')
  process.stdout.write(">>")
}

module.exports = {
  createTerminal: createTerminal,
};
