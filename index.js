const args = process.argv.slice(2);

// console.log(process.env);

args.forEach(arg => {
 console.log(arg);
});


let islandSize = Number.parseInt(args[0],10);
if (! islandSize) islandSize = 40;

console.log("Building an island of size " + islandSize);

class Island {

constructor(size) {
  this.size = size;
  this.territory = [];

  // creating a matrix of land objects with a value of 0
  for (let i = 0; i<size;i++){
    let line = [];
    for (let j=0 ;j< size;j++){
      line.push(new Land(i,j));
    }
    this.territory.push(line);
  }

  // first lines of land from line 1 to line size -1   
  let variation = islandSize / 5;
  let start = variation , start2= variation;
  for (let j =1; j < size - 1; j++ ) {
    let rnd = Math.floor((Math.random() * 3) - 1 + start);
    start = rnd;

    let rnd2 = Math.floor((Math.random() * 3) - 1 + start2);
    rnd2 = rnd2 < 0 ? 0 : rnd2;
    start2 = rnd2;

    for (let i = rnd; i < size - rnd2; i++){
      this.territory[j][i].setLand(1);
    }

  }

  // sea borders on the upper and lower side
  start = variation; 
  start2= variation;
  for (let j =1; j < size - 1; j++ ) {
    let rnd = Math.floor((Math.random() * 3) - 1 + start);
    start = rnd;

    let rnd2 = Math.floor((Math.random() * 3) - 1 + start2);
    rnd2 = rnd2 < 0 ? 0 : rnd2;
    start2 = rnd2;

    for (let i = 0; i< rnd; i++){
      this.territory[i][j].setLand(0);
    }

    for (let i = size - rnd2; i < size; i++){
      this.territory[i][j].setLand(0);
    }

  }

  for(let i=0;i<size*2;i++) {
    let xpos = Math.floor((Math.random() * size ));
    let ypos = Math.floor((Math.random() * size ));
    let land = this.territory[xpos][ypos];
    
    //if (land) {
    //      console.log(xpos + " " + ypos + " " + land.getType());
    //} else {
    //  console.log(xpos + " " + ypos + " ---");
    //}
    if (land && land.getType() !== 0) {
      land.setLand(land.getType() + 1);      
    }
  }
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

  setLand(num) {
    this.type = num;
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
