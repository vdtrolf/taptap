const penguinReq = require("./penguin.js");
const axios = require("axios");

let Penguin = penguinReq.Penguin;

class Land {
  constructor(l, h) {
    // console.log(x + " " + y);
    this.lpos = l;
    this.hpos = h;
    this.type = 0;
    this.penguin = null;
  }

  setLand(num) {
    this.type = num;
  }

  addPenguin(penguin) {
    // console.log("New penguin at " + this.lpos + " " + this.hpos);
    this.penguin = penguin;
  }

  checkPenguin(){
    // console.log("Checking penguin at " + this.lpos + " " + this.hpos + " -> " + this.penguin);
    return this.penguin;
  }

  getType() {
    return this.type;
  }
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    Land : Land
}
