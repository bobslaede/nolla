var hostname = process.env.IP ? 'nolla.bobslaede.c9.io' : 'localhost';
var db = 'mongodb://nolla:sudo@dharma.mongohq.com:10075/nolla';
if (hostname == 'localhost') {
  db = 'mongodb://localhost/nolla';
}

var config = {
  hostname : hostname,
  port : 3003,
  secret : 'nolla nolla nolla wow!',
  db : db
};

config.urls = {
  login : '/login',
  logout : '/logout',
  failureRedirect : '/login',
  successRedirect : '/nolla',
  callback : '/auth/google/callback'
};

config.google = {
  clientID : '75672706662.apps.googleusercontent.com',
  clientSecret : 'ApQubYsUnmQW48ipWeHqq-N-',
  callbackURL : 'http://' + config.hostname  + config.urls.callback
};

module.exports = config;