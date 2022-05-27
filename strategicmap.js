const deco1 = [" ",".","^","%","#","#","#","#"];

class StrategicMap {
  constructor(island) {
    this.island = island;
    this.knownWorld = [];
    this.maxH = island.sizeH;

    this.maxL = island.sizeL;
  }

  look = (centerH,centerL,viewLength,hunger,wealth) => {
    this.knownWorld = [];
    for (let hpos = centerH - viewLength; hpos <= centerH + viewLength; hpos++ ) {
      let hline = [];
      for (let lpos = centerL - viewLength; lpos <= centerL + viewLength; lpos++) {

        if (hpos > 0 && hpos < this.maxH) {
          if (lpos > 0 && lpos < this.maxL) {
            let land = this.island.territory[hpos][lpos];
            // console.log(hpos + " " + lpos + " " + land.getType());
            if (land.getType() === 0) {
              hline.push({hpos:hpos,lpos:lpos,pos:false,fish:false,stable:false,swim:false,smelt:0});
            } else {
              hline.push({hpos:hpos,lpos:lpos,pos:true,fish:land.hasFish, stable: this.isLandStable(hpos,lpos),swim: this.isLandSwim(hpos,lpos), smelt: this.island.territory[hpos][lpos].getConf()});
            }
          } else {
            hline.push({hpos:hpos,lpos:lpos,pos:false,fish:false,stable:false,swim:false, smelt: 0});
          }
        } else {
          hline.push({hpos:hpos,lpos:lpos,pos:false,fish:false,stable:false,swim:false, smelt:0});
        }
      }
      this.knownWorld.push(hline);
    }
    
    let curFish = this.island.territory[centerH][centerL].hasFish;
    let curStable = this.isLandStable(centerH,centerL);
    let curSwim = this.isLandSwim(centerH,centerL);
    
    console.log()
    
    
    console.log("+" + "--------".substring(0,(viewLength * 2) +1) + "+");
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
      console.log(txt + "|");
    })
    console.log("+" + "--------".substring(0,(viewLength * 2) +1) + "+");
  
  
  
  
  }

  // A land is stable if it's made from stone or if circled by ice

  isLandStable(hpos,lpos) {
    return this.island.territory[hpos][lpos].getType() > 1 ||
    (this.island.territory[hpos-1][lpos].getType() > 0
      && this.island.territory[hpos+1][lpos].getType() > 0
      && this.island.territory[hpos][lpos-1].getType() > 0
      && this.island.territory[hpos][lpos+1].getType() > 0 );
  }

  // A land has a swim if there is a fish in the neighbour tiles

  isLandSwim(hpos,lpos) {
    return this.island.territory[hpos-1][lpos].hasSwim
      || this.island.territory[hpos+1][lpos].hasSwim
      || this.island.territory[hpos][lpos-1].hasSwim
      || this.island.territory[hpos][lpos+1].hasSwim;
  }

}

class knownLand {



}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    StrategicMap: StrategicMap
}
