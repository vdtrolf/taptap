let debug = false;

class Session {
  constructor() {
    // console.log(x + " " + y);
    this.id = Math.floor(Math.random() * 99999999999);
    this.moveLog = [];
    this.moveCounter = 0;
    if (debug) {
      console.log("session.js - constructor : New session with id " + this.id);
    }

  }

  reset() {
    this.moveCounter = 0;

    if (debug) {
      console.log("session.js - reset : Session reset with id " + this.id);
    }
  }

  getId() {
    return this.id;
  }

  isAlive() {
    return true;
  }

  //setIsland(island) {
  //  this.island = island;
  //}

  //getIsland() {
  //  return this.island;
  //}


  // Add a move log record
  // move objects are made of :
  // -- move type 1
  // ---- movement 1
  // ---- movement 2
  // -- move type 2
  // -- move type 1
  // ---- movement 1
  // If it is a move, it then checks if there is already a move 1 for
  // that penguin, and if so, append the movement

  addMoveLog(turn, id, num, moveType, moveDir, origH, origL, newH, newL, cat, state) {

    let moveTypes = ["init","move","grow","eat","love","die"];
    let moveid = this.moveCounter++;
    if (debug) {
      console.log("session.js - addMoveLog : " + turn + " " + moveid + " : Penguin " + id + " " + moveTypes[moveType] + " (" + moveType + ":" + moveDir +") " + origH + "/" + origL + " -> " + newH + "/" + newL);
    }
    if (moveType !== 1) {
     this.moveLog.push({
        moveid : moveid,
        id : id,
        num : num,
        moveType : moveType, // 1 = move
        movements : [],
        cat : cat,
        state : state
      });
    } else {
      let amove = this.moveLog.find(move => { return (move.id === id && move.moveType === 1)} );
      if (amove) {
       let newMove = {movmtid : moveid, moveDir : moveDir, origH : origH, origL : origL, newH : newH, newL : newL };
        amove.movements.push(newMove);
      } else {

       this.moveLog.push({
          moveid : moveid,
          id : id,
          num : num,
          moveType : moveType, // 1 = move
          movements : [{movmtid : moveid, moveDir : moveDir, origH : origH, origL : origL, newH : newH, newL : newL }],
          cat : cat,
          state : state
        });
      }
    }
  }

  // Reinitiate the move log and ask the island to fill it with penguins
  // initial states

  getInitMoveLog(island) {

    this.moveLog = [];
    island.resetPenguins(this);

    if (debug) {
      console.log("session.js - getInitMoveLog : number of moves after reset = " + this.moveLog.length);
    }

    let lastMoves = [...this.moveLog];
    this.moveLog = [];
    return lastMoves;
  }

  // returns the last version of the move log and reset the move log

  getMoveLog () {

    if (debug) {
      console.log("session.js - getMoveLog : number of moves = " + this.moveLog.length);
    }


    let lastMoves = [...this.moveLog];
    this.moveLog = [];
    return lastMoves;
  }

  // getPenguinsStates() {

//    console.log("---> getPeguinsStates");

//    let lastMoves = [...this.moveLog];
//    let states = [];
//    this.moveLog = [];
//    lastMoves.forEach(aMove => {
//      states.filter(aState =>aState.id !== aMove.id);
//      states.push(aMove);
//    });
//  }



}

// now we export the class, so other modules can create Penguin objects
module.exports = {
    Session : Session
}
