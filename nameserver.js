const axios = require("axios");


const debug = false;

const penguinsNames = [];
const islandsNames = [];

class NameServer { 
  constructor() {
    this.namesSize = 20;
    this.islandsSize = 10;
    
    // checkNames();
    // this.startInterval();
  }
  
  getPenguinName () {
    if (penguinsNames.length > 0) {
      return penguinNames.shift(); 
    }  else {
      return {name: "tata", gender : "female"};
    }
  }
  
  getIslandName () {
    if (islandsNames.length > 0) {
      return islandNames.shift();   
    }
  }

  checkNames () {
    while ( penguinsNames.length < 20 ) {
      let penguinName = {name: "toto", gender : "male"};
      getFakeName(penguinName);
      penguinsNames.push(penguinName);
      console.log("Another name");
    }
  }
  
  startInterval () {
    setInterval(() => {
      checkNames();
    }, 1000);
  }

}

// Gets a name from a name server

const getFakeName = async (aPenguin) => {

  // for (let i = 0; i <3; i++) {
    axios
      .get("https://randomuser.me/api/?inc=gender,name&nat=fr")
      .then((response) => {
          aPenguin.name = response.data.results[0].name.first;
          aPenguin.gender = response.data.results[0].gender;
          // i = 4;
      })
      .catch((error) => {
        // aPenguin.setName("toto");
        //aPenguin.setGender("male");
      });
    // }
};


let nameserver = new NameServer(1,1);

// now we export the class, so other modules can create Penguin objects
module.exports = {
    NameServer : NameServer
}