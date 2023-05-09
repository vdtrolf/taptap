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
    hpos,
    lpos,
    islandId,
    id = 0,
    kind =0
  ) {
    this.id = id === 0 ? Math.floor(Math.random() * 999999999) : id;
    this.islandId = islandId;
    this.num = num;
    this.hpos = hpos;
    this.lpos = lpos;
    this.kind = kind === 0 ? Math.floor(Math.random() * 5) + 1 : kind;

    log(
      realm,
      source,
      "constructor",
      "new garbage " + this.id + " at " + this.hpos + "/" + this.lpos
    );
  }
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
  Garbage: Garbage,
};