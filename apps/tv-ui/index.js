var express     = require('express'),
    morgan      = require('morgan'),
    app         = express(),
    serveStatic = express.static,
    port        = process.env.PORT || 5200;

app.use(morgan(':remote-addr ":referrer" :remote-user :method :url HTTP/:http-version :status :res[content-length] range: (:req[range]) - :response-time ms'));
app.use(serveStatic('static'));
console.log('listening on port '+port);
app.listen(port);
