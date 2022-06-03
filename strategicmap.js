const deco1 = [" ",".","^","%","#","#","#","#"];

class StrategicMap {
  constructor(sizeH,sizeL) {
    //this.island = island;
    this.knownWorld = [];
    this.maxH = sizeH;
    this.maxL = sizeL;

    this.strategy = "";
    this.strategyShort = "";
    this.hasTarget = false;
    this.targetH = 0;
    this.targetL = 0;
    this.targetDirections = [0,0,0,0];
    this.wantsSearch = false;
  }

  look = (island,centerH,centerL,viewLength,hungry,wealth,name,show=false) => {

    this.strategy = "";
    this.strategyShort = " I am fine";
    this.hasTarget = false;
    this.targetH = 0;
    this.targetL = 0;
    this.wantsSearch = false;

    let curFish = island.territory[centerH][centerL].hasFish;
    let curStable = this.isLandStable(island,centerH,centerL);
    let curSwim = this.isLandSwim(island,centerH,centerL);
    let curWarm = this.calculateWarm(island,centerH,centerL) + 1;
    let curSmelt = island.territory[centerH][centerL].getType() !== 1?1:island.territory[centerH][centerL].getConf();

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


    this.knownWorld = [];
    for (let hpos = centerH - viewLength; hpos <= centerH + viewLength; hpos++ ) {
      let hline = [];
      for (let lpos = centerL - viewLength; lpos <= centerL + viewLength; lpos++) {

        if (hpos > 0 && hpos < this.maxH) {
          if (lpos > 0 && lpos < this.maxL) {
            let land = island.territory[hpos][lpos];
            // console.log(hpos + " " + lpos + " " + land.getType());
            if (land.getType() === 0) {
              hline.push({hpos:hpos,lpos:lpos,pos:false,fish:false,stable:false,swim:false,smelt:0, warm:0 });
            } else {

              let stable = this.isLandStable(island,hpos,lpos);
              let swim = this.isLandSwim(island,hpos,lpos);
              let warm = this.calculateWarm(island,hpos,lpos) + 1;



              hline.push({hpos:hpos,
                pos:lpos,
                pos:true,
                fish:land.hasFish,
                stable: stable,
                swim: swim,
                smelt: island.territory[hpos][lpos].getConf(),
                warm: warm });

              // Is there a fish and is it closer than last foud fish ?

              if (land.hasFish || swim ) {
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
                  distWarm= dist;
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


            }
          } else {
            hline.push({hpos:hpos,lpos:lpos,pos:false,fish:false,stable:false,swim:false, smelt: 0,warm:0});
          }
        } else {
          hline.push({hpos:hpos,lpos:lpos,pos:false,fish:false,stable:false,swim:false, smelt:0,warm:0});
        }
      }
      this.knownWorld.push(hline);
    }



    // select a strategy

    if ((hungry > 60 && foundFish) || hungry > 80) {
      if (foundFish) {
        this.strategyShort = " go to food";
      this.hasTarget = true;
        this.targetH = foundFishH;
        this.targetL = foundFishL;
      } else if (hungry > 60) {
        this.strategyShort = " search food";
        this.wantsSearch = true;
      }
    } else if ((curSmelt > 8 && foundStable) || curSmelt > 12) {
      if (foundStable) {
        this.strategyShort = " go to stability";
        this.hasTarget = true;
        this.targetH = foundStableH;
        this.targetL = foundStableL;
      } else  if (curSmelt >12) {
        this.strategyShort = " search stability";
        this.wantsSearch = true;
      }
    } else if ((wealth < 40 && foundWarm > curWarm) || wealth < 20) {
      if (foundWarm) {
        this.strategyShort = " go to warmth";
        this.hasTarget = true;
        this.targetH = foundWarmH;
        this.targetL = foundWarmL;
      } else if (wealth > 70 ) {
        this.strategyShort = " search warmth";
        this.wantsSearch = true;
      }
    }

    //  setting directions
    // 1  2  3  4  5  6  7  8
    // l  r  u  d rd ru ld lu

    if (this.hasTarget) {
      this.targetDirections = [];
      let deltaH = this.targetH - centerH;
      let deltaL = this.targetL - centerL;
      if (deltaH !== 0 || deltaL !== 0) {
        if (deltaH === 0 && deltaL !== 0) {
          this.targetDirections.push(deltaL < 0 ? 1: 2 );
          this.targetDirections.push(deltaL < 0 ? 2: 1 );
          this.targetDirections.push(0);
          this.targetDirections.push(0);
        } else if (deltaH !== 0 && deltaL !== 0) {
          this.targetDirections.push(deltaH < 0 ? 3: 4 );
          this.targetDirections.push(deltaL < 0 ? 1: 2 );
          this.targetDirections.push(deltaL < 0 ? 2: 1 );
          this.targetDirections.push(0);
        } else if (deltaH !== 0 && deltaL === 0) {
          this.targetDirections.push(deltaH < 0 ? 3: 4 );
          this.targetDirections.push(deltaH < 0 ? 4: 3 );
          this.targetDirections.push(0);
          this.targetDirections.push(0);
        }
      } else {
        this.targetDirections.push(0,0,0,0);
        this.hasTarget = false;
      }
    }


    if (show) {

      let cntline = 0;
      console.log("+" + "--------".substring(0,(viewLength * 2) +1) + "+ +" + "--------".substring(0,(viewLength * 2) +1) + "+")
      this.knownWorld.forEach(line => {
        let txt = "|";
        line.forEach(cell => {
          let celltxt = " ";
          if (cell.pos ) celltxt = Math.floor(cell.smelt /2);
          if (cell.stable ) celltxt = "=";
          if (cell.swim ) celltxt = "~";
          if (cell.fish ) celltxt = "@";
          txt += celltxt;
        });
        txt += "| |";
        line.forEach(cell => {
          let celltxt = " ";
          if (cell.pos ) celltxt = cell.warm;
          txt += celltxt;
        });
        txt += "|";

        switch (cntline++) {
          case 0:
            txt += " " + name + " Pos: " + centerH + "/" + centerL + " wealth: " + wealth;
            break;
          case 1:
            txt += " Hungry = " + hungry;
            if (foundFish) txt += " Found fish at (" + foundFishH + "/" + foundFishL + ")";
            break;
          case 2:
            txt += " Stable = " + curSmelt;
            if (foundStable) txt += " Found stable at (" + foundStableH + "/" + foundStableL + ")";
            break;
          case 3:
              txt += " Warm = " + curWarm;
              if (foundWarm > 0) txt += " Found warm " + foundWarm+ " at (" + foundWarmH + "/" + foundWarmL + ")";
            break;
          case 4:
            txt += this.strategyShort;
            if (this.hasTarget) txt += " target: " + this.targetDirections[0] + "-" + this.targetDirections[1] + "-" + this.targetDirections[2] + "-" + this.targetDirections[3];
            break;
        }
        console.log(txt);
      })
      console.log("+" + "--------".substring(0,(viewLength * 2) +1) + "+ +" + "--------".substring(0,(viewLength * 2) +1) + "+");

    }

    return this.strategyShort;

  }


  // A land is stable if it's made from stone or if circled by ice

  isLandStable(island,hpos,lpos) {
    return island.territory[hpos][lpos].getType() > 1 ||
    (island.territory[hpos-1][lpos].getType() > 0
      && island.territory[hpos+1][lpos].getType() > 0
      && island.territory[hpos][lpos-1].getType() > 0
      && island.territory[hpos][lpos+1].getType() > 0 );
  }

  // A land has a swim if there is a fish in the neighbour tiles

  isLandSwim(island,hpos,lpos) {
    return island.territory[hpos-1][lpos].hasSwim
      || island.territory[hpos+1][lpos].hasSwim
      || island.territory[hpos][lpos-1].hasSwim
      || island.territory[hpos][lpos+1].hasSwim;
  }

  calculateWarm(island,hpos,lpos) {
    if (island) {
      let neighbours = 0;

      island.penguins.forEach(penguin => {
        if (( penguin.hpos == hpos && (penguin.lpos === lpos -1 || penguin.lpos === lpos + 11))
          || ( penguin.lpos == lpos && (penguin.hpos === hpos -1 || penguin.hpos === hpos + 11))) {
        neighbours += 1;
        }
      });

    //if (neighbours > 1)
    // console.log(neighbours +" neighbours");

      if (neighbours < 1) {
        return -1
      } else if (neighbours > 1) {
        return 1
      }
      return 0;
    }
    return 1;
  }

}

class knownLand {



}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    StrategicMap: StrategicMap
}
