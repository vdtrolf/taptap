const axios = require("axios");

class Penguin {
  constructor(num, h, l) {
    this.num = num;
    this.hpos = h;
    this.lpos = l;
    this.age = Math.floor(Math.random() * 15);

    getFakeName(this);

  }

  getName() {
    return this.name;
  }

  getNum() {
    return this.num;
  }

  getLPos() {
    return this.lpos;
  }

  getHPos() {
    return this.hpos;
  }

  setName(name) {
    this.name = name;
  }

  setPos(hpos,lpos) {
    this.hpos = hpos;
    this.lpos = lpos;
  }

  setGender(gender) {
    this.gender = gender;
    console.log("New penguin " + this.num + " - " + this.name + " (" + this.gender + "," + this.age + ")");
  }

}

const getFakeName = async (aPenguin) => {

  for (let i = 0; i <3; i++) {
    axios
      .get("https://randomuser.me/api/?inc=gender,name&nat=fr")
      .then((response) => {
          aPenguin.setName(response.data.results[0].name.first);
          aPenguin.setGender(response.data.results[0].gender);
          i = 4;
      })
      .catch((error) => {
        // aPenguin.setName("toto");
        //aPenguin.setGender("male");
      });
    }
};


// now we export the class, so other modules can create Penguin objects
module.exports = {
    Penguin : Penguin
}
