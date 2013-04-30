var server = require('./server');

module.exports = {
  yar : {
    cookieOptions : {
      password: 'this is the vixi',
      isSecure : false
    }
  },
  travelogue: server.config
};