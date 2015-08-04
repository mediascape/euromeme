var multicastDNS = require('multicast-dns'),
    os      = require('os'),
    ip      = require('ip'),
    debug   = require('debug')('mdns'),
    partial = require('lodash/function/partial'),
    times   = require('lodash/utility/times'),
    values  = require('lodash/object/values'),
    forEach = require('lodash/collection/forEach'),
    cloneDeep  = require('lodash/lang/cloneDeep'),
    Promise = require('es6-promise').Promise;

module.exports = function (config) {
  var mdns = multicastDNS(),
      recordsPromise = getIps().then( partial(createRecords, config) );

  return {
    advertise: partial(advertise, mdns, recordsPromise),
    goodbye: partial(goodbye, mdns, recordsPromise),
    destroy: partial(destroy, mdns)
  };
};

/*
  Public function to create mDNS record
  data, publish it initially and respond
  to queries for it
  Returns: <Promise>
              - resolves when chain is complete
              - rejects on any errors
*/
function advertise(mdns, recordsPromise) {
  return recordsPromise
    .then( partial(announceOnNetwork, mdns) )
    .then( partial(listenForQueries, mdns) )
    .catch(function (err) { console.error(err.stack); });
}

/*
  Public function to send a goodbye mDNS record set
  Returns <Promise> resolved when records have been sent
*/
function goodbye(mdns, recordsPromise) {
  return recordsPromise
    .then( createGoodByeRecords )
    .then( partial(announceOnNetwork, mdns) );
}

/*
  Public function that destroys the mdns instance
  Returns <Promise> a resolved promise
*/
function destroy(mdns) {
  mdns.destroy();
  return Promise.resolve();
}

/*
  Local v4 IP of machine
*/
function getIps() {
  return Promise.resolve(ip.address());
}

/*
  Create mDNS records
  Returns: <Object> with each record as a key e.g.
            meta, ptr, srv, txt, a

  TODO: Create ipv6 AAAA record
*/
function createRecords(config, ipv4) {
  var domain          = 'local',
      serviceType     = '_mediascape-http._tcp.' + domain,
      hostname        = os.hostname(),
      instanceName    = config.instanceName.replace( '{hostname}', hostname.replace('.local', '') ),
      serviceInstance = instanceName + '.' + serviceType,
      port = config.port,
      records = {};

  records.meta = { type: 'PTR', name: '_services._dns-sd._udp.local', ttl: 75 * 60, data: serviceType };
  records.ptr  = { type: 'PTR', name: serviceType, ttl: 75 * 60, data: serviceInstance };
  records.srv  = { type: 'SRV', name: serviceInstance, ttl: 75 * 60, data: { port: port, target: hostname } };
  records.txt  = { type: 'TXT', name: serviceInstance, ttl: 75 * 60, data: '' };
  records.a    = { type: 'A',   name: hostname, ttl: 120,            data: ipv4 };

  debug('created records', records);

  return records;
}

function createGoodByeRecords(records) {
  var recs = {};

  forEach(records, function (record, type) {
    var rec = cloneDeep(record);
    rec.ttl = 0;
    recs[type] = rec;
  });

  return recs;
}

/*
  The MDNS spec indicates that we should broadcast
  between 2-8 times on startup.
  OS X's mdns services sends 3
*/
function announceOnNetwork(mdns, records) {
  return Promise.all(
    times( 3, createAnswerResponderWithDelay(mdns, values(records)) )
  ).then(function () {
    return records;
  });
}

/*
  Broadcasts a single set of records with a delay determined
  by the number passed into the returned function.
  e.g. if called with 2, delay will be 2000 ms
*/
function createAnswerResponderWithDelay(mdns, answers) {
  return function (callCount) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        mdns.response({ answers: answers }, resolve);
      }, 1000 * callCount);
    });
  }
}

function listenForQueries(mdns, records) {
  mdns.on('query', function(query) {
    debug('Got a query packet with questions:', query.questions.length);
    query.questions.forEach(function (qn) {
      var response;

      debug('Question: ', qn);

      if (qn.type === 'PTR' && qn.name === records.ptr.name) {
        response = {
          answers: [ records.ptr ],
          additionals: [ records.srv, records.txt, records.a/*, records.aaaa*/ ]
        };
      } else if (qn.type === 'SRV' && qn.name === records.srv.name) {
        response = {
          answers: [ records.srv ],
          andditionals: [ records.txt, records.a/*, records.aaaa*/ ]
        };
      } else if (qn.type === 'TXT' && qn.name === records.txt.name ) {
        response = {
          answers: [ records.txt ]
        };
      } else if (qn.type === 'PTR' && qn.name === records.meta.name) {
        response = {
          answers: [ records.meta ]
        };
      }
      // TODO: Respond to A and AAAA questions

      if (response) {
        debug('Sending response', response);
        mdns.respond(response);
      }
    });
  });
}
