const axios = require("axios");
const genders = ["male","female"];
const names = ["Billy Boy", "Glossy Rose"];

class Penguin {
  constructor(num, h, l,session, turn, fatherId = 0, motherId=0) {

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
    this.fatherId = fatherId;
    this.motherId = motherId;
    this.partnerId = 0;

    getFakeName(this);
    
    
    session.addMoveLog(turn, this.id,this.num,1,0,0,0,this.hpos,this.lpos,this.getCat(),"move");
    console.log("new penguin " + this.id + " at " + this.hpos + "/" + this.lpos);
  }

  getCat() {
    let cat = this.gender === "male" ? "-m-" : "-f-";
    cat = this.age < 6 ?"-y-":cat;
    return cat;
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

  canLove(partnerId) {
    
    
    if (partnerId === this.fatherId) {
      console.log("can not love with my father " + this.fatherId);
    }
    if (partnerId === this.motherId) {
      console.log("can not love with my mother " + this.motherId);
    }
    
    return this.age > 5 && this.hasLoved === 0 && partnerId !== this.fatherId && partnerId !== this.motherId;
  }

  // let moveType = moves[i].moveType, // 1=move,2=age,3=eat,4=love,5=die
  // let moveDir = moves[i].moveDir, // 1=left,2=right,3=up,4=down

  setPos(session, turn,moveDir,hpos,lpos) {

    if (this.hpos !== hpos || this.lpos !== lpos) {
      session.addMoveLog(turn,this.id,this.num,1,moveDir,this.hpos,this.lpos,hpos,lpos,this.getCat(),"move");
    }
    this.hpos = hpos;
    this.lpos = lpos;
  }
  
  // reset the penguin move log by adding an initial move record 
  // if the penguin is eating or loving it will also add the corresponding records to the penguins log
  
  resetPos(session,turn) {
    session.addMoveLog(turn, this.id,this.num,1,0,0,0,this.hpos,this.lpos,this.getCat(),"move");
    console.log("reset penguin " + this.id + " at " + this.hpos + "/" + this.lpos);
    
    if (this.loving > 0) {
      session.addMoveLog(turn, this.id,this.num,4,0,0,0,0,0,this.getCat(),"love");
    } 
    if (this.eating > 0) {
      session.addMoveLog(turn, this.id,this.num,3,0,0,0,0,0,this.getCat(),"eat");
    }
  }

  love(session, turn, partnerId) {
    this.loving = 4;
    this.hasLoved = 10;
    this.partnerId = partnerId;
    session.addMoveLog(turn, this.id,this.num,4,0,0,0,0,0,this.getCat(),"love");
  }

  isLoving () {
    return this.loving > 0;
  }

  eat(session, turn) {
    this.age = this.age > 3 ? this.age -3 : 0;
    this.eating = 3;
    session.addMoveLog(turn, this.id,this.num,3,0,0,0,0,0,this.getCat(),"eat");
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
    if (this.age === 6) {
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
