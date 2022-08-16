const { AceBaseServer } = require('acebase-server');
const dbname = 'my_db';
const server = new AceBaseServer(dbname, { host: 'localhost', port: 5757, authentication: { enabled: false}, logLevel: "info" });
server.ready(() => {
  console.log("server is running");
    // Server running
});
