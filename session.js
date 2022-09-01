// const dbhelperReq = require("./acebasehelper.js");
const dbhelperReq = require("./dynamohelper.js");
const islandReq = require("./island.js");

let putItem = dbhelperReq.putItem;
let getItems = dbhelperReq.getItems;
let getItem = dbhelperReq.getItem;
let deleteItem = dbhelperReq.deleteItem;
let getIsland = islandReq.getIsland;
let registerSession = islandReq.registerSession;

let debug = false;
let deepdebug = false;
let loaded = false;

let sessions = [];
const moveTypes = [
  "init",
  "move",
  "grow",
  "eat",
  "love",
  "die",
  "still",
  "fish",
];

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
    if (deepdebug) {
      console.log(
        "session.js - constructor : New session with id " +
          this.id +
          " last " +
          this.lastInvocation
      );
    }

    sessions.push(this);

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
    let baseDate = new Date("8/1/22");
    let moveTimer = Math.floor((new Date().getTime() - baseDate) / 100);
    if ((debug && moveType !== 6) || deepdebug) {
      console.log(
        "session.js - addMoveLog : " +
          moveTimer +
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
        moveid: moveTimer,
        id: id,
        num: num,
        moveType: moveType, // 1 = move
        direction: moveDir, // necessary for fishing direction
        movements: [],
        cat: cat,
        state: state,
      });
    } else {
      this.moveLog.push({
        moveid: moveTimer,
        id: id,
        num: num,
        moveType: moveType, // 1 = move
        direction: moveDir, // necessary for fishing direction
        movements: [
          {
            movmtid: moveTimer,
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
      //      }
    }
  }
}

const initiateSessions = (callBack) => {
  if (deepdebug) {
    console.log("session.js - initiateSessions: getting sessions out of DB");
  }

  sessions = [];
  getItems("session", loadSessions, "id", ">", 0, callBack);
};

const loadSessions = (theSessions, callBack) => {
  if (deepdebug) {
    console.log(
      "session.js - loadSessions: found " + theSessions.length + " sessions"
    );
  }

  theSessions.forEach((asession) => {
    let session = new Session(
      asession.id,
      asession.lastInvocation,
      asession.islandId,
      asession.moveCounter,
      asession.moveLog
    );
    // sessions.push(session);
  });

  callBack();
};

const registerSessions = () => {
  sessions.forEach((session) => {
    if (deepdebug) {
      console.log("session.js registerSession : island " + session.islandId);
    }

    let island = getIsland(session.islandId);
    if (island) {
      island.registerSession(session);
    } else {
      console.log(
        "session.js registerSession : could not find island " + session.islandId
      );
    }
  });
};

// create a new session and directly returns it, in the mean time saves the session to the db

const createSession = () => {
  let session = new Session();
  return session;
};

// gets the session, either out of the local array or out of the NoSQL db

const getSession = async (sessionId) => {
  if (deepdebug) {
    console.log(
      "session.js - getSession: looking for session with id " + sessionId
    );
  }

  let sessionData = await getItem("session", sessionId);
  if (sessionData && sessionData.id) {
    if (deepdebug) {
      console.log(
        "session.js - getSession:: found a DB session " + sessionData.id
      );
    }
    return sessionData;
  } else {
    if (deepdebug) {
      console.log("session.js - getSession:: creating a session " + sessionId);
    }
    let session = new Session(sessionId);
    await persistSessions("4", session);
    return session;
  }
};

// persists the session in the NoSQL db

const persistSessions = async (orig, asession = null) => {
  if (asession === null) {
    if (deepdebug)
      console.log(
        "session.js - persistSessions(1) : persisting sessions (no id) " +
          sessions.length
      );

    sessions.forEach((session) => {
      let currentTime = new Date().getTime();

      if (currentTime - session.lastInvocation > 300000) {
        if (deepdebug) {
          console.log(
            "session.js - persistSessions(2) : Going to delete session " +
              session.id +
              " " +
              session.lastInvocation +
              " now:" +
              currentTime
          );
        }
        deleteItem("session", session.id);
      } else {
        if (deepdebug)
          console.log(
            "session.js - persistSessions(3) : persisting session in DB " +
              session.id +
              " island: " +
              session.islandId
          );
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
    if (deepdebug)
      console.log(
        "session.js - persistSessions(4) : persisting session " +
          asession.id +
          " island: " +
          asession.islandId
      );
    await putItem(
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

// Session: Session,

// now we export the class, so other modules can interact with the session objects
module.exports = {
  getSession: getSession,
  createSession: createSession,
  persistSessions: persistSessions,
  initiateSessions: initiateSessions,
  registerSessions: registerSessions,
};
