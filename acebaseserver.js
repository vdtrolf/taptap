const { AceBaseServer } = require('acebase_server');
const options = { logLevel: "info" }; //   'verbose'};
const server = new AceBaseServer("my_db", options);
server.ready(() => {
  console.log("server is running");
    // Server running
});