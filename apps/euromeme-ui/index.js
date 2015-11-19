var express     = require('express'),
    morgan      = require('morgan'),
    fs          = require('fs'),
    discovery   = require('./discovery-ws-server'),
    serveStatic = express.static,
    app         = express(),
    port        = process.env.PORT || 5000,
    ip          = process.env.IP,
    server;

// Start listener
app.use(morgan(':remote-addr ":referrer" :remote-user :method :url HTTP/:http-version :status :res[content-length] range: (:req[range]) - :response-time ms'));
app.use(serveStatic('static'));
console.log('listening on port '+port);
server = app.listen(port);

//If IP is present, rewrite the config file
//This isn't a great way of doing it, but it's a very common usecase
//The config needs to be static so the client side js can read it

//Replace all IPs with our new one, if it's not blank and generally makes sense
console.log("IP is "+ip);
if(ip && ip!="" && ip.match(/([0-9]*\.){3}[0-9]*/)){

//Read config file
  var config = require('./static/config.json');

  Object.keys(config).forEach(function(key) {
    var val = config[key];
    var replaced = val.replace(/([0-9]*\.){3}[0-9]*/,ip);
    config[key] = replaced;
    
  }) 

  var newConfig = JSON.stringify(config,null, ' ');
  fs.writeFile('./static/config.json', newConfig, function (err) {
    if (err) {
      console.log('There has been an error saving your configuration data.');
      console.log(err.message);
      return;
    }
    console.log('Configuration saved successfully.')
  });

  console.log("IP replaced in config file: ");
  console.log(config);
      
}else{
  console.log("IP not replaced "+ip);
}


discovery.start(server);
