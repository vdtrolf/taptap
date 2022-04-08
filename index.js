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

app.get('/penguins', (req, res) => {
  console.log(req);
  res.json(island.getPenguins());
});

app.get("/new-island", (req, res) => {
  let island = new Island(islandH,islandL);
  res.json( {island : island.getAscii(mode,islandH,islandL)});
});

app.get("/island-ascii", (req, res) => {
  console.log("get");
  res.json( {island : island.getAscii(mode,islandH,islandL)});
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});




    // res.send(`{island : "${island.getAscii(mode,islandH,islandL)}"}`);

// getWeather();
