// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGVERB = loggerReq.LOGVERB;
const LOGINFO = loggerReq.LOGINFO;
const LOGERR = loggerReq.LOGERR;
const LOGDATA = loggerReq.LOGDATA;

const realm = "map";
const source = "strategicmap.js";

const deco1 = [" ", ".", "^", "%", "#", "#", "#", "#"];
const moveTypes = [
  "init",
  "move",
  "grow",
  "eat",
  "love",
  "die",
  "still",
  "fish",
  "dig",
  "fill"
];

class StrategicMap {
  constructor(sizeH, sizeL) {
    //this.island = island;
    this.knownWorld = [];
    this.maxH = sizeH;
    this.maxL = sizeL;

    this.strategy = "";
    this.strategyShort = "";
    this.hasTarget = false;
    this.path = [];
    this.targetH = 0;
    this.targetL = 0;
    this.targetDirections = [];
    this.actionDirection = 0;
    this.wantsSearch = false;
    this.followUp = false;
  }
  

  look(
    island,
    centerH,
    centerL,
    penguin,
    alone,
    maxcnt = 5,
    islandSize,
    islandPopulation,
    alivePenguins,
    show = false
  ) {
       

    // console.log("£££ " + show + " " + this.maxL + " " + centerL + " " + penguin.vision)

    const debug=false;
    
    this.strategy = "";
    this.strategyShort = " I am fine";
    this.hasTarget = false;
    this.targetH = 0;
    this.targetL = 0;
    this.target = 0;
    this.action = 0;
    this.actionDirection = 0;
    this.loverId = 0;
    this.wantsSearch = false;

    let curWarm = this.calculateWarm(island,centerH,centerL,penguin.id,show) + 1;
    let curSmelt =
      island.territory[centerH][centerL].getType() !== 1
        ? 1
        : island.territory[centerH][centerL].getConf();

    let foundFish = false;
    let foundFishH = 0;
    let foundFishL = 0;
    let distFish = 99;

    let foundWarm = curWarm;
    let foundWarmH = 0;
    let foundWarmL = 0;
    let distWarm = 99;

    let foundStable = false;
    let foundStableH = 0;
    let foundStableL = 0;
    let distStable = 99;

    let foundIce = false;
    let foundIceH = 0;
    let foundIceL = 0;
    let distIce = 99;
    
    let foundLove = false;
    let foundLoveH = 0;
    let foundLoveL = 0;
    let distLove = 99;

    let foundFill = false;
    let foundFillH = 0;
    let foundFillL = 0;
    let distFill = 99;

    let hasUrgentNeed = false;

    let additionalText = "";

    this.knownWorld = [];

    for (
      let hpos = centerH - penguin.vision;
      hpos <= centerH + penguin.vision;
      hpos++
    ) {
      let hline = [];
      for (
        let lpos = centerL - penguin.vision;
        lpos <= centerL + penguin.vision;
        lpos++
      ) {
        if (hpos > 0 && hpos < this.maxH) {
          if (lpos > 0 && lpos < this.maxL) {
            
            // console.log("££££££ " + penguin.name + " " + hpos + "/" + lpos)
            
            let land = island.territory[hpos][lpos];
            
            // console.log("££££££ +++ " + land.getType() )
            
            if (land.getType() === 0) {
              hline.push({
                hpos: hpos,
                lpos: lpos,
                pos: false,
                food: false,
                stable: false,
                fish: false,
                ice: false,
                fill: false,
                love: false,
                smelt: 0,
                warm: 0,
                art: land.hasFish?3:0
              });

            } else {
              let stable = this.isLandStable(island, hpos, lpos);
              //console.log("££££££ -+- A")
              let fish = this.isLandFish(island, hpos, lpos);
              //console.log("££££££ -+- b")
              let warm = this.calculateWarm(island, hpos, lpos, penguin.id, show) + 1;
              //console.log("££££££ -+- C")
              let ice = this.hasLandIce(island, hpos, lpos,);
              //console.log("££££££ -+- C")
              let fill = this.hasLandFill(island, hpos, lpos,);
              //console.log("££££££ -+- C")
              let love = this.hasLandLove(island, hpos, lpos, penguin.id, penguin.gender);
              //console.log("££££££ -+- D")
              
              //console.log("££££££ -+- " + land.getConf() )
              
              hline.push({
                hpos: hpos,
                pos: lpos,
                pos: true,
                food: land.hasFood,
                stable: stable,
                fish: fish,
                ice:ice,
                love:love,
                fill:fill,
                smelt: land.getConf(),
                warm: warm,
                art: land.hasFood?2:land.hasIce?4:0
              });

              // Is there a fish and is it closer than last foud fish ?

              if (land.hasFood || fish) {
                foundFish = true;
                let dist = Math.abs(centerH - hpos) + Math.abs(centerL - lpos);
                if (dist < distFish) {
                  foundFishH = hpos;
                  foundFishL = lpos;
                  distFish = dist;
                }
              }

              // Is there a warm place is it warmer than last foud warm place ?

              if (warm > foundWarm) {
                foundWarm = warm;
                let dist = Math.abs(centerH - hpos) + Math.abs(centerL - lpos);
                if (dist < distWarm) {
                  foundWarmH = hpos;
                  foundWarmL = lpos;
                  distWarm = dist;
                }
              }

              // Is there a stable place is it closer than last foud stable place?

              if (stable) {
                foundStable = true;
                let dist = Math.abs(centerH - hpos) + Math.abs(centerL - lpos);
                if (dist < distStable) {
                  foundStableH = hpos;
                  foundStableL = lpos;
                  distStable = dist;
                }
              }
              
              // Is there ice somewhere
              
              if (ice) {
                foundIce = true;
                let dist = Math.abs(centerH - hpos) + Math.abs(centerL - lpos);
                if (dist < distIce) {
                  foundIceH = hpos;
                  foundIceL = lpos;
                  distIce= dist;
                }
              }

              // Is there something to build somewhere
              
              if (fill) {
                foundFill = true;
                let dist = Math.abs(centerH - hpos) + Math.abs(centerL - lpos);
                if (dist < distFill) {
                  foundFillH = hpos;
                  foundFillL = lpos;
                  distFill= dist;
                }
              }
              
              // is a loving in the vicinity ?
              
              if (love) {
                foundLove = true;
                let dist = Math.abs(centerH - hpos) + Math.abs(centerL - lpos);
                if (dist < distLove) {
                  foundLoveH = hpos;
                  foundLoveL = lpos;
                  distLove= dist;
                }
              }
              
            }
          } else {
            hline.push({
              hpos: hpos,
              lpos: lpos,
              pos: false,
              food: false,
              stable: false,
              fish: false,
              ice: false,
              fill: false,
              smelt: 0,
              warm: 0,
              art:0
            });
          }
        } else {
          hline.push({
            hpos: hpos,
            lpos: lpos,
            pos: false,
            food: false,
            stable: false,
            fish: false,
            ice: false,
            fill: false,
            smelt: 0,
            warm: 0,
            art:0
          });
        }
      }
      this.knownWorld.push(hline);
    } // for hpos
  
    // console.dir(this.knownWorld)     

    let hasPath = false;
    let fatburnsteps = (100 - penguin.hungry) / (Math.floor(penguin.fat / 3) + 1)

    if (penguin.isLoving()) {
      this.action = 4;
      this.directions = [0,0,0,0];
      this.actionDirection = 0;
      this.strategyShort = " Loving";
      this.followUp = true;
    } else if (penguin.isEating()) {
      this.action = 3;
      this.directions = [0,0,0,0];
      this.actionDirection = 0;
      this.strategyShort = " Eating";
      this.followUp = true;  
    } else if (penguin.isFishing()) {
      this.action = 7;
      this.directions = [0,0,0,0];
      this.actionDirection = 0;
      this.strategyShort = " Fishing";
      this.followUp = true;
    } else if (penguin.isDiging()) {
      this.action = 8;
      this.directions = [0,0,0,0];
      this.actionDirection = 0;
      this.strategyShort = " Diging";
      this.followUp = true;
    } else if (penguin.isFilling()) {
      this.action = 9;
      this.directions = [0,0,0,0];
      this.actionDirection = 0;
      this.strategyShort = " Filling";
      this.followUp = true;
    } else {
     
      // Define the short term strategy
      
      let hasOther = island.penguins.some(
                (other) =>
                  other.id !== penguin.id &&
                  other.hpos === penguin.hpos &&
                  other.lpos === penguin.lpos
              );

      hasUrgentNeed = false;
      
      if (fatburnsteps < 40) { // hungry
      
        if (island.territory[penguin.hpos][penguin.lpos].hasFood) {
          this.strategyShort = " Eating";
          this.action = 3;
        } else if (foundFish) {
        
          if (distFish < 1) {
            let fishmoves = [];

            if (island.territory[penguin.hpos][penguin.lpos - 1].canFish()) fishmoves.push(1);
            if (island.territory[penguin.hpos][penguin.lpos + 1].canFish()) fishmoves.push(2);
            if (island.territory[penguin.hpos - 1][penguin.lpos].canFish()) fishmoves.push(3);
            if (island.territory[penguin.hpos + 1][penguin.lpos].canFish()) fishmoves.push(4);

            if (fishmoves.length > 0) {
              let fishmove = fishmoves[Math.floor(Math.random() * fishmoves.length)];
    
              let fishlpos = fishmove === 1 ? penguin.lpos - 1 : penguin.lpos;
              fishlpos = fishmove === 2 ? penguin.lpos + 1 : fishlpos;
              let fishhpos = fishmove === 3 ? penguin.hpos - 1 : penguin.hpos;
              fishhpos = fishmove === 4 ? penguin.hpos + 1 : fishhpos;

              island.fishes.forEach((fish) => {
                if ( ! fish.onHook && fish.hpos === fishhpos && fish.lpos === fishlpos ){
                  fish.setOnHook(true);
                  this.strategyShort = " Fishing";
                  this.actionDirection = fishmove;
                  this.action = 7;
                }
              });
              
            }
          } else {

            // if (show) console.log(">>>>> " + penguin.name +" To food")

            hasUrgentNeed = true;
            this.strategyShort = " To food";
            this.hasTarget = true;
            this.targetH = foundFishH;
            this.targetL = foundFishL;
          }

        } else if (fatburnsteps < 30) {
          this.strategyShort = " Search food";
          this.wantsSearch = true;
        }    

        // if (show) console.log(">>>>> 000 action: " + this.action + " hasTarget: " + this.hasTarget + " hasUrgentNeed " + hasUrgentNeed)

      }  // hungry 

      // Lets see if there is a filling to be done

      if (penguin.hasIce && this.action === 0 && ! hasUrgentNeed ) { // cold

        if (foundFill) {

          if (distFill < 1) {
            let fillmoves = [];

            if (island.territory[penguin.hpos][penguin.lpos - 1].canFill()) fillmoves.push(1);
            if (island.territory[penguin.hpos][penguin.lpos + 1].canFill()) fillmoves.push(2);
            if (island.territory[penguin.hpos - 1][penguin.lpos].canFill()) fillmoves.push(3);
            if (island.territory[penguin.hpos + 1][penguin.lpos].canFill()) fillmoves.push(4);

            if (fillmoves.length > 0) {
              let fillmove = fillmoves[Math.floor(Math.random() * fillmoves.length)];
    
              let filllpos = fillmove === 1 ? penguin.lpos - 1 : penguin.lpos;
              filllpos = fillmove === 2 ? penguin.lpos + 1 : filllpos;
              let fillhpos = fillmove === 3 ? penguin.hpos - 1 : penguin.hpos;
              fillhpos = fillmove === 4 ? penguin.hpos + 1 : fillhpos;

              island.territory[fillhpos][filllpos].fill();

              this.strategyShort = " Filling";
              this.actionDirection = fillmove;
              this.action = 9;
                            
            }
          } else {

            hasUrgentNeed = true;
            this.strategyShort = " To fill";
            this.hasTarget = true;
            this.targetH = foundFillH;
            this.targetL = foundFillL;
          }
        }      
      } // looking for a fill

      // Lets see if we can find any warmth

      if (this.action === 0 && ! hasUrgentNeed && island.weather > 0 && penguin.wealth < 90) { // cold

        if (foundWarm) {
          hasUrgentNeed = true;
          this.strategyShort = " To warmth";
          this.hasTarget = true;
          this.targetH = foundWarmH;
          this.targetL = foundWarmL;
        } else if (penguin.wealth < 60 && ! this.wantSearch) {
          this.strategyShort = " Search warmth";
          this.wantsSearch = true;
        }      
      } // cold
      
      if (! hasUrgentNeed) {

        // if (show) console.log(">>>>> " + penguin.name +" not urgent")

        // if (this.action===0  && island.weather < 2 && curSmelt > 10) { // unstable
        //   if (foundStable) {
        //     this.strategyShort = " To stable";
        //     this.hasTarget = true;
        //     this.targetH = foundStableH;
        //     this.targetL = foundStableL;
        //   } else if (curSmelt > 12 && ! this.wantSearch) {
        //     this.strategyShort = " Search stable";
        //     this.wantsSearch = true;
        //   }
        // } // unstable
        
        
        if (this.action===0 && alone > 0 && foundLove) { // alone
          
          let lover = island.getLover(penguin.gender, penguin.hpos, penguin.lpos);
          
          if (lover && penguin.canLove(lover.id)) {
            if (islandPopulation / islandSize > 0.5) {
              log(realm,source, "look",
                `can't love : sub-island population: ${islandPopulation} size: ${islandSize} = ${
                islandPopulation / islandSize
              }`);
            } else if (alivePenguins >= this.landSize / 5) {
              log(realm,source,"look",
                  `can't love : population: ${alivePenguins} tiles : ${this.landSize}`);
            } else {      
              lover.love(penguin.id);
              this.loverId = lover.id;  
              this.strategyShort = " Loving";
              this.action = 4;
            } // pop/size > 0.5
          } else if (foundLove && penguin.gender==="male") {
            this.strategyShort = " To love";
            this.hasTarget = true;
            this.targetH = foundLoveH;
            this.targetL = foundLoveL;          
          } else if (! this.wantSearch){
            this.strategyShort = " Search love";
            this.wantsSearch = true; 
          }
        } // alone
        
        if (this.action=== 0  && penguin.age > 6 && ! penguin.hasIce && foundIce) { // no Ice

          if (distIce < 2) {
          
            let icemoves = [];

            if (island.territory[penguin.hpos][penguin.lpos - 1].canDig()) icemoves.push(1);
            if (island.territory[penguin.hpos][penguin.lpos + 1].canDig()) icemoves.push(2);
            if (island.territory[penguin.hpos - 1][penguin.lpos].canDig()) icemoves.push(3);
            if (island.territory[penguin.hpos + 1][penguin.lpos].canDig()) icemoves.push(4);

            if (icemoves.length > 0) {
              let icemove = icemoves[Math.floor(Math.random() * icemoves.length)];

              let icelpos = icemove === 1 ? penguin.lpos - 1 : penguin.lpos;
              icelpos = icemove === 2 ? penguin.lpos + 1 : icelpos;
              let icehpos = icemove === 3 ? penguin.hpos - 1 : penguin.hpos;
              icehpos = icemove === 4 ? penguin.hpos + 1 : icehpos;
              island.territory[icehpos][icelpos].iceDig();
              this.strategyShort = " Diging";
              this.actionDirection = icemove;
              this.action = 8;
            }
          } else  {
            this.strategyShort = " To ice";
            this.hasTarget = true;
            this.targetH = foundIceH;
            this.targetL = foundIceL;
          } 
        } // no Ice
      
      }
      // let hasPath = false;

      // if (show) console.log(">> action: " + this.action + " hasTarget " + this.hasTarget + " urgent " +  hasUrgentNeed + " " + this.strategyShort);

      
      if (this.action === 0) {
        
        if (false) { // { islandPopulation / islandSize > 0.79) {
          log(realm, source, "movePenguins",
                `on ${island.name} island for ${penguin.name} is too crowded (size: ${islandSize} and population: ${islandPopulation} = ${islandPopulation / islandSize})`);   
        
        } else {
        
          if (this.hasTarget) {
            
            hasPath = findPath(
              island,
              centerH,
              centerL,
              this.targetH,
              this.targetL,
              this.path,
              show && debug,
              maxcnt
            );
          
            if (hasPath) {
              this.action = 1;
            } 

            // else if (this.targetH && penguin.hasIce) { // Filling for Path 

            //   // if (show) console.log(penguin.name + " (" + this.strategyShort + ") Looking for filling at " + penguin.hpos + "/" + penguin.lpos + " to " + this.targetH + "/" + this.targetL   );

            //   let posmoves = [];
            //   if (this.targetL > penguin.lpos && island.territory[penguin.hpos][penguin.lpos + 1].getType() === 0) posmoves.push(2);
            //   if (this.targetL < penguin.lpos && island.territory[penguin.hpos][penguin.lpos - 1].getType() === 0) posmoves.push(1);
            //   if (this.targetH > penguin.hpos && island.territory[penguin.hpos + 1][penguin.lpos].getType() === 0) posmoves.push(4);
            //   if (this.targetH < penguin.hpos && island.territory[penguin.hpos - 1][penguin.lpos].getType() === 0) posmoves.push(3);
 
            //   if (posmoves.length > 0) {
            //     let aPosMove = Math.floor(Math.random() * posmoves.length);

            //     // if (show) console.log("Found filling to " + posmoves[aPosMove]) ;

            //     this.strategyShort = " Filling (for path)";
            //     this.actionDirection = posmoves[aPosMove] ;
            //     this.action = 9;
            //   } else {
            //     let posmoves = [];
            //     if (this.targetL < penguin.lpos && island.territory[penguin.hpos][penguin.lpos - 1].canMove()) posmoves.push({dir:1, posH: penguin.hpos, posL: penguin.lpos -1 });
            //     if (this.targetL > penguin.lpos && island.territory[penguin.hpos][penguin.lpos + 1].canMove()) posmoves.push({dir:2, posH: penguin.hpos, posL: penguin.lpos +1 });
            //     if (this.targetH < penguin.hpos && island.territory[penguin.hpos - 1][penguin.lpos].canMove()) posmoves.push({dir:3, posH: penguin.hpos -1, posL: penguin.lpos });
            //     if (this.targetH > penguin.hpos && island.territory[penguin.hpos + 1][penguin.lpos].canMove()) posmoves.push({dir:4, posH: penguin.hpos +1, posL: penguin.lpos });

            //     if (posmoves.length > 0) {
            //       let aPosMove = Math.floor(Math.random() * posmoves.length);

            //       // if (show) console.log( penguin.name + " Found pre-filling to " + posmoves[aPosMove].dir);

            //       this.path.push(posmoves[aPosMove]);
            //       this.action = 1;
            //       hasPath = true;
            //     }

            //   }
            // }

          } else if (this.wantsSearch || hasOther) {
            
            let posmoves = [];
            if (island.territory[penguin.hpos][penguin.lpos - 1].canMove()) posmoves.push({dir:1, posH: penguin.hpos, posL: penguin.lpos -1 });
            if (island.territory[penguin.hpos][penguin.lpos + 1].canMove()) posmoves.push({dir:2, posH: penguin.hpos, posL: penguin.lpos +1 });
            if (island.territory[penguin.hpos - 1][penguin.lpos].canMove()) posmoves.push({dir:3, posH: penguin.hpos -1, posL: penguin.lpos });
            if (island.territory[penguin.hpos + 1][penguin.lpos].canMove()) posmoves.push({dir:4, posH: penguin.hpos +1, posL: penguin.lpos });

            if (posmoves.length > 0) {
              let aPosMove = Math.floor(Math.random() * posmoves.length);
              this.path.push(posmoves[aPosMove]);
              this.action = 1;
              hasPath = true;
            }
            
          }
        }
      }
      
      // calculating the directions  
      
      if (hasPath && this.path.length > 0) {
        let targetLand = null;
        switch (this.path[this.path.length - 1].dir) {
          case 1:
            this.targetDirections = [1, 3, 4, 2];
            targetLand = island.territory[penguin.hpos][penguin.lpos - 1]
            break;
          case 2:
            this.targetDirections = [2, 4, 3, 1];
            targetLand = island.territory[penguin.hpos][penguin.lpos + 1]
            break;
          case 3:
            this.targetDirections = [3, 1, 2, 4];
            targetLand = island.territory[penguin.hpos - 1][penguin.lpos]
            break;
          case 4:
            this.targetDirections = [4, 2, 1, 3];
            targetLand = island.territory[penguin.hpos + 1][penguin.lpos]
            break;
        }

      } else {
        this.targetDirections.push(0, 0, 0, 0);
        
        this.hasTarget = false;      
      }
    }
    if (show) {
      
      if (debug) {
        this.path.forEach((step) =>
        console.log( hasPath + " step to dir " + step.dir + " at " + step.posH + "/" + step.posL ));
      }

      let iceblock = [
        "▓",
        "▓",
        "▒",
        "▒",
        "░",
        "░",
        "-",
        "-",
        "."
      ];

      let cntline = 0;
      let ruler = "---" + centerL + "---";
      // for(let i=centerL-3;i<centerL+4;i++) ruler+=i>0&&i<11?i%10:"-";
      
      console.log(
        "+" +
          ruler.substring(3-penguin.vision, penguin.vision * 2 + (4 - penguin.vision)) +
          "+ +" +
          ruler.substring(3-penguin.vision, penguin.vision * 2 + (4 - penguin.vision)) +
          "+ +" +
          ruler.substring(3-penguin.vision, penguin.vision * 2 + (4 - penguin.vision)) +
          "+ " +
          penguin.name +
          "(" +
          penguin.age +
          ") Pos: " +
          centerH +
          "/" +
          centerL + 
          " ! : " +
          hasUrgentNeed

      );
      
      this.knownWorld.forEach((line) => {
        
        let txt = cntline===penguin.vision?centerH%10:"|";
        line.forEach((cell) => {
          let celltxt = " ";
          if (cell.pos) celltxt = iceblock[Math.floor(cell.smelt / 2)];
          if (cell.stable) celltxt = "▓";
          txt += celltxt;
        });
        txt += "| |";
        line.forEach((cell) => {
          let celltxt = " ";
          if (cell.pos || cell.stable) celltxt = ".";
          if (cell.fish) celltxt = "~";
          if (cell.food) celltxt = "@";
          if (cell.fill) celltxt = "#";
          // if (cell.ice) celltxt = "^";
          if (cell.love) celltxt = "&";
          txt += celltxt;
        });
        txt += "| |";
        line.forEach((cell) => {
          let celltxt = " ";
          if (cell.pos) celltxt = cell.warm>0?cell.warm:".";
          txt += celltxt;
        });
        txt += "|";


        switch (cntline++) {
          case 0:
            txt += " Hungry: " + penguin.hungry + " (" + fatburnsteps + ")";
            if (foundFish)
              txt += " - Found fish at " + foundFishH + "/" + foundFishL + " (" + distFish + ")";
            break;
          case 1:
            txt += " Smelt : " + curSmelt;
            if (foundStable)
              txt +=
                " - More stable at " + foundStableH + "/" + foundStableL ;
            break;
          case 2:
            txt += " Warmth: " + penguin.wealth + " (" + curWarm + ")";
            if (foundWarmH > 0)
              txt +=
                " - Warmer (" +
                foundWarm +
                ") at " +
                foundWarmH +
                "/" +
                foundWarmL;
            break;
          case 3:
            txt += " Has ice: " + (penguin.hasIce?"yes":"no");
            if (!penguin.hasIce && foundIce)
              txt +=
                " - Found ice (^) at " +
                foundIceH +
                "/" +
                foundIceL;
            break;  
          case 4:
            if (penguin.hasIce && foundFill)
              txt +=
                " - Found fill (#) at " +
                foundFillH +
                "/" +
                foundFillL;
            break;  
          case 5:
            txt += " Alone : " + 
                    (alone?"yes":"no");
            if (alone && foundLove)
              txt +=
                " - Found love (&) at " +
                foundLoveH +
                "/" +
                foundLoveL;
            break;  
          case 6:
            txt += this.strategyShort;
            if (this.hasTarget && this.path.length > 0) {
              txt += " path : ";
              this.path
                .reverse()
                .forEach(
                  (step) =>
                    (txt += + step.posH + "/" + step.posL + " ")
                );
            }
            break;
        }
        console.log(txt);
      });
      console.log(
        "+" +
          "--------".substring(0, penguin.vision * 2 + 1) +
          "+ +" +
          "--------".substring(0, penguin.vision * 2 + 1) +
          "+ +" +
          "--------".substring(  0, penguin.vision * 2 + 1) +
          "+"
      );
    } // show
    
    let resultTarget = {action: this.action, 
                        actionDirection: this.actionDirection, 
                        directions: this.targetDirections, 
                        loverId: this.loverId, 
                        strategyShort: this.strategyShort,
                        followUp: this.followUp,
                        targetH: this.targetH,
                        targetL: this.targetL,
                        path: this.path}
    
    // if (show) console.dir(resultTarget);
    
    return resultTarget;
  }

  // A land is stable if it's made from stone or if circled by ice

  isLandStable(island, hpos, lpos) {
    return (
      island.territory[hpos][lpos].getType() > 1 ||
      (island.territory[hpos - 1][lpos].getType() > 0 &&
        island.territory[hpos + 1][lpos].getType() > 0 &&
        island.territory[hpos][lpos - 1].getType() > 0 &&
        island.territory[hpos][lpos + 1].getType() > 0)
    );
  }

  // A land has a fish if there is a fish in the neighbour tiles

  isLandFish(island, hpos, lpos) {
    let hasFish = false;
    if (island) {     
      island.fishes.forEach((fish) => {
        if ( ! fish.onHook && (
          fish.hpos === hpos && fish.lpos === lpos - 1 ||
          fish.hpos === hpos && fish.lpos === lpos + 1 ||
          fish.hpos === hpos - 1 && fish.lpos === lpos ||
          fish.hpos === hpos + 1 && fish.lpos === lpos )) {
            hasFish = true;
        }
      });
    }
    return hasFish;
  }

  // A land has a ice if there is ice in the neighbour tiles

  hasLandIce(island, hpos, lpos) {
    return (
      island.territory[hpos - 1][lpos].hasIce ||
      island.territory[hpos + 1][lpos].hasIce ||
      island.territory[hpos][lpos - 1].hasIce ||
      island.territory[hpos][lpos + 1].hasIce
    );
  }

  // A land has a built if there is a buildTarget in the neighbour tiles

  hasLandFill(island, hpos, lpos) {
    return (
      island.territory[hpos - 1][lpos].isFillTarget ||
      island.territory[hpos + 1][lpos].isFillTarget ||
      island.territory[hpos][lpos - 1].isFillTarget ||
      island.territory[hpos][lpos + 1].isFillTarget
    );
  }  

  // A land has love if there is a lovable in de vicinity 

  hasLandLove(island, hpos, lpos, id, gender) {
    let hasLove = false;
    if (island && id) {
      
      island.penguins.forEach((penguin) => {
        if (penguin.alive && penguin.id !== id && penguin.canLove(id,gender)) {
          if (penguin.hpos === hpos && penguin.lpos === lpos) {
            hasLove = true;
          }
        }
      });
    }
    return hasLove;
  }

  // calculate the warmth of a given tile based on the proximity of other penguins

  calculateWarm(island, hpos, lpos, id, show = false) {
    if (island && id) {
      let neighbours = 0;
      island.penguins.forEach((penguin) => {
        if (penguin.alive && penguin.id !== id) {
          if (
            (penguin.hpos === hpos &&
              (penguin.lpos === lpos - 1 || penguin.lpos === lpos + 1)) ||
            (penguin.lpos === lpos &&
              (penguin.hpos === hpos - 1 || penguin.hpos === hpos + 1))
          ) {
            neighbours += 1;
          }
        }
      });
      if (neighbours < 1) {
        return -1;
      } else if (neighbours > 1) {
        return 1;
      }
      return 0;
    }
    return 0;
  }

  getKnownWorld() {
    let knownWorld = [];
    let lineNum = 0;

    this.knownWorld.forEach((line) => {
      lineNum++;
      let colNum = 0;
      line.forEach((cell) => {
        colNum++;
        let soil = cell.pos ? Math.floor(cell.smelt / 2) : 0;
        let artifact = 0;
        if (cell.stable && cell.art < 2) {
          artifact = 1
        } else {
          artifact = cell.art;
        }
        let warm = cell.pos ? cell.warm : 0;

        knownWorld.push({
          line: lineNum,
          col: colNum,
          soil: soil,
          art: artifact,
          warm: warm,
        });
      });
    });

    return knownWorld;
  }

  getStrategyShort() {
    return this.strategyShort
  }

}

//  setting directions
// 1  2  3  4  5  6  7  8
// l  r  u  d rd ru ld lu

const findPath = (
  island,
  curH,
  curL,
  targetH,
  targetL,
  path,
  show,
  maxcnt = 5,
  cnt = 0,
  visited = []
) => {
  if (++cnt > maxcnt) return false;

  visited.push({ hpos: curH, lpos: curL });

  let movesH = [0, 0, 0, -1, 1];
  let movesL = [0, -1, 1, 0, 0];
  let dirs = [];
  let deltaH = targetH - curH;
  let deltaL = targetL - curL;
  if (deltaH !== 0 || deltaL !== 0) {
    if (deltaH === 0 && deltaL !== 0) {
      dirs = deltaL < 0 ? [1, 3, 4, 2] : [2, 4, 3, 1];
    } else if (deltaH !== 0 && deltaL !== 0) {
      dirs.push(deltaH < 0 ? 3 : 4);
      dirs.push(deltaL < 0 ? 2 : 1);
      dirs.push(deltaL < 0 ? 1 : 2);
      dirs.push(deltaH < 0 ? 4 : 3);
    } else if (deltaH !== 0 && deltaL === 0) {
      dirs = deltaH < 0 ? [3, 1, 2, 4] : [4, 2, 1, 3];
    }
    let foundMov = false,
      cntdir = 0;
    for (let dir of dirs) {
      let movH = curH + movesH[dir];
      let movL = curL + movesL[dir];
      if (movH > 0 && movH < island.sizeH && movL > 0 && movL < island.sizeL) {
        let land = island.territory[movH][movL];
        if (show) {
          if (
            land.getType() > 0 &&
            !land.hasCross &&
            !land.hasIce &&
            !visited.some((vland) => vland.hpos === movH && vland.lpos === movL)
          ) {
            console.log(
              "findPath (" +
                cnt +
                "-" +
                ++cntdir +
                ") " +
                targetH +
                "/" +
                targetL +
                " from " +
                curH +
                "/" +
                curL +
                " to " +
                movH +
                "/" +
                movL +
                " dir " +
                dir +
                " => " +
                (land.getType() > 0 ? "~ " : "= ") +
                (land.hasCross ? "+" : "_")
            );
          }
        }
        if (
          land.getType() > 0 &&
          !land.hasCross &&
          !visited.some(
            (vland) => vland.hpos === movH && vland.lpos === movL
          ) &&
          findPath(
            island,
            movH,
            movL,
            targetH,
            targetL,
            path,
            show,
            maxcnt,
            cnt,
            visited
          )
        ) {
          path.push({ dir: dir, posH: movH, posL: movL });

          foundMov = true;
          break;
        }
      }
    }
    return foundMov;
  } else {
    return true;
  }
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  StrategicMap: StrategicMap,
};