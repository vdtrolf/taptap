  // const colors = require('colors/safe')

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;
const LOGINFO = loggerReq.LOGINFO;
const LOGERR = loggerReq.LOGERR;
const LOGTEXT = loggerReq.LOGTEXT;
const LOGDATA = loggerReq.LOGDATA;
const LOGDUMP = loggerReq.LOGDUMP;

const realm = "island";
const source = "island.js";

// imports
const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
const nameserverReq = require("./nameserver.js");
const fishReq = require("./fish.js");
const garbageReq = require("./garbage.js");

let Penguin = penguinReq.Penguin;
let Land = landReq.Land;
let Fish = fishReq.Fish;
let Garbage = garbageReq.Garbage;

let islands = [];

const weathers = ["sun", "rain", "snow", "cold", "endgame"];

class Island {
  constructor(
    sizeH,
    sizeL,
    id = 0,
    name = "",
    year = 2000,
    weather = 0,
    weatherCount = 0,
    temperature = 0.4,
    plasticControl = 0,
    oceanTemperature = 20.3,
    numPeng = 0,
    tiles = 0,
    landSize = 0,
    food = 0,
    points = 0,
    running = true,
    runonce = false,
    lastInvocation = 0,
    followId = 0,
    counter = 0
  ) {
    let newIsland = id === 0;

    this.id = id === 0 ? Math.floor(Math.random() * 999999999) : id;
    this.name = name === "" ? nameserverReq.getIslandName() : name;
    this.sizeH = sizeH;
    this.sizeL = sizeL;
    this.year = year;
    this.weather = weather;
    this.weatherCount = weatherCount;
    this.temperature = temperature;
    this.plasticControl = plasticControl;
    this.oceanTemperature = oceanTemperature; 
    this.numPeng = numPeng;
    this.tiles = tiles;
    this.landSize = landSize;
    this.food = food;
    this.points = points;
    this.running = running;
    this.runonce = runonce;
    this.followId = followId;
    this.counter = counter;

    this.lastInvocation =
      lastInvocation === 0 ? new Date().getTime() : lastInvocation;
    this.territory = [];
    this.penguins = [];
    this.fishes = [];
    this.garbages = [];

    let matrix = [];

    log(realm, source, "new island", this.name + " with id " + this.id);

    if (newIsland) {
      // creating a matrix of land objects with a value of 0
      for (let h = 0; h < sizeH; h++) {
        let line = [];
        let lineNum = [];
        for (let l = 0; l < sizeL; l++) {
          line.push(new Land(h, l, this.id));
          lineNum.push(0);
        }
        this.territory.push(line);
        matrix.push(lineNum);
      }

      // Randomly ceate lands - for this it uses a matfrix of sizeH * sizeL
      let cnt = 0,
        max = sizeH * sizeL;
      for (let i = 0; i < sizeH * sizeL * 40 && cnt < max / 3; i++) {
        let hpos = Math.floor(Math.random() * sizeH) + Math.floor(sizeH / 10);
        let lpos = Math.floor(Math.random() * sizeL) + Math.floor(sizeL / 10);

        if (hpos > 0 && hpos < sizeH - 1 && lpos > 0 && lpos < sizeL - 1) {
          if (i < 10) {
            matrix[hpos][lpos] = 1;
            cnt++;
          } else if (
            matrix[hpos][lpos] === 0 && // only elevate is neighbour = 1
            (matrix[hpos - 1][lpos] === 1 ||
              matrix[hpos][lpos - 1] === 1 ||
              matrix[hpos + 1][lpos] === 1 ||
              matrix[hpos][lpos + 1] === 1)
          ) {
            matrix[hpos][lpos] = 1;
            cnt++;
          }
        }
      }

      // remove lonely land dots (surrended with 3 seas)
      for (let x = 0; x < 2; x++) {
        for (let h = 1; h < sizeH - 1; h++) {
          for (let l = 1; l < sizeL - 1; l++) {
            if (matrix[h][l] === 1) {
              let cnf = 0;
              cnf += matrix[h - 1][l] === 0 ? 1 : 0;
              cnf += matrix[h + 1][l] === 0 ? 2 : 0;
              cnf += matrix[h][l - 1] === 0 ? 4 : 0;
              cnf += matrix[h][l + 1] === 0 ? 8 : 0;
              if (
                cnf === 7 ||
                cnf == 11 ||
                cnf == 13 ||
                cnf == 14 ||
                cnf == 15
              ) {
                matrix[h][l] = 0;
              }
            }
          }
        }
      }

      // remove lonely lakes dots (surrended with 4 lands)
      for (let h = 1; h < sizeH - 1; h++) {
        for (let l = 1; l < sizeL - 1; l++) {
          if (
            matrix[h][l] === 0 &&
            matrix[h - 1][l] === 1 &&
            matrix[h + 1][l] === 1 &&
            matrix[h][l - 1] === 1 &&
            matrix[h][l + 1] === 1
          ) {
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

      // Set initial smelt level - if it is next to a see tile
      // Amount of borders with water will influence how much it is smelt
      for (let l = 1; l < sizeL - 1; l++) {
        for (let h = 1; h < sizeH - 1; h++) {
          if (this.territory[h][l].getType() === 1) {
            let waterBorders = this.territory[h - 1][l].getType() === 0 ? 1 : 0;
            waterBorders += this.territory[h + 1][l].getType() === 0 ? 1 : 0;
            waterBorders += this.territory[h][l - 1].getType() === 0 ? 1 : 0;
            waterBorders += this.territory[h][l + 1].getType() === 0 ? 1 : 0;
            if (waterBorders > 0) {
              this.territory[h][l].setRandomSmeltLevel(waterBorders);
            }
          }
        }
      }

      // calculate the size of the land

      for (let l = 0; l < sizeL; l++) {
        for (let h = 0; h < sizeH; h++) {
          this.landSize += this.territory[h][l].getType() > 0 ? 1 : 0;
        }
      }

      // randomly add some penguins

      let pengNum = Math.floor(Math.random() * 2) + 4;
      let pengCnt = 0;

      while (pengCnt < pengNum) {
        let hpos = Math.floor(Math.random() * this.sizeH);
        let lpos = Math.floor(Math.random() * this.sizeL);
        let land = this.territory[hpos][lpos];

        if (land && land.getType() !== 0) {
          // && this.penguins.length < 1) {
          let penguin = new Penguin(
            0, // this.numPeng++,
            hpos,
            lpos,
            this.id,
          );

          this.penguins.push(penguin);
          pengCnt++;
        }
      }

      // randomly add some garbage

      let garbageNum = Math.floor(Math.random() * 2) + 4;
      let garbageCnt = 0;
      let i=0;

      while (i++ < 10 && garbageCnt < garbageNum) {
        let hpos = Math.floor(Math.random() * this.sizeH);
        let lpos = Math.floor(Math.random() * this.sizeL);
        let land = this.territory[hpos][lpos];

        if ((hpos === 0 || lpos=== 0 || hpos === 11 || lpos=== 11) && land && land.getType() === 0 && ! land.hasGarbage) {
          // && this.penguins.length < 1) {
          let garbage = new Garbage(
            0, // this.numPeng++,
            hpos,
            lpos,
            this.id,
            0
          );

          land.addGarbage();

          this.garbages.push(garbage);
          garbageCnt++;
        }
      }
 
      // randomly add some fishes

      let fishNum = Math.floor(Math.random() * 2) + 4;
      let fishCnt = 0;

      while (fishCnt < fishNum) {
        let hpos = Math.floor(Math.random() * this.sizeH);
        let lpos = Math.floor(Math.random() * this.sizeL);
        let land = this.territory[hpos][lpos];

        if (land && land.getType() === 0 && ! land.hasFish && ! land.hasGarbage) {
          // && this.penguins.length < 1) {
          let fish = new Fish(
            0, // this.numPeng++,
            hpos,
            lpos,
            this.id,
            0
          );
          land.addFish();
          this.fishes.push(fish);
          fishCnt++;
        }
      }
    } // new Island
  } // constructor ()

  addTile() {
    this.tiles += 1;
  }

  addFood() {
    this.food += 1;
  }

  addPoints(points) {
    this.points += points;
  }

  resetPoints() {
    this.points = 0;
  }

  setFollowId(followId) {
    this.followId = followId;
  }

  getLover(gender, hpos, lpos) {
    let lover = this.penguins.find((penguin) => {
      return (
        penguin.hpos === hpos &&
        penguin.lpos === lpos &&
        penguin.gender !== gender &&
        penguin.alive
      );
    });
    return lover;
  }

  getLandType(x, y) {
    const land = this.territory[x][y];
    return land.getType();
  }

  hasPenguin(x, y) {
    const land = this.territory[x][y];
    if (land.hasPenguin()) {
      return true;
    }
    return false;
  }

 getPenguins() {
    return this.penguins;
  } 

  getFishes() {
    return this.fishes;
  } 

  hasFish(x, y) {
    const land = this.territory[x][y];
    if (land.hasFish()) {
      return true;
    }
    return false;
  }

  getFishes() {
    return this.fishes;
  }

  getGarbages() {
    return this.garbages;
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
              this.elev(this.territory[h][l], h, l);
            }
          } catch (error) {
            console.error(
              "island.js - elev : No land at h=" +
                h +
                " / l" +
                l +
                " - " +
                error
            );
          }
        }
      }
    }
    this.territory[hpos][lpos].setLand(height);
  }

  reset() {
    this.tiles = 5;
    this.food = 5;
    this.points = 0;
  }

  // Decrease or increase the amount of ice

  smelt() {
    if (!this.running) {
      return;
    }

    this.year += 0.25;
    this.temperature += 0.00625;
    this.oceanTemperature += 0.01;

    log(realm,source,"smelt","island = " + this.id);

    // Randomly decrease some terrain parts
    for (let i = 0; i < this.sizeH * 2; i++) {
      let hpos = Math.floor(Math.random() * (this.sizeH - 1)) + 1;
      let lpos = Math.floor(Math.random() * (this.sizeL - 1)) + 1;
      let land = this.territory[hpos][lpos];

      // console.log(">>>>" + hpos + " " + lpos);  

      let hasWaterBorders =
        hpos === 11 || lpos === 11 ||
        this.territory[hpos - 1][lpos].getType() === 0 || 
        this.territory[hpos + 1][lpos].getType() === 0 ||
        this.territory[hpos][lpos - 1].getType() === 0 ||
        this.territory[hpos][lpos + 1].getType() === 0;

      if (this.weather < 2) {
        if (land && land.getType() == 1) {
          if (land.getConf() < 15) {
            land.increaseConf();
          } else {
            land.setType(0);

            // Ice sinks and dissapears
            
            if (land.hasIce) {
              land.hasIce = false;
            }  
            
            // If penguins are on the land, they sink

            let sinkingPenguins = this.penguins.filter(
              (penguin) => penguin.hpos === hpos && penguin.lpos === lpos && penguin.alive
            );
            if (sinkingPenguins.length > 0) {
              sinkingPenguins.forEach((penguin) => {
                log(
                  realm,
                  source,
                  "smelt",
                  `penguin ${penguin.name} sinking at ${hpos}/${lpos}`
                );
                penguin.letDie();
              });
              this.territory[hpos][lpos].setCross();
            }
            land.resetConf();
          }
        }
      } else if (this.weather === 2) {
        if (land && land.getType() == 1) {
          if (land.getConf() > 0 && hasWaterBorders) {
            land.decreaseConf();
          }
        }
      }
    }

    // make all land pieces older - check if crosses must be removed

    this.landSize = 0;
    for (let hpos = 0; hpos < this.sizeH; hpos++) {
      for (let lpos = 0; lpos < this.sizeL; lpos++) {
        let land = this.territory[hpos][lpos];
        land.makeOlder();
        this.landSize += this.territory[hpos][lpos].getType() > 0 ? 1 : 0;
      }
    }

    this.fishes = this.fishes.filter((fish) => fish.makeHookOlder());

  }

  // Move all the penguins of this island

  movePenguins() {
    
    //            0  1  2  3  4  5  6  7  8
    //               l  r  u  d rd ru ld lu
    let lmoves = [0, -1, 1, 0, 0, 1, 1, -1, -1];
    let hmoves = [0, 0, 0, -1, 1, 1, -1, 1, -1];
    
    // check if there are still alive penguins

    log(realm, source, "movePenguins", "count for island " + this.id + " = " + this.counter);

    let cntPenguins = this.penguins.filter((penguin) => penguin.alive).length;

    if (cntPenguins < 1) {
      this.running = false;
      this.weather = 4;
      log(realm, source, "movePenguins", "endgame");
    }

    // Remove all istarget flags from the lands

    for (let i = 0; i < this.sizeH; i++) {
      for (let j = 0; j < this.sizeL; j++) {
        if (this.territory[i][j]) {
          this.territory[i][j].isTarget = false;
          this.territory[i][j].hasPenguin = false;
        }
      }
    }

    // set the target flag if there are penguins eating, fishing or loving

    let alivePenguins = 0;

    this.penguins.forEach((penguin) => {
      if (penguin.alive) {
        alivePenguins++;
        if (penguin.isEating() || penguin.isFishing() || penguin.isLoving() || penguin.isDiging()) {
          this.territory[penguin.hpos][penguin.lpos].setTarget(true);
        }
      }
    });

    // for (let penguin of this.penguins) {

    this.penguins.forEach((penguin) => {
      // First check if the penguin is alive
      if (penguin.alive) {
        let pengH = penguin.hpos;
        let pengL = penguin.lpos;

        let islandSize = this.territory[pengH][pengL].getIslandSize();
        let islandPopulation = this.territory[pengH][pengL].getIslandPopulation();
        
        // calculating the target

        const target = penguin.getStrategicMap(this,islandSize,islandPopulation, alivePenguins);
        
        // console.dir(target)
        // No doing anything else - can the penguin move  ?

        if (! target.followUp) {
          switch(target.action) {
            case 0: 
              log(realm, source, "movePenguin",`${penguin.name} Staying still`);
              penguin.wait();
              this.territory[penguin.hpos][penguin.lpos].setTarget(true);
              break;
            case 1:
              let move = 0;
              log(realm,source,"movePenguins","penguin " +
                    penguin.id +
                    " at  " +
                    penguin.hpos +
                    "/" +
                    penguin.lpos +
                    " hasTarget : " +
                    target.directions[0] +
                    "-" +
                    target.directions[1]
                );

              for (let curDir = 0; curDir < target.directions.length && move === 0; curDir++) {
                let curmove = target.directions[curDir];
                if ((curmove === 1 && this.territory[penguin.hpos][penguin.lpos - 1].canMove()) ||
                    (curmove === 2 && this.territory[penguin.hpos][penguin.lpos + 1].canMove()) ||
                    (curmove === 3 && this.territory[penguin.hpos - 1][penguin.lpos].canMove()) ||
                    (curmove === 4 && this.territory[penguin.hpos + 1][penguin.lpos].canMove()))
                    move = curmove;
              }

              // No move => wait
              if (move === 0) {
                log(realm, source, "movePenguin",`${penguin.name} No possible move found`);
                penguin.wait();
                this.territory[penguin.hpos][penguin.lpos].setTarget(true);
              } else {
                this.addPoints(10);

                let l = penguin.lpos + lmoves[move];
                let h = penguin.hpos + hmoves[move];

                if (this.territory[h][l].getType() > 0) {
                  penguin.setPos(move, h, l);
                  this.territory[h][l].setTarget(true);
                } else {
                  penguin.wait();
                  this.territory[penguin.hpos][penguin.lpos].setTarget(true);
                } 
              } // move === 0
              
              break;
            case 3:
              this.territory[penguin.hpos][penguin.lpos].removeFish();
              penguin.eat();
              this.territory[penguin.hpos][penguin.lpos].setTarget(true);
              this.addPoints(100);
              break;
            case 4:
              penguin.love(target.loverId);
              this.territory[penguin.hpos][penguin.lpos].setTarget(true);
              this.addPoints(200);
              break;
            case 7:
              log(realm, source, "movePenguins", `${penguin.name} is going to fish at direction ${target.actionDirection}`);
              penguin.fish(target.actionDirection);
              this.territory[penguin.hpos][penguin.lpos].setTarget(true);
              break;
            case 8:
              log(realm, source, "movePenguins", `${penguin.name} is going to dig at direction ${target.actionDirection}`);
              penguin.dig(target.actionDirection);
              this.territory[penguin.hpos][penguin.lpos].setTarget(true);
              break;
            case 9:

              console.log(`>>>> ${penguin.name} is going to fill at direction ${target.actionDirection}`)

              log(realm, source, "movePenguins", `${penguin.name} is going to fill at direction ${target.actionDirection}`);
              penguin.fill(target.actionDirection);
              this.territory[penguin.hpos][penguin.lpos].setTarget(true);
              break;
            } // switch on target
        } // ! FolloowUp
      } // is penguin alive
    }); // forEach

    // tagging all the lands with a penguin, so they don't receive ice

    this.penguins.forEach((penguin) => {
      if (penguin.alive) {
        this.territory[penguin.hpos][penguin.lpos].setPenguin(true);
      }
    });

    //this.fishes.forEach((fish) => {
    //    this.territory[fish.hpos][fish.lpos].setFish(true);
    //});

    // for (let i = 0; i < this.sizeH; i++) {
    //   for (let j = 0; j < this.sizeL; j++) {
    //     if (this.territory[i][j]) {
    //       if (this.territory[i][j].isTarget) console.log("target " + i + "/" + j);
    //     }
    //   }
    // }


    for (let penguin of this.penguins) {
       penguin.calculateWealth(this, penguin.hpos, penguin.lpos);
    }
    
  } // movePenguins()


  // Move all the penguins of this island

  moveFishes() {
    
    //            0  1  2  3  4  5  6  7  8
    //               l  r  u  d rd ru ld lu
    let lmoves = [0, -1, 1, 0, 0, 1, 1, -1, -1];
    let hmoves = [0, 0, 0, -1, 1, 1, -1, 1, -1];
    
    // check if there are still alive penguins

    log(realm, source, "moveFishes", "count for island " + this.id + " = " + this.counter);

    // Remove all istarget flags from the lands

    for (let i = 0; i < this.sizeH; i++) {
      for (let j = 0; j < this.sizeL; j++) {
        if (this.territory[i][j]) {
          this.territory[i][j].isTarget = false;
          this.territory[i][j].hasFish = false;
          this.territory[i][j].hasGarbage = false;
        }
      }
    }

    // set the target flag if there are penguins eating, fishing or loving

    let aliveFishes = 0;

    this.fishes.forEach((fish) => {
        aliveFishes++;
        this.territory[fish.hpos][fish.lpos].setTarget(true);
    });

    this.garbages.forEach((garbage) => {
      this.territory[garbage.hpos][garbage.lpos].setTarget(true);
      this.territory[garbage.hpos][garbage.lpos].setGarbage(true);
    });

   // randomly add some garbage

   let i=0;

   while (i++ < 3) {
     let hpos = Math.floor(Math.random() * this.sizeH);
     let lpos = Math.floor(Math.random() * this.sizeL);
     let land = this.territory[hpos][lpos];

     if ( land && land.getType() === 0 && ! land.isTarget && 
          // (hpos === 0 || hpos === 11 ||
          //  lpos=== 0 || lpos=== 11 ||
           ((lpos > 0 && this.territory[hpos][lpos - 1].hasGarbage) ||
           ( lpos < 11 && this.territory[hpos][lpos + 1].hasGarbage) ||
           ( hpos > 0 && this.territory[hpos - 1][lpos].hasGarbage) ||
           ( hpos < 11 && this.territory[hpos + 1][lpos].hasGarbage)
           )) {

       let garbage = new Garbage(
         0, // this.numPeng++,
         hpos,
         lpos,
         this.id,
         0
       );

       this.garbages.push(garbage);

       land.addGarbage();
       land.setTarget(true);
     }
   }

   
    this.fishes.forEach((fish) => {
      // First check if the penguin is alive
      let fishH = fish.hpos;
      let fishL = fish.lpos;
      
      // console.dir(target)
      // No doing anything else - can the penguin move  ?

      if (! fish.onHook) {

        let move =0;

        if (fish.staying > 3 + Math.floor(Math.random() * 5)) {

          for (let curDir = 0; curDir < 5 && move === 0; curDir++) {
            let curmove = Math.floor(Math.random() * 4) + 1;
            if ((curmove === 1 && fish.lpos > 0 && this.territory[fish.hpos][fish.lpos - 1].canFishMove()) ||
                (curmove === 2 && fish.lpos < 11 && this.territory[fish.hpos][fish.lpos + 1].canFishMove()) ||
                (curmove === 3 && fish.hpos > 0 && this.territory[fish.hpos - 1][fish.lpos].canFishMove()) ||
                (curmove === 4 && fish.hpos < 11 && this.territory[fish.hpos + 1][fish.lpos].canFishMove()))
                move = curmove;
          }
        }
        // No move => wait
        if (move === 0) {
          log(realm, source, "moveFish",`${fish.num} No move`);
          fish.setDirection(0);
          this.territory[fish.hpos][fish.lpos].setTarget(true);
        } else {
          let l = fish.lpos + lmoves[move];
          let h = fish.hpos + hmoves[move];
            fish.setPos(move, h, l);
            this.territory[h][l].setTarget(true);
        } // move === 0
        fish.increaseStaying();
      } // ! onHook
    }); // forEach

    // Add some fishes ?

    let fishNum = Math.floor(Math.random() * 2) + 4;

    while (aliveFishes < fishNum) {
      let hpos = Math.floor(Math.random() * this.sizeH);
      let lpos = Math.floor(Math.random() * this.sizeL);
      let land = this.territory[hpos][lpos];

      if (land && land.getType() === 0 && ! land.hasTarget) {
        
        let fish = new Fish(
          0, 
          hpos,
          lpos,
          this.id,
          0
        );

        land.addFish();

        this.fishes.push(fish);
        aliveFishes++;
      }
    }



    this.fishes.forEach((fish) => {
       this.territory[fish.hpos][fish.lpos].setFish(true);
    });
    
  } // moveFishes()



  // ramdomly add and remove some fishmig fishes

  addStuff(iceTiles) {
    // if (!this.running) {
    //   return;
    // }

    let cntFish = 0;
    let cntIce = 0;

    for (let i = 0; i < this.sizeH; i++) {
      for (let j = 0; j < this.sizeL; j++) {
        let land = this.territory[i][j];

        if (land.hasIce) {
          cntIce += 1;
        }
      }
    }

    // console.log("----> " + cntFish)

    // randomly add some ice
    if (cntIce < 6) {
      let hpos = Math.floor(Math.random() * (this.sizeH - 2)) + 1;
      let lpos = Math.floor(Math.random() * (this.sizeL - 2)) + 1;
      let land = this.territory[hpos][lpos];

      // console.log("----> " + hpos + "/" +lpos)

      if (land) {
        if ( land.getType() !== 0 && iceTiles && !land.hasPenguin && !land.hasCross && !land.hasFood) {
          land.addIce();
        }
      }
    }
  }

  // Makes all the penguins older and react on status returned by penguin
  // if status is 1, then the penguin is dead and a cross is placed
  // if status is 2 and the penguin gender is female, then there is a baby

  makePenguinsOlder() {
    if (!this.running) {
      return;
    }

    let l = 0,
      h = 0;

    this.penguins.forEach((penguin) => {
      if (penguin.alive) {
        let status = penguin.makeOlder();

        log(
          realm,
          source,
          "makePenguinsOlder",
          "island = " + this.id + " penguin=" + penguin.id
        );

        if (status.newTile && this.tiles < 6) {
          this.tiles++;
        }

        if (status.newFood && this.food < 6) {
          this.food++;
        }

        switch (status.returncode) {
          case 1: // died
            l = penguin.lpos;
            h = penguin.hpos;
            this.territory[h][l].setCross();
            break;
          case 2: // born
            if (penguin.gender === "female") {
              l = penguin.lpos;
              h = penguin.hpos;
              let fatherId =
                penguin.gender === "male" ? penguin.id : penguin.partnerId;
              let motherId =
                penguin.gender === "male" ? penguin.partnerId : penguin.id;
              let child = new Penguin(
                0, // this.numPeng++,
                h,
                l,
                this.id,
                [],
                fatherId,
                motherId
              );
              this.penguins.push(child);
            }
            break;  
          case 3: // filled
            l = status.fillLPos;
            h = status.fillHPos;

            // console.log(">>> Going to fill " + h + "/" + l)

            this.territory[h][l].setLand(1);
            break;
        } // switch
      } // alive
    });
  }

  // Changing the weather - this will happen any time between 4 and 12 cycles

  setWeather() {
    if (!this.running) {
      return;
    }

    log(realm,source,"setWeather","island = " + this.id);

    // add some random food or tiles

    switch (Math.floor(Math.random() * 40)) {
      case 0:
        this.addFood();
        break;
      case 1:
        this.addTile();
        break;
    }

    this.weatherCount += 1;
    if (this.weatherCount > Math.floor(Math.random() * 20) + 15) {
      let newWeather = this.weather;

      while (newWeather === this.weather) {
        newWeather = Math.floor(Math.random() * 4);
      }

      if (newWeather === 0) {
        this.addFood();
      } else if (newWeather === 1) {
        this.addTile();
      }
      this.weather = newWeather;

      log(
        realm,
        source,
        "setWeather",
        "Changing weather to " +
          this.weather +
          " (" +
          weathers[this.weather] +
          ")"
      );

      this.weatherCount = 0;
    }
  }

  // Returns the weather as a String

  getWeather() {
    return weathers[this.weather];
  }

  // calculate the size and populations of subislands

  calculateNeighbours() {
    let allExplored = [];

    for (let hpos = 1; hpos < this.sizeH - 1; hpos++) {
      for (let lpos = 1; lpos < this.sizeL - 1; lpos++) {
        if (
          this.territory[hpos][lpos] &&
          this.territory[hpos][lpos].type > 0 &&
          !allExplored.some((tile) => tile.hpos === hpos && tile.lpos === lpos)
        ) {
          let neighbours = this.getNeighbourTiles(0, hpos, lpos, [], []);
          let pengCnt = 0;
          this.penguins.forEach((penguin) => {
            pengCnt +=
              penguin.alive &&
              neighbours.some(
                (tile) =>
                  tile.hpos === penguin.hpos && tile.lpos === penguin.lpos
              );
          });

          neighbours.forEach((tile) => {
            this.territory[tile.hpos][tile.lpos].setIslandSize(
              neighbours.length
            );
            this.territory[tile.hpos][tile.lpos].setIslandPopulation(pengCnt);
          });

          allExplored = [...allExplored, ...neighbours];
        }
      }
    }
  }

  // iteratively set up the list of neighbours (tiles > 0) for a tile

  getNeighbourTiles(inc, hpos, lpos, neigbourTiles, exploredTiles) {
    exploredTiles.push({ hpos: hpos, lpos: lpos });

    if (
      this.territory[hpos - 1][lpos] &&
      this.territory[hpos - 1][lpos].type > 0 &&
      !exploredTiles.some(
        (tile) => tile.hpos === hpos - 1 && tile.lpos === lpos
      )
    ) {
      exploredTiles = this.getNeighbourTiles(
        inc++,
        hpos - 1,
        lpos,
        [],
        exploredTiles
      );
    }
    if (
      this.territory[hpos + 1][lpos].getType() > 0 &&
      !exploredTiles.some(
        (tile) => tile.hpos === hpos + 1 && tile.lpos === lpos
      )
    ) {
      exploredTiles = this.getNeighbourTiles(
        inc++,
        hpos + 1,
        lpos,
        [],
        exploredTiles
      );
    }
    if (
      this.territory[hpos][lpos - 1].getType() > 0 &&
      !exploredTiles.some(
        (tile) => tile.hpos === hpos && tile.lpos === lpos - 1
      )
    ) {
      exploredTiles = this.getNeighbourTiles(
        inc++,
        hpos,
        lpos - 1,
        [],
        exploredTiles
      );
    }
    if (
      this.territory[hpos][lpos + 1].getType() > 0 &&
      !exploredTiles.some(
        (tile) => tile.hpos === hpos && tile.lpos === lpos + 1
      )
    ) {
      exploredTiles = this.getNeighbourTiles(
        inc++,
        hpos,
        lpos + 1,
        [],
        exploredTiles
      );
    }

    return exploredTiles;
  }

  getAsciiImg() {
    
    let penguinpos = [];
    let fishpos = [];
    const shapes = ["","Fat","Fit","Slim","Lean"]
    const activities = ["","Eating","Fishing","Loving","Diging","Filling"]
    const hunger = ["#####", ".####", "..###", "...##","....#","....."]
    const health = ["-----", "----+", "---++", "--+++","-++++","+++++" ]
    const eyes = ["   "," oo "," ôô "," öö "," @@ "," ©© "," °° "," õõ "," 88 "," 99 "," oo "," oo "]
    const fishEyes = ["    ","><o>","><ô>","><ö>","><@>","><©>","><°>","><õ>","><8>","><9>","><o>","><+>"]
    const actImg = ["(\\/)","(<>)","()/: ","(<3)","()-■","(##)"]
    const acts = ["═╬╬═","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬"];
    const lineNum = ["1","2","3","4","5","6","7","8","9","A","B","C"]
    for (let h = 0; h < this.sizeH; h++) {
      let linep = [];
      let linef = [];
      for (let l = 0; l < this.sizeL; l++) {
        linep.push[0];
        linef.push[0];
      }
      penguinpos.push(linep);
      fishpos.push(linef);
    }

    let top =
      "|" +
      (" " + this.name.toUpperCase() + " (" + this.id + ") " + (this.running?this.counter:"end") + " " + this.points + " pts " + weathers[this.weather] + "                                                     ").substring(
        0,
        this.sizeH * 4
      ) +
      "|";
    let head =
      "+" +
      ("--1---2---3---4---5---6---7---8---9---A---B---C-------------------------------------------").substring(0,this.sizeH * 4) + "+"; 
    let mid =
      "+" +
      ("---------------------------------------------------------------------------------------").substring(0,this.sizeH * 4) + "+"; 
    
    let side = ("---------------------------------------------------------------------------------------").substring(0,this.sizeH * 3 + 1) + "+"; 

      let results = [""];
    results.push(mid + side );
    results.push(top + " PENGUINS                                                             ".substring(0,this.sizeH * 3 + 1) + "|");
    results.push(head + side );

    let penglist = [""];
    let pengCnt = 0;

    let cnt = 0;
    this.penguins.forEach((penguin) => {
      if (penguin.alive) {
        cnt +=1;
        var activity = 0;
        if (penguin.eating > 0) {
          activity = 1;
        } else if (penguin.fishTime > 0) {
          activity = 2;
        } else if (penguin.loving > 0) {
          activity = 3;
        } else if (penguin.digTime > 0) {
          activity = 4;
        } else if (penguin.fillTime > 0) {
          activity = 5;
        }        
        penguinpos[penguin.hpos][penguin.lpos] = cnt;
        var status = penguin.gender.substring(0,1) + "/" + Math.floor(penguin.age) 
        const hungryBar = hunger[Math.floor(penguin.hungry/20)]
        const healthBar = health[Math.floor(penguin.wealth/20)]
        // let line="                                                                 "
        let line = `${eyes[cnt]}${penguin.name} ${status} ${hungryBar} ${healthBar} ${activity > 0? activities[activity]:penguin.strategyShort}                                `
        line = line.substring(0,this.sizeH * 3 ) + ' |';
        acts[cnt] = actImg[activity];
        penglist.push(line);
        pengCnt++;
      }
    });

    let fishlist = [""];
    let fishCnt = 1;

    this.fishes.forEach((fish) => {

      if (fish.onHook) {
        fishpos[fish.hpos][fish.lpos] = 11;
      } else {
        fishpos[fish.hpos][fish.lpos] = fishCnt;;
      }

      let line = ` ${fish.onHook?'<>< ':fishEyes[fishCnt]} h=${fish.hpos} l=${fish.lpos} hook=${fish.hookAge}                                                  `
      line = line.substring(0,this.sizeH * 3 ) + ' |';
      fishlist.push(line);
      fishCnt++;
    })
   
    let lands1 = [
      "    ",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
    ];
    let lands2 = [
      "    ",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
      "::::",
    ];

    let ice1 = [
      "....",
      "....",
      "....",
      "....",
      "....",
      "....",
      "....",
      "....",
      "....",
    ];
    let ice2 = [
      "....",
      "....",
      "....",
      "....",
      "....",
      "....",
      "....",
      "....",
      "....",
    ];
    let iceblock = [
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      "."
    ];

    let curPeng = 1;
    let hasPenguins = true;
    let curFish = 1;
    for (let h = 0; h < this.sizeH; h++) {
      let line1 = lineNum[h];
      let line2 = "|";
      for (let l = 0; l < this.sizeL; l++) {
        if (penguinpos[h][l] > 0) {
          line1 += `${eyes[penguinpos[h][l]]}`;
          line2 += acts[penguinpos[h][l]];
        } else if (fishpos[h][l] > 0) {
          line1 += `${fishEyes[fishpos[h][l]]}`;
          line2 += "    ";
        } else {
          let land = this.territory[h][l];
          if (land.hasFood) {
            if (land.type ==1) {
              let ice = Math.floor(land.conf / 2);
              line1 += "><x>";
              line2 += ice2[ice];
            } else {
              line1 += "><x>";
              line2 += lands2[land.type];
            }    
          } else if (land.hasIce) {
            if (land.type ==1) {
              let ice = Math.floor(land.conf / 2);
              line1 += iceblock[ice] + "╔╗" + iceblock[ice];
              line2 += iceblock[ice] + "╚╝" + iceblock[ice];    
            } else {
              line1 += ":╔╗:";
              line2 += ":╚╝:";
            }    
          } else if (land.isFillTarget) {
            line1 += " /\\ " ;
            line2 += " \\/ " ;    
          } else if (land.hasGarbage) {
            line1 += " °° " ;
            line2 += " °° " ;    
          } else if (land.hasCross) {
            line1 += " ++ ";
            line2 += "(--)";
          } else {
            if (land.type === 1) {
              let ice = Math.floor(land.conf / 2);
              line1 += ice1[ice];
              line2 += ice2[ice];
            } else {
              line1 += lands1[land.type];
              line2 += lands2[land.type];
            }
          }
        }
      }

      if(hasPenguins) {
        if(curPeng <= pengCnt) { 
          results.push(line1 + "|" + penglist[curPeng++]);
        } else if (curPeng++ == pengCnt + 1){
          results.push(line1 + "+" + side );
          hasPenguins=false;
        } else {  
          results.push(line1 + "|" );
        }

        if(curPeng <= pengCnt) { 
          results.push(line2 + "|" + penglist[curPeng++]);
        } else if (curPeng++ == pengCnt + 1){
          results.push(line2 + "+" + side );  
          hasPenguins=false;
        } else {
          results.push(line2 + "|" );
        } 
      } else {
        if(curFish < fishCnt) { 
          results.push(line1 + "|" + fishlist[curFish++]);
        } else if (curFish++ == fishCnt){
          results.push(line1 + "+" + side );
        } else {  
          results.push(line1 + "|" );
        }

        if(curFish < fishCnt) { 
          results.push(line2 + "|" + fishlist[curFish++]);
        } else if (curFish++ == fishCnt){
          results.push(line2 + "+" + side );  
        } else {
          results.push(line2 + "|" );
        }        
      }


    }

    results.push(mid);
    return results;
  }
}

const cleanIslands = () => {
  islands = [];
};

const addIsland = (anIsland) => {
  if (!islands.find((island) => island.id === anIsland.id)) {
    islands.push(anIsland);
  }
};

const setIslands = (theIslands) => {
  islands = theIslands;
};

const getIslands = () => {
  return islands;
};

const getIsland = (islandId) => {
  return islands.find((island) => island.id === islandId);
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  Island: Island,
  cleanIslands: cleanIslands,
  addIsland: addIsland,
  getIsland: getIsland,
  getIslands: getIslands,
  setIslands: setIslands
};