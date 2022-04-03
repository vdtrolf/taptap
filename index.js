const axios = require("axios");

//import {fetch} from 'node-fetch';

const args = process.argv.slice(2);

// console.log(process.env);

args.forEach((arg) => {
  console.log(arg);
});

let islandSize = Number.parseInt(args[0], 10);
if (!islandSize) islandSize = 40;

console.log("Building an island of size " + islandSize);

class Island {
  constructor(size) {
    this.size = size;
    this.territory = [];

    // creating a matrix of land objects with a value of 0
    for (let i = 0; i < size; i++) {
      let line = [];
      for (let j = 0; j < size; j++) {
        line.push(new Land(i, j));
      }
      this.territory.push(line);
    }

    // first lines of land from line 1 to line size -1
    let variation = islandSize / 5;
    let start = variation,
      start2 = variation;
    for (let j = 1; j < size - 1; j++) {
      let rnd = Math.floor(Math.random() * 3 - 1 + start);
      start = rnd;

      let rnd2 = Math.floor(Math.random() * 3 - 1 + start2);
      rnd2 = rnd2 < 0 ? 0 : rnd2;
      start2 = rnd2;

      for (let i = rnd; i < size - rnd2; i++) {
        if (this.territory[j][i]) {
          this.territory[j][i].setLand(1);
        } else {
          console.log("const: cant set land for " + j + " " + i);
        }
      }
    }

    // sea borders on the upper and lower side
    start = variation / 2;
    start2 = variation / 2;
    for (let j = 1; j < size - 1; j++) {
      let rnd = Math.floor(Math.random() * 3 - 1 + start);
      start = rnd;

      let rnd2 = Math.floor(Math.random() * 3 - 1 + start2);
      rnd2 = rnd2 < 0 ? 0 : rnd2;
      start2 = rnd2;

      for (let i = 0; i < rnd; i++) {
        this.territory[i][j].setLand(0);
      }

      for (let i = size - rnd2; i < size; i++) {
        this.territory[i][j].setLand(0);
      }
    }

    for (let i = 0; i < size * 5; i++) {
      // for (let i = 0; i < 2; i++) {
      let xpos = Math.floor(Math.random() * size);
      let ypos = Math.floor(Math.random() * size);
      let land = this.territory[xpos][ypos];

      // if (land) {
      //   console.log("const: " + xpos + " " + ypos + " " + land.getType());
      // } else {
      //   console.log("const: " + xpos + " " + ypos + " -- no land");
      // }

      if (land && land.getType() !== 0) {
        this.elev(land, xpos, ypos);
      }
    }
  }

  getLandType(x, y) {
    // console.log("-->" + x + " " + y);
    const land = this.territory[x][y];
    return land.getType();
  }

  elev(land, xpos, ypos) {
    const height = land.getType() + 1;
    // console.log("elev: " + xcoord + " " + ycoord + " -> " + height);
    for (let x = xpos - 1; x <= xpos + 1; x++) {
      for (let y = ypos - 1; y <= ypos + 1; y++) {
        if (x >= 0 && y >= 0) {
          let lheight = this.territory[x][y].getType();
          if (lheight > 0 && height - lheight > 1) {
            // console.log("elev: upscaling " + x + " " + y + " " + lheight);
            this.territory[x][y].setLand(lheight + 1);
          }
        }
      }
    }
    this.territory[xpos][ypos].setLand(height);
  }
}

class Land {
  constructor(x, y) {
    // console.log(x + " " + y);
    this.xcoord = x;
    this.ycoord = y;
    this.type = 0;
  }

  setLand(num) {
    this.type = num;
  }

  getType() {
    return this.type;
  }
}

const getWeather = () => {
  axios
    .get(
      "http://api.weatherapi.com/v1/current.json?key=c28ff46234e64f52abe171323220204&q=London&aqi=no"
    )
    .then((response) => {
      console.log(response.data.current);
    })
    .catch((error) => {
      console.log(error);
    });
};

const island = new Island(islandSize);

let linetop = "+";
for (let j = 0; j < islandSize; j++) linetop += "-";
console.log(linetop + "+");

for (let i = 0; i < islandSize; i++) {
  let line = "|";
  for (let j = 0; j < islandSize; j++) {
    switch (island.getLandType(i, j)) {
      case 0:
        line += " ";
        break;
      case 1:
        line += ".";
        break;
      case 2:
        line += "^";
        break;
      case 3:
        line += "*";
        break;
      case 4:
        line += "#";
        break;
    }
  }
  console.log(line + "|");
}

console.log(linetop + "+");

getWeather();
