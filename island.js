const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
const sessionReq = require("./session.js");
const axios = require("axios");

let Penguin = penguinReq.Penguin;
let Land = landReq.Land;
let Session = sessionReq.Session;
let debug = false;

const deco1 = [" ",".","^","%","#","#","#","#"];
const deco2 = ["&nbsp;","░","▒","▓","█","█","█","█"];
const weathers = ["sun","rain","snow","cold","endgame"];
const names = ["Iswell","Fairland","Esturga","Tranquility","BolderIsland","PureWorld","Ratatown","Scotlandia","Ramona","Toroland",
"Nowherecap","Hopelessland","Karialand","Cupoea","Isolaland","Curfore","Flielandia","Messa","OuatesIsland","Grabundia","Aubonne",
"Fortune","Coldstone","Vulcania","Ramone","ThreeStones","Syconess","Rueland","MariaIsland","Sofsofland","Terragusta"];

class Island {
  constructor(sizeH,sizeL,session) {
    this.id = Math.floor(Math.random() * 999999);
    this.name = names[Math.floor(Math.random() * 30)];
    this.sizeH = sizeH;
    this.sizeL = sizeL;
    this.territory = [];
    this.penguins = [];
    this.sessions = [session];
    this.weather = 0; // "sun";
    this.weatherCount = 0;
    this.numPeng = 0;
    this.tiles = 5;
    this.landSize = 0;
    this.fishes = 5;
    this.turn = 0;
    this.points = 0;
    this.running = true;


    let matrix = [];

    if (debug) {
      console.log("Island.js : new island : " + this.name + " with id " + this.id);
    }

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

    for (let l = 0; l < sizeL ; l++) {
      for (let h = 0; h < sizeH ; h++) {
         this.landSize += this.territory[h][l].getType() > 0 ?1:0;
      }
    }

    // randomly add some penguins

    let pengNum = Math.floor(Math.random() * 2) + 4;
    let pengCnt = 0;

    while (pengCnt < pengNum) {
       let hpos = Math.floor(Math.random() * this.sizeH);
       let lpos = Math.floor(Math.random() * this.sizeL);
       let land = this.territory[hpos][lpos];

       if (land && land.getType() !== 0 ) { // && this.penguins.length < 1) {
         let penguin = new Penguin(this.numPeng++,hpos,lpos,this.sessions, this.turn);
         land.addPenguin(penguin);
         this.penguins.push(penguin);
         pengCnt++;
       }
     }

    if (debug) {
      console.log(this.getAscii());
    }
 } // constructor ()

 // Adds a session to the list of listening sessions

  registerSession(session) {
    if ( ! this.sessions.find(aSession => aSession.id === session.id) )
    {
      this.sessions.push(session);
      if (debug) {
        console.log("island.js - registerSession : session " + session.id + " registered to island " + this.name + "/" + this.id);
      }
    } else {
      console.log("island.js - registerSession : session " + session.id + " already registered to island " + this.name + "/" + this.id);
    }
  }

  // Adds a session to the list of listening sessions

  unregisterSession(session) {
    this.sessions = this.sessions.filter(aSession => aSession.id !== session.id);
    if (debug) {
      console.log("island.js - unregisterSession : session " + session.id + " unregistered from island " + this.name + "/" + this.id);
    }
  }

  hasSession(sessionId) {
    let foundSession = this.sessions.find(session => session.getId() === sessionId);
      // probably not necessary
    return foundSession?true:false;

  }

   getTurn() {
     return this.turn++;
   }

   getTurnNoUpd() {
     return this.turn;
   }

   getTiles() {
     return this.tiles;
   }

   addTile() {
     this.tiles += 1;
   }

   addFish() {
     this.fishes += 1;
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

   addPoints(points) {
     this.points += points;
   }

   getPoints() {
     return this.points;
   }

   resetPoints() {
     this.points = 0;
   }


   getLover(gender, hpos, lpos) {

     let lover = this.penguins.find(penguin => {
       return penguin.hpos === hpos && penguin.lpos === lpos && penguin.gender !== gender && penguin.alive
     });
    return lover;
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

  getImg(mode,islandH,islandL) {
    let result = [];
    for (let i = 1; i < islandH -1; i++) {
      for (let j = 1; j < islandL -1 ; j++) {
        let id = i + "-" + j;
        let tile = this.territory[i][j].getType() + "-" + this.territory[i][j].getConf();
        result.push({
          li : i,
          id : id,
          ti : tile
        });
      }
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
          if (land.type === 0) {
            result += `<img class="cross" src="./tiles/wreath.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
          } else {
            result += `<img class="cross" src="./tiles/cross.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
          }
        } else if (land && land.fish()) {
          result += `<img class="fish" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
        } else if (land && land.swim()) {
          let transp = 0.6; // ((Math.floor(Math.random() * 2) / 10))  + 0.3;
          result += `<img class="swim" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute; opacity:${transp}" width="48" height="48" >\n`;
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
            console.error("island.js - elev : No land at h=" + h + " / l" + l + " - " + error);
          }
        }
      }
    }
    this.territory[hpos][lpos].setLand(height);
  }

  reset() {
    this.tiles = 5;
    this.fishes = 5;
    this.turn = 0;
    this.points = 0;
    if (debug) {
      console.log("island.js - reset : Session reset with id " + this.id);
    }
  }

  // Set a tile at a given position

  setTile(hpos,lpos) {
    let land = this.territory[hpos][lpos];
    if (land ) {
      if (land.getType() == 0 && hpos > 0 && lpos > 0 && hpos < this.sizeH -1 && lpos < this.sizeL -1 && this.getTiles() > 0) {
        land.setIce();
        this.decreaseTiles();
        return true;
      } else if (land.getType() > 0 && this.getFishes() > 0) {
        land.setFish();
        this.decreaseFishes();
        return true;
      }
    }
    return false;
  }

  // Decrease or increase the amount of ice

  smelt() {

    if (! this.running) {
      return;
    }

    // Randomly decrease some terrain parts
    for (let i = 0; i < this.sizeH * 2; i++) {
      let hpos = Math.floor(Math.random() * this.sizeH);
      let lpos = Math.floor(Math.random() * this.sizeL);
      let land = this.territory[hpos][lpos];

      if (this.weather <2 ) {

        if (land && land.getType() == 1) {
          if (land.getConf() < 15 ) {
            land.increaseConf();
          } else {
            land.setType(0);

            let sinkingPenguins = this.penguins.filter(penguin => penguin.hpos === hpos && penguin.lpos === lpos);
            if (sinkingPenguins.length > 0) {
              sinkingPenguins.forEach(penguin => {
                console.log(`penguin ${penguin.name} (${penguin.hpos}/${penguin.lpos}) sinking at ${hpos}/${lpos}`);
                penguin.letDie(this.sessions,this.turn);
              });
              this.territory[hpos][lpos].setCross();
            }
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

    // make all land pieces older - check if crosses must be removed

    this.landSize = 0;
    for (let i = 0; i < this.sizeH ; i++) {
      for (let j = 0; j < this.sizeL ; j++) {
        let land = this.territory[i][j];
        land.makeOlder();
        this.landSize += this.territory[i][j].getType() > 0?1:0;
      }
    }
  }

  // Move all the penguins of this island

  movePenguins() {

    // check if there are still alive penguinsLayer

    let cntPenguins = this.penguins.filter(penguin => penguin.isAlive()).length;

    if (cntPenguins < 1) {
      this.running = false;
      this.weather = 4;
      if (debug) { console.log("island.js - movePenguins : endgame")};
    }

    let turn = this.getTurn();

    // Remove all istarget flags from the lands

    for (let i = 0; i < this.sizeH; i++) {
      for (let j = 0; j < this.sizeL; j++) {
        this.territory[i][j].setTarget(false) ;
      }
    }

    for (let penguin of this.penguins) {

      // First check if the penguin is alive
      if (penguin.isAlive() && ! penguin.isEating() && ! penguin.isLoving() && ! penguin.isFishing()) {

        let islandSize = this.territory[penguin.hpos][penguin.lpos].getIslandSize();
        let islandPopulation = this.territory[penguin.hpos][penguin.lpos].getIslandPopulation();

        if (islandPopulation / islandSize > 0.79) {
          penguin.wait(this.sessions, turn);
          if (debug) {
            console.log(`island.js - movePenguins : on ${this.name} island for ${penguin.name} is too crowded (size: ${islandSize} and population: ${islandPopulation} = ${islandPopulation / islandSize})` );
          }
          console.log("wait");
          break ;
        }

        // Gonna Eat ?

        if (this.territory[penguin.hpos][penguin.lpos].fish()) {
          this.territory[penguin.hpos][penguin.lpos].removeFish();
          penguin.eat(this.sessions, turn);
          this.addPoints(100);
          break;
        }

        // Gonna love ?

        let lover= this.getLover(penguin.gender, penguin.hpos, penguin.lpos);
        if ( cntPenguins < this.landSize / 5 && lover && penguin.canLove(lover.id) ) {
          penguin.love(this.sessions, turn,  lover.id);
          lover.love(this.sessions, turn, this.id);
          this.addPoints(200);
          break;
        }

        // Fishing ?

        let fishmoves = [];

        if (this.territory[penguin.getHPos()][penguin.getLPos()-1].canFish() ) fishmoves.push(1);
        if (this.territory[penguin.getHPos()][penguin.getLPos()+1].canFish() ) fishmoves.push(2);
        if (this.territory[penguin.getHPos()-1][penguin.getLPos()].canFish() ) fishmoves.push(3);
        if (this.territory[penguin.getHPos()+1][penguin.getLPos()].canFish() ) fishmoves.push(4);

        if (fishmoves.length > 0) {
          let fishmove = fishmoves[Math.floor(Math.random() * fishmoves.length)];
          console.log(`insland.js - movePenguins : ${penguin.name} is going to fish at direction ${fishmove}`)
          penguin.fish(this.sessions, turn, fishmove);
          let swimlpos = fishmove === 1 ? penguin.getLPos()-1 : penguin.getLPos();
          swimlpos = fishmove === 2 ? penguin.getLPos() + 1 : swimlpos;
          let swimhpos = fishmove === 3 ? penguin.getHPos()-1 : penguin.getHPos();
          swimhpos = fishmove === 4 ? penguin.getHPos() + 1 : swimhpos;
          this.territory[swimhpos][swimlpos].fishSwim();
          break;
        }

        // No doing anything else - can the penguin move  ?

        let posmoves = [];

        if (this.territory[penguin.getHPos()][penguin.getLPos()-1].canMove() ) posmoves.push(1);
        if (this.territory[penguin.getHPos()][penguin.getLPos()+1].canMove() ) posmoves.push(2);
        if (this.territory[penguin.getHPos()-1][penguin.getLPos()].canMove() ) posmoves.push(3);
        if (this.territory[penguin.getHPos()+1][penguin.getLPos()].canMove() ) posmoves.push(4);

        // if (posmoves.length  === 0) {
        //   if (debug) {console.log("island.js movePenguin : Staying still")};
        //   penguin.wait(this.sessions, turn);
        //   break ;
        // }

        // is is possible to move - let's see which direction

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

        //            0  1  2  3  4  5  6  7  8
        //               l  r  u  d rd ru ld lu
        let lmoves = [0,-1, 1, 0, 0, 1, 1,-1,-1];
        let hmoves = [0, 0, 0,-1, 1, 1,-1, 1,-1];
        let movestxt = ["-","l","r","u","d","rd","ru","ld","lu"];

        if (targetL > 0){

          if (debug) { console.log("island.js - movePenguins : " + turn + " -  : penguin " + penguin.getId()  + " at  " + penguin.getHPos() + "/" + penguin.getLPos() + " found target : " + targetH + "/" + targetL)};
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
              console.log("target but no move");
            } else {
              move = targetH < penguin.getHPos() ? 3:4;
            }
          }

          // console.log(turn + " -  : penguin " + penguin.getId() + " going to move "  + move + " (" + movestxt[move] + ")");

        } else {
          if (Math.floor(Math.random() * 10) === 0 || posmoves.length === 0 ){
            move = 0;
            // console.log("no move");
          } else {
            let aPosMove = Math.floor(Math.random() * posmoves.length);
            move = posmoves[aPosMove];
            // console.log("move " + move);
          }
        }

        // No move => wait

        if (move === 0) {
          if (debug) {console.log("island.js movePenguin : Staying still")};
          penguin.wait(this.sessions, turn);
          break ;
        }

        // Simple move (under 5)

        this.addPoints(10);

        l=penguin.getLPos() + lmoves[move];
        h=penguin.getHPos() + hmoves[move];

        if (this.territory[h][l].getType() > 0) {
          switch (move) {
            case 5:
              penguin.setPos(this.sessions, turn, 2, penguin.getHPos(), penguin.getLPos() + 1);
              penguin.setPos(this.sessions, turn, 4, penguin.getHPos() + 1, penguin.getLPos());
              this.territory[h][l].setTarget(true);
              break;
            case 6:
              penguin.setPos(this.sessions, turn, 2, penguin.getHPos(), penguin.getLPos() + 1);
              penguin.setPos(this.sessions, turn, 3, penguin.getHPos() - 1, penguin.getLPos());
              this.territory[h][l].setTarget(true);
              break;
            case 7:
              penguin.setPos(this.sessions, turn, 1, penguin.getHPos(), penguin.getLPos() - 1);
              penguin.setPos(this.sessions, turn, 4, penguin.getHPos() + 1, penguin.getLPos());
              this.territory[h][l].setTarget(true);
              break;
            case 8:
              penguin.setPos(this.sessions, turn, 1, penguin.getHPos(), penguin.getLPos() -1);
              penguin.setPos(this.sessions, turn, 3, penguin.getHPos() - 1, penguin.getLPos());
              this.territory[h][l].setTarget(true);
              break;
            default:
              penguin.setPos(this.sessions, turn, move, h,l);
              this.territory[h][l].setTarget(true);
          } // switch on move
        } // is territory > 0
      }  // is penguin alive
    } // for of
  } // movePenguins()



  // Goes through all the alive penguins and ask them to generate an initial move + the eat or love move

  resetPenguins(session) {

    let turn = this.getTurn();

    this.penguins.forEach(penguin => {

      // First check if the penguin is alive
      if (penguin.isAlive()) {
        penguin.resetPos([session],turn);
      }
    });
  }

  // ramdomly add and remove some swimmig fishes

  addSwims() {

    if (! this.running) {
      return
    }

    let cntSwim = 0;

    for (let i = 0; i < this.sizeH; i++) {
      for (let j = 0; j < this.sizeL; j++) {
        let land = this.territory[i][j];

        if (land.swim())  {
          if (Math.floor(Math.random() * 60) === 0) {
            land.removeSwim();
          } else {
            cntSwim += 1;
          }
        }
      }
    }

    // randomly add some swimming getFishes
    if (cntSwim < 6) {
      let hpos = Math.floor(Math.random() * (this.sizeH -2)) + 1;
      let lpos = Math.floor(Math.random() * (this.sizeL -2)) + 1;
      let land = this.territory[hpos][lpos];

      if (land && land.getType() === 0 ) { // && this.penguins.length < 1) {
        land.addSwim();
      }
    }
  }


  // Makes all the penguins older and react on status returned by penguin
  // if status is 1, then the penguin is dead and a cross is placed
  // if status is 2 and the penguin gender is female, then there is a baby

  makePenguinsOlder() {

    if (! this.running) {
      return
    }

    let l=0,h=0
    let turn = this.getTurnNoUpd();

    this.penguins.forEach(penguin => {
      if (penguin.isAlive()) {
        let status = penguin.makeOlder(this.sessions,turn);

        switch (status.returncode) {
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
              let child = new Penguin(this.numPeng++,h,l,this.sessions,turn,fatherId,motherId);
              this.territory[h][l].addPenguin(child);
              this.penguins.push(child);
            }
            break;
        } // switch

      } // isAlive
    });
  }

  // Changing the weather - this will happen any time between 4 and 12 cycles

  setWeather(session) {

    if (! this.running) {
      return
    }

    // add some random fishes or tiles

    switch (Math.floor(Math.random() * 40
    )) {
      case 0:
        this.addFish();
        break;
      case 1:
        this.addTile();
        break;
    }

    this.weatherCount += 1;
    if (this.weatherCount  >  Math.floor(Math.random() * 20) + 15) {
      let newWeather = this.weather;

      while (newWeather === this.weather) {
        newWeather = Math.floor(Math.random() * 4);
      }

      if (newWeather === 0) {
        this.addFish();
      } else if (newWeather === 1) {
        this.addTile();
      }
      this.weather = newWeather;

      if (debug) {
        console.log("island.js - setWeather : Changing weather to " + this.weather + " (" + weathers[this.weather] + ")");
      }
      this.weatherCount = 0;
    }
  }

  // Returns the weather as a String

  getWeather() {
    return weathers[this.weather];
  }

  // Returns the id of the island

  getId() {
    return this.id;
  }

  // Returns the land size of the island

  getLandSize() {
    return this.landSize;
  }

  // Returns the name of the island

  getName() {
    return this.name;
  }

  // calculate the size and populations of subislands

  calculateNeighbours() {

    let allExplored = [];

    for (let hpos = 1; hpos < this.sizeH - 1; hpos++) {
      for (let lpos = 1; lpos < this.sizeL - 1; lpos++) {
        if (this.territory[hpos][lpos].getType() > 0 && ! allExplored.some(tile => tile.hpos === hpos && tile.lpos === lpos)) {
          let neighbours = this.getNeighbourTiles(0,hpos,lpos,[],[]);
          let pengCnt = 0
          this.penguins.forEach(penguin => {
            pengCnt += penguin.isAlive() && neighbours.some(tile => tile.hpos === penguin.hpos && tile.lpos === penguin.lpos);
          });

          neighbours.forEach(tile => {
            this.territory[tile.hpos][tile.lpos].setIslandSize(neighbours.length);
            this.territory[tile.hpos][tile.lpos].setIslandPopulation(pengCnt);
          })

          allExplored = [...allExplored, ...neighbours];
          if (debug) {
            console.log("penguins.js - calculateNeighbours : tile " + hpos + "/" + lpos + " has " + neighbours.length + " neighbours with " + pengCnt + " penguins");
          }
        }
      }
    }
  }

  // iteratively set up the list of neighbours (tiles > 0) for a tile

  getNeighbourTiles(inc,hpos,lpos,neigbourTiles,exploredTiles) {
    // console.log("exploring " + hpos + "/" + lpos + " " + exploredTiles.length);

    exploredTiles.push({hpos:hpos,lpos:lpos});
    // console.dir(exploredTiles);

    if (this.territory[hpos-1][lpos].getType() > 0 && ! exploredTiles.some(tile => tile.hpos === hpos-1 && tile.lpos === lpos)) {
      exploredTiles = this.getNeighbourTiles(inc++,hpos-1,lpos,[],exploredTiles);
    }
    if (this.territory[hpos+1][lpos].getType() > 0 && ! exploredTiles.some(tile => tile.hpos === hpos+1 && tile.lpos === lpos)) {
      exploredTiles = this.getNeighbourTiles(inc++,hpos+1,lpos,[],exploredTiles);
    }
    if (this.territory[hpos][lpos-1].getType() > 0 && ! exploredTiles.some(tile => tile.hpos === hpos && tile.lpos === lpos-1)) {
      exploredTiles = this.getNeighbourTiles(inc++,hpos,lpos-1,[],exploredTiles);
    }
    if (this.territory[hpos][lpos+1].getType() > 0 && ! exploredTiles.some(tile => tile.hpos === hpos && tile.lpos === lpos+1)) {
      exploredTiles = this.getNeighbourTiles(inc++,hpos,lpos+1,[],exploredTiles);
    }

    return exploredTiles;
  }
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    Island : Island
}
