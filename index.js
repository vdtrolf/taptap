const express = require('express');
const cors = require('cors');
const penguinReq = require("./penguin.js");
const islandReq = require("./island.js");
const landReq = require("./land.js");
const axios = require("axios");

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
if (!islandL) islandL = 90;
let islandH = islandL / 3;

let mode = Number.parseInt(args[1], 10);
if (!mode) mode = 2;

let debug = Number.parseInt(args[2], 10);

console.log("Building an island of size " + islandH + " * " + islandL);

let island = new Island(islandH,islandL);

if (debug) {
  console.log(island.getAscii(mode));
}

app.get('/*', (req, res) => {
  console.log(req.url);
  switch(req.url) {
    case "/island-ascii" : {
      return res.json( {island : island.getAscii(mode,islandH,islandL),penguins : island.getPenguins()});
    }
    case "/new-island" : {
      island = new Island(islandH,islandL);
      return res.json( {island : island.getAscii(mode,islandH,islandL),penguins : island.getPenguins()});
    }
    case "/penguins" : {
      return res.json({penguins : island.getPenguins()}); 
    } 
  }
   
  // res.json({penguins : island.getPenguins()});
});

app.listen(port, () => {
  console.log(`Little island listening at port: ${port}`);
});

// getWeather();
