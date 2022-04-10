const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
const axios = require("axios");

let Penguin = penguinReq.Penguin;
let Land = landReq.Land;

const deco1 = [" ",".","^","%","#","#","#","#"];
const deco2 = ["&nbsp;","░","▒","▓","█","█","█","█"];
const deco3 = [`<img src="./tiles/LI-0.png">`,
               `<img src="./tiles/LI-16.png">`,
               `<img src="./tiles/LI-32.png">`,
               `<img src="./tiles/LI-64.png">`,
               `<img src="./tiles/LI-128.png">`,
               `<img src="./tiles/LI-128.png">`,
               `<img src="./tiles/LI-128.png">`];


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


    // Randomly elevate some terrain parts
    for (let i = 0; i < 20; i++) {
      let hpos = Math.floor(Math.random() * sizeH / 1.5) + Math.floor(sizeH/6);
      let lpos = Math.floor(Math.random() * sizeL / 1.5) + Math.floor(sizeL/6);
     
      matrix[hpos][lpos] = 1;
      
      // console.log("==>" + hpos + " " + lpos + " " + matrix[hpos][lpos]);
     
      let land = this.territory[hpos][lpos];

      if (land && land.getType() === 0) {
        this.elev(land, hpos, lpos);
      }
    }


    for ( let h=0;h<sizeH;h++) {
      let maxleft = 0, maxright =sizeL, hasdot = false; 
      
      for (let l=0; l<sizeL;l++) {
         if(matrix[h][l] === 1) {
           maxleft = l > maxleft ? l : maxleft;
           maxright = l < maxright ? l : maxright;
           hasdot = true;
         }
      }
      if (hasdot) {
        console.log("--> " + h + " " + maxright + " " + maxleft);
      }
    }
    


    if (false) {
    
    // first lines of land from line 1 to line size -1
    let variation = this.sizeL / 5;
    let start = variation,
      start2 = variation;
    for (let h = 1; h < sizeH - 1; h++) {
      let rnd = Math.floor(Math.random() * 3 - 1 + start);
      start = rnd;

      let rnd2 = Math.floor(Math.random() * 3 - 1 + start2);
      rnd2 = rnd2 < 0 ? 0 : rnd2;
      start2 = rnd2;

      for (let l = rnd; l < sizeL - rnd2; l++) {
        if (this.territory[h][l]) {
          this.territory[h][l].setLand(1);
        } else {
          console.log("const: cant set land for " + j + " " + i);
        }
      }
    }

    // sea borders on the upper and lower side
    start = variation / 5;
    start2 = variation / 4;
    for (let l = 1; l < sizeL - 1; l++) {
      let rnd = Math.floor(Math.random() * 3 - 1 + start);
      start = rnd;

      let rnd2 = Math.floor(Math.random() * 3 - 1 + start2);
      rnd2 = rnd2 < 0 ? 0 : rnd2;
      start2 = rnd2;

      for (let h = 0; h < rnd; h++) {
        this.territory[h][l].setLand(0);
      }

      for (let h = sizeH - rnd2; h < sizeH; h++) {
        this.territory[h][l].setLand(0);
      }
    }

    // Randomly elevate some terrain parts
    for (let i = 0; i < sizeH * 20; i++) {
      let hpos = Math.floor(Math.random() * sizeH);
      let lpos = Math.floor(Math.random() * sizeL);
      let land = this.territory[hpos][lpos];

      if (land && land.getType() !== 0) {
        this.elev(land, hpos, lpos);
      }
    }
    
    // Remove lonely hills for levels 1 to 3
    for (let x = 3; x > 0; x-- ){
      for (let l = 1; l < sizeL - 1; l++) {
        for (let h = 1; h < sizeH - 1; h++) {
          if (this.territory[h][l].getType() === x) {
            this.territory[h][l].removeHill(this.territory[h][l-1].getType(),
                                         this.territory[h][l+1].getType(),
                                         this.territory[h-1][l].getType(),
                                         this.territory[h+1][l].getType());
          }
        }
      }
    }
    
    // Calculate terrain configuration
    for (let l = 1; l < sizeL - 1; l++) {
      for (let h = 1; h < sizeH - 1; h++) {
        this.territory[h][l].setConf(this.territory[h][l-1].getType(),
                                     this.territory[h][l+1].getType(),
                                     this.territory[h-1][l].getType(),
                                     this.territory[h+1][l].getType());
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
    }

  }

  getLandType(x, y) {
    // console.log("-->" + x + " " + y);
    const land = this.territory[x][y];
    return land.getType();
  }

  hasPenguin(x, y) {
    // console.log("-->" + x + " " + y);
    const land = this.territory[x][y];
    if (land.checkPenguin()) {
      return true;
    }
    return false;
  }

  getPenguins() {
    return this.penguins;
  }

  getAscii(mode,islandH,islandL) {

    console.log("getAscii : " + mode + " " + islandH + " " + islandL)

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
  
  getImg(mode,islandH,islandL) {

    let deco = deco3;

    let result = ``;
    
    for (let i = 0; i < islandH; i++) {
      let line = `<div>`;
      for (let j = 0; j < islandL; j++) {
        //const land = this.territory[i][j];
        //if (land.checkPenguin()){
        //    line += this.territory[i][j].checkPenguin().getNum();
        //} else {
          line += `<img src="./tiles/PX-${this.territory[i][j].getType()}-${this.territory[i][j].getConf()}.png" width="16" height="24">`;
        //}
      }
      result += line + `</div>`;
    }
    
    return result;

  }


  elev(land, hpos, lpos) {
    const height = land.getType() + 1;
    // console.log("elev: " + xcoord + " " + ycoord + " -> " + height);
    for (let h = hpos - 1; h <= hpos + 1; h++) {
      for (let l = lpos - 1; l <= lpos + 1; l++) {
        if (h >= 0 && l >= 0 && h < this.sizeH && l < this.sizeL) {
          try {
            let lheight = this.territory[h][l].getType();
            if (lheight > 0 && height - lheight > 1) {
              // console.log("elev: upscaling " + x + " " + y + " " + lheight);
              this.elev(this.territory[h][l],h,l);
              //this.territory[h][l].setLand(lheight + 1);
            }

          } catch (error) {
            console.error("No land at h=" + h + " / l" + l + " - " + error);
          }
        }
      }
    }
    this.territory[hpos][lpos].setLand(height);
  }
}


// now we export the class, so other modules can create Penguin objects
module.exports = {
    Island : Island
}
