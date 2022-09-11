// DB stuff
const dbhelperReq = require("./dynamohelper.js"); // require("./acebasehelper.js");

// logger stuff
const loggerReq = require("./logger.js");
let log = loggerReq.log;
const LOGINFO = loggerReq.LOGINFO;
const LOGVERB = loggerReq.LOGVERB;
const LOGERR = loggerReq.LOGERR;

const realm = "session";
const source = "session.js";
const deepdebug = true;

// imports
const islandReq = require("./island.js");

let putItem = dbhelperReq.putItem;
let getItems = dbhelperReq.getItems;
let getItem = dbhelperReq.getItem;
let deleteItem = dbhelperReq.deleteItem;
let getIsland = islandReq.getIsland;

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
  constructor(id = 0, lastInvocation = 0, moveCounter = 0, moveLog = []) {
    this.id = id === 0 ? Math.floor(Math.random() * 99999999999) : id;
    this.lastInvocation =
      lastInvocation === 0 ? new Date().getTime() : lastInvocation;
    this.moveCounter = moveCounter;
    this.moveLog = [moveLog];
    log(
      realm,
      source,
      "constructor",
      "New session with id " + this.id + " last " + this.lastInvocation,
      LOGVERB
    );

    sessions.push(this);
  }

  // resets the session - that is set the moveCounter to 0

  reset() {
    this.moveCounter = 0;
    log(realm, source, "reset", "Session reset with id " + this.id);
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
    if (moveType !== 6 || deepdebug) {
      log(
        realm,
        source,
        "addMoveLog",
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
          newL,
        LOGINFO
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

// const registerSessions = () => {
//   sessions.forEach((session) => {
//     log(
//       realm,
//       source,
//       "registerSession",
//       "island " + session.islandId,
//       LOGVERB
//     );

//     let island = getIsland(session.islandId);
//     if (island) {
//       island.registerSession(session);
//     } else {
//       log(
//         realm,
//         source,
//         "registerSession",
//         "could not find island " + session.islandId,
//         LOGERR
//       );
//     }
//   });
// };

// create a new session and directly returns it, in the mean time saves the session to the db

const createSession = () => {
  log(realm, source, "createSession", "creating a new session", LOGINFO);
  let session = new Session();
  return session;
};

// gets the session out of the NoSQL db

const getSessionData = async (sessionId) => {
  log(
    realm,
    source,
    "getSessionData",
    "looking for session with id " + sessionId,
    LOGINFO
  );

  let sessionData = await getItem("session", sessionId);
  if (sessionData && sessionData.id) {
    log(
      realm,
      source,
      "getSession",
      "found a DB session " + sessionData.id,
      LOGINFO
    );

    return sessionData;
  }
};

// gets a new session - if there is an islandId it means it's requested fron a resetData function,
// which will take care of persisting it

const getSession = async (
  sessionId,
  lastInvocation = 0,
  moveCounter = 0,
  moveLog = []
) => {
  log(realm, source, "getSession", "creating a session " + sessionId, LOGINFO);

  let session = new Session(sessionId, lastInvocation, moveCounter, moveLog);
  // if (islandId === 0) await persistSessions(session);
  return session;
};

// persists the session in the NoSQL db

// const persistSessions = async (asession = null) => {
//   if (asession === null) {
//     log(
//       realm,
//       source,
//       "persistSessions",
//       "persisting sessions (no id)",
//       LOGINFO
//     );

//     sessions.forEach((session) => {
//       let currentTime = new Date().getTime();

//       // if (currentTime - session.lastInvocation > 300000) {
//       //   log(
//       //     realm,
//       //     source,
//       //     "persistSessions",
//       //     "Going to delete session " +
//       //       session.id +
//       //       " " +
//       //       session.lastInvocation +
//       //       " now:" +
//       //       currentTime,
//       //     LOGINFO
//       //   );

//       //   deleteItem("session", session.id);
//       // } else {
//       log(
//         realm,
//         source,
//         "persistSessions",
//         "persisting session in DB " +
//           session.id +
//           " island: " +
//           session.islandId,
//         LOGINFO
//       );

//       putItem(
//         "session",
//         {
//           id: session.id,
//           moveLog: session.moveLog,
//           moveCounter: session.moveCounter,
//           lastInvocation: session.lastInvocation,
//           islandId: session.islandId,
//         },
//         session.id
//       );
//       // }
//     });
//   } else {
//     log(
//       realm,
//       source,
//       "persistSessions",
//       "persisting session " + asession.id + " island: " + asession.islandId,
//       LOGVERB
//     );

//     await putItem(
//       "session",
//       {
//         id: asession.id,
//         moveLog: asession.moveLog,
//         moveCounter: asession.moveCounter,
//         lastInvocation: asession.lastInvocation,
//         islandId: asession.islandId,
//       },
//       asession.id
//     );
//   }
// };

// Session: Session,

// now we export the class, so other modules can interact with the session objects
module.exports = {
  Session: Session,
  getSession: getSession,
  getSessionData: getSessionData,
  createSession: createSession,
};
