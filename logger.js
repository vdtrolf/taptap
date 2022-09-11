const LOGVERB = 0;
const LOGINFO = 1;
const LOGERR = 2;
const LOGALL = 3;
const LOGTEXT = 0;
const LOGDATA = 1;
const LOGDUMP = 2;

const realms = [];
let allRealms = false;
let loglevel = LOGERR;

const setLogLevel = (realm, level = LOGERR) => {
  if (realm === "all") {
    allRealms = true;
  } else {
    realms.push(realm);
  }
  loglevel = level;
};

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
      if (allRealms || realms.includes(realm)) {
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
