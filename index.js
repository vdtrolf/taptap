const axios = require("axios");

const args = process.argv.slice(2);

// console.log(process.env);

args.forEach((arg) => {
  console.log(arg);
});

let islandL = Number.parseInt(args[0], 10);
if (!islandL) islandL = 120;
let islandH = islandL / 3;

console.log("Building an island of size " + islandH + " * " + islandL);

class Island {
  constructor(sizeH,sizeL) {
    this.sizeH = sizeH;
    this.sizeL = sizeL;
    this.territory = [];
    this.penguins = [];

    // creating a matrix of land objects with a value of 0
    for (let h = 0; h < sizeH; h++) {
      let line = [];
      for (let l = 0; l < sizeL; l++) {
        line.push(new Land(h,l));
      }
      this.territory.push(line);
    }

    // first lines of land from line 1 to line size -1
    let variation = this.sizeL / 5;
    let start = variation,
      start2 = variation;
    for (let h = 1; h < sizeH - 1; h++) {
      let rnd = Math.floor(Math.random() * 3 - 1 + start);
      start = rnd;

      let rnd2 = Math.floor(Math.random() * 3 - 1 + start2);
      rnd2 = rnd2 < 0 ? 0 : rnd2;
      start2 = rnd2;

      for (let l = rnd; l < sizeL - rnd2; l++) {
        if (this.territory[h][l]) {
          this.territory[h][l].setLand(1);
        } else {
          console.log("const: cant set land for " + j + " " + i);
        }
      }
    }

    // sea borders on the upper and lower side
    start = variation / 4;
    start2 = variation / 4;
    for (let l = 1; l < sizeL - 1; l++) {
      let rnd = Math.floor(Math.random() * 3 - 1 + start);
      start = rnd;

      let rnd2 = Math.floor(Math.random() * 3 - 1 + start2);
      rnd2 = rnd2 < 0 ? 0 : rnd2;
      start2 = rnd2;

      for (let h = 0; h < rnd; h++) {
        this.territory[h][l].setLand(0);
      }

      for (let h = sizeH - rnd2; h < sizeH; h++) {
        this.territory[h][l].setLand(0);
      }
    }

    // Randomly elevate some terrain parts
    for (let i = 0; i < sizeH * 30; i++) {
      let hpos = Math.floor(Math.random() * sizeH);
      let lpos = Math.floor(Math.random() * sizeL);
      let land = this.territory[hpos][lpos];

      if (land && land.getType() !== 0) {
        this.elev(land, hpos, lpos);
      }
    }
    // randomly add some penguins
    for (let i = 0; i < 10; i++) {
      let hpos = Math.floor(Math.random() * sizeH);
      let lpos = Math.floor(Math.random() * sizeL);
      let land = this.territory[hpos][lpos];


      if (land && land.getType() !== 0) {
        let penguin = new Penguin(hpos,lpos,"toto","M",10);
        land.addPenguin(penguin);
        this.penguins.push(penguin);
      }
    }

  }

  getLandType(x, y) {
    // console.log("-->" + x + " " + y);
    const land = this.territory[x][y];
    return land.getType();
  }

  hasPenguin(x, y) {
    // console.log("-->" + x + " " + y);
    const land = this.territory[x][y];
    if (land.checkPenguin()) {
      return true;
    }
    return false;
  }


  elev(land, hpos, lpos) {
    const height = land.getType() + 1;
    // console.log("elev: " + xcoord + " " + ycoord + " -> " + height);
    for (let h = hpos - 1; h <= hpos + 1; h++) {
      for (let l = lpos - 1; l <= lpos + 1; l++) {
        if (h >= 0 && l >= 0 && h < this.sizeH && l < this.sizeL) {
          try {
            let lheight = this.territory[h][l].getType();
            if (lheight > 0 && height - lheight > 1) {
              // console.log("elev: upscaling " + x + " " + y + " " + lheight);
              this.elev(this.territory[h][l],h,l);
              //this.territory[h][l].setLand(lheight + 1);
            }

          } catch (error) {
            console.error("No land at h=" + h + " / l" + l + " - " + error);
          }
        }
      }
    }
    this.territory[hpos][lpos].setLand(height);
  }
}

class Land {
  constructor(l, h) {
    // console.log(x + " " + y);
    this.lpos = l;
    this.hpos = h;
    this.type = 0;
    this.penguin = null;
  }

  setLand(num) {
    this.type = num;
  }

  addPenguin(penguin) {
    console.log("New penguin at " + this.lpos + " " + this.hpos);
    this.penguin = penguin;
  }

  checkPenguin(){
    // console.log("Checking penguin at " + this.lpos + " " + this.hpos + " -> " + this.penguin);
    return this.penguin;
  }

  getType() {
    return this.type;
  }
}

class Penguin {
  constructor(l, h, name, gender, age) {
    // console.log("New penguin " + l + " " + h);
    this.lpos = l;
    this.hpos = h;
    this.name = name;
    this.gender = gender;
    this.age = age;
  }

  getName() {
    return this.name;
  }
}

const getWeather = () => {
  axios
    .get(
      "http://api.weatherapi.com/v1/current.json?key=c28ff46234e64f52abe171323220204&q=London&aqi=no"
    )
    .then((response) => {
      console.log(response.data.current.condition.text);
    })
    .catch((error) => {
      console.log(error);
    });
};

const island = new Island(islandH,islandL);

let linetop = "+";
for (let j = 0; j < islandL; j++) linetop += "-";
console.log(linetop + "+");

for (let i = 0; i < islandH; i++) {
  let line = "|";
  for (let j = 0; j < islandL; j++) {
    if (island.hasPenguin(i,j)) {
      line += "o";
    } else {
    switch (island.getLandType(i, j)) {
      case 0:
        line += " ";
        break;
      case 1:
        line += "░";
        break;
      case 2:
        line += "▒";
        break;
      case 3:
        line += "▓";
        break;
      case 4:
        line += "█";
        break;
    }
  }
  }
  console.log(line + "|");
}

console.log(linetop + "+");

// getWeather();
