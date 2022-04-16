const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
const axios = require("axios");

let Penguin = penguinReq.Penguin;
let Land = landReq.Land;

const deco1 = [" ",".","^","%","#","#","#","#"];
const deco2 = ["&nbsp;","░","▒","▓","█","█","█","█"];

class Island {
  constructor(sizeH,sizeL) {
    this.sizeH = sizeH;
    this.sizeL = sizeL;
    this.territory = [];
    this.penguins = [];

    let matrix = [];

    // creating a matrix of land objects with a value of 0
    for (let h = 0; h < sizeH; h++) {
      let line = [];
      let lineNum = [];
      for (let l = 0; l < sizeL; l++) {
        line.push(new Land(h,l));
        lineNum.push(0);
      }
      this.territory.push(line);
      matrix.push(lineNum);
    }

    // Randomly ceate lands
    let cnt = 0, max = sizeH * sizeL;
    for (let i = 0; i < sizeH * sizeL * 40 && cnt < max / 3 ; i++) {
      let hpos = Math.floor(Math.random() * sizeH) + Math.floor(sizeH/10);
      let lpos = Math.floor(Math.random() * sizeL) + Math.floor(sizeL/10);

      if (hpos > 0 && hpos < sizeH - 1 && lpos > 0 && lpos < sizeL - 1  ) {
      if (i < 10) {
        matrix[hpos][lpos] = 1;
        cnt++
      } else if (matrix[hpos][lpos] === 0 && // only elevate is neighbour = 1
          (matrix[hpos-1][lpos] === 1 ||
          matrix[hpos][lpos-1] === 1 ||
          matrix[hpos+1][lpos] === 1 ||
          matrix[hpos][lpos+1] === 1 )) {
          matrix[hpos][lpos] = 1;
          cnt++;
        }
      }
    }

    // remove lonely land dots (surrended with 3 seas)
    for (let x=0; x<2; x++) {
      for (let h = 1; h < sizeH - 1 ; h++) {
        for (let l = 1; l < sizeL -1 ; l++) {
          if (matrix[h][l] ===1) {
            let cnf = 0;
            cnf += matrix[h-1][l] === 0 ? 1 : 0;
            cnf += matrix[h+1][l] === 0 ? 2 : 0;
            cnf += matrix[h][l-1] === 0 ? 4 : 0;
            cnf += matrix[h][l+1] === 0 ? 8 : 0;
            if (cnf === 7 || cnf == 11 || cnf == 13 || cnf == 14 || cnf == 15) {
              matrix[h][l] = 0;
            }
          }
        }
      }
    }

    // remove lonely lakes dots (surrended with 4 lands)
    for (let h = 1; h < sizeH - 1 ; h++) {
      for (let l = 1; l < sizeL -1 ; l++) {
        if (matrix[h][l] === 0 &&
          matrix[h-1][l] === 1 &&
          matrix[h+1][l] === 1 &&
          matrix[h][l-1] === 1 &&
          matrix[h][l+1] === 1) {
            matrix[h][l] = 1;
        }
      }
    }

    // Make land based on the matrix
    for (let h = 0; h < sizeH; h++) {
      for (let l = 0; l < sizeL; l++) {
        let land = this.territory[h][l];
        if (land && land.getType() === 0 && matrix[h][l]) {
          this.elev(land, h, l);
        }
      }
    }

    // Randomly elevate some terrain parts
    for (let i = 0; i < sizeH * 2; i++) {
      let hpos = Math.floor(Math.random() * sizeH);
      let lpos = Math.floor(Math.random() * sizeL);
      let land = this.territory[hpos][lpos];

      if (land && land.getType() !== 0) {
        this.elev(land, hpos, lpos);
      }
    }

    // Calculate terrain configuration
    for (let l = 1; l < sizeL - 1; l++) {
      for (let h = 1; h < sizeH - 1; h++) {
        this.territory[h][l].setConf()
       }
    }
    for (let l = 0; l < sizeL ; l++) {
      for (let h = 0; h < sizeH ; h++) {
         this.territory[h][l].setBorder(h,l,sizeH,sizeL);
      }
    }

    // randomly add some penguins
    let numPeng = 0;
    for (let i = 0; i < 10; i++) {
      let hpos = Math.floor(Math.random() * sizeH);
      let lpos = Math.floor(Math.random() * sizeL);
      let land = this.territory[hpos][lpos];


      if (land && land.getType() !== 0) {
        let penguin = new Penguin(numPeng++,hpos,lpos);
        land.addPenguin(penguin);
        this.penguins.push(penguin);
      }
    }
  } // constructor ()

  getLandType(x, y) {
    const land = this.territory[x][y];
    return land.getType();
  }

  hasPenguin(x, y) {
    const land = this.territory[x][y];
    if (land.checkPenguin()) {
      return true;
    }
    return false;
  }

  getPenguins() {
    return this.penguins;
  }

  // returns an ascii image of the island
  getAscii(mode,islandH,islandL) {
    let deco = mode === 1 ? deco1 : deco2;

    let result = ``;
    let linetop = `+`;
    for (let j = 0; j < islandL; j++) linetop += `-`;
    result += linetop + `+\n`;
    for (let i = 0; i < islandH; i++) {
      let line = "|";
      for (let j = 0; j < islandL; j++) {
        const land = this.territory[i][j];
        if (land.checkPenguin()){
            line += this.territory[i][j].checkPenguin().getNum();
        } else {
          line += deco[this.territory[i][j].getType()];
        }
      }
      result += line + `|\n`;
    }
    result += linetop + `+\n`;
    return result;
  }

  // returns a list of images
  getImg(mode,islandH,islandL) {
    let result = ``;
    for (let i = 0; i < islandH; i++) {
      let line = `<div>`;
      for (let j = 0; j < islandL; j++) {
        //line += `<img src="./tiles/PX-${this.territory[i][j].getType()}-${this.territory[i][j].getConf()}.png" width="16" height="24">`;
        line += `<img class="tile" id="img-${i}-${j}"src="./tiles/PF-${this.territory[i][j].getType()}-${this.territory[i][j].getConf()}.png" width="48" height="48">`;
      }
      result += line + `</div>`;
    }
    return result;
  }

  getChangedImg() {



  }


  // elevate a plot os land - can be called recusrsively to elevate adjacent plots of land
  elev(land, hpos, lpos) {
    const height = land.getType() + 1;
    for (let h = hpos - 1; h <= hpos + 1; h++) {
      for (let l = lpos - 1; l <= lpos + 1; l++) {
        if (h >= 0 && l >= 0 && h < this.sizeH && l < this.sizeL) {
          try {
            let lheight = this.territory[h][l].getType();
            if (lheight > 0 && height - lheight > 1) {
              this.elev(this.territory[h][l],h,l);
            }

          } catch (error) {
            console.error("No land at h=" + h + " / l" + l + " - " + error);
          }
        }
      }
    }
    this.territory[hpos][lpos].setLand(height);
  }


  smelt() {
    // Randomly decrease some terrain parts
    for (let i = 0; i < this.sizeH ; i++) {
      let hpos = Math.floor(Math.random() * this.sizeH);
      let lpos = Math.floor(Math.random() * this.sizeL);
      let land = this.territory[hpos][lpos];

      if (land && land.getType() == 1) {
        if (land.getConf() < 15 ) {
          land.increaseConf();
        } else {
          land.setType(0);
          land.resetConf();
        }
      }
    }



  }

  movePenguins() {
    this.penguins.forEach(penguin => {
      let lmoves = [1,-1,0, 0,1,1,-1,-1];
      let hmoves = [0, 0,1,-1,1,-1,1,-1];
      let move = Math.floor(Math.random() * 8);
      let l=penguin.getLPos() + lmoves[move];
      let h=penguin.getHPos() + hmoves[move];
      // console.log("moving penguin " + penguin.getNum() + " = " + move + " " + lmoves[move] + " " + hmoves[move] + " => " +  h + "/" + l);

      // const land = this.territory[h][l];
      // console.log( " " + this.territory[h] + " " );
      if (this.territory[h][l].getType() > 0) {
        penguin.setPos(h,l);
        // console.log("moving penguin " + penguin.getNum() +  " to " +  h + "/" + l);
      }
    });
  }

  makePenguinsOlder() {
    this.penguins.forEach(penguin => {
      if (! penguin.makeOlder()) {
        console.log("Death");
        let l=penguin.getLPos();
        let h=penguin.getHPos();
        this.territory[l][h].setCross();
        this.penguins.filter(penguin => penguin.isAlive());
      }
    });
  }
}


// now we export the class, so other modules can create Penguin objects
module.exports = {
    Island : Island
}
