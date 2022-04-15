const express = require('express');
const cors = require('cors');
const penguinReq = require("./penguin.js");
const islandReq = require("./island.js");
const landReq = require("./land.js");
const axios = require("axios");
const readline = require('readline')
const strings = require('./strings')
//const colors = require('colors/safe')

//colors.enable()

let Penguin = penguinReq.Penguin;
let Island = islandReq.Island;
let Land = landReq.Land;

const app = express();
const port = 3001;
app.use(cors())
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const args = process.argv.slice(2);

// console.log(process.env);

args.forEach((arg) => {
  console.log(arg);
});

let islandL = Number.parseInt(args[0], 10);
if (!islandL) islandL = 12;
let islandH = 12; // islandL / 2 ;

let mode = Number.parseInt(args[1], 10);
if (!mode) mode = 1;

let debug = Number.parseInt(args[2], 10);
debug = true;

listen = true;

console.log("Building an island of size " + islandH + " * " + islandL);

let island = new Island(islandH,islandL);
if (debug) {
  console.log(island.getAscii(mode,islandH,islandL)); 
}

//console.log(` - - - - - - - - - - - - - - - - - `);
//console.log(`- - - - - -/\\ - - - - - - - - - - -`);
//console.log(` - - -/          |=- - - - - - - -`);
//console.log(`- - - \\_          \\-=- - - - - - - `);
//console.log(` - - - -|           |=- - - - - - -`);
//console.log(`- - - - |        ___|= - - - - - - `);
//console.log(` - - -/         |-=- - - - - - - - `);
//console.log(`- - - \\_        \\=-=- - - - - - - -`);
//console.log(` - - - -|____         \\-=- - - - - `);
//console.log(`- - - - - - |___  ____/=- - - - - -`);
//console.log(` - - - - - - - -\\/=- - - - - - - - `);
//console.log(`- - - - - - - - - - - - - - - - - -`);

//const print = (msg) => {
//  console.log(msg)
//}
//
//let rl = readline.createInterface({
//  input: process.stdin,
//  output: process.stdout,
//  terminal: true
//})
//
//rl.on('line', (line) => {
//  print('-----------')
//  var input = line.replace(/\0/g, '')
//  console.log(island.getAscii(mode,islandH,islandL));
//  
//  console.log("tata");
//})
//
//print(strings.hello)
//print('')
//process.stdout.write(strings.prompt)

if (listen) {

  app.get('/*', (req, res) => {
    // console.log("Receiving a request at " + req.url);
    switch(req.url) {
      case "/island-ascii" : {
        return res.json( {island : island.getImg(mode,islandH,islandL),penguins : island.getPenguins()});
      }
      case "/new-island" : {
        island = new Island(islandH,islandL);
        return res.json( {island : island.getImg(mode,islandH,islandL),penguins : island.getPenguins()});
      }
      case "/penguins" : {
        return res.json({penguins : island.getPenguins()});
      }
    }

  });

  app.listen(port, () => {
    
    console.log(`Little island listening at port: ${port}`);
  });
}



setInterval(() => {
    island.movePenguins();
    island.smelt();
}, 1000);



