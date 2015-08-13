var express     = require('express'),
    morgan      = require('morgan'),
    app         = express(),
    serveStatic = express.static,
    port        = process.env.PORT || 5200;

app.use(morgan('short'));
app.use(serveStatic('static'));
console.log('listening on port '+port);
app.listen(port);
