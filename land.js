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
    this.hasCross = false;
    this.hasFish = false;
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

  setType(newType) {
    this.type = newType;
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

  setBorder(h,l,sizeH,sizeL) {
    if (this.type === 0 ) {
      let cnf = 0;
      cnf += h === 0 ? 1 : 0;
      cnf += h === sizeH - 1 ? 4 : 0;
      cnf += l === sizeL - 1 ? 2 : 0;
      cnf += l === 0 ? 8 : 0;
      this.conf = cnf;
    }
  }

  setCross() {
    this.hasCross = true;
  }
  
  removeFish() {
    this.hasFish = false;
  }

  setFish() {
    this.hasFish = true;
  }

  cross() {
    return this.hasCross;
  }

  fish() {
    return this.hasFish;
  }

  setConf(newValue) {
    if (newValue) {
      this.conf = newValue;
    } else if (this.type === 1 ) {
      this.conf = Math.floor(Math.random() * 15);
    }
  }

  setConf() {
    if (this.type === 1) {
      this.conf = Math.floor(Math.random() * 15);
    }
  }

  setIce() {
    this.type = 1;
    this.conf = 0;
  }

  resetConf() {
    this.conf = 0;
  }

  increaseConf() {
    this.conf = this.conf + 1;
  }

  decreaseConf() {
    this.conf = this.conf -1;
  }

  getConf() {
    return this.conf;
  }
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    Land : Land
}
