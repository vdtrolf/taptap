let debug = true;

class Land {
  constructor(
    h,
    l,
    debugit,
    islandId,
    id = 0,
    atype = 0,
    conf = 0,
    avar = 0,
    hasCross = false,
    crossAge = 0,
    hasFish = false,
    hasSwim = false,
    hasIce = false,
    swimAge = 0
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
    (this.hasIce = hasIce), (this.swimAge = swimAge);

    this.changed = true;
    this.isTarget = false;
    this.islandSize = 0;
    this.islandPopulation = 0;

    debug = false;
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
    }
  }

  setCross() {
    if (debug) {
      console.log(
        "land.js - setCross : setting cross at " + this.hpos + "/" + this.lpos
      );
    }
    this.hasCross = true;
    this.crossAge = 10;
  }

  removeFish() {
    this.hasFish = false;
  }

  // setFish() {
  //   this.hasFish = true;
  //   this.changed = true;
  // }

  canFish() {
    return this.hasSwim;
  }

  setRandomSmeltLevel(waterBorders) {
    this.conf = waterBorders * 2 + Math.floor(Math.random() * 7);
  }

  // converting a water tile to ice - if there is a fish swimming into the water,
  // then put it on the ice

  // setIce() {
  //   if (this.hasSwim) {
  //     this.hasSwim = false;
  //     this.hasFish = true;
  //   }
  //   this.type = 1;
  //   this.conf = 0;
  //   this.changed = true;

  // }

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
    this.hasSwim = true;
    this.changed = true;
  }

  // remove a swimming fish
  removeSwim() {
    this.hasSwim = false;
    this.changed = true;
  }

  // remove a swimming fish
  fishSwim() {
    this.hasSwim = false;
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
