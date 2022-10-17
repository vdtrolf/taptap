// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;

const realm = "name";
const source = "nameserver.js";

const penguinsNames = [];
const islandsNames = [];

const genders = [
  "male",
  "female",
  "male",
  "female",
  "male",
  "female",
  "male",
  "female",
  "male",
  "female",
  "male",
  "female",
  "male",
  "female",
  "male",
  "female",
  "male",
  "female",
  "male",
  "female",
];

const names = [
  "Billy Boy",
  "Glossy Rose",
  "Titus",
  "Bella",
  "Rolf",
  "Gradina",
  "Paulus",
  "Agripa",
  "Cesar",
  "Mira",
  "Georges",
  "Amelie",
  "Owen",
  "Miranda",
  "Ronald",
  "Dragina",
  "Titeuf",
  "Marie",
  "Auguste",
  "Sophie",
];
const islands = [
  "Iswell",
  "Fairland",
  "Esturga",
  "Tranquility",
  "BolderIsland",
  "PureWorld",
  "Ratatown",
  "Scotlandia",
  "Ramona",
  "Toroland",
  "Nowherecap",
  "Hopelessland",
  "Karialand",
  "Cupoea",
  "Isolaland",
  "Curfore",
  "Flielandia",
  "Messa",
  "OuatesIsland",
  "Grabundia",
  "Aubonne",
  "Fortune",
  "Coldstone",
  "Vulcania",
  "Ramone",
  "ThreeStones",
  "Syconess",
  "Rueland",
  "MariaIsland",
  "Sofsofland",
  "Terragusta",
  "Islay",
  "Romont",
  "Vlieland",
  "Fuerteventura",
  "Menorca",
  "Corse",
  "Sicilia",
  "Sardinia",
  "Guernesey",
  "Skagen",
  "BehindLand",
  "Mormora",
  "St-Helen",
  "Portobelle",
  "Capri",
  "Elba",
  "Finca",
  "Mann",
  "Ibiza",
  "Tenerife",
  "Goa"
];

let debug = false;

class NameServer {
  constructor(namesQty, islandsQty, debugit = false) {
    this.namesSize = namesQty;
    this.islandsSize = islandsQty;
    debug = debugit;

    log(realm, source, "constructor", "starting nameserver");
    this.startInterval();
  }

  checkNames() {
    if (penguinsNames.length < this.namesSize) {
      let penguinName = { name: "toto", gender: "male" };
      getFakePenguinName(penguinName);
      penguinsNames.push(penguinName);
    }
  }

  startInterval() {
    setInterval(() => {
      this.checkNames();
    }, 100);
  }
}

const getPenguinName = () => {
  if (penguinsNames.length > 0) {
    let aPenguinName = penguinsNames.shift();
    log(
      realm,
      source,
      "getPenguinName",
      "returning the name " + aPenguinName.name
    );

    return aPenguinName;
  } else {
    let gdname = Math.floor(Math.random() * 10);
    log(
      realm,
      source,
      "getPenguinName",
      "returning a fake name " + names[gdname]
    );

    return { name: names[gdname], gender: genders[gdname] };
  }
};

const getIslandName = () => {
  if (islandsNames.length > 0) {
    return islandsNames.shift();
  } else {
    let isname = Math.floor(Math.random() * 50);
    log(
      realm,
      source,
      "getIslandName",
      "returning a fake name " + islands[isname]
    );

    return islands[isname];
  }
};

// const getFakePenguinName = async (aPenguin) => {
//   let random = Math.floor(Math.random() * 20);
//   aPenguin.name = names[random];
//   aPenguin.gender = genders[random];
// };

// Gets a name from a name server

const getFakePenguinName = async (aPenguin) => {
  const axios = require("axios");

  axios
    .get("https://randomuser.me/api/?inc=gender,name&nat=fr")
    .then((response) => {
      aPenguin.name = response.data.results[0].name.first;
      aPenguin.gender = response.data.results[0].gender;
      if (debug) {
        console.log(
          "nameserver.js - getFakeName : getting another penguin name"
        );
      }
    })
    .catch((error) => {
      if (debug) {
        console.log(
          "nameserver.js - getFakeName : error in getting a penguin name"
        );
      }
    });
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  NameServer: NameServer,
  getPenguinName: getPenguinName,
  getIslandName: getIslandName,
};
