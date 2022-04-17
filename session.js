const islandReq = require("./island.js");

let Island = islandReq.Island;

class Session {
  constructor(island) {
    // console.log(x + " " + y);
    this.id = Math.floor(Math.random() * 99999999999);
    this.tiles = 5;
    this.fishes = 5;
    this.changedLands = [];
    this.island = island;

    console.log("New session with id " + this.id);

  }

  reset() {
    this.tiles = 5;
    this.fishes = 5;
  }

  getIsland() {
    return this.island;
  }

  setIsland(island) {
    this.island = island;
  }

  getId() {
    return this.id;
  }

  getTiles() {
    return this.tiles;
  }

  decreaseTiles() {
    this.tiles -= this.tiles > 0 ? 1 : 0; 
  }

  decreaseFishes() {
    this.fishes -= this.fishes > 0 ? 1 : 0; 
  }
  
  getFishes() {
     return this.fishes; 
  }

  isAlive() {
    return true;
  }

}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    Session : Session
}
