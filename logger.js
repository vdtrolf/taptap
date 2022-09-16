const LOGVERB = 0;
const LOGINFO = 1;
const LOGERR = 2;
const LOGALL = 3;
const LOGTEXT = 0;
const LOGDATA = 1;
const LOGDUMP = 2;

const infoRealms = [];
const verbRealms = [];
let allInfoRealms = false;
let allVerbRealms = false;

// default loglevel
let loglevel = LOGERR;

// sets the log level either for all realms or a specific realm 
// log level can be INFO or VERBOSE (ERROR is always displayed)
const setLogLevel = (realm, level = LOGERR) => {
  if (realm === "all" && level === LOGINFO) {
    allInfoRealms = true;
    console.log("logger.js - setLogLevel - adding all to info mode");
  } else if (realm === "all" && level === LOGVERB) {
    allVerbRealms = true;
    console.log("logger.js - setLogLevel - adding all to verbose mode");
  } else {
    if (level === LOGVERB) {
      verbRealms.push(realm);
      console.log("logger.js - setLogLevel - adding " + realm + " to verbose mode");
    } else {
      infoRealms.push(realm);
      console.log("logger.js - setLogLevel - adding " + realm + " to info mode");
    }
  }
  if (level < loglevel) loglevel = level;
};

// Log function - based on the realm and the loglevel decides if the log is to be displayed
const log = (
  realm,
  origclass,
  origfunction,
  logtext,
  level = LOGINFO,
  logtype = LOGTEXT
) => {
  if (level >= loglevel) {
    if (level === LOGERR) {
      console.error(origclass + "-" + origfunction + "\n", logtext);
    } else {
      if (
        (level === LOGINFO && (allInfoRealms || infoRealms.includes(realm))) ||
        (level === LOGVERB && (allVerbRealms || verbRealms.includes(realm)))
      ) {
        if (logtype === LOGTEXT) {
          console.log(origclass + "-" + origfunction + ": " + logtext);
        } else if (logtype === LOGDATA) {
          console.log(`/ /---- ${origclass} - ${origfunction} -------\\ \\`);
          console.log(logtext);
          console.log(`\\ \\---- ${origclass} - ${origfunction} -------/ /`);
        } else if (logtype === LOGDUMP) {
          console.log(logtext);
        }
      }
    }
  }
};

module.exports = {
  setLogLevel: setLogLevel,
  log: log,
  LOGVERB: LOGVERB,
  LOGINFO: LOGINFO,
  LOGERR: LOGERR,
  LOGALL: LOGALL,
  LOGTEXT: LOGTEXT,
  LOGDATA: LOGDATA,
  LOGDUMP: LOGDUMP,
};
