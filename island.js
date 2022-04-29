const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
const axios = require("axios");

let Penguin = penguinReq.Penguin;
let Land = landReq.Land;

const deco1 = [" ",".","^","%","#","#","#","#"];
const deco2 = ["&nbsp;","░","▒","▓","█","█","█","█"];
const weathers = ["sun","rain","snow","cold"];

class Island {
  constructor(sizeH,sizeL) {
    this.sizeH = sizeH;
    this.sizeL = sizeL;
    this.territory = [];
    this.penguins = [];
    this.weather = "sun";
    this.weatherCount = 0;

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


      if (land && land.getType() !== 0) { //  && this.penguins.length < 1) {
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
        line += `<img class="tile" id="img-${i}-${j}"src="./tiles/PF-${this.territory[i][j].getType()}-${this.territory[i][j].getConf()}.png" width="48" height="48">`;
      }
      result += line + `</div>`;
    }
    return result;
  }

  getArtifacts() {
    let result = ``;
    for (let i = 0; i < this.sizeH; i++) {
      let h = (i * 48) + 16; //  + 16;
      for (let j = 0; j < this.sizeL; j++) {
        let l = (j * 48) + 16; // + 16 ;
        let land = this.territory[i][j] ;
        if (land && land.cross()) {
          result += `<img class="cross" src="./tiles/cross.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
        } else if (land && land.fish()) {
          result += `<img class="fish" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
        }
      }
    }
    return result + ``;
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


  setTile(hpos,lpos,session) {
    let land = this.territory[hpos][lpos];
    if (land ) {
      if (land.getType() == 0 && hpos > 0 && lpos > 0 && hpos < this.sizeH -1 && lpos < this.sizeL -1 && session.getTiles() > 0) {
        land.setIce();
        session.decreaseTiles();
        return true;
      } else if (land.getType() > 0 && session.getFishes() > 0) {
        land.setFish();
        session.decreaseFishes();
        return true;
      }
    }
    return false;
  }

  smelt() {
    // Randomly decrease some terrain parts
    for (let i = 0; i < this.sizeH ; i++) {
      let hpos = Math.floor(Math.random() * this.sizeH);
      let lpos = Math.floor(Math.random() * this.sizeL);
      let land = this.territory[hpos][lpos];

      if (this.weather === "sun" || this.weather === "rain") {

        if (land && land.getType() == 1) {
          if (land.getConf() < 15 ) {
            land.increaseConf();
          } else {
            land.setType(0);
            land.resetConf();
          }
        }
      } else {
        if (land && land.getType() == 1) {
          if (land.getConf() > 0 ) {
            land.decreaseConf();
          }
        }
      }
    }
  }

  movePenguins(session) {
    this.penguins.forEach(penguin => {
      
      if (penguin.isAlive() && ! penguin.isEating() ) {
        
        let posmoves = [];
        if (this.territory[penguin.getHPos()][penguin.getLPos()-1].getType()>0) posmoves.push(1);
        if (this.territory[penguin.getHPos()][penguin.getLPos()+1].getType()>0) posmoves.push(2);
        if (this.territory[penguin.getHPos()-1][penguin.getLPos()].getType()>0) posmoves.push(3);
        if (this.territory[penguin.getHPos()+1][penguin.getLPos()].getType()>0) posmoves.push(4);
      
        let startH = penguin.getHPos() -2;
        let stopH = startH + 4 < this.sizeL ? startH +4 : this.sizeH;
        startH = startH > 0 ? startH : 1;
        
        let startL = penguin.getLPos() -2;
        let stopL = startL + 4 < this.sizeL ? startL +4 : this.sizeL;
        startL = startL > 0 ? startL : 1;
        
        let targetL = 0, targetH = 0;
       
        for (let h= startH; h < stopH ; h++) {
          for (let l =startL; l < stopL ; l++) {
            if(this.territory[h][l].fish()) {
              targetL = l;
              targetH = h;
            }
          }
        }
        
        let l=0,h=0,move=0;
        //               l  r  u  d rd ru ld lu
        let lmoves = [0,-1, 1, 0, 0, 1, 1,-1,-1];
        let hmoves = [0, 0, 0,-1, 1, 1,-1, 1,-1];
        
        // move: 1=right,2=left,3=down,4=up
        
        
        if (targetL > 0){
         
          if (targetL < penguin.getLPos()) {
            if (targetH === penguin.getHPos()) {
              move = 1;
            } else {
              move = targetH < penguin.getHPos() ? 7:8;
            }
          } else if (targetL > penguin.getLPos()) {
            if (targetH === penguin.getHPos()) {
              move = 2;
            } else {
              move = targetH < penguin.getHPos() ? 6:5;
            }
          } else {
            if (targetH === penguin.getHPos()) {
              this.territory[targetH][targetL].removeFish();
              penguin.eat(session);
              move = 0;
            } else {
              move = targetH < penguin.getHPos() ? 3:4;
            }
          }
          
         
        } else {
          let aPosMove = Math.floor(Math.random() * posmoves.length);
          move = posmoves[aPosMove];
        }
        
        if (move > 0 && move < 5 ) {
        
          l=penguin.getLPos() + lmoves[move];
          h=penguin.getHPos() + hmoves[move];
        
          if (this.territory[h][l].getType() > 0) {
            penguin.setPos(session, move, h,l);
          }
          
        } else if (move > 0){
          
          l=penguin.getLPos() + lmoves[move];
          h=penguin.getHPos() + hmoves[move];
          
          if (this.territory[h][l].getType() > 0) {
            switch (move) {
              case 5:
                penguin.setPos(session, 2, penguin.getHPos(), penguin.getLPos() + 1);     
                penguin.setPos(session, 4, penguin.getHPos() + 1, penguin.getLPos() + 1);     
                break;               
              case 6:
                penguin.setPos(session, 2, penguin.getHPos(), penguin.getLPos() + 1);     
                penguin.setPos(session, 3, penguin.getHPos() - 1, penguin.getLPos() + 1);     
                break;               
              case 7:
                penguin.setPos(session, 1, penguin.getHPos(), penguin.getLPos() - 1);     
                penguin.setPos(session, 4, penguin.getHPos() + 1, penguin.getLPos() + 1);     
                break;               
              case 8:
                penguin.setPos(session, 1, penguin.getHPos(), penguin.getLPos() -1);     
                penguin.setPos(session, 3, penguin.getHPos() - 1, penguin.getLPos() - 1);     
                break;               
            } // switch
          } // is territory > 0
        } // if move
      } // isPenguins
    });
  }

  makePenguinsOlder(session) {
    this.penguins.forEach(penguin => {
      if (penguin.isAlive()) {
        if (! penguin.makeOlder(session)) {
          let l=penguin.getLPos();
          let h=penguin.getHPos();
          this.territory[h][l].setCross();
        }
      }
    });
  }

  setWeather(session) {
    this.weatherCount += 1;
    // if (this.weatherCount  >  Math.floor(Math.random() * 8) + 5) {
    if (this.weatherCount  >  2) {
      let newWeather = Math.floor(Math.random() * 4);
      if (newWeather === 0) { 
        session.addFish();
      } else if (newWeather === 1) {
        session.addTile();
      }
      this.weather = weathers[newWeather];
      console.log("changing weather to " + this.weather);
      this.weatherCount = 0;
    }
  }

  getWeather() {
    return this.weather;
  }
}



// now we export the class, so other modules can create Penguin objects
module.exports = {
    Island : Island
}
