const axios = require("axios");

class Penguin {
  constructor(num, l, h) {
    this.num = num;
    this.lpos = l;
    this.hpos = h;
    this.age = Math.floor(Math.random() * 15);
    
    getFakeName(this);
    
  }

  getName() {
    return this.name;
  }
  
  getNum() {
    return this.num;
  }
  
  setName(name) {
    this.name = name;
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
