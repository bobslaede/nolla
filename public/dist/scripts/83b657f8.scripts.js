'use strict';
var nolla = angular.module('nolla', [
    'socket',
    'hashKeyCopier',
    'ui.compat',
    'goog',
    'auth'
  ]).config([
    'socketProvider',
    '$stateProvider',
    '$urlRouterProvider',
    'gapiProvider',
    'authProvider',
    function (socketProvider, $stateProvider, $urlRouterProvider, gapiProvider, authProvider) {
      gapiProvider.setClientId('75672706662.apps.googleusercontent.com');
      gapiProvider.setKey('AIzaSyAq9qPcsZoBDXtFP-Zt1whLgMTD3ZUnqY8');
      gapiProvider.setScopes([
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]);
      socketProvider.setServer('http://localhost:3003');
      authProvider.setHost('http://localhost:3003');
      moment.lang('da');
      $stateProvider.state('app', {
        url: '',
        controller: 'InitCtrl',
        templateUrl: 'views/index.html'
      }).state('app.main', {
        url: '/nolla',
        abstract: true,
        resolve: {
          clientListResolved: function (socket, clients, $q) {
            var d = $q.defer();
            socket.socketPromise.then(function () {
              if (clients.list.length === 0) {
                clients.populate(function () {
                  console.log('populated clients list early!');
                  d.resolve();
                });
              } else {
                d.resolve();
              }
            });
            return d.promise;
          },
          user: function (auth, $state, $q) {
            var d = $q.defer();
            console.log('getting when authed');
            auth.getAuth().then(function (user) {
              d.resolve(user);
            }, function () {
              $state.transitionTo('app');
              d.reject();
            });
            return d.promise;
          }
        },
        controller: 'MainCtrl',
        templateUrl: 'views/main.html'
      }).state('app.main.client', {
        url: '/client/{clientId}',
        controller: 'ClientCtrl',
        templateUrl: 'views/client.html'
      }).state('app.main.journal', {
        url: '/journal/{clientId}',
        controller: 'JournalCtrl',
        templateUrl: 'views/journal.html'
      }).state('app.main.calendar', {
        url: '/calendar/{clientId}',
        controller: 'CalendarCtrl',
        templateUrl: 'views/calendar.html'
      });
    }
  ]).run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });
'use strict';
angular.module('socket', []).provider('socket', function () {
  console.log('socket provider');
  var server;
  this.setServer = function (value) {
    server = value;
  };
  this.$get = [
    '$window',
    '$rootScope',
    '$q',
    function ($window, $rootScope, $q) {
      var io = $window.io;
      var d = $q.defer();
      var socket = io.connect(server);
      $window.socket = socket;
      socket.on('connect', function () {
        d.resolve();
      });
      return {
        on: function (event, cb) {
          socket.on(event, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              cb.apply(socket, args);
            });
          });
        },
        emit: function (event, data, cb) {
          cb = cb || function () {
          };
          socket.emit(event, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              cb.apply(socket, args);
            });
          });
        },
        socket: socket,
        socketPromise: d.promise
      };
    }
  ];
});
'use strict';
angular.module('goog', []).provider('gapi', function () {
  var clientId = '';
  this.setClientId = function (value) {
    clientId = value;
  };
  var key = '';
  this.setKey = function (value) {
    key = value;
  };
  var scopes = [];
  this.setScopes = function (value) {
    scopes = value;
  };
  var immediate = true;
  this.setImmediate = function (value) {
    immediate = !!value;
  };
  var responseType = 'token';
  this.setResponseType = function (value) {
    responseType = value;
  };
  var url = 'https://apis.google.com/js/client:plusone.js';
  this.setUrl = function (value) {
    url = value;
  };
  var accessType = 'online';
  this.setAccessType = function (value) {
    accessType = value;
  };
  var redirectUri = '';
  this.setRedirectUri = function (value) {
    redirectUri = value;
  };
  var onloadName = 'angularCallbackGapiOnload';
  var gapi;
  this.$get = [
    '$q',
    '$http',
    '$rootScope',
    '$window',
    function ($q, $http, $rootScope, $window) {
      var loadedDeferred = $q.defer();
      var authorizedDeferred = $q.defer();
      var _isLoaded = false;
      this.load = function () {
        if (_isLoaded === true) {
          gapi = $window.gapi;
          console.info('gapi already loaded');
          loadedDeferred.resolve(gapi);
        } else {
          $window[onloadName] = angular.bind(this, function () {
            gapi = $window.gapi;
            console.info('gapi onload callback fired');
            _isLoaded = true;
            loadedDeferred.resolve(gapi);
            $rootScope.$digest();
          });
          $http.jsonp(url + '?onload=' + onloadName);
        }
        return loadedDeferred.promise;
      };
      loadedDeferred.promise.then(function () {
        gapi.client.setApiKey(key);
      });
      this.auth = function (options) {
        options = _.extend({ silent: false }, options || {});
        console.debug('gapi auth options', options);
        var authCallback = function (response) {
          console.debug('gapi auth callback', response);
          if (!response || response.error) {
            console.warn('Not authorized', response && response.error);
            authorizedDeferred.reject(response);
          } else {
            console.info('Authorized');
            authorizedDeferred.resolve(response);
            $rootScope.$digest();
          }
          $rootScope.$digest();
        };
        var auth = function () {
          _.defer(function () {
            gapi.auth.authorize({
              'client_id': clientId,
              'scope': scopes,
              'immediate': !!options.silent,
              'access_type': accessType
            }, authCallback);
          });
        };
        loadedDeferred.promise.then(function () {
          _.defer(auth);
        });
        return authorizedDeferred.promise;
      };
      return this;
    }
  ];
});
(function (angular) {
  'use strict';
  angular.module('auth', []).provider('auth', function () {
    var host = '';
    this.setHost = function (value) {
      host = value;
    };
    this.$get = [
      '$http',
      '$q',
      '$rootScope',
      'gapi',
      function ($http, $q, $rootScope, gapi) {
        var self = this;
        this.isAuthed = false;
        this.user = undefined;
        this.token = undefined;
        var authWithChromeIdentity = function (options) {
          var d = $q.defer();
          console.debug('We are in a packaged app, options:', options);
          chrome.experimental.identity.getAuthToken({ interactive: !options.silent }, function (accessToken) {
            console.info('chrome responded with', accessToken);
            if (accessToken !== undefined) {
              var response = { 'access_token': accessToken };
              d.resolve(response);
              $rootScope.$digest();
            } else {
              d.reject();
              $rootScope.$digest();
            }
          });
          return d.promise;
        };
        var authWithGapi = function (options) {
          var d = $q.defer();
          console.debug('this is a website, trying to authenticate with gapi, options:', options);
          gapi.load().then(function () {
            console.info('gapi has loaded');
            gapi.auth({ silent: !!options.silent }).then(function (response) {
              console.info('gapi auth resolved', response);
              if (response && !response.error) {
                d.resolve(response);
              } else {
                d.reject(response && response.error);
              }
            }, function () {
              console.info('gapi auth rejected');
              d.reject();
            });
          });
          return d.promise;
        };
        this.askForAuthentication = function (options) {
          options = _.extend({ silent: false }, options || {});
          if (window.chrome && window.chrome.experimental && window.chrome.experimental.identity) {
            return authWithChromeIdentity(options);
          } else {
            return authWithGapi(options);
          }
        };
        this.tryAuth = function () {
          var d = $q.defer();
          console.info('trying to auth without asking the user');
          self.askForAuthentication({ silent: true }).then(function (token) {
            console.log('got token without asking!');
            d.resolve(token);
          }, function () {
            console.log('didnt get token, will ask the user now');
            self.askForAuthentication({ silent: false }).then(function (token) {
              console.log('got token when asked');
              d.resolve(token);
            }, function () {
              console.log('didnt get token even tho i asked');
              d.reject();
            });
          });
          return d.promise;
        };
        this.validateWithServer = function (token) {
          var d = $q.defer();
          $http.post(host + '/auth', token).success(function (response) {
            if (response && response._id) {
              d.resolve(response);
            } else {
              d.reject();
            }
          }, function (err) {
            d.reject(err);
          });
          return d.promise;
        };
        this.auth = function () {
          console.log('trying to auth');
          var d = $q.defer();
          self.tryAuth().then(self.validateWithServer).then(function (user) {
            self.user = user;
            d.resolve();
          });
          return d.promise;
        };
        var authedDeferred = $q.defer();
        this.getAuth = function () {
          if (self.user) {
            authedDeferred.resolve(self.user);
          } else {
            $http.get(host + '/auth' + '?' + Math.random()).success(function (response) {
              if (response && response._id) {
                console.log('i am logged in', response);
                self.user = response;
                authedDeferred.resolve();
              } else {
                console.log('i am not logged in');
                authedDeferred.resolve(self.auth());
              }
            }).error(authedDeferred.reject);
          }
          return authedDeferred.promise;
        };
        this.whenAuthed = function () {
          return authedDeferred.promise;
        };
        return this;
      }
    ];
    return this;
  });
}(angular));
(function (angular) {
  'use strict';
  angular.module('nolla').provider('server', function () {
    var self = this;
    this.socket = undefined;
    this.model = {
      apps: [],
      user: {}
    };
    this.$get = [
      'auth',
      'socket',
      '$q',
      '$rootScope',
      '$log',
      'HashKeyCopier',
      function (auth, socket, $q, $rootScope, $log, HashKeyCopier) {
        this.socket = socket;
        socket.on('connect', function () {
          console.log('socket connected');
        });
        socket.on('error', function (err) {
          $log.error(err);
        });
        socket.on('apps:list', function (apps) {
          self.model.apps = HashKeyCopier.copyHashKeys(self.model.apps, apps);
          self.apps = apps;
        });
        this.getModel = function (key, query, options) {
          var query = query;
          var model = {};
          var options = _.extend({
              before: function (arg) {
                return arg;
              },
              after: function (arg) {
                return arg;
              }
            }, options);
          model.list = [];
          var _remove = function (response) {
            var newArray = _.reject(model.list, function (item) {
                return response._id && item._id && item._id === response._id;
              });
            model.list = HashKeyCopier.copyHashKeys(model.list, newArray, ['_id']);
          };
          var fixBeforeSendingToServer = function (obj) {
            var newObj = _.clone(obj);
            delete newObj.$$hashKey;
            options.after(newObj);
            return newObj;
          };
          var wrap = function (obj) {
            if (_.isArray(obj)) {
              _.map(obj, wrap);
            } else {
              if (obj) {
                var save = function () {
                  socket.emit(key + ':save', fixBeforeSendingToServer(obj), function (response) {
                    _.extend(obj, HashKeyCopier.copyHashKeys(obj, response, ['_id']));
                    obj.$rewrap();
                  });
                };
                options.before(obj);
                watch(obj, save);
                obj.$unwrap = function () {
                  unwatch(obj, save);
                };
                obj.$rewrap = function () {
                  obj.$unwrap();
                  watch(obj, save);
                };
                obj.$remove = function () {
                  var index = model.list.indexOf(this);
                  model.list.splice(index, 1);
                  socket.emit(key + ':remove', fixBeforeSendingToServer(this));
                };
                obj.$save = function () {
                  save();
                };
              }
            }
            return obj;
          };
          model.findById = function (id) {
            var searched = _.filter(model.list, function (item) {
                return item._id === id;
              });
            if (searched.length === 1) {
              return searched[0];
            }
            return false;
          };
          model.setQuery = function (value) {
            query = value;
          };
          model.populate = function (cb) {
            socket.socketPromise.then(function () {
              socket.emit(key + ':list', query, function (response) {
                model.list = HashKeyCopier.copyHashKeys(model.list, wrap(response), ['_id']);
                (cb || function () {
                })();
              });
            });
            return model;
          };
          model.add = function (obj) {
            var d = $q.defer();
            socket.emit(key + ':add', obj, function (response) {
              var n = wrap(response);
              model.list.push(n);
              d.resolve(response);
            });
            return d.promise;
          };
          model.remove = function (inst) {
            var index = model.list.indexOf(inst);
            model.list.splice(index, 1);
            socket.emit(key + ':remove', fixBeforeSendingToServer(inst));
          };
          socket.on(key + ':list', function (data) {
            model.populate();
          });
          socket.on(key + ':add', function (data) {
            var me = socket.socket.socket.sessionid;
            if (me !== data.origin) {
              if (data.data && data.data._id && false) {
                var old = model.findById(data.data._id);
                if (old) {
                  old.$unwrap();
                  old = _.extend(old, data.data);
                  wrap(old);
                } else {
                  var n = wrap(data.data);
                  model.list.push(n);
                }
              } else {
                model.populate();
              }
            }
          });
          socket.on(key + ':update', function (data) {
            var me = socket.socket.socket.sessionid;
            if (me !== data.origin) {
              if (data.data && data.data._id) {
                var old = model.findById(data.data._id);
                if (old) {
                  old.$unwrap();
                  old = _.extend(old, data.data);
                  wrap(old);
                } else {
                  model.populate();
                }
              } else {
                model.populate();
              }
            }
          });
          socket.on(key + ':remove', function (data) {
            var me = socket.socket.socket.sessionid;
            if (me !== data.origin) {
              model.populate();
            }
          });
          return model;
        };
        this.selectApp = function (app) {
          this.socket.emit('apps:select', app, function () {
            self.app = app;
          });
        };
        return this;
      }
    ];
  });
}(angular));
(function (angular) {
  'use strict';
  angular.module('nolla').provider('app', function () {
    this.$get = function () {
      return this;
    };
  });
}(angular));
'use strict';
angular.module('nolla').provider('clients', function () {
  console.log('clients service');
  this.$get = [
    'server',
    function (server) {
      var model = server.getModel('clients').populate();
      model.schema = {};
      return model;
    }
  ];
});
'use strict';
angular.module('nolla').provider('journalentries', function () {
  console.log('journalentries service');
  this.$get = [
    'server',
    function (server) {
      return {
        getHelpers: function () {
          var model = server.getModel('journalhelpers');
          model.populate();
          return model;
        },
        fromClient: function (client) {
          var query = { client: client._id };
          var model = server.getModel('journalentries', query, {
              before: function (obj) {
              },
              after: function (obj) {
              }
            }).populate();
          model.schema = {};
          return model;
        }
      };
    }
  ];
});
'use strict';
angular.module('nolla').filter('moment', function () {
  return function (str, expression) {
    if (!str) {
      return '';
    }
    return moment(str).format(expression);
  };
});
'use strict';
angular.module('nolla').directive('nlModal', function () {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      element.appendTo('body');
      scope.$on('$destroy', function () {
        _.defer(function () {
          element.remove();
        });
      });
    }
  };
});
'use strict';
angular.module('nolla').directive('nlScroll', function () {
  return {
    restrict: 'A',
    compile: function () {
      return {
        post: function (scope, element, attrs, controller) {
          console.log(element.height());
        }
      };
    },
    link: function postLink(scope, element, attrs) {
      scope.$watch(function () {
        console.log('scroll changed');
      });
      element[0].scrollTop = 1000000;
    }
  };
});
angular.module('nolla').directive('contenteditable', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
      element.on('input', function () {
        scope.$apply(function () {
          ctrl.$setViewValue(element.html());
        });
      });
      ctrl.$render = function () {
        element.html(ctrl.$viewValue);
      };
    }
  };
});
'use strict';
angular.module('nolla').directive('nlJournalEntry', function () {
  return {
    restrict: 'A',
    controller: [
      '$scope',
      function ($scope) {
      }
    ],
    link: function postLink(scope, element, attrs) {
      var model = scope[attrs['nlJournalEntry']];
      element.on('dragover dragenter', function (e) {
        e.preventDefault();
      });
      element.on('drop', function (e) {
        e.preventDefault();
        if (scope.entry.locked) {
          return;
        }
        var data = e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.getData('application/json');
        var obj = JSON.parse(data);
        var toSave = {};
        toSave.origin = obj._id;
        toSave.description = obj.description;
        toSave.originaldescription = obj.description;
        toSave.name = obj.name;
        model.entryData.push(toSave);
      });
    }
  };
});
'use strict';
angular.module('nolla').directive('nlJournalEntryHelper', function () {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      element.on('dragstart', function (e) {
        var data = JSON.stringify(scope[attrs.nlJournalEntryHelper]);
        console.log(data);
        e.originalEvent.dataTransfer.setData('application/json', data);
      });
    }
  };
});
'use strict';
angular.module('nolla').controller('InitCtrl', [
  '$scope',
  'auth',
  '$state',
  function ($scope, auth, $state) {
    console.log('InitCtrl');
    auth.getAuth().then(function () {
      console.log('trans to app.main', $state.current, $state.params);
      var state = $state.current;
      if (state.name == 'app') {
        console.log('already here');
        state = 'app.main.client';
      }
      $state.transitionTo(state, $state.params);
    });
  }
]);
'use strict';
angular.module('nolla').controller('MainCtrl', [
  '$scope',
  '$state',
  'clients',
  'app',
  'auth',
  function ($scope, $state, clients, app, auth) {
    console.log('MainCtrl');
    $scope.clients = clients;
    $scope.appModel = app.model;
    $scope.user = auth.user;
    $scope.selectAction = function (action) {
      var params = _.clone($state.params);
      console.log('action', action, params);
      $state.transitionTo(action, params);
    };
    $scope.selectClient = function (client) {
      console.log('app.main.client', client._id);
      var params = _.clone($state.params);
      params.clientId = client._id;
      var state = $state.current;
      if (console.log(state)) {
      }
      $state.transitionTo(state, params);
    };
  }
]);
'use strict';
angular.module('nolla').controller('ClientCtrl', [
  '$scope',
  '$state',
  'clients',
  function ($scope, $state, clients) {
    console.log('ClientCtrl');
    var id = $state.params.clientId;
    $scope.model = {};
    $scope.model.client = clients.findById(id);
    $scope.locked = $scope.model.client === false;
    $scope.newClient = function () {
      clients.add({}).then(function (addedClient) {
        var id = addedClient._id;
        var params = _.clone($state.params);
        params.clientId = id;
        $state.transitionTo($state.current.name, params);
      });
    };
    $scope.deleteClient = function () {
      console.warn('DELETE');
      clients.remove($scope.model.client);
      $state.transitionTo($state.current.name, {});
    };
    $scope.addContact = function (type) {
      $scope.model.client[type].push({
        type: '',
        contact: ''
      });
      $scope.model.client.$rewrap();
    };
    $scope.removeContact = function (type, contact) {
      var index = _.indexOf($scope.model.client[type], contact);
      if (index > -1) {
        $scope.model.client[type].splice(index, 1);
        $scope.model.client.$save();
      }
    };
  }
]);
'use strict';
angular.module('nolla').controller('JournalCtrl', [
  '$scope',
  '$state',
  'clients',
  'journalentries',
  function ($scope, $state, clients, journalentries) {
    console.log('JournalCtrl');
    var id = $state.params.clientId;
    $scope.model = {};
    $scope.model.client = clients.findById(id);
    $scope.locked = $scope.model.client === false;
    if ($scope.model.client) {
      $scope.model.journal = journalentries.fromClient($scope.model.client);
      $scope.model.helpers = journalentries.getHelpers();
      $scope.addJournalHelper = function () {
        $scope.model.helpers.add({ name: 'foo ' + Math.random() });
      };
      $scope.removeJournalHelper = function (helper) {
        $scope.model.helpers.remove(helper);
      };
      $scope.addJournalEntry = function () {
        _.each($scope.model.journal.list, function (obj) {
          obj.locked = true;
        });
        $scope.model.journal.add({
          client: $scope.model.client._id,
          date: Date.now()
        });
      };
      $scope.removeJournalEntry = function (entry) {
        $scope.model.journal.remove(entry);
      };
      $scope.removeJournalEntryData = function (data, entry) {
        var index = entry.entryData.indexOf(data);
        if (index > -1) {
          entry.entryData.splice(index, 1);
        }
      };
    }
  }
]);
'use strict';
angular.module('nolla').controller('CalendarCtrl', [
  '$scope',
  '$state',
  function ($scope, $state) {
    console.log('CalendarCtrl');
    var month = moment().month();
    $scope.month = month;
    $scope.today = moment();
    var start = moment().startOf('month').startOf('week');
    var end = moment().endOf('month').endOf('week');
    var range = moment.twix(start, end);
    var iter = range.iterate('days');
    var weeks = [];
    var day, i = 0, w = 0;
    while (day = iter.next()) {
      var week = weeks[w] ? weeks[w] : weeks[w] = [];
      week.push(day);
      week.number = day.isoWeek();
      i += 1;
      w += i % 7 === 0 ? 1 : 0;
    }
    $scope.weeks = weeks;
    var m = moment().startOf('week');
    var dayNames = [];
    for (var i = 0, l = 7; i < l; ++i) {
      dayNames.push(m.format('ddd'));
      m.add('days', 1);
    }
    $scope.dayNames = dayNames;
  }
]);