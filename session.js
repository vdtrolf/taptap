const islandReq = require("./island.js");

let Island = islandReq.Island;

class Session {
  constructor(island) {
    // console.log(x + " " + y);
    this.id = Math.floor(Math.random() * 99999999999);
    this.tiles = 3;
    this.changedLands = [];
    this.island = island;
    
    console.log("New session with id " + this.id);
    
  }

  resetChangedLands() {
    this.changedLands = [];
  }

  getChangedLands() {
    return changedLands;
  }

  addChangedLand(land){
    changedLands.push(land);
  }
  
  getIsland() {
    return this.island;
  }
  
  getId() {
    return this.id;
  }
 
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    Session : Session
}