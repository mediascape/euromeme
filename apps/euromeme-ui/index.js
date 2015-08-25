var express     = require('express'),
    morgan      = require('morgan'),
    discovery   = require('./discovery-ws-server'),
    serveStatic = express.static,
    app         = express(),
    port        = process.env.PORT || 5000,
    server;

// Start listener
app.use(morgan(':remote-addr ":referrer" :remote-user :method :url HTTP/:http-version :status :res[content-length] range: (:req[range]) - :response-time ms'));
app.use(serveStatic('static'));
console.log('listening on port '+port);
server = app.listen(port);

discovery.start(server);
