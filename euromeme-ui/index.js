var express     = require('express'),
    morgan      = require('morgan'),
    serveStatic = express.static,
    app         = express(),
    port        = process.env.PORT || 5000;

app.use(morgan('short'));
app.use(serveStatic('static'));
console.log('listening on port '+port);
app.listen(port);
