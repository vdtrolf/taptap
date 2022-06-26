const penguinReq = require("./penguin.js");
const landReq = require("./land.js");
const sessionReq = require("./session.js");
const nameserverReq = require("./nameserver.js");

let Penguin = penguinReq.Penguin;
let Land = landReq.Land;
let Session = sessionReq.Session;
let initiateSessions = sessionReq.initiateSessions;

let islands = [];

let debug = false;

const weathers = ["sun", "rain", "snow", "cold", "endgame"];

class Island {
  constructor(
    sizeH,
    sizeL,
    session,
    debugit,
    id = 0,
    name = "",
    weather = 0,
    weatherCount = 0,
    numPeng = 0,
    tiles = 5,
    landSize = 0,
    fishes = 5,
    points = 0,
    running = true,
    lastInvocation = 0,
    followId = 0
  ) {
    debug = debugit;
    let newIsland = id === 0;

    this.id = id === 0 ? Math.floor(Math.random() * 999999) : id;
    this.name = name === "" ? nameserverReq.getIslandName() : name;
    this.sizeH = sizeH;
    this.sizeL = sizeL;
    this.weather = weather;
    this.weatherCount = weatherCount;
    this.numPeng = numPeng;
    this.tiles = tiles;
    this.landSize = landSize;
    this.fishes = fishes;
    this.points = points;
    this.running = running;
    this.followId = followId;
    this.lastInvocation =
      lastInvocation === 0 ? new Date().getTime() : lastInvocation;
    this.territory = [];
    this.penguins = [];
    this.sessions = session ? [session] : [];

    let matrix = [];

    if (debug) {
      console.log(
        "Island.js : new island : " + this.name + " with id " + this.id
      );
    }

    if (newIsland) {
      // creating a matrix of land objects with a value of 0
      for (let h = 0; h < sizeH; h++) {
        let line = [];
        let lineNum = [];
        for (let l = 0; l < sizeL; l++) {
          line.push(new Land(h, l, debug, this.id));
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
            this.numPeng++,
            hpos,
            lpos,
            this.sessions,
            this.id
          );

          this.penguins.push(penguin);
          pengCnt++;
        }
      }

      addIsland(this);

    }
  } // constructor ()

  // Adds a session to the list of listening sessions

  registerSession(session) {
    if (!this.sessions.find((aSession) => aSession.id === session.id)) {
      this.sessions.push(session);
      if (debug) {
        console.log(
          "island.js - registerSession : session " +
            session.id +
            " registered to island " +
            this.name +
            "/" +
            this.id
        );
      }
    } else {
      console.log(
        "island.js - registerSession : session " +
          session.id +
          " already registered to island " +
          this.name +
          "/" +
          this.id
      );
    }
  }

  // Remove a session from the list of listening sessions

  unregisterSession(session) {
    this.sessions = this.sessions.filter(
      aSession => aSession.id !== session.id
    );
    if (debug) {
      console.log(
        "island.js - unregisterSession : session " +
          session.id +
          " unregistered from island " +
          this.name +
          "/" +
          this.id
      );
    }
  }

  hasSession(sessionId) {
    let foundSession = this.sessions.find(
      (session) => session.id === sessionId
    );
    // probably not necessary
    return foundSession ? true : false;
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
    if (land.checkPenguin()) {
      return true;
    }
    return false;
  }

  getPenguins() {
    return this.penguins;
  }

  getImg(mode, islandH, islandL) {
    let result = [];
    for (let i = 1; i < islandH - 1; i++) {
      for (let j = 1; j < islandL - 1; j++) {
        let id = i + "-" + j;
        let tile =
          this.territory[i][j].getType() +
          "-" +
          this.territory[i][j].getConf() +
          "-" +
          this.territory[i][j].getVar();
        result.push({
          li: i,
          id: id,
          ti: tile,
        });
      }
    }
    return result;
  }

  // returns the list of artifacts
  getArtifacts() {
    let result = ``;
    for (let i = 0; i < this.sizeH; i++) {
      let h = i * 48 + 16; //  + 16;
      for (let j = 0; j < this.sizeL; j++) {
        let l = j * 48 + 16; // + 16 ;
        let land = this.territory[i][j];
        if (land) {
          if (land.hasCross) {
            if (land.type === 0) {
              result += `<img class="cross" src="./tiles/wreath.gif" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
            } else {
              result += `<img class="cross" src="./tiles/cross.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
            }
          } else if (land.hasFish) {
            result += `<img class="fish" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
          } else if (land.hasSwim) {
            let transp = 0.6; // ((Math.floor(Math.random() * 2) / 10))  + 0.3;
            result += `<img class="swim" src="./tiles/fish.png" style="left: ${l}px; top: ${h}px; position: absolute; opacity:${transp}" width="48" height="48" >\n`;
          } else if (land.hasIce) {
            result += `<img class="fish" src="./tiles/ice.png" style="left: ${l}px; top: ${h}px; position: absolute" width="48" height="48">\n`;
          }
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
    this.fishes = 5;
    this.points = 0;
    if (debug) {
      console.log("island.js - reset : Session reset with id " + this.id);
    }
  }

  // Set a tile at a given position

  setTile(hpos, lpos) {
    let land = this.territory[hpos][lpos];
    if (land) {
      if (
        land.getType() == 0 &&
        hpos > 0 &&
        lpos > 0 &&
        hpos < this.sizeH - 1 &&
        lpos < this.sizeL - 1 &&
        this.tiles > 0
      ) {
        land.setIce();
        this.decreaseTiles();
        return true;
      } else if (land.getType() > 0 && this.fishes > 0) {
        land.setFish();
        this.decreaseFishes();
        return true;
      }
    }
    return false;
  }

  // Decrease or increase the amount of ice

  smelt() {
    if (!this.running) {
      return;
    }

    // Randomly decrease some terrain parts
    for (let i = 0; i < this.sizeH * 2; i++) {
      let hpos = Math.floor(Math.random() * (this.sizeH - 1)) + 1;
      let lpos = Math.floor(Math.random() * (this.sizeL - 1)) + 1;
      let land = this.territory[hpos][lpos];

      //console.log("checking " + hpos + "/" + lpos);
      let hasWaterBorders =
        this.territory[hpos - 1][lpos].getType() === 0 ||
        hpos === 11 ||
        this.territory[hpos + 1][lpos].getType() === 0 ||
        this.territory[hpos][lpos - 1].getType() === 0 ||
        this.territory[hpos][lpos + 1].getType() === 0;

      if (this.weather < 2) {
        if (land && land.getType() == 1) {
          if (land.getConf() < 15) {
            land.increaseConf();
          } else {
            land.setType(0);

            let sinkingPenguins = this.penguins.filter(
              (penguin) => penguin.hpos === hpos && penguin.lpos === lpos
            );
            if (sinkingPenguins.length > 0) {
              sinkingPenguins.forEach((penguin) => {
                if (debug) {
                  console.log(
                    `islands.js - smelt : penguin ${penguin.name} sinking at ${hpos}/${lpos}`
                  );
                }
                penguin.letDie(this.sessions);
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
  }

  // Move all the penguins of this island

  movePenguins() {

    // console.log("move " + this.id);

    // check if there are still alive penguins

    let cntPenguins = this.penguins.filter((penguin) => penguin.alive).length;

    if (cntPenguins < 1) {
      this.running = false;
      this.weather = 4;
      if (debug) {
        console.log("island.js - movePenguins : endgame");
      }
    }

    // Remove all istarget flags from the lands

    for (let i = 0; i < this.sizeH; i++) {
      for (let j = 0; j < this.sizeL; j++) {
        if (this.territory[i][j]) this.territory[i][j].setTarget(false);
      }
    }

    // set the target flag if there are penguins erating, fishing or loving

    let alivePenguins = 0;

    this.penguins.forEach((penguin) => {
      if (penguin.alive) {
        alivePenguins++;
        if (penguin.isEating() || penguin.isFishing() || penguin.isLoving()) {
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
        let islandPopulation =
          this.territory[pengH][pengL].getIslandPopulation();

        if (
          !penguin.isEating() &&
          !penguin.isLoving() &&
          !penguin.isFishing()
        ) {
          penguin.getStrategicMap(this);

          // Is the penguin hungry ? Lets see if it can eat or fish

          if (penguin.hungry > 30) {
            // Gonna Eat ?

            if (this.territory[penguin.hpos][penguin.lpos].hasFish) {
              this.territory[pengH][pengL].removeFish();
              penguin.eat(this.sessions);
              this.territory[pengH][pengL].setTarget(true);
              this.addPoints(100);
            }

            // Fishing ?

            let fishmoves = [];

            if (this.territory[pengH][pengL - 1].canFish()) fishmoves.push(1);
            if (this.territory[pengH][pengL + 1].canFish()) fishmoves.push(2);
            if (this.territory[pengH - 1][pengL].canFish()) fishmoves.push(3);
            if (this.territory[pengH + 1][pengL].canFish()) fishmoves.push(4);

            if (penguin.age > 6 && fishmoves.length > 0) {
              let fishmove =
                fishmoves[Math.floor(Math.random() * fishmoves.length)];
              if (debug) {
                console.log(
                  `insland.js movePenguins : ${penguin.name} is going to fish at direction ${fishmove}`
                );
              }

              penguin.fish(this.sessions, fishmove);

              this.territory[pengH][pengL].setTarget(true);

              let swimlpos = fishmove === 1 ? pengL - 1 : pengL;
              swimlpos = fishmove === 2 ? pengL + 1 : swimlpos;
              let swimhpos = fishmove === 3 ? pengH - 1 : pengH;
              swimhpos = fishmove === 4 ? pengH + 1 : swimhpos;
              this.territory[swimhpos][swimlpos].fishSwim();
            }
          } // if hungry > 30
        } // not eating, fishing or loving

        // Gonna love ? Only is there is enough room
        if (
          !penguin.isEating() &&
          !penguin.isLoving() &&
          !penguin.isFishing()
        ) {
          let lover = this.getLover(penguin.gender, pengH, pengL);
          if (lover && penguin.canLove(lover.id)) {
            if (islandPopulation / islandSize > 0.5) {
              console.log(
                `island.js - movePenguins : can't love : sub-island population: ${islandPopulation} size: ${islandSize} = ${
                  islandPopulation / islandSize
                }`
              );
            } else if (alivePenguins >= this.landSize / 5) {
              console.log(
                `island.js - movePenguins : can't love : population: ${alivePenguins} tiles : ${this.landSize}`
              );
            } else {
              penguin.love(this.sessions, lover.id);
              lover.love(this.sessions, this.id);
              this.territory[pengH][pengL].setTarget(true);
              this.addPoints(200);
            } // pop/size > 0.5
          } // if canlove
        } // not eating, fishing or loving

        // No doing anything else - can the penguin move  ?

        if (
          !penguin.isEating() &&
          !penguin.isLoving() &&
          !penguin.isFishing()
        ) {
          if (islandPopulation / islandSize > 0.79) {
            penguin.wait(this.sessions);
            this.territory[pengH][pengL].setTarget(true);
            if (debug) {
              console.log(
                `island.js - movePenguins : on ${this.name} island for ${
                  penguin.name
                } is too crowded (size: ${islandSize} and population: ${islandPopulation} = ${
                  islandPopulation / islandSize
                })`
              );
            }
          } else {
            let move = 0;

            //            0  1  2  3  4  5  6  7  8
            //               l  r  u  d rd ru ld lu
            let lmoves = [0, -1, 1, 0, 0, 1, 1, -1, -1];
            let hmoves = [0, 0, 0, -1, 1, 1, -1, 1, -1];
            let movestxt = ["-", "l", "r", "u", "d", "rd", "ru", "ld", "lu"];

            if (penguin.hasTarget()) {
              let directions = penguin.getDirections();

              if (debug) {
                console.log(
                  "island.js movePenguins penguin " +
                    penguin.id +
                    " at  " +
                    penguin.hpos +
                    "/" +
                    penguin.lpos +
                    " hasTarget : " +
                    directions[0] +
                    "-" +
                    directions[1]
                );
              }

              for (
                let curDir = 0;
                curDir < penguin.getDirections().length && move === 0;
                curDir++
              ) {
                let curmove = directions[curDir];
                if (
                  (curmove === 1 &&
                    this.territory[pengH][pengL - 1].canMove()) ||
                  (curmove === 2 &&
                    this.territory[pengH][pengL + 1].canMove()) ||
                  (curmove === 3 &&
                    this.territory[pengH - 1][pengL].canMove()) ||
                  (curmove === 4 && this.territory[pengH + 1][pengL].canMove())
                )
                  move = curmove;
              }
            }

            let hasOther = this.penguins.some(
              (other) =>
                other.id !== penguin.id &&
                other.hpos === penguin.hpos &&
                other.lpos === penguin.lpos
            );

            // if (hasOther) console.log("has other on " + penguin.hpos + "/" + penguin.lpos);

            if (penguin.wantsSearch() || hasOther) {
              let posmoves = [];
              if (this.territory[pengH][pengL - 1].canMove()) posmoves.push(1);
              if (this.territory[pengH][pengL + 1].canMove()) posmoves.push(2);
              if (this.territory[pengH - 1][pengL].canMove()) posmoves.push(3);
              if (this.territory[pengH + 1][pengL].canMove()) posmoves.push(4);

              // if (Math.floor(Math.random() * 10) === 0 || posmoves.length === 0 ){
              if (posmoves.length === 0) {
                move = 0;
              } else {
                let aPosMove = Math.floor(Math.random() * posmoves.length);
                move = posmoves[aPosMove];
              }
            }

            // No move => wait

            if (move === 0) {
              // if (debug) {console.log(`island.js movePenguin : ${penguin.name} Staying still`)};
              penguin.wait(this.sessions);
              this.territory[pengH][pengL].setTarget(true);
            } else {
              this.addPoints(10);

              let l = penguin.lpos + lmoves[move];
              let h = penguin.hpos + hmoves[move];

              if (this.territory[h][l].getType() > 0) {
                penguin.setPos(this.sessions, move, h, l);
                this.territory[h][l].setTarget(true);
              } else {
                penguin.wait(this.sessions);
                this.territory[h][l].setTarget(true);
              }
            } // is territory > 0
          } // NOT TO CROWDED
        } // not eating, fishing or loving
      } // is penguin alive
    }); // forEach

    for (let penguin of this.penguins) {
      penguin.calculateWealth(this, penguin.hpos, penguin.lpos);
    }
  } // movePenguins()

  // Goes through all the alive penguins and ask them to generate an initial move + the eat or love move

  resetPenguins(session) {
    this.penguins.forEach((penguin) => {
      // First check if the penguin is alive
      if (penguin.alive) {
        penguin.resetPos([session]);
      }
    });
  }

  // ramdomly add and remove some swimmig fishes

  addSwims() {
    if (!this.running) {
      return;
    }

    let cntSwim = 0;

    for (let i = 0; i < this.sizeH; i++) {
      for (let j = 0; j < this.sizeL; j++) {
        let land = this.territory[i][j];

        if (land.swim()) {
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
      let hpos = Math.floor(Math.random() * (this.sizeH - 2)) + 1;
      let lpos = Math.floor(Math.random() * (this.sizeL - 2)) + 1;
      let land = this.territory[hpos][lpos];

      if (land && land.getType() === 0) {
        // && this.penguins.length < 1) {
        land.addSwim();
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
        let status = penguin.makeOlder(this.sessions);

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
                this.numPeng++,
                h,
                l,
                this.sessions,
                fatherId,
                motherId
              );
              this.penguins.push(child);
            }
            break;
        } // switch
      } // alive
    });
  }

  // Changing the weather - this will happen any time between 4 and 12 cycles

  setWeather(session) {
    if (!this.running) {
      return;
    }

    // add some random fishes or tiles

    switch (Math.floor(Math.random() * 40)) {
      case 0:
        this.addFish();
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
        this.addFish();
      } else if (newWeather === 1) {
        this.addTile();
      }
      this.weather = newWeather;

      if (debug) {
        console.log(
          "island.js setWeather : Changing weather to " +
            this.weather +
            " (" +
            weathers[this.weather] +
            ")"
        );
      }
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
}

addIsland = (anIsland) => {
  if (! islands.find((island) => island.id === anIsland.id)) {
    islands.push(anIsland);
  }
}

setIslands = (theIslands) => {
 //  console.log("setting the islands " + theIslands.length);
  islands = theIslands;
};

getIslands = () => {
  return islands;
};

getIsland = (islandId) => {
  return islands.find((island) => island.id === islandId);
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  Island: Island,
  addIsland: addIsland,
  getIsland: getIsland,
  getIslands: getIslands,
  setIslands: setIslands,
};
