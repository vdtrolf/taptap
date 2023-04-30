// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGINFO = loggerReq.LOGINFO;
const LOGVERB = loggerReq.LOGVERB;

const realm = "garbage";
const source = "garbage.js";

const debug = false;

// Class and constructor

class Garbage {
  constructor(
    num,
    h,
    l,
    islandId,
    id = 0,
    type =0,
    age = 0,
        
  ) {
    this.id = id === 0 ? Math.floor(Math.random() * 999999999) : id;
    this.islandId = islandId;
    this.num = num;
    this.hpos = h;
    this.lpos = l;
    this.type = type === 0 ? Math.floor(Math.random() * 4) : type;
    this.age = age;

    log(
      realm,
      source,
      "constructor",
      "new garbage " + this.id + " at " + this.hpos + "/" + this.lpos
    );
  }

  // returns teh category of the penguin - y,m,f,o (old man), e (eldery woman)


  setPos(direction,h,l) {
    this.hpos = h;
    this.lpos = l;
  }

  increaseAge() {
    this.age = this.age + 1;
  }

}


// now we export the class, so other modules can create Penguin objects
module.exports = {
  Garbage: Garbage,
};