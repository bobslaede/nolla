
module.exports = {
  hostname : 'localhost',
  port : 3003,
  urls : {
    failureRedirect : '/login',
    successRedirect : '/'
  },
  google : {
    clientID : '75672706662.apps.googleusercontent.com',
    clientSecret : 'ApQubYsUnmQW48ipWeHqq-N-',
    callbackURL : 'http://localhost:3000/auth/google/callback'
  },
  options : {
    views : {
      path : 'public/app/templates',
      engine: {
        module: 'ejs'
      }
    }
  }
};