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
    hasFish = false,
    hasSwim = false,
    swimAge = 0,
    hasIce = false
  ) {
    this.id = id === 0 ? Math.floor(Math.random() * 999999) : id;
    this.islandId = islandId;
    this.hpos = h;
    this.lpos = l;
    this.type = atype;
    this.conf = conf;
    this.var =
      avar === 0 ? (Math.floor(Math.random() * 2) === 1 ? "a" : "b") : avar;
    this.hasCross = hasCross;
    this.crossAge = crossAge;
    this.hasFish = hasFish;
    this.hasSwim = hasSwim;
    this.hasIce = hasIce;
    this.swimAge = swimAge;

    this.changed = true;
    this.isTarget = false;
    this.islandSize = 0;
    this.islandPopulation = 0;

    // if (hasSwim ) console.log("Youp");


  }

  setTarget(isTarget) {
    this.isTarget = isTarget;
  }

  setLand(num) {
    this.type = num;
  }

  getType() {
    return this.type;
  }

  canMove() {
    return this.type > 0 && !this.isTarget && !this.hasCross;
  }

  setType(newType) {
    this.type = newType;
  }

  makeOlder() {
    if (this.crossAge > 0) {
      this.crossAge -= 1;
      this.hasCross = this.crossAge > 0;
    }
    if (this.swimAge > 0) {
      this.swimAge -= 1;
      this.hasSwim = this.swimAge > 0;
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

  removeFish() {
    this.hasFish = false;
  }

  canFish() {
    return this.hasSwim;
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

  // return true if there is a swimming fish
  swim() {
    return this.hasSwim || this.swimAge > 0;
  }

  // add a swimming fish
  addSwim() {

    // console.log("addswim at " + this.hpos + " " + this.lpos)

    this.hasSwim = true;
    this.changed = true;
  }

  // remove a swimming fish
  removeSwim() {
    this.hasSwim = false;
    this.changed = true;
  }

  // add a swimming fish
  addIce() {

    // console.log("addswim at " + this.hpos + " " + this.lpos)

    this.hasIce = true;
    this.changed = true;
  }

  // remove a swimming fish
  removeIce() {
    this.hasIce = false;
    this.changed = true;
  }

  // remove a swimming fish
  fishSwim() {
    this.hasSwim = true;
    this.swimAge = 12;
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
