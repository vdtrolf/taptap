const dbhelperReq = require("./acebasehelper.js");
let putItem = dbhelperReq.putItem;
let getItems = dbhelperReq.getItems;
let deleteItem = dbhelperReq.deleteItem;


let debug = false;

const sessions = [];

class Session {
  constructor(id = 0, lastInvocation = 0, islandId = 0) {
    this.id = id===0?Math.floor(Math.random() * 99999999999):id;
    this.moveLog = [];
    this.moveCounter = 0;
    this.lastInvocation = lastInvocation===0?new Date().getTime():lastInvocation;
    this.islandId = islandId;
    if (debug) {
      console.log("session.js - constructor : New session with id " + this.id + " last " +  this.lastInvocation );
    }
  }

  // resets the session - that is set the moveCounter to 0

  reset() {
    this.moveCounter = 0;
    if (debug) {
      console.log("session.js - reset : Session reset with id " + this.id);
    }
  }

  setIsland(islandId) {
    this.islandId = islandId; 
  }


  //getId() {
  //  return this.id;
  //}

  //isAlive() {
  //  return true;
  // }

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

  addMoveLog(id, num, moveType, moveDir, origH, origL, newH, newL, cat, state) {
    let moveTypes = ["init", "move", "grow", "eat", "love", "die"];
    let moveid = this.moveCounter++;
    if (debug) {
      console.log("session.js - addMoveLog : " + moveid + " : Penguin " + id + " " 
                  + moveTypes[moveType] + " (" + moveType + ":" + moveDir + ") " 
                  + origH + "/" + origL + " -> " + newH + "/" + newL
      );
    }
    if (moveType !== 1) {
      this.moveLog.push({
        moveid: moveid,
        id: id,
        num: num,
        moveType: moveType, // 1 = move
        direction: moveDir, // necessary for fishing direction
        movements: [],
        cat: cat,
        state: state,
      });
    } else {
      let amove = this.moveLog.find((move) => {
        return move.id === id && move.moveType === 1;
      });
      if (amove) {
        let newMove = {
          movmtid: moveid,
          moveDir: moveDir,
          origH: origH,
          origL: origL,
          newH: newH,
          newL: newL,
        };
        amove.movements.push(newMove);
      } else {
        this.moveLog.push({
          moveid: moveid,
          id: id,
          num: num,
          moveType: moveType, // 1 = move
          direction: moveDir, // necessary for fishing direction
          movements: [
            {
              movmtid: moveid,
              moveDir: moveDir,
              origH: origH,
              origL: origL,
              newH: newH,
              newL: newL,
            },
          ],
          cat: cat,
          state: state,
        });
      }
    }
  }

  // Reinitiate the move log and ask the island to fill it with penguins
  // initial states

  getInitMoveLog(island) {
    this.moveLog = [];
    island.resetPenguins(this);

    if (debug) { console.log( "session.js - getInitMoveLog : number of moves after reset = " + this.moveLog.length );
    }

    let lastMoves = [...this.moveLog];
    this.moveLog = [];
    return lastMoves;
  }

  // returns the last version of the move log and reset the move log

  getMoveLog() {
    if (debug) {
      console.log(
        "session.js - getMoveLog : number of moves = " + this.moveLog.length
      );
    }

    let lastMoves = [...this.moveLog];
    this.moveLog = [];
    return lastMoves;
  }
}

const initiateSessions = () => {
  
  console.log("session.js - initiateSessions: getting sessions out of DB");
  getItems("session",loadSessions);
  
}

const loadSessions = (theSessions) => {
  
  console.log("session.js - loadSessions: found " + theSessions.length + " sessions");

  theSessions.forEach(asession => {
    let session = new Session(asession.id, asession.lastInvocation, asession.islandId);
    sessions.push(session);
  });
  
}


// create a new session and directly returns it, in the mean time saves the session to the db

const createSession = () => {
  session = new Session();
  sessions.push(session); 
  persistSessions(session);
  return session;
}

// gets the session, either out of the local array or out of the NoSQL db

const getSession = (sessionId) => {
  
  let foundSession = sessions.find(session => session.id === sessionId);
  foundSession.lastInvocation = new Date().getTime();
  return foundSession;
}

// persists the session in the NoSQL db

const persistSessions = (asession = null) => {
  
  
  if ( ! asession) {
    sessions.forEach(session => {
      
      let currentTime = new Date().getTime();

      if (currentTime - session.lastInvocation > 300000) {
        // console.log("Going to delete session " + session.id + " " + session.lastInvocation + " now:" + currentTime);
        deleteItem("session",session.id);
      } else {
        putItem("session", {      
          id: session.id,
          moveLog: session.moveLog,
          moveCounter: session.moveCounter,
          lastInvocation: session.lastInvocation,
        },session.id)
      }
    }); 
  } else {
    putItem("session", {      
      id: asession.id,
      moveLog: asession.moveLog,
      moveCounter: asession.moveCounter,
      lastInvocation: asession.lastInvocation,
    },asession.id)
  }
}

// now we export the class, so other modules can create Penguin objects
module.exports = {
  Session: Session,
  getSession: getSession,
  createSession: createSession,
  persistSessions: persistSessions,
  initiateSessions: initiateSessions
};