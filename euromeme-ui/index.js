var express     = require('express'),
    app         = express(),
    serveStatic = require('serve-static'),
    port        = process.env.PORT || 5000;

app.use(serveStatic('static'));
console.log('listening on port '+port);
app.listen(port);
