const axios = require("axios");
const genders = ["male","female"];
const names = ["Billy Boy", "Glossy Rose"];

class Penguin {
  constructor(num, h, l, session, turn) {

    let gdname = Math.floor(Math.random() * 2);

    this.id = Math.floor(Math.random() * 999999);
    this.num = num;
    this.hpos = h;
    this.lpos = l;
    this.age = Math.floor(Math.random() * 5);
    this.alive = true;
    this.gender = genders[gdname];
    this.cat = "-y-";
    this.name = names[gdname];
    this.eating = 0;
    this.loving = 0;
    this.hasLoved = 0;

    getFakeName(this);
    session.addMoveLog(turn, this.id,this.num,1,0,0,0,this.hpos,this.lpos,this.cat,"move");
    console.log("new penguin " + this.id + " at " + this.hpos + "/" + this.lpos);
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

  getGender() {
    return this.gender;
  }

  setName(name) {
    this.name = name;
  }

  canLove() {
    return this.age > 5 && this.hasLoved === 0;
  }

  // let moveType = moves[i].moveType, // 1=move,2=age,3=eat,4=love,5=die
  // let moveDir = moves[i].moveDir, // 1=left,2=right,3=up,4=down

  setPos(session, turn,moveDir,hpos,lpos) {

    if (this.hpos !== hpos || this.lpos !== lpos) {
      let cat = this.gender === "male" ? "-m-" : "-f-";
      cat = this.age < 6 ?"-y-":cat;
      session.addMoveLog(turn,this.id,this.num,1,moveDir,this.hpos,this.lpos,hpos,lpos,cat,"move");
    }
    this.hpos = hpos;
    this.lpos = lpos;
  }

  love(session, turn) {
    this.loving = 4;
    this.hasLoved = 10;
    let cat = this.gender === "male" ? "-m-" : "-f-";
    cat = this.age < 6 ?"-y-":cat;
    session.addMoveLog(turn, this.id,this.num,4,0,0,0,0,0,cat,"love");
  }

  isLoving () {
    return this.loving > 0;
  }

  eat(session, turn) {
    this.age = this.age > 3 ? this.age -3 : 0;
    this.eating = 3;
    let cat = this.gender === "male" ? "-m-" : "-f-";
    cat = this.age < 6 ?"-y-":cat;
    session.addMoveLog(turn, this.id,this.num,3,0,0,0,0,0,cat,"eat");
  }

  isEating () {
    return this.eating > 0;
  }

  // Makes the penguin one year older and check status
  // Return 1 if dead and 2 if end of loving periond (in which case a baby will born)
  // Otherwise returns 0

  makeOlder(session, turn) {

    let hasChild = false;

    if (this.eating > 0) {
      this.eating -= 1;
    }

    if (this.hasLoved > 0) {
      this.hasLoved -= 1;
    }

    if (this.loving > 0) {
      this.loving -= 1;
      if (this.loving === 0) {
        hasChild = true;
      }
    }

    this.age += this.alive ? 0.5 : 0;
    if (this.age === 4) {
      let cat = this.gender === "male" ? "-m-" : "-f-";
      session.addMoveLog(turn, this.id,this.num,2,0,0,0,0,0,"","age");
    }
    if (this.age > 20) {
      if (this.alive) {
        console.log(this.name + " just died !")
      }
      this.alive = false;
      session.addMoveLog(turn, this.id,this.num,5,0,0,0,0,0,"","dead");
      return 1;
    }
    if (hasChild) {
      return 2;
    } else {
      return 0;
    }
}

  setGender(gender) {
    this.gender = gender;
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
