
var config = {
  hostname : 'localhost',
  port : 3003,
  secret : 'nolla nolla nolla wow!'
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
  callbackURL : 'http://' + config.hostname + (config.port ? ':' + config.port : '') + config.urls.callback
};

module.exports = config;