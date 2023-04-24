// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGINFO = loggerReq.LOGINFO;
const LOGVERB = loggerReq.LOGVERB;

const realm = "fish";
const source = "fish.js";

const species = [
  "tuna",
  "cod",
  "salmon",
  "sturgeon",
  "marlin"
];

const debug = false;

// Class and constructor

class Fish {
  constructor(
    num,
    h,
    l,
    islandId,
    id = 0,
    specie = 0,
    moving = 0,
    staying = 0,
    onHook = false,
    hookAge = 0,
    fishDirection = 0,
    
  ) {
    this.id = id === 0 ? Math.floor(Math.random() * 999999) : id;
    this.islandId = islandId;
    this.num = num;
    this.hpos = h;
    this.lpos = l;
    this.onHook = onHook;
    this.hookAge = hookAge;
    this.specie = specie === 0 ? Math.floor(Math.random() * 4) : specie;

    this.fishDirection = fishDirection;
    this.moving = moving;
    this.staying = staying;

    log(
      realm,
      source,
      "constructor",
      "new fish " + this.id + " at " + this.hpos + "/" + this.lpos
    );
  }

  // returns teh category of the penguin - y,m,f,o (old man), e (eldery woman)

  setDirection(direction) {
    this.fishDirection = direction;
  }

  setPos(direction,h,l) {
    this.fishDirection = direction;
    this.hpos = h;
    this.lpos = l;
    this.staying = 0;
  }

  setOnHook(isOnHook) {
    this.onHook = isOnHook;
    this.hookAge = 6;
  }

  makeHookOlder() {
    if (this.onHook) {
      this.hookAge = this.hookAge - 1;
      return this.hookAge > 0;
    } else {
      return true;
    }
  }

  increaseStaying() {
    this.staying = this.staying + 1;
  }


}


// now we export the class, so other modules can create Penguin objects
module.exports = {
  Fish: Fish,
};