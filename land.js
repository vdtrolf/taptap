const penguinReq = require("./penguin.js");
const axios = require("axios");

let Penguin = penguinReq.Penguin;

class Land {
  constructor(l, h) {
    // console.log(x + " " + y);
    this.lpos = l;
    this.hpos = h;
    this.type = 0;
    this.conf = 0;
    this.penguin = null;
  }

  setLand(num) {
    this.type = num;
  }

  addPenguin(penguin) {
    this.penguin = penguin;
  }

  checkPenguin(){
    return this.penguin;
  }

  getType() {
    return this.type;
  }
  
  removeHill(left,right,up,down) {
    let cnf = 0;
    cnf += left < this.type ? 1 : 0;
    cnf += up < this.type ? 2 : 0;
    cnf += right < this.type ? 4 : 0;
    cnf += down < this.type ? 8 : 0;
      
    if (cnf === 7 || cnf == 11 || cnf == 13 || cnf == 14 || cnf == 15) {
      this.type -= 1;
    } 
  }
  
  setConf(left,right,up,down) {
    if (this.type === 1 || this.type === 2) {
      let cnf = 0;
      cnf += left < this.type ? 1 : 0;
      cnf += up < this.type ? 2 : 0;
      cnf += right < this.type ? 4 : 0;
      cnf += down < this.type ? 8 : 0;
      this.conf = cnf;
    }
  }
  
  getConf() {
    return this.conf;
  }  
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    Land : Land
}
