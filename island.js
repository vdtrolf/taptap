const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
const axios = require("axios");

let Penguin = penguinReq.Penguin;
let Land = landReq.Land;
let debug = false;

const deco1 = [" ",".","^","%","#","#","#","#"];
const deco2 = ["&nbsp;","░","▒","▓","█","█","█","█"];
const weathers = ["sun","rain","snow","cold"];

class Island {
  constructor(sizeH,sizeL,session) {
    this.sizeH = sizeH;
    this.sizeL = sizeL;
    this.territory = [];
    this.penguins = [];
    this.weather = 0; // "sun";
    this.weatherCount = 0;
    this.numPeng = 0;

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

 } // constructor ()


 // Add some penguins to the island

 addPenguins(session) {

   let turn = 0;

   // randomly add some penguins
   for (let i = 0; i < 10; i++) {
      let hpos = Math.floor(Math.random() * this.sizeH);
      let lpos = Math.floor(Math.random() * this.sizeL);
      let land = this.territory[hpos][lpos];

      if (land && land.getType() !== 0 ) { // && this.penguins.length < 1) {
        let penguin = new Penguin(this.numPeng++,hpos,lpos,session, turn);
        land.addPenguin(penguin);
        this.penguins.push(penguin);
      }
    }
  }

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

  // returns the list of artifacts
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

  // Set a tile at a given position

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

  // Decrease or increase the amount of ice

  smelt() {
    // Randomly decrease some terrain parts
    for (let i = 0; i < this.sizeH ; i++) {
      let hpos = Math.floor(Math.random() * this.sizeH);
      let lpos = Math.floor(Math.random() * this.sizeL);
      let land = this.territory[hpos][lpos];

      if (this.weather <2 ) {

        if (land && land.getType() == 1) {
          if (land.getConf() < 15 ) {
            land.increaseConf();
          } else {
            land.setType(0);
            land.resetConf();
          }
        }
      } else if (this.weather === 2 ) {
        if (land && land.getType() == 1) {
          if (land.getConf() > 0 ) {
            land.decreaseConf();
          }
        }
      }
    }
  }

  // Move all the penguins of this island

  movePenguins(session) {

    let turn = session.getTurn();
    
    // Remove all istarget flags from the lands
    
    for (let i = 0; i < this.sizeH; i++) {
      for (let j = 0; j < this.sizeL; j++) {
        this.territory[i][j].setTarget(false) ;
      }
    }
    
    

    this.penguins.forEach(penguin => {

      // First check if the penguin is alive
      if (penguin.isAlive()) {

        // Gonna Eat or Love ?
        let lover= session.getLover(penguin.gender, penguin.hpos, penguin.lpos);

        if (this.territory[penguin.hpos][penguin.lpos].fish()) {
          this.territory[penguin.hpos][penguin.lpos].removeFish();
          penguin.eat(session, turn);
          session.addPoints(100);
        } else if ( lover && penguin.canLove(lover.id)) {
          if (! penguin.isLoving()) {
            penguin.love(session, turn,  lover.id);
            lover.love(session, turn, this.id);
            session.addPoints(200);
          }
        }

        // Not eating or loving => then it can move
        if (! penguin.isEating() && ! penguin.isLoving()){

          let posmoves = [];
          if (this.territory[penguin.getHPos()][penguin.getLPos()-1].canMove() || lover !== null) posmoves.push(1);
          if (this.territory[penguin.getHPos()][penguin.getLPos()+1].canMove() || lover !== null) posmoves.push(2);
          if (this.territory[penguin.getHPos()-1][penguin.getLPos()].canMove() || lover !== null) posmoves.push(3);
          if (this.territory[penguin.getHPos()+1][penguin.getLPos()].canMove() || lover !== null) posmoves.push(4);

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

          // move: 1=right,2=left,3=down,4=up
          //
          //            0  1  2  3  4  5  6  7  8
          //               l  r  u  d rd ru ld lu
          let lmoves = [0,-1, 1, 0, 0, 1, 1,-1,-1];
          let hmoves = [0, 0, 0,-1, 1, 1,-1, 1,-1];
          let movestxt = ["-","l","r","u","d","rd","ru","ld","lu"];

          if (targetL > 0){

            if (debug) {
              console.log(turn + " -  : penguin " + penguin.getId()  + " at  " + penguin.getHPos() + "/" + penguin.getLPos() + " found target : " + targetH + "/" + targetL);
            }
            if (targetL < penguin.getLPos()) {
              if (targetH === penguin.getHPos()) {
                move = 1;
              } else {
                move = targetH < penguin.getHPos() ? 8:7;
              }
            } else if (targetL > penguin.getLPos()) {
              if (targetH === penguin.getHPos()) {
                move = 2;
              } else {
                move = targetH < penguin.getHPos() ? 6:5;
              }
            } else {
              if (targetH === penguin.getHPos()) {
                move = 0;
              } else {
                move = targetH < penguin.getHPos() ? 3:4;
              }
            }

            console.log(turn + " -  : penguin " + penguin.getId() + " going to move "  + move + " (" + movestxt[move] + ")");

          } else {
             
            let aPosMove = Math.floor(Math.random() * posmoves.length);
            move = posmoves[aPosMove];
          }

          if (move > 0 && move < 5 ) {

            l=penguin.getLPos() + lmoves[move];
            h=penguin.getHPos() + hmoves[move];

            if (this.territory[h][l].getType() > 0) {
              penguin.setPos(session, turn, move, h,l);
              this.territory[h][l].setTarget(true);
            }

          } else if (move > 0){

            l=penguin.getLPos() + lmoves[move];
            h=penguin.getHPos() + hmoves[move];

            if (this.territory[h][l].getType() > 0) {
              switch (move) {
                case 5:
                  penguin.setPos(session, turn, 2, penguin.getHPos(), penguin.getLPos() + 1);
                  penguin.setPos(session, turn, 4, penguin.getHPos() + 1, penguin.getLPos());
                  this.territory[h][l].setTarget(true);
                  break;
                case 6:
                  penguin.setPos(session, turn, 2, penguin.getHPos(), penguin.getLPos() + 1);
                  penguin.setPos(session, turn, 3, penguin.getHPos() - 1, penguin.getLPos());
                  this.territory[h][l].setTarget(true)
                  
                  
                  
                  ;
                  break;
                case 7:
                  penguin.setPos(session, turn, 1, penguin.getHPos(), penguin.getLPos() - 1);
                  penguin.setPos(session, turn, 4, penguin.getHPos() + 1, penguin.getLPos());
                  this.territory[h][l].setTarget(true);
                  break;
                case 8:
                  penguin.setPos(session, turn, 1, penguin.getHPos(), penguin.getLPos() -1);
                  penguin.setPos(session, turn, 3, penguin.getHPos() - 1, penguin.getLPos());
                  this.territory[h][l].setTarget(true);
                  break;
              } // switch
            } // is territory > 0
          } else if (move === 0) {
            enguin.wait(session, turn); 
          }
          // if move
        } // not eating or loving
      } // isPenguins
    }); // ForEach
  } // movePenguins()

  // Goes through all the alive penguins and ask them to generate an initial move + the eat or love move 

  resetPenguins(session) {  
  
    let turn = session.getTurn();
  
    this.penguins.forEach(penguin => {

      // First check if the penguin is alive
      if (penguin.isAlive()) {
        penguin.resetPos(session,turn);
      }
    });
  }
 
  // Makes all the penguins older and react on status returned by penguin
  // if status is 1, then the penguin is dead and a cross is placed
  // if status is 2 and the penguin gender is female, then there is a baby

  makePenguinsOlder(session) {
    let l=0,h=0
    let turn = session.getTurnNoUpd();

    this.penguins.forEach(penguin => {
      if (penguin.isAlive()) {
        switch (penguin.makeOlder(session,turn)) {
          case 1: // died
            l=penguin.getLPos();
            h=penguin.getHPos();
            this.territory[h][l].setCross();
            break;
          case 2: // born
            if (penguin.getGender() === "female") {
              l=penguin.getLPos();
              h=penguin.getHPos();
              let fatherId = penguin.gender === "male" ? penguin.id : penguin.partnerId;
              let motherId = penguin.gender === "male" ? penguin.partnerId : penguin.id;
              let child = new Penguin(this.numPeng++,h,l,session,turn,fatherId,motherId);
              this.territory[h][l].addPenguin(child);
              this.penguins.push(child);
            }
            break;
        }
      }
    });
  }

  // Changing the weather - this will happen any time between 4 and 12 cycles

  setWeather(session) {

    this.weatherCount += 1;
    if (this.weatherCount  >  Math.floor(Math.random() * 20) + 15) {
      let newWeather = this.weather;

      while (newWeather === this.weather) {
        newWeather = Math.floor(Math.random() * 4);
      }

      if (newWeather === 0) {
        session.addFish();
      } else if (newWeather === 1) {
        session.addTile();
      }
      this.weather = newWeather;

      // console.log("Changing weather to " + this.weather + " (" + weathers[this.weather] + ")");
      this.weatherCount = 0;
    }
  }

  // Returns the weather as a String

  getWeather() {
    return weathers[this.weather];
  }
}



// now we export the class, so other modules can create Penguin objects
module.exports = {
    Island : Island
}
      