const penguinReq = require("./penguin.js");
const islandReq = require("./island.js");
const landReq = require("./land.js");
const axios = require("axios");

let Penguin = penguinReq.Penguin;
let Island = islandReq.Island;
let Land = landReq.Land;

const deco1 = [" ",".","^","%","#","#","#","#"];
const deco2 = [" ","░","▒","▓","█","█","█","█"];

let deco = deco1;

const args = process.argv.slice(2);
// console.log(process.env);

args.forEach((arg) => {
  console.log(arg);
});

let islandL = Number.parseInt(args[0], 10);
if (!islandL) islandL = 60;
let islandH = islandL / 3;

console.log("Building an island of size " + islandH + " * " + islandL);


const getWeather = () => {
  axios
    .get(
      "http://api.weatherapi.com/v1/current.json?key=c28ff46234e64f52abe171323220204&q=London&aqi=no"
    )
    .then((response) => {
      console.log(response.data.current.condition.text);
    })
    .catch((error) => {
      console.log(error);
    });
};

const island = new Island(islandH,islandL);

let linetop = "+";
for (let j = 0; j < islandL; j++) linetop += "-";
console.log(linetop + "+");

for (let i = 0; i < islandH; i++) {
  let line = "|";
  for (let j = 0; j < islandL; j++) {
    if (island.hasPenguin(i,j)) {
      line += "o";
    } else {
      line += deco[island.getLandType(i,j)];
    }
  }
  console.log(line + "|");
}

console.log(linetop + "+");

// getWeather();

penguinReq.testFunction("tati");
