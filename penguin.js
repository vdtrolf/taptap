const axios = require("axios");

class Penguin {
  constructor(l, h) {
    this.lpos = l;
    this.hpos = h;
    this.age = Math.floor(Math.random() * 15);
    
    getFakeName(this);
    
  }

  getName() {
    return this.name;
  }
  
  setName(name) {
    this.name = name;
  }
  
  setGender(gender) {
    this.gender = gender;
    console.log("New penguin " + this.name + " (" + this.gender + "," + this.age + ")");
  }
  
  
}

const getFakeName = (aPenguin) => {
  axios
    .get("https://randomuser.me/api/?inc=gender,name&nat=fr")
    .then((response) => {
        // console.log(response.data.results[0].name.first +" " + response.data.results[0].gender);
        aPenguin.setName(response.data.results[0].name.first);
        aPenguin.setGender(response.data.results[0].gender);
        
        // console.log("New penguin " + aPenguin.name + " (" + aPenguin.gender + " "+ aPenguin.age +")");
        
    })
    .catch((error) => {
      // console.log(error);
      aPenguin.setName("toto");
      aPenguin.setGender("male");
    });
};


// now we export the class, so other modules can create Penguin objects
module.exports = {
    Penguin : Penguin
}
