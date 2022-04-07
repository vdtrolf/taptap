const express = require('express');
const penguinReq = require("./penguin.js");
const islandReq = require("./island.js");
const landReq = require("./land.js");
const axios = require("axios");

let Penguin = penguinReq.Penguin;
let Island = islandReq.Island;
let Land = landReq.Land;

const app = express();
const port = 3005;

const args = process.argv.slice(2);

let users = {
  1: {
    id: '1',
    username: 'Robin Wieruch',
  },
  2: {
    id: '2',
    username: 'Dave Davids',
  },
};

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

const island = new Island(islandH,islandL);

if (debug) {
  console.log(island.getAscii(mode));
}

// app.get('/penguins', (req, res) => {
//     res.send(island.getPenguins());
// }).listen(port, () => console.log(`Little island app listening on port ${port}!`))

app.get('/island-ascii', (req, res) => {
    console.log("Hiiiii");
    // res.send(Object.values(users));
    res.send(island.getAscii(mode,islandH,islandL));
}).listen(port, () => console.log(`Little island app listening on port ${port}!`))

// app.get('/', (req, res) => {
//     res.send('Penguin island');
// }).listen(port, () => console.log(`Little island app listening on port ${port}!`))


// getWeather();

