const axios = require("axios");

class Penguin {
  constructor(num, h, l) {
    this.id = Math.floor(Math.random() * 999999);
    this.num = num;
    this.hpos = h;
    this.lpos = l;
    this.age = Math.floor(Math.random() * 5);
    this.alive = true;
    this.name = "Lonely penguin";

    getFakeName(this);

  }

  getId() {
    return this.id;
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

  makeOlder() {
    this.age += this.alive ? 0.5 : 0;
    if (this.age > 12) {
      if (this.alive) {
        console.log(this.name + " just died !")
      }
      this.alive = false;
      
      return false;
    }
    return true;
  }

  setGender(gender) {
    this.gender = gender;
    // console.log("New penguin " + this.num + " - " + this.name + " (" + this.gender + "," + this.age + ")");
  }

  isAlive() {
    return this.alive;
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
