'use strict';

module.exports = function (server) {

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
  });

  server.addRoute({
    method : 'GET',
    path : '/app/',
    config : {
      auth : 'passport',
      handler : function (request) {
        var response = request.reply.view('index.html', {
          world : 'foobar'
        });
        response.send();
      }
    }
  });

};