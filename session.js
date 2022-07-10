const dbhelperReq = require("./acebasehelper.js");
// const dbhelperReq = require("./dynamohelper.js");

// const islandReq = require("./island.js");

let putItem = dbhelperReq.putItem;
let getItems = dbhelperReq.getItems;
let deleteItem = dbhelperReq.deleteItem;
let getAsyncItem = dbhelperReq.getAsyncItem;
// let getIsland = islandReq.getIsland;

let debug = false;
let deepdebug = false;
let loaded = false;

const sessions = [];

class Session {
  constructor(
    id = 0,
    lastInvocation = 0,
    islandId = 0,
    moveCounter = 0,
    moveLog = []
  ) {
    this.id = id === 0 ? Math.floor(Math.random() * 99999999999) : id;
    this.lastInvocation =
      lastInvocation === 0 ? new Date().getTime() : lastInvocation;
    this.islandId = islandId;
    this.moveCounter = moveCounter;
    this.moveLog = moveLog;
    if (debug) {
      console.log(
        "session.js - constructor : New session with id " +
          this.id +
          " last " +
          this.lastInvocation
      );
    }

    let island = getIsland(this.islandId);
    if (island) island.registerSession(this);
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

  addMoveLog(
    id,
    num,
    moveType,
    cat,
    state,
    moveDir = 0,
    origH = 0,
    origL = 0,
    newH = 0,
    newL = 0
  ) {
    let moveTypes = ["init", "move", "grow", "eat", "love", "die", "still"];
    let moveid = this.moveCounter++;
    if (debug) {
      console.log(
        "session.js - addMoveLog : " +
          moveid +
          " : Penguin " +
          id +
          " " +
          cat +
          " " +
          moveTypes[moveType] +
          " (" +
          moveType +
          ":" +
          moveDir +
          ") " +
          origH +
          "/" +
          origL +
          " -> " +
          newH +
          "/" +
          newL
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
    if (island) island.resetPenguins(this);

    if (debug) {
      console.log(
        "session.js - getInitMoveLog : number of moves after reset = " +
          this.moveLog.length
      );
    }

    let lastMoves = [...this.moveLog];
    this.moveLog = [];
    persistSessions(this);
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
    persistSessions(this);
    return lastMoves;
  }
}

const initiateSessions = () => {
  if (!loaded) {
    console.log("session.js - initiateSessions: getting sessions out of DB");
    getItems("session", loadSessions);
  }
  loaded = true;
};

const loadSessions = (theSessions) => {
  console.log(
    "session.js - loadSessions: found " + theSessions.length + " sessions"
  );

  theSessions.forEach((asession) => {
    let session = new Session(
      asession.id,
      asession.lastInvocation,
      asession.islandId,
      asession.moveCounter,
      asession.movelog
    );
    sessions.push(session);
  });
};

// create a new session and directly returns it, in the mean time saves the session to the db

const createSession = () => {
  let session = new Session();
  sessions.push(session);
  // persistSessions(session);
  return session;
};

// gets the session, either out of the local array or out of the NoSQL db

const getSession = (sessionId) => {
  if (deepdebug)
    console.log(
      "session.js - getSession: looking for session with id " + sessionId
    );

  let foundSession = sessions.find((session) => session.id === sessionId);
  if (foundSession) {
    if (deepdebug)
      console.log(
        "session.js - getSession: found a session with id " + sessionId
      );
    foundSession.lastInvocation = new Date().getTime();
    return foundSession;
  } else {
    //let sessionData = await getAsyncItem("session", sessionId);
    let sessionData = getItem("session", sessionId);
    if (sessionData) {
      if (deepdebug) {
        console.log(
          "session.js - getSession:: found a DB session " + sessionData.id
        );
      }
      let session = new Session(
        sessionData.id,
        sessionData.lastInvocation,
        sessionData.islandId,
        sessionData.moveCounter,
        sessionData.moveLog
      );
      return session;
    } else {
      if (deepdebug) {
        console.log(
          "session.js - getSession:: creatinf a session " + sessionId
        );
      }
      let session = new Session(sessionId);
      persistSessions(session);
      return session;
    }
  }
};

// persists the session in the NoSQL db

const persistSessions = (asession = null) => {
  if (!asession) {
    if (deepdebug) console.log("persisting sessions " + asession);

    sessions.forEach((session) => {
      let currentTime = new Date().getTime();

      if (currentTime - session.lastInvocation > 300000) {
        if (deepdebug) {
          console.log(
            "Going to delete session " +
              session.id +
              " " +
              session.lastInvocation +
              " now:" +
              currentTime
          );
        }
        deleteItem("session", session.id);
      } else {
        putItem(
          "session",
          {
            id: session.id,
            moveLog: session.moveLog,
            moveCounter: session.moveCounter,
            lastInvocation: session.lastInvocation,
            islandId: session.islandId,
          },
          session.id
        );
      }
    });
  } else {
    if (deepdebug) console.log("persisting session " + asession.id);
    putItem(
      "session",
      {
        id: asession.id,
        moveLog: asession.moveLog,
        moveCounter: asession.moveCounter,
        lastInvocation: asession.lastInvocation,
        islandId: asession.islandId,
      },
      asession.id
    );
  }
};

// now we export the class, so other modules can create Penguin objects
module.exports = {
  Session: Session,
  getSession: getSession,
  createSession: createSession,
  persistSessions: persistSessions,
  initiateSessions: initiateSessions,
};
