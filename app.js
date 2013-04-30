
var serverConf = require('./config/server');
var pluginsConf = require('./config/plugins');

var Hapi = require('hapi');

var server = new Hapi.server(serverConf.hostname, serverConf.port, serverConf.options);

server.plugin.allow({
    ext: true
  })
  .require(pluginsConf, function(err) {
    if (err) {
      throw err;
    }
  });

var Passport = server.plugins.travelogue.passport;

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

Passport.use(new GoogleStrategy(serverConf.google,
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    done(null, profile);
  }
));

server.addRoute({
  method: 'GET',
  path: serverConf.urls.failureRedirect,
  config: {
    handler: function (request) {
      Passport.authenticate('google', {
        scope : ['email', 'profile']
      })(request);
    }
  }
});

server.addRoute({
  method: 'GET',
  path: '/auth/google/callback',
  config: {
    handler: function (request) {

      Passport.authenticate('google', {
        failureRedirect: serverConf.urls.failureRedirect,
        successRedirect: serverConf.urls.successRedirect,
        failureFlash: true
      })(request, function () {
        return request.reply.redirect('/').send();
      });

    }
  }
});

server.addRoute({
  method: 'GET',
  path : '/public/{path*}',
  config : {
    handler : {
      directory : {
        path : './public',
        listing : true,
        index : true
      }
    }
  }
})

server.addRoute({
  method : 'GET',
  path : '/app/',
  config : {
    handler : function(request) {
      var response = request.reply.view('index.html', {
        world : 'foobar'
      });
      response.send();
    }
  }
});

server.start(function() {
  console.log('server has started on port: %d', serverConf.port);
});