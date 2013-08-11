var hostname = process.env.IP ? 'nolla.bobslaede.c9.io' : 'localhost';
var db = 'mongodb://nolla:sudo@dharma.mongohq.com:10075/nolla';

if (hostname === 'localhost') {
  db = 'mongodb://localhost/nolla';
}

var config = {
  hostname : hostname,
  port : 3003,
  secret : 'nolla nolla nolla wow!',
  db : db
};

config.google = {
  clientIds : [
    '75672706662.apps.googleusercontent.com', // webapp
    '75672706662-h20bb90m1rij7d4f9ihg7b8mjttfq0jr.apps.googleusercontent.com' // packaged app
    ],
  clientSecret : 'ApQubYsUnmQW48ipWeHqq-N-'
};

module.exports = config;
