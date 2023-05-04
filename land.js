// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;
const LOGINFO = loggerReq.LOGINFO;
const LOGERR = loggerReq.LOGERR;
const LOGTEXT = loggerReq.LOGTEXT;
const LOGDATA = loggerReq.LOGDATA;
const LOGDUMP = loggerReq.LOGDUMP;

const realm = "island";
const source = "land.js";
class Land {
  constructor(
    h,
    l,
    islandId,
    id = 0,
    atype = 0,
    conf = 0,
    avar = 0,
    hasCross = false,
    crossAge = 0,
    hasFood = false,
    hasFish = false,
    fishAge = 0,
    hasGarbage = false,
    hasIce = false,
    iceAge = 0,
    isFillTarget = false,
    fillAge = 0
  ) {
    this.id = id === 0 ? Math.floor(Math.random() * 999999999) : id;
    this.islandId = islandId;
    this.hpos = h;
    this.lpos = l;
    this.type = atype;
    this.conf = conf;
    this.var =
      avar === 0 ? (Math.floor(Math.random() * 2) === 1 ? "a" : "b") : avar;
    this.hasCross = hasCross;
    this.crossAge = crossAge;
    this.hasFood = hasFood;
    this.hasFish = hasFish;
    this.hasIce = hasIce;
    this.iceAge = iceAge;
    this.fishAge = fishAge;
    this.hasGarbage = hasGarbage;
    this.isFillTarget = isFillTarget;
    this.fillAge = fillAge;

    this.changed = true;
    this.isTarget = false;
    this.hasPenguin = false;
    this.islandSize = 0;
    this.islandPopulation = 0;

    // if (hasFish ) console.log("Youp");


  }

  setTarget(isTarget) {
    this.isTarget = isTarget;
  }

  setPenguin(hasPenguin) {
    this.hasPenguin = hasPenguin;
  }

  setFish(hasFish) {
    this.hasFish = hasFish;
  }

  setGarbage(hasGarbage) {
    this.hasGarbage = hasGarbage;
  }

  setLand(num) {

    if (num ===1 && this.isFillTarget) {
      this.isFillTarget = false;
      this.fillAge = 0;
    }

    this.type = num;
    this.conf = 0;
  }

  getType() {
    return this.type;
  }

  canMove() {
    return this.type > 0 && !this.isTarget && !this.hasCross && !this.hasIce ;
  }

  canFishMove() {
    return this.type === 0 && !this.isTarget ;
  }


  setType(newType) {
    this.type = newType;
  }

  makeOlder() {
    if (this.crossAge > 0) {
      this.crossAge -= 1;
      this.hasCross = this.crossAge > 0;
    }
    if (this.fishAge > 0) {
      this.fishAge -= 1;
      this.hasFish = this.fishAge > 0;
    } 
    if (this.iceAge > 0) {
      this.iceAge -= 1;
      this.hasIce = this.iceAge > 0;
    } 

  }

  setCross() {
    log(
      realm,
      source,
      "setCross",
      "setting cross at " + this.hpos + "/" + this.lpos
    );
    this.hasCross = true;
    this.crossAge = 10;
  }

  digIce() {
    log(
      realm,
      source,
      "digIce",
      "diging ices at " + this.hpos + "/" + this.lpos
    );
    this.iceAge = 6;
  }

  fill() {
    log(
      realm,
      source,
      "fill",
      "filling ices at " + this.hpos + "/" + this.lpos
    );
    this.iceAge = 6;
  }

  removeFish() {
    this.hasFood = false;
  }

  canFish() {
    return this.hasFish && this.fishAge === 0;
  }

  canFill() {
    return this.isFillTarget && this.fillAge === 0;
  }

  removeFill() {
    this.isFillTarget = false;
  }

  setRandomSmeltLevel(waterBorders) {
    this.conf = waterBorders * 2 + Math.floor(Math.random() * 7);
  }

  resetConf() {
    this.conf = 0;
  }

  increaseConf() {
    this.conf = this.conf + 1;
    this.changed = true;
  }

  decreaseConf() {
    this.conf = this.conf - 1;
    this.changed = true;
  }

  getConf() {
    return this.conf;
  }

  getVar() {
    return this.var;
  }

  // return true if there is a fishming fish
  fish() {
    return this.hasFish || this.fishAge > 0;
  }

  // add a fishming fish
  addFish() {

    // console.log("addfish at " + this.hpos + " " + this.lpos)

    this.hasFish = true;
    this.changed = true;
  }

  // remove a fishming fish
  removeFish() {
    this.hasFish = false;
    this.changed = true;
  }

  // add a fishming fish
  addGarbage() {
    this.hasGarbage = true;
    this.changed = true;
  }

  // add ice
  addIce() {

    // console.log("addice at " + this.hpos + " " + this.lpos)

    this.hasIce = true;
    this.changed = true;
  }

  canDig() {
    return this.hasIce && this.iceAge === 0;
  }

  // begin diging a piece of ice
  iceDig() {
    this.hasIce = true;
    this.iceAge = 6;
    this.changed = true;
  }

  // remove a piece of ice
  removeIce() {
    this.hasIce = false;
    this.changed = true;
  }

  // begin fishing a fishming fish
  fishFish() {
    this.hasFish = true;
    this.fishAge = 6;
    this.changed = true;
  }

  // set the island sizeH
  setIslandSize(size) {
    this.islandSize = size;
  }

  // set the island sizeH
  setIslandPopulation(population) {
    this.islandPopulation = population;
  }

  // set the island sizeH
  getIslandSize(size) {
    return this.islandSize;
  }

  // set the island sizeH
  getIslandPopulation(population) {
    return this.islandPopulation;
  }
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
  Land: Land,
};