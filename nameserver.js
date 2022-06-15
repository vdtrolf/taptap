const axios = require("axios");

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
];

let debug = false;

class NameServer {
  constructor(namesQty, islandsQty, debugit = false) {
    this.namesSize = namesQty;
    this.islandsSize = islandsQty;
    debug = debugit;

    if (debug) {
      console.log("nameserver.js - constructor : starting nameserver");
    }
    this.startInterval();
  }

  checkNames() {
    if (penguinsNames.length < this.namesSize) {
      let penguinName = { name: "toto", gender: "male" };
      getFakePenguinName(penguinName);
      penguinsNames.push(penguinName);
      //console.log("Another name");
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
    if (debug) {
      console.log(
        "nameserver.js - getPenguinName : returning the name " +
          aPenguinName.name
      );
    }
    return aPenguinName;
  } else {
    let gdname = Math.floor(Math.random() * 10);
    if (debug) {
      console.log(
        "nameserver.js - getPenguinName : returning a fake name " +
          names[gdname]
      );
    }
    return { name: names[gdname], gender: genders[gdname] };
  }
};

const getIslandName = () => {
  if (islandsNames.length > 0) {
    return islandsNames.shift();
  } else {
    let isname = Math.floor(Math.random() * 30);
    if (debug) {
      console.log(
        "nameserver.js - getIslandName : returning a fake name " +
          islands[isname]
      );
    }
    return islands[isname];
  }
};

// Gets a name from a name server

const getFakePenguinName = async (aPenguin) => {
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
