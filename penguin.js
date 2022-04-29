const axios = require("axios");

class Penguin {
  constructor(num, h, l) {
    this.id = Math.floor(Math.random() * 999999);
    this.num = num;
    this.hpos = h;
    this.lpos = l;
    this.age = Math.floor(Math.random() * 5);
    this.alive = true;
    this.gender = "male";
    this.cat = "-y-";
    this.name = "Lonely penguin";
    this.eating = 0;
    this.loving = 0;

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

  // let moveType = moves[i].moveType, // 1=move,2=age,3=eat,4=love,5=die
  // let moveDir = moves[i].moveDir, // 1=left,2=right,3=up,4=down

  setPos(session,moveDir,hpos,lpos) {
    if (this.hpos !== hpos || this.lpos !== lpos) {
      let cat = this.gender === "male" ? "-m-" : "-f-";
      cat = this.age < 8 ?"-y-":cat;
      session.addMoveLog(this.id,this.num,1,moveDir,this.hpos,this.lpos,hpos,lpos,cat,"move");
    }
    this.hpos = hpos;
    this.lpos = lpos;
  }
  
  eat(session) {
    this.age = this.age > 3 ? this.age -3 : 0;
    this.eating = 3;
    let cat = this.gender === "male" ? "-m-" : "-f-";
    cat = this.age < 8 ?"-y-":cat;
    session.addMoveLog(this.id,this.num,3,0,0,0,0,0,cat,"eat");
  }
  
  isEating () {
    return this.eating > 0;
  }
  
  makeOlder(session) {
    
    if (this.eating > 0) {
      this.eating -= 1;
      return true;
    } else {
      this.age += this.alive ? 0.3 : 0;
      if (this.age > 7) {
        let cat = this.gender === "male" ? "-m-" : "-f-";
        session.addMoveLog(this.id,this.num,2,0,0,0,0,0,"","age");
     } if (this.age > 20) {
        if (this.alive) {
          console.log(this.name + " just died !")
        }
        this.alive = false;
        session.addMoveLog(this.id,this.num,5,0,0,0,0,0,"","dead");
        return false;
      }
      return true;
    }
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
  