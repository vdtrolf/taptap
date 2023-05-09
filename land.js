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
    hpos,
    lpos,
    islandId,
    id = 0,
    nature = 0,
    smeltLevel= 0,
    tileAngle = 0,
    hasCross = false,
    crossAge = 0,
    hasFood = false,
    hasFish = false,
    fishAge = 0,
    hasGarbage = false,
    hasIce = false,
    iceAge = 0,
    hasFill = false,
    fillAge = 0
  ) {
    this.id = id === 0 ? Math.floor(Math.random() * 999999999) : id;
    this.islandId = islandId;
    this.hpos = hpos;
    this.lpos = lpos;
    this.nature = nature;
    this.smeltLevel= smeltLevel;
    this.tileAngle =
      tileAngle=== 0 ? (Math.floor(Math.random() * 2) === 1 ? "a" : "b") : tileAngle;
    this.hasCross = hasCross;
    this.crossAge = crossAge;
    this.hasFood = hasFood;
    this.hasFish = hasFish;
    this.hasIce = hasIce;
    this.iceAge = iceAge;
    this.fishAge = fishAge;
    this.hasGarbage = hasGarbage;
    this.hasFill = hasFill;
    this.fillAge = fillAge;

    this.changed = true;
    this.isTarget = false;
    this.hasPenguin = false;
    this.islandSize = 0;
    this.islandPopulation = 0;
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
    this.nature = num;
    this.smeltLevel= 0;
  }

  getNature() {
    return this.nature;
  }

  canMove() {
    return this.nature > 0 && !this.isTarget && !this.hasCross && !this.hasIce ;
  }

  canFishMove() {
    return this.nature === 0 && !this.isTarget && !this.hasGarbage && !this.hasFill;
  }

  setNature(newNature) {
    this.nature = newNature;
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
    if (this.fillAge > 0) {
      this.fillAge -= 1;
      if (this.fillAge ===0) {
        this.hasFill = false;
        this.nature = 1;
      }
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

  fill() {
    log(
      realm,
      source,
      "fill",
      "filling ices at " + this.hpos + "/" + this.lpos
    );
    this.hasFill = true;
    this.fillAge = 6;
  }

  removeFood() {
    this.hasFood = false;
  }

  canFish() {
    return this.hasFish && this.fishAge === 0;
  }

  canFill() {
    return this.hasFill && this.fillAge === 0;
  }

  setRandomSmeltLevel(waterBorders) {
    this.smeltLevel= waterBorders * 2 + Math.floor(Math.random() * 7);
  }

  resetSmeltLevel() {
    this.smeltLevel= 0;
  }

  increaseSmeltLevel() {
    this.smeltLevel= this.smeltLevel+ 1;
    this.changed = true;
  }

  decreaseSmeltLevel() {
    this.smeltLevel= this.smeltLevel- 1;
    this.changed = true;
  }

  getSmeltLevel() {
    return this.smeltLevel;
  }

  // add a fishming fish
  addFish() {
    this.hasFish = true;
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