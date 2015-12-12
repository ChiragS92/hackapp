var mainserver = require("./server");
    config = require("./config/config.js");

var port = process.env.PORT || config.port;

mainserver.listen(port, function() {
  console.log('Listening to', port);
});
