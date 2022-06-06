const nameserverReq = require("./nameserver.js");
const strategicMapReq = require("./strategicmap.js");

let StrategicMap = strategicMapReq.StrategicMap;

const debug = false;

class Penguin {
  constructor(num, h, l,sessions, turn, fatherId = 0, motherId=0) {
    this.id = Math.floor(Math.random() * 999999);
    this.num = num;
    this.hpos = h;
    this.lpos = l;
    this.age = Math.floor(Math.random() * 5);
    this.fat = Math.floor(Math.random() * 4);
    this.wealth = 100;
    this.hungry = 0;
    this.alive = true;
    this.gender = "male";
    this.cat = "-y-";
    this.name = "titi";
    this.eating = 0;
    this.loving = 0;
    this.waiting = 0;
    this.fishTime = 0;
    this.fishDirection = 0;
    this.moving = 0;
    this.hasLoved = 0;
    this.fatherId = fatherId;
    this.motherId = motherId;
    this.partnerId = 0;
    this.strategicMap = null;
    this.strategyShort = "";

    let aPenguinName = nameserverReq.getPenguinName();
    this.name = aPenguinName.name;
    this.gender = aPenguinName.gender;

    sessions.forEach(session => {
      session.addMoveLog(turn, this.id,this.num,1,0,0,0,this.hpos,this.lpos,this.getCat(),"move");
    });
    if (debug) {
      console.log("penguin.js - constructor : new penguin " + this.id + " at " + this.hpos + "/" + this.lpos);
    }
  }

  // returns teh category of the penguin - y,m,f,o (old man), e (eldery woman)

  getCat() {
    let cat = this.gender === "male" ? "-m-" : "-f-";
    cat = this.age < 6 ? "-y-":cat;
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

  getWealth() {
    return this.wealth;
  }

  getHungry() {
    return this.hungry;
  }

  setName(name) {
    this.name = name;
  }

  // Calculates the strategic map for the penguin

  getStrategicMap(island) {
    if (this.strategicMap === null) {
      this.strategicMap = new StrategicMap(island.sizeH,island.sizeL);
    }
    this.strategyShort = this.strategicMap.look(island,this.hpos,this.lpos,this.age > 5 ? 3 : 2, this.hungry, this.wealth, this.name, this.id, this.id === island.followId && this.alive);
  }

  // Wealth will decrease if the penguin is not surrended by other penguins - unless the sun is shinning
  // If the penguin is fat it will go slower than is h3e is meaget

  calculateWealth(island) {

    if (this.strategicMap) {
      let weatherFactor = island.weather === 0 ? 1 :0;
      let warmth = this.strategicMap.calculateWarm(island,this.hpos,this.lpos,this.id);
      this.wealth += (warmth  * weatherFactor);

      // if (this.id === island.followId && this.alive) console.log("Warmth: " + warmth + " fatfactor: " + this.fat + " weatherfactor: " + weatherFactor);

      if (this.wealth > 99) this.wealth = 100;
      if (this.wealth < 1 ) this.wealth = 0;
    }
  }

  hasTarget() {
    if (this.strategicMap) {
      return this.strategicMap.hasTarget;
    }
    return false;
  }

  wantsSearch() {
    if (this.strategicMap) {
      return this.strategicMap.wantsSearch;
    }
    return false;
  }

  getDirections(){
    if (this.strategicMap) {
      return this.strategicMap.targetDirections;
    }
    return [0,0,0,0];
  }

  getStrategy() {
    if (this.strategicMap) {
      return this.strategicMap.strategyShort;
    }
    return "";
  }


  // Check if love is possible

  canLove(partnerId) {

    if ( partnerId === this.fatherId) {
      if (debug) { console.log(`penguin.js - canLove : ${this.id}-${this.name} love not possible with father ${this.fatherId}`) };
      return false;
    }
    if (partnerId === this.motherId) {
      if (debug) { console.log(`penguin.js - canLove : ${this.id}-${this.name} love not possible with mother ${this.motherId}`) };
      return false;
    }
    if (this.age < 7 || this.age > 30) {
      if (debug) { console.log(`penguin.js - canLove : ${this.id}-${this.name} too yong or old for all this (i am ${this.age})`) };
      return false;
    }

    return this.hasLoved === 0 && ! this.eating && ! this.fishing ;
  }

  // let moveType = moves[i].moveType, // 1=move,2=age,3=eat,4=love,5=die
  // let moveDir = moves[i].moveDir, // 1=left,2=right,3=up,4=down

  setPos(sessions, turn,moveDir,hpos,lpos) {

    if (this.hpos !== hpos || this.lpos !== lpos) {
      sessions.forEach(session => {
        session.addMoveLog(turn,this.id,this.num,1,moveDir,this.hpos,this.lpos,hpos,lpos,this.getCat(),"move");
      });
    }
    this.hpos = hpos;
    this.lpos = lpos;
    this.waiting = 0;
  }

  // reset the penguin move log by adding an initial move record
  // if the penguin is eating or loving it will also add the corresponding records to the penguins log

  resetPos(sessions,turn) {
    sessions.forEach(session => {
      session.addMoveLog(turn, this.id,this.num,1,0,0,0,this.hpos,this.lpos,this.getCat(),"move");
    });
    if (debug) {
      console.log("penguin.js - resetPos : reset penguin " + this.id + " at " + this.hpos + "/" + this.lpos);
    }
    if (this.loving > 0) {
      sessions.forEach(session => {
        session.addMoveLog(turn, this.id,this.num,4,0,0,0,0,0,this.getCat(),"love");
      });
    }
    if (this.eating > 0) {
      sessions.forEach(session => {
        session.addMoveLog(turn, this.id,this.num,3,0,0,0,0,0,this.getCat(),"eat");
      });
    }
    this.waiting = 0;
  }

  // tells te peguin to make love with a partner

  love(sessions, turn, partnerId) {
    this.loving = 4;
    this.hasLoved = 15;
    this.partnerId = partnerId;
    this.waiting = 0;
    sessions.forEach(session => {
      session.addMoveLog(turn, this.id,this.num,4,0,0,0,0,0,this.getCat(),"love");
    });
  }

  // return true is the penguin is makning love

  isLoving () {
    return this.loving > 0;
  }

  // tell the penhuin to eat

  eat(sessions, turn) {
    this.eating = 5;
    this.waiting = 0;
    this.hungry = this.hungry < 25 ? 0 : this.hungry - 25;
    this.wealth = this.wealth > 90 ? 100 : this.wealth + 10;
    sessions.forEach(session => {
      session.addMoveLog(turn, this.id,this.num,3,0,0,0,0,0,this.getCat(),"eat");
    });
  }

  // return true is the penguin is eating

  isEating () {
    return this.eating > 0;
  }

  // makes the penguin fish

  fish(sessions, turn, direction) {
    sessions.forEach(session => {
      session.addMoveLog(turn, this.id,this.num,7,direction,0,0,0,0,this.getCat(),"fish");
    });
    this.fishDirection = direction;
    this.fishTime = 6;
  }

  // return true is the penguin is eating

  isFishing () {
    return this.fishTime > 0;
  }

  // makes the penguin fish

  wait(sessions, turn) {
    sessions.forEach(session => {
      session.addMoveLog(turn, this.id,this.num,6,0,0,0,0,0,this.getCat(),"still");
    });

    // if (this.id === island.followId && this.alive) console.log("Hungry: " + this.hungry + " fatfactor: " + this.fat + " getting more hungry by : " + (Math.floor(this.fat / 2) + 1));


    this.hungry += (Math.floor(this.fat / 2) + 1);
  }

  // return true is the penguin is eating

  isWaiting () {
    return this.waiting > 0;
  }

  // Penguins die - all counters are reset

  letDie(sessions, turn) {
    this.alive = false;
    this.eating = 0;
    this.loving = 0;
    this.hasLoved = 0;
    this.hungry = 0;

    sessions.forEach(session => {
      session.addMoveLog(turn, this.id,this.num,5,0,0,0,0,0,"","dead");
    });
  }


  // Makes the penguin one year older and check status
  // Return 1 if dead and 2 if end of loving periond (in which case a baby will born)
  // Otherwise returns 0

  makeOlder(sessions, turn) {

    let hasChild = false;
    let returncode = 0;

    if (this.eating > 0) {
      this.eating -= 1;
    }

    if (this.fishTime> 0) {
      this.fishTime-= 1;
      if (this.fishTime === 0) {
        this.fishDirection = 0;
        this.eat(sessions,turn);
      }
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

    this.hungry += (Math.floor(this.fat / 3) + 1);

    this.age += this.alive ? 0.25 : 0;
    if (this.age === 4) {
      let cat = this.gender === "male" ? "-m-" : "-f-";
      sessions.forEach(session => {
        session.addMoveLog(turn, this.id,this.num,2,0,0,0,0,0,cat,"age");
      });
    }
    if (this.age > 40 || this.hungry > 99 || this.wealth <1 ) {
      if (debug && this.alive) {
        console.log("penguin.js - makeOlder : " + this.name + " just died !")
      }
      this.alive = false;
      sessions.forEach(session => {
        session.addMoveLog(turn, this.id,this.num,5,0,0,0,0,0,"","dead");
      });
      returncode = 1;
    } else if (hasChild) {
      returncode =  2;
    }

    return {returncode : returncode};

  }

  setGender(gender) {
    this.gender = gender;
  }

  isAlive() {
    return this.alive;
  }

}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    Penguin : Penguin
}
