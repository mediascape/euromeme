var mDNSResponder = require('./lib/mdns'),
    Relay         = require('./lib/relay');

var port = process.env.PORT || 5100;

var mdns = new mDNSResponder({ port: port, instanceName: 'mediascape-tv-{hostname}' }),
    relay = new Relay({ port: port });

// Advertise this TV
mdns.advertise();


// Do any tidying up on shutdown, including
//
function cleanup(err) {
  console.log('Cleaning up before shutdown...');
  if (err) { console.log(err.stack); }

  // Announce that this TV is gone
  mdns.goodbye()
    .then(function () {
      // Clean up the mdns instance
      return mdns.destroy();
    })
    .then(function () {
      console.log('...exit');
      process.exit();
    });
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
process.on('uncaughtException', cleanup);
