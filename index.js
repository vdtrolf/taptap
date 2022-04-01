const args = process.argv.slice(2);

console.log(process.env);

args.forEach(arg => {
 console.log(arg);
});


let islandSize = Number.parseInt(args[0],10);
if (! islandSize) islandSize = 20;

console.log("Building an island of size " + islandSize);

class Island {

constructor(size) {
  this.size = size;
  this.territory = [];

  // first line
  for (let i = 0; i<size;i++){
    let line = [];
    for (let j=0 ;j< size;j++){
      line.push(new Land(i,j));
    }
    this.territory.push(line);
  }

  let start = 3, start2= 3;
  for (let j =0; j < size; j++ ) {
    let rnd = Math.floor((Math.random() * 3) - 1 + start);
    start = rnd;

    let rnd2 = Math.floor((Math.random() * 3) - 1 + start2);
    rnd2 = rnd2 < 0 ? 0 : rnd2;
    start2 = rnd2;

    // console.log(rnd + " " + rnd2);

    for (let i = rnd; i < size - rnd2; i++){
      this.territory[j][i].setLand(1);
    }

  }


  // for(let i=1; i< size -1  ; i++) {
  //   let line1 = [];
  //   let line2 = [];
  //   let isLand1 = false;
  //   let isLand2 = false;
  //   for (let j=0 ; j < (size / 2) ; j++){
  //     if (j === 0) {
  //       line1.push(new Land(i,j));
  //       line2.push(new Land(i,size -j));
  //     } else  {
  //       let land1 = new Land(i,j);
  //       let land2 = new Land(i,size -j);
  //
  //       isLand1 = land1.elev(this.territory[i-1][j],line1[j-1],isLand1);
  //       isLand2 = land2.elev(this.territory[i-1][size -j],line2[j-1],isLand2);
  //
  //       line1.push(land1);
  //       line2.unshift(land2);
  //
  //     }
  //   }
  //   let line3 = [...line1,...line2]
  //   this.territory.push(line3);
  // }

  // last line1

}

getLandType(x,y){
  // console.log("-->" + x + " " + y);
  const land = this.territory[x][y];
  return land.getType();
}
}

class Land {
constructor(x,y){
  // console.log(x + " " + y);
  this.xcoord = x;
  this.ycoord = y;
  this.type = 0;

}

setLand() {
  this.type = 1;
}


elev(up,ref,isLand) {
  console.log(this.xcoord + " " + this.ycoord + " " + up.type + " " + ref.type);


  if (this.xcoord === 0 || this.ycoord === 0 || this.xcoord === islandSize -1 || this.ycoord === islandSize -1) {
    this.type = 0
  } else {
    let elev = Math.floor((Math.random() * 3) - 1 + ref.type);
    elev = elev > 0 ? elev : 0;
    elev = Math.abs(elev - up.type) > 1 ? up.type : elev;
    elev = isLand && elev < 1 ? 1 : elev;
    this.type = elev;
    return elev > 0;
  }
}

getType() {
  return this.type;
}
}

const island = new Island(islandSize);

for(let i=0; i<islandSize ; i++) {
 let line = "";
 for (let j=0 ;j<islandSize;j++){
   line += island.getLandType(i,j);
 }
 console.log(line);
}
