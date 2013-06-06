(function (ng) {
  'use strict';
  var module = ng.module('hashKeyCopier', []);
  module.value('HashKeyCopier', HashKeyCopier);
  function HashKeyCopier(source, destination, uniqueIdentifiers) {
    var hashKeyPropertyName = '$$hashKey';
    var hashKeyIndex = {};
    if (!uniqueIdentifiers) {
      uniqueIdentifiers = ['id'];
    }
    var angularJSPropertyPattern = /^$/i;
    function copyHashKeys() {
      if (isTargetEmpty(source) || isTargetEmpty(destination)) {
        return destination;
      }
      hashKeyIndex = {};
      buildHashKeyIndexFromSource();
      applyHashKeyIndexToDestination();
      return destination;
    }
    function applyHashKeyIndexToDestination() {
      if (ng.isArray(destination)) {
        applyHashKeyIndexToArray('[]', destination);
      } else if (ng.isObject(destination)) {
        applyHashKeyIndexToObject('.', destination);
      }
    }
    function applyHashKeyIndexToArray(path, target) {
      for (var i = 0, length = target.length; i < length; i++) {
        var targetItem = target[i];
        if (ng.isArray(targetItem)) {
          applyHashKeyIndexToArray(path + '[]', targetItem);
        } else if (ng.isObject(targetItem)) {
          applyHashKeyIndexToObject(path + '.', targetItem);
        }
      }
    }
    function applyHashKeyIndexToObject(path, target) {
      var identifier = getUniqueIdentifierForObject(target);
      if (identifier) {
        var hashKeyPath = path + target[identifier];
        if (hashKeyIndex.hasOwnProperty(hashKeyPath)) {
          target[hashKeyPropertyName] = hashKeyIndex[hashKeyPath];
        }
      }
      for (var key in target) {
        if (target.hasOwnProperty(key) && isUserDefinedProperty(key)) {
          var targetItem = target[key];
          if (ng.isArray(targetItem)) {
            applyHashKeyIndexToArray(path + key + '[]', targetItem);
          } else if (ng.isObject(targetItem)) {
            applyHashKeyIndexToObject(path + key + '.', targetItem);
          }
        }
      }
    }
    function buildHashKeyIndexFromSource() {
      if (ng.isArray(source)) {
        buildHashKeyIndexFromArray('[]', source);
      } else if (ng.isObject(source)) {
        buildHashKeyIndexFromObject('.', source);
      }
    }
    function buildHashKeyIndexFromArray(path, target) {
      for (var i = 0, length = target.length; i < length; i++) {
        var targetItem = target[i];
        if (ng.isArray(targetItem)) {
          buildHashKeyIndexFromArray(path + '[]', targetItem);
        } else if (ng.isObject(targetItem)) {
          buildHashKeyIndexFromObject(path + '.', targetItem);
        }
      }
    }
    function buildHashKeyIndexFromObject(path, target) {
      if (target.hasOwnProperty(hashKeyPropertyName)) {
        var identifier = getUniqueIdentifierForObject(target);
        if (identifier) {
          hashKeyIndex[path + target[identifier]] = target[hashKeyPropertyName];
        }
      }
      for (var key in target) {
        if (target.hasOwnProperty(key) && isUserDefinedProperty(key)) {
          var targetItem = target[key];
          if (ng.isArray(targetItem)) {
            buildHashKeyIndexFromArray(path + key + '[]', targetItem);
          } else if (ng.isObject(targetItem)) {
            buildHashKeyIndexFromObject(path + key + '.', targetItem);
          }
        }
      }
    }
    function getUniqueIdentifierForObject(target) {
      for (var i = 0, length = uniqueIdentifiers.length; i < length; i++) {
        var identifier = uniqueIdentifiers[i];
        if (target.hasOwnProperty(identifier)) {
          return identifier;
        }
      }
      return null;
    }
    function isTargetEmpty(target) {
      if (!target) {
        return true;
      }
      if (ng.isArray(target)) {
        return target.length === 0;
      }
      if (ng.isObject(target)) {
        return false;
      }
      return true;
    }
    function isUserDefinedProperty(name) {
      return !angularJSPropertyPattern.test(name);
    }
    return { copyHashKeys: copyHashKeys };
  }
  HashKeyCopier.copyHashKeys = function (source, destination, uniqueIdentifiers) {
    var copier = new HashKeyCopier(source, destination, uniqueIdentifiers);
    copier.copyHashKeys();
    return destination;
  };
}(angular));
'use strict';
(function (factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    window.WatchJS = factory();
    window.watch = window.WatchJS.watch;
    window.unwatch = window.WatchJS.unwatch;
    window.callWatchers = window.WatchJS.callWatchers;
  }
}(function () {
  var WatchJS = { noMore: false }, lengthsubjects = [];
  var isFunction = function (functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
  };
  var isInt = function (x) {
    return x % 1 === 0;
  };
  var isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };
  var getObjDiff = function (a, b) {
    var aplus = [], bplus = [];
    if (!(typeof a == 'string') && !(typeof b == 'string') && !isArray(a) && !isArray(b)) {
      for (var i in a) {
        if (!b[i]) {
          aplus.push(i);
        }
      }
      for (var j in b) {
        if (!a[j]) {
          bplus.push(j);
        }
      }
    }
    return {
      added: aplus,
      removed: bplus
    };
  };
  var clone = function (obj) {
    if (null == obj || 'object' != typeof obj) {
      return obj;
    }
    var copy = obj.constructor();
    for (var attr in obj) {
      copy[attr] = obj[attr];
    }
    return copy;
  };
  var defineGetAndSet = function (obj, propName, getter, setter) {
    try {
      Object.defineProperty(obj, propName, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    } catch (error) {
      try {
        Object.prototype.__defineGetter__.call(obj, propName, getter);
        Object.prototype.__defineSetter__.call(obj, propName, setter);
      } catch (error2) {
        throw new Error('watchJS error: browser not supported :/');
      }
    }
  };
  var defineProp = function (obj, propName, value) {
    try {
      Object.defineProperty(obj, propName, {
        enumerable: false,
        configurable: true,
        writable: false,
        value: value
      });
    } catch (error) {
      obj[propName] = value;
    }
  };
  var watch = function () {
    if (isFunction(arguments[1])) {
      watchAll.apply(this, arguments);
    } else if (isArray(arguments[1])) {
      watchMany.apply(this, arguments);
    } else {
      watchOne.apply(this, arguments);
    }
  };
  var watchAll = function (obj, watcher, level, addNRemove) {
    if (typeof obj == 'string' || !(obj instanceof Object) && !isArray(obj)) {
      return;
    }
    var props = [];
    if (isArray(obj)) {
      for (var prop = 0; prop < obj.length; prop++) {
        props.push(prop);
      }
    } else {
      for (var prop2 in obj) {
        props.push(prop2);
      }
    }
    watchMany(obj, props, watcher, level, addNRemove);
  };
  var watchMany = function (obj, props, watcher, level, addNRemove) {
    if (typeof obj == 'string' || !(obj instanceof Object) && !isArray(obj)) {
      return;
    }
    for (var prop in props) {
      watchOne(obj, props[prop], watcher, level, addNRemove);
    }
  };
  var watchOne = function (obj, prop, watcher, level, addNRemove) {
    if (typeof obj == 'string' || !(obj instanceof Object) && !isArray(obj)) {
      return;
    }
    if (isFunction(obj[prop])) {
      return;
    }
    if (obj[prop] != null && (level === undefined || level > 0)) {
      if (level !== undefined) {
        level--;
      }
      watchAll(obj[prop], watcher, level);
    }
    defineWatcher(obj, prop, watcher);
    if (addNRemove) {
      pushToLengthSubjects(obj, prop, watcher, level);
    }
  };
  var unwatch = function () {
    if (isFunction(arguments[1])) {
      unwatchAll.apply(this, arguments);
    } else if (isArray(arguments[1])) {
      unwatchMany.apply(this, arguments);
    } else {
      unwatchOne.apply(this, arguments);
    }
  };
  var unwatchAll = function (obj, watcher) {
    if (obj instanceof String || !(obj instanceof Object) && !isArray(obj)) {
      return;
    }
    var props = [];
    if (isArray(obj)) {
      for (var prop = 0; prop < obj.length; prop++) {
        props.push(prop);
      }
    } else {
      for (var prop2 in obj) {
        props.push(prop2);
      }
    }
    unwatchMany(obj, props, watcher);
  };
  var unwatchMany = function (obj, props, watcher) {
    for (var prop2 in props) {
      unwatchOne(obj, props[prop2], watcher);
    }
  };
  var defineWatcher = function (obj, prop, watcher) {
    var val = obj[prop];
    watchFunctions(obj, prop);
    if (!obj.watchers) {
      defineProp(obj, 'watchers', {});
    }
    if (!obj.watchers[prop]) {
      obj.watchers[prop] = [];
    }
    for (var i in obj.watchers[prop]) {
      if (obj.watchers[prop][i] === watcher) {
        return;
      }
    }
    obj.watchers[prop].push(watcher);
    var getter = function () {
      return val;
    };
    var setter = function (newval) {
      var oldval = val;
      val = newval;
      if (obj[prop]) {
        watchAll(obj[prop], watcher);
      }
      watchFunctions(obj, prop);
      if (!WatchJS.noMore) {
        if (JSON.stringify(oldval) !== JSON.stringify(newval)) {
          callWatchers(obj, prop, 'set', newval, oldval);
          WatchJS.noMore = false;
        }
      }
    };
    defineGetAndSet(obj, prop, getter, setter);
  };
  var callWatchers = function (obj, prop, action, newval, oldval) {
    if (prop) {
      for (var wr in obj.watchers[prop]) {
        if (isInt(wr)) {
          obj.watchers[prop][wr].call(obj, prop, action, newval || obj[prop], oldval);
        }
      }
    } else {
      for (var prop in obj) {
        callWatchers(obj, prop, action, newval, oldval);
      }
    }
  };
  var methodNames = [
      'pop',
      'push',
      'reverse',
      'shift',
      'sort',
      'slice',
      'unshift'
    ];
  var defineArrayMethodWatcher = function (obj, prop, original, methodName) {
    defineProp(obj[prop], methodName, function () {
      var response = original.apply(obj[prop], arguments);
      watchOne(obj, obj[prop]);
      if (methodName !== 'slice') {
        callWatchers(obj, prop, methodName, arguments);
      }
      return response;
    });
  };
  var watchFunctions = function (obj, prop) {
    if (!obj[prop] || obj[prop] instanceof String || !isArray(obj[prop])) {
      return;
    }
    for (var i = methodNames.length, methodName; i--;) {
      methodName = methodNames[i];
      defineArrayMethodWatcher(obj, prop, obj[prop][methodName], methodName);
    }
  };
  var unwatchOne = function (obj, prop, watcher) {
    for (var i in obj.watchers[prop]) {
      var w = obj.watchers[prop][i];
      if (w == watcher) {
        obj.watchers[prop].splice(i, 1);
      }
    }
    removeFromLengthSubjects(obj, prop, watcher);
  };
  var loop = function () {
    for (var i in lengthsubjects) {
      var subj = lengthsubjects[i];
      var difference = getObjDiff(subj.obj[subj.prop], subj.actual);
      if (difference.added.length || difference.removed.length) {
        if (difference.added.length) {
          for (var j in subj.obj.watchers[subj.prop]) {
            watchMany(subj.obj[subj.prop], difference.added, subj.obj.watchers[subj.prop][j], subj.level - 1, true);
          }
        }
        callWatchers(subj.obj, subj.prop, 'differentattr', difference, subj.actual);
      }
      subj.actual = clone(subj.obj[subj.prop]);
    }
  };
  var pushToLengthSubjects = function (obj, prop, watcher, level) {
    lengthsubjects.push({
      obj: obj,
      prop: prop,
      actual: clone(obj[prop]),
      watcher: watcher,
      level: level
    });
  };
  var removeFromLengthSubjects = function (obj, prop, watcher) {
    for (var i in lengthsubjects) {
      var subj = lengthsubjects[i];
      if (subj.obj == obj && subj.prop == prop && subj.watcher == watcher) {
        lengthsubjects.splice(i, 1);
      }
    }
  };
  setInterval(loop, 50);
  WatchJS.watch = watch;
  WatchJS.unwatch = unwatch;
  WatchJS.callWatchers = callWatchers;
  return WatchJS;
}));
(function (undefined) {
  var moment, VERSION = '2.0.0', round = Math.round, i, languages = {}, hasModule = typeof module !== 'undefined' && module.exports, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(\d*)?\.?(\d+)\:(\d+)\:(\d+)\.?(\d{3})?/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseMultipleFormatChunker = /([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{1,4}/, parseTokenSixDigits = /[+\-]?\d{1,6}/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, isoRegex = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/, isoFormat = 'YYYY-MM-DDTHH:mm:ssZ', isoTimes = [
      [
        'HH:mm:ss.S',
        /(T| )\d\d:\d\d:\d\d\.\d{1,3}/
      ],
      [
        'HH:mm:ss',
        /(T| )\d\d:\d\d:\d\d/
      ],
      [
        'HH:mm',
        /(T| )\d\d:\d\d/
      ],
      [
        'HH',
        /(T| )\d\d/
      ]
    ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'), unitMillisecondFactors = {
      'Milliseconds': 1,
      'Seconds': 1000,
      'Minutes': 60000,
      'Hours': 3600000,
      'Days': 86400000,
      'Months': 2592000000,
      'Years': 31536000000
    }, unitAliases = {
      ms: 'millisecond',
      s: 'second',
      m: 'minute',
      h: 'hour',
      d: 'day',
      w: 'week',
      M: 'month',
      y: 'year'
    }, formatFunctions = {}, ordinalizeTokens = 'DDD w W M D d'.split(' '), paddedTokens = 'M D H h m s w W'.split(' '), formatTokenFunctions = {
      M: function () {
        return this.month() + 1;
      },
      MMM: function (format) {
        return this.lang().monthsShort(this, format);
      },
      MMMM: function (format) {
        return this.lang().months(this, format);
      },
      D: function () {
        return this.date();
      },
      DDD: function () {
        return this.dayOfYear();
      },
      d: function () {
        return this.day();
      },
      dd: function (format) {
        return this.lang().weekdaysMin(this, format);
      },
      ddd: function (format) {
        return this.lang().weekdaysShort(this, format);
      },
      dddd: function (format) {
        return this.lang().weekdays(this, format);
      },
      w: function () {
        return this.week();
      },
      W: function () {
        return this.isoWeek();
      },
      YY: function () {
        return leftZeroFill(this.year() % 100, 2);
      },
      YYYY: function () {
        return leftZeroFill(this.year(), 4);
      },
      YYYYY: function () {
        return leftZeroFill(this.year(), 5);
      },
      gg: function () {
        return leftZeroFill(this.weekYear() % 100, 2);
      },
      gggg: function () {
        return this.weekYear();
      },
      ggggg: function () {
        return leftZeroFill(this.weekYear(), 5);
      },
      GG: function () {
        return leftZeroFill(this.isoWeekYear() % 100, 2);
      },
      GGGG: function () {
        return this.isoWeekYear();
      },
      GGGGG: function () {
        return leftZeroFill(this.isoWeekYear(), 5);
      },
      e: function () {
        return this.weekday();
      },
      E: function () {
        return this.isoWeekday();
      },
      a: function () {
        return this.lang().meridiem(this.hours(), this.minutes(), true);
      },
      A: function () {
        return this.lang().meridiem(this.hours(), this.minutes(), false);
      },
      H: function () {
        return this.hours();
      },
      h: function () {
        return this.hours() % 12 || 12;
      },
      m: function () {
        return this.minutes();
      },
      s: function () {
        return this.seconds();
      },
      S: function () {
        return ~~(this.milliseconds() / 100);
      },
      SS: function () {
        return leftZeroFill(~~(this.milliseconds() / 10), 2);
      },
      SSS: function () {
        return leftZeroFill(this.milliseconds(), 3);
      },
      Z: function () {
        var a = -this.zone(), b = '+';
        if (a < 0) {
          a = -a;
          b = '-';
        }
        return b + leftZeroFill(~~(a / 60), 2) + ':' + leftZeroFill(~~a % 60, 2);
      },
      ZZ: function () {
        var a = -this.zone(), b = '+';
        if (a < 0) {
          a = -a;
          b = '-';
        }
        return b + leftZeroFill(~~(10 * a / 6), 4);
      },
      z: function () {
        return this.zoneAbbr();
      },
      zz: function () {
        return this.zoneName();
      },
      X: function () {
        return this.unix();
      }
    };
  function padToken(func, count) {
    return function (a) {
      return leftZeroFill(func.call(this, a), count);
    };
  }
  function ordinalizeToken(func, period) {
    return function (a) {
      return this.lang().ordinal(func.call(this, a), period);
    };
  }
  while (ordinalizeTokens.length) {
    i = ordinalizeTokens.pop();
    formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
  }
  while (paddedTokens.length) {
    i = paddedTokens.pop();
    formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
  }
  formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
  function Language() {
  }
  function Moment(config) {
    extend(this, config);
  }
  function Duration(duration) {
    var data = this._data = {}, years = duration.years || duration.year || duration.y || 0, months = duration.months || duration.month || duration.M || 0, weeks = duration.weeks || duration.week || duration.w || 0, days = duration.days || duration.day || duration.d || 0, hours = duration.hours || duration.hour || duration.h || 0, minutes = duration.minutes || duration.minute || duration.m || 0, seconds = duration.seconds || duration.second || duration.s || 0, milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;
    this._milliseconds = milliseconds + seconds * 1000 + minutes * 60000 + hours * 3600000;
    this._days = days + weeks * 7;
    this._months = months + years * 12;
    data.milliseconds = milliseconds % 1000;
    seconds += absRound(milliseconds / 1000);
    data.seconds = seconds % 60;
    minutes += absRound(seconds / 60);
    data.minutes = minutes % 60;
    hours += absRound(minutes / 60);
    data.hours = hours % 24;
    days += absRound(hours / 24);
    days += weeks * 7;
    data.days = days % 30;
    months += absRound(days / 30);
    data.months = months % 12;
    years += absRound(months / 12);
    data.years = years;
  }
  function extend(a, b) {
    for (var i in b) {
      if (b.hasOwnProperty(i)) {
        a[i] = b[i];
      }
    }
    return a;
  }
  function absRound(number) {
    if (number < 0) {
      return Math.ceil(number);
    } else {
      return Math.floor(number);
    }
  }
  function leftZeroFill(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
      output = '0' + output;
    }
    return output;
  }
  function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
    var milliseconds = duration._milliseconds, days = duration._days, months = duration._months, minutes, hours, currentDate;
    if (milliseconds) {
      mom._d.setTime(+mom._d + milliseconds * isAdding);
    }
    if (days || months) {
      minutes = mom.minute();
      hours = mom.hour();
    }
    if (days) {
      mom.date(mom.date() + days * isAdding);
    }
    if (months) {
      currentDate = mom.date();
      mom.date(1).month(mom.month() + months * isAdding).date(Math.min(currentDate, mom.daysInMonth()));
    }
    if (milliseconds && !ignoreUpdateOffset) {
      moment.updateOffset(mom);
    }
    if (days || months) {
      mom.minute(minutes);
      mom.hour(hours);
    }
  }
  function isArray(input) {
    return Object.prototype.toString.call(input) === '[object Array]';
  }
  function compareArrays(array1, array2) {
    var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
    for (i = 0; i < len; i++) {
      if (~~array1[i] !== ~~array2[i]) {
        diffs++;
      }
    }
    return diffs + lengthDiff;
  }
  function normalizeUnits(units) {
    return units ? unitAliases[units] || units.toLowerCase().replace(/(.)s$/, '$1') : units;
  }
  Language.prototype = {
    set: function (config) {
      var prop, i;
      for (i in config) {
        prop = config[i];
        if (typeof prop === 'function') {
          this[i] = prop;
        } else {
          this['_' + i] = prop;
        }
      }
    },
    _months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
    months: function (m) {
      return this._months[m.month()];
    },
    _monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
    monthsShort: function (m) {
      return this._monthsShort[m.month()];
    },
    monthsParse: function (monthName) {
      var i, mom, regex;
      if (!this._monthsParse) {
        this._monthsParse = [];
      }
      for (i = 0; i < 12; i++) {
        if (!this._monthsParse[i]) {
          mom = moment([
            2000,
            i
          ]);
          regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
          this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        if (this._monthsParse[i].test(monthName)) {
          return i;
        }
      }
    },
    _weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    weekdays: function (m) {
      return this._weekdays[m.day()];
    },
    _weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    weekdaysShort: function (m) {
      return this._weekdaysShort[m.day()];
    },
    _weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
    weekdaysMin: function (m) {
      return this._weekdaysMin[m.day()];
    },
    weekdaysParse: function (weekdayName) {
      var i, mom, regex;
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
      }
      for (i = 0; i < 7; i++) {
        if (!this._weekdaysParse[i]) {
          mom = moment([
            2000,
            1
          ]).day(i);
          regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
          this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        if (this._weekdaysParse[i].test(weekdayName)) {
          return i;
        }
      }
    },
    _longDateFormat: {
      LT: 'h:mm A',
      L: 'MM/DD/YYYY',
      LL: 'MMMM D YYYY',
      LLL: 'MMMM D YYYY LT',
      LLLL: 'dddd, MMMM D YYYY LT'
    },
    longDateFormat: function (key) {
      var output = this._longDateFormat[key];
      if (!output && this._longDateFormat[key.toUpperCase()]) {
        output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
          return val.slice(1);
        });
        this._longDateFormat[key] = output;
      }
      return output;
    },
    isPM: function (input) {
      return (input + '').toLowerCase()[0] === 'p';
    },
    _meridiemParse: /[ap]\.?m?\.?/i,
    meridiem: function (hours, minutes, isLower) {
      if (hours > 11) {
        return isLower ? 'pm' : 'PM';
      } else {
        return isLower ? 'am' : 'AM';
      }
    },
    _calendar: {
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      nextWeek: 'dddd [at] LT',
      lastDay: '[Yesterday at] LT',
      lastWeek: '[Last] dddd [at] LT',
      sameElse: 'L'
    },
    calendar: function (key, mom) {
      var output = this._calendar[key];
      return typeof output === 'function' ? output.apply(mom) : output;
    },
    _relativeTime: {
      future: 'in %s',
      past: '%s ago',
      s: 'a few seconds',
      m: 'a minute',
      mm: '%d minutes',
      h: 'an hour',
      hh: '%d hours',
      d: 'a day',
      dd: '%d days',
      M: 'a month',
      MM: '%d months',
      y: 'a year',
      yy: '%d years'
    },
    relativeTime: function (number, withoutSuffix, string, isFuture) {
      var output = this._relativeTime[string];
      return typeof output === 'function' ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    },
    pastFuture: function (diff, output) {
      var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
      return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    },
    ordinal: function (number) {
      return this._ordinal.replace('%d', number);
    },
    _ordinal: '%d',
    preparse: function (string) {
      return string;
    },
    postformat: function (string) {
      return string;
    },
    week: function (mom) {
      return weekOfYear(mom, this._week.dow, this._week.doy).week;
    },
    _week: {
      dow: 0,
      doy: 6
    }
  };
  function loadLang(key, values) {
    values.abbr = key;
    if (!languages[key]) {
      languages[key] = new Language();
    }
    languages[key].set(values);
    return languages[key];
  }
  function getLangDefinition(key) {
    if (!key) {
      return moment.fn._lang;
    }
    if (!languages[key] && hasModule) {
      require('./lang/' + key);
    }
    return languages[key];
  }
  function removeFormattingTokens(input) {
    if (input.match(/\[.*\]/)) {
      return input.replace(/^\[|\]$/g, '');
    }
    return input.replace(/\\/g, '');
  }
  function makeFormatFunction(format) {
    var array = format.match(formattingTokens), i, length;
    for (i = 0, length = array.length; i < length; i++) {
      if (formatTokenFunctions[array[i]]) {
        array[i] = formatTokenFunctions[array[i]];
      } else {
        array[i] = removeFormattingTokens(array[i]);
      }
    }
    return function (mom) {
      var output = '';
      for (i = 0; i < length; i++) {
        output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
      }
      return output;
    };
  }
  function formatMoment(m, format) {
    var i = 5;
    function replaceLongDateFormatTokens(input) {
      return m.lang().longDateFormat(input) || input;
    }
    while (i-- && localFormattingTokens.test(format)) {
      format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
    }
    if (!formatFunctions[format]) {
      formatFunctions[format] = makeFormatFunction(format);
    }
    return formatFunctions[format](m);
  }
  function getParseRegexForToken(token, config) {
    switch (token) {
    case 'DDDD':
      return parseTokenThreeDigits;
    case 'YYYY':
      return parseTokenFourDigits;
    case 'YYYYY':
      return parseTokenSixDigits;
    case 'S':
    case 'SS':
    case 'SSS':
    case 'DDD':
      return parseTokenOneToThreeDigits;
    case 'MMM':
    case 'MMMM':
    case 'dd':
    case 'ddd':
    case 'dddd':
      return parseTokenWord;
    case 'a':
    case 'A':
      return getLangDefinition(config._l)._meridiemParse;
    case 'X':
      return parseTokenTimestampMs;
    case 'Z':
    case 'ZZ':
      return parseTokenTimezone;
    case 'T':
      return parseTokenT;
    case 'MM':
    case 'DD':
    case 'YY':
    case 'HH':
    case 'hh':
    case 'mm':
    case 'ss':
    case 'M':
    case 'D':
    case 'd':
    case 'H':
    case 'h':
    case 'm':
    case 's':
      return parseTokenOneOrTwoDigits;
    default:
      return new RegExp(token.replace('\\', ''));
    }
  }
  function timezoneMinutesFromString(string) {
    var tzchunk = (parseTokenTimezone.exec(string) || [])[0], parts = (tzchunk + '').match(parseTimezoneChunker) || [
        '-',
        0,
        0
      ], minutes = +(parts[1] * 60) + ~~parts[2];
    return parts[0] === '+' ? -minutes : minutes;
  }
  function addTimeToArrayFromToken(token, input, config) {
    var a, b, datePartArray = config._a;
    switch (token) {
    case 'M':
    case 'MM':
      datePartArray[1] = input == null ? 0 : ~~input - 1;
      break;
    case 'MMM':
    case 'MMMM':
      a = getLangDefinition(config._l).monthsParse(input);
      if (a != null) {
        datePartArray[1] = a;
      } else {
        config._isValid = false;
      }
      break;
    case 'D':
    case 'DD':
    case 'DDD':
    case 'DDDD':
      if (input != null) {
        datePartArray[2] = ~~input;
      }
      break;
    case 'YY':
      datePartArray[0] = ~~input + (~~input > 68 ? 1900 : 2000);
      break;
    case 'YYYY':
    case 'YYYYY':
      datePartArray[0] = ~~input;
      break;
    case 'a':
    case 'A':
      config._isPm = getLangDefinition(config._l).isPM(input);
      break;
    case 'H':
    case 'HH':
    case 'h':
    case 'hh':
      datePartArray[3] = ~~input;
      break;
    case 'm':
    case 'mm':
      datePartArray[4] = ~~input;
      break;
    case 's':
    case 'ss':
      datePartArray[5] = ~~input;
      break;
    case 'S':
    case 'SS':
    case 'SSS':
      datePartArray[6] = ~~(('0.' + input) * 1000);
      break;
    case 'X':
      config._d = new Date(parseFloat(input) * 1000);
      break;
    case 'Z':
    case 'ZZ':
      config._useUTC = true;
      config._tzm = timezoneMinutesFromString(input);
      break;
    }
    if (input == null) {
      config._isValid = false;
    }
  }
  function dateFromArray(config) {
    var i, date, input = [];
    if (config._d) {
      return;
    }
    for (i = 0; i < 7; i++) {
      config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
    }
    input[3] += ~~((config._tzm || 0) / 60);
    input[4] += ~~((config._tzm || 0) % 60);
    date = new Date(0);
    if (config._useUTC) {
      date.setUTCFullYear(input[0], input[1], input[2]);
      date.setUTCHours(input[3], input[4], input[5], input[6]);
    } else {
      date.setFullYear(input[0], input[1], input[2]);
      date.setHours(input[3], input[4], input[5], input[6]);
    }
    config._d = date;
  }
  function makeDateFromStringAndFormat(config) {
    var tokens = config._f.match(formattingTokens), string = config._i, i, parsedInput;
    config._a = [];
    for (i = 0; i < tokens.length; i++) {
      parsedInput = (getParseRegexForToken(tokens[i], config).exec(string) || [])[0];
      if (parsedInput) {
        string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
      }
      if (formatTokenFunctions[tokens[i]]) {
        addTimeToArrayFromToken(tokens[i], parsedInput, config);
      }
    }
    if (string) {
      config._il = string;
    }
    if (config._isPm && config._a[3] < 12) {
      config._a[3] += 12;
    }
    if (config._isPm === false && config._a[3] === 12) {
      config._a[3] = 0;
    }
    dateFromArray(config);
  }
  function makeDateFromStringAndArray(config) {
    var tempConfig, tempMoment, bestMoment, scoreToBeat = 99, i, currentScore;
    for (i = 0; i < config._f.length; i++) {
      tempConfig = extend({}, config);
      tempConfig._f = config._f[i];
      makeDateFromStringAndFormat(tempConfig);
      tempMoment = new Moment(tempConfig);
      currentScore = compareArrays(tempConfig._a, tempMoment.toArray());
      if (tempMoment._il) {
        currentScore += tempMoment._il.length;
      }
      if (currentScore < scoreToBeat) {
        scoreToBeat = currentScore;
        bestMoment = tempMoment;
      }
    }
    extend(config, bestMoment);
  }
  function makeDateFromString(config) {
    var i, string = config._i, match = isoRegex.exec(string);
    if (match) {
      config._f = 'YYYY-MM-DD' + (match[2] || ' ');
      for (i = 0; i < 4; i++) {
        if (isoTimes[i][1].exec(string)) {
          config._f += isoTimes[i][0];
          break;
        }
      }
      if (parseTokenTimezone.exec(string)) {
        config._f += ' Z';
      }
      makeDateFromStringAndFormat(config);
    } else {
      config._d = new Date(string);
    }
  }
  function makeDateFromInput(config) {
    var input = config._i, matched = aspNetJsonRegex.exec(input);
    if (input === undefined) {
      config._d = new Date();
    } else if (matched) {
      config._d = new Date(+matched[1]);
    } else if (typeof input === 'string') {
      makeDateFromString(config);
    } else if (isArray(input)) {
      config._a = input.slice(0);
      dateFromArray(config);
    } else {
      config._d = input instanceof Date ? new Date(+input) : new Date(input);
    }
  }
  function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
    return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
  }
  function relativeTime(milliseconds, withoutSuffix, lang) {
    var seconds = round(Math.abs(milliseconds) / 1000), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = seconds < 45 && [
        's',
        seconds
      ] || minutes === 1 && ['m'] || minutes < 45 && [
        'mm',
        minutes
      ] || hours === 1 && ['h'] || hours < 22 && [
        'hh',
        hours
      ] || days === 1 && ['d'] || days <= 25 && [
        'dd',
        days
      ] || days <= 45 && ['M'] || days < 345 && [
        'MM',
        round(days / 30)
      ] || years === 1 && ['y'] || [
        'yy',
        years
      ];
    args[2] = withoutSuffix;
    args[3] = milliseconds > 0;
    args[4] = lang;
    return substituteTimeAgo.apply({}, args);
  }
  function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
    var end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(), adjustedMoment;
    if (daysToDayOfWeek > end) {
      daysToDayOfWeek -= 7;
    }
    if (daysToDayOfWeek < end - 7) {
      daysToDayOfWeek += 7;
    }
    adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
    return {
      week: Math.ceil(adjustedMoment.dayOfYear() / 7),
      year: adjustedMoment.year()
    };
  }
  function makeMoment(config) {
    var input = config._i, format = config._f;
    if (input === null || input === '') {
      return null;
    }
    if (typeof input === 'string') {
      config._i = input = getLangDefinition().preparse(input);
    }
    if (moment.isMoment(input)) {
      config = extend({}, input);
      config._d = new Date(+input._d);
    } else if (format) {
      if (isArray(format)) {
        makeDateFromStringAndArray(config);
      } else {
        makeDateFromStringAndFormat(config);
      }
    } else {
      makeDateFromInput(config);
    }
    return new Moment(config);
  }
  moment = function (input, format, lang) {
    return makeMoment({
      _i: input,
      _f: format,
      _l: lang,
      _isUTC: false
    });
  };
  moment.utc = function (input, format, lang) {
    return makeMoment({
      _useUTC: true,
      _isUTC: true,
      _l: lang,
      _i: input,
      _f: format
    });
  };
  moment.unix = function (input) {
    return moment(input * 1000);
  };
  moment.duration = function (input, key) {
    var isDuration = moment.isDuration(input), isNumber = typeof input === 'number', duration = isDuration ? input._data : isNumber ? {} : input, matched = aspNetTimeSpanJsonRegex.exec(input), sign, ret;
    if (isNumber) {
      if (key) {
        duration[key] = input;
      } else {
        duration.milliseconds = input;
      }
    } else if (matched) {
      sign = matched[1] === '-' ? -1 : 1;
      duration = {
        y: 0,
        d: ~~matched[2] * sign,
        h: ~~matched[3] * sign,
        m: ~~matched[4] * sign,
        s: ~~matched[5] * sign,
        ms: ~~matched[6] * sign
      };
    }
    ret = new Duration(duration);
    if (isDuration && input.hasOwnProperty('_lang')) {
      ret._lang = input._lang;
    }
    return ret;
  };
  moment.version = VERSION;
  moment.defaultFormat = isoFormat;
  moment.updateOffset = function () {
  };
  moment.lang = function (key, values) {
    var i;
    if (!key) {
      return moment.fn._lang._abbr;
    }
    if (values) {
      loadLang(key, values);
    } else if (!languages[key]) {
      getLangDefinition(key);
    }
    moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
  };
  moment.langData = function (key) {
    if (key && key._lang && key._lang._abbr) {
      key = key._lang._abbr;
    }
    return getLangDefinition(key);
  };
  moment.isMoment = function (obj) {
    return obj instanceof Moment;
  };
  moment.isDuration = function (obj) {
    return obj instanceof Duration;
  };
  moment.fn = Moment.prototype = {
    clone: function () {
      return moment(this);
    },
    valueOf: function () {
      return +this._d + (this._offset || 0) * 60000;
    },
    unix: function () {
      return Math.floor(+this / 1000);
    },
    toString: function () {
      return this.format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    },
    toDate: function () {
      return this._offset ? new Date(+this) : this._d;
    },
    toISOString: function () {
      return formatMoment(moment(this).utc(), 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    },
    toArray: function () {
      var m = this;
      return [
        m.year(),
        m.month(),
        m.date(),
        m.hours(),
        m.minutes(),
        m.seconds(),
        m.milliseconds()
      ];
    },
    isValid: function () {
      if (this._isValid == null) {
        if (this._a) {
          this._isValid = !compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray());
        } else {
          this._isValid = !isNaN(this._d.getTime());
        }
      }
      return !!this._isValid;
    },
    utc: function () {
      return this.zone(0);
    },
    local: function () {
      this.zone(0);
      this._isUTC = false;
      return this;
    },
    format: function (inputString) {
      var output = formatMoment(this, inputString || moment.defaultFormat);
      return this.lang().postformat(output);
    },
    add: function (input, val) {
      var dur;
      if (typeof input === 'string') {
        dur = moment.duration(+val, input);
      } else {
        dur = moment.duration(input, val);
      }
      addOrSubtractDurationFromMoment(this, dur, 1);
      return this;
    },
    subtract: function (input, val) {
      var dur;
      if (typeof input === 'string') {
        dur = moment.duration(+val, input);
      } else {
        dur = moment.duration(input, val);
      }
      addOrSubtractDurationFromMoment(this, dur, -1);
      return this;
    },
    diff: function (input, units, asFloat) {
      var that = this._isUTC ? moment(input).zone(this._offset || 0) : moment(input).local(), zoneDiff = (this.zone() - that.zone()) * 60000, diff, output;
      units = normalizeUnits(units);
      if (units === 'year' || units === 'month') {
        diff = (this.daysInMonth() + that.daysInMonth()) * 43200000;
        output = (this.year() - that.year()) * 12 + (this.month() - that.month());
        output += (this - moment(this).startOf('month') - (that - moment(that).startOf('month'))) / diff;
        if (units === 'year') {
          output = output / 12;
        }
      } else {
        diff = this - that - zoneDiff;
        output = units === 'second' ? diff / 1000 : units === 'minute' ? diff / 60000 : units === 'hour' ? diff / 3600000 : units === 'day' ? diff / 86400000 : units === 'week' ? diff / 604800000 : diff;
      }
      return asFloat ? output : absRound(output);
    },
    from: function (time, withoutSuffix) {
      return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
    },
    fromNow: function (withoutSuffix) {
      return this.from(moment(), withoutSuffix);
    },
    calendar: function () {
      var diff = this.diff(moment().startOf('day'), 'days', true), format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
      return this.format(this.lang().calendar(format, this));
    },
    isLeapYear: function () {
      var year = this.year();
      return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    },
    isDST: function () {
      return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
    },
    day: function (input) {
      var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
      if (input != null) {
        if (typeof input === 'string') {
          input = this.lang().weekdaysParse(input);
          if (typeof input !== 'number') {
            return this;
          }
        }
        return this.add({ d: input - day });
      } else {
        return day;
      }
    },
    month: function (input) {
      var utc = this._isUTC ? 'UTC' : '';
      if (input != null) {
        if (typeof input === 'string') {
          input = this.lang().monthsParse(input);
          if (typeof input !== 'number') {
            return this;
          }
        }
        this._d['set' + utc + 'Month'](input);
        moment.updateOffset(this);
        return this;
      } else {
        return this._d['get' + utc + 'Month']();
      }
    },
    startOf: function (units) {
      units = normalizeUnits(units);
      switch (units) {
      case 'year':
        this.month(0);
      case 'month':
        this.date(1);
      case 'week':
      case 'day':
        this.hours(0);
      case 'hour':
        this.minutes(0);
      case 'minute':
        this.seconds(0);
      case 'second':
        this.milliseconds(0);
      }
      if (units === 'week') {
        this.weekday(0);
      }
      return this;
    },
    endOf: function (units) {
      return this.startOf(units).add(units, 1).subtract('ms', 1);
    },
    isAfter: function (input, units) {
      units = typeof units !== 'undefined' ? units : 'millisecond';
      return +this.clone().startOf(units) > +moment(input).startOf(units);
    },
    isBefore: function (input, units) {
      units = typeof units !== 'undefined' ? units : 'millisecond';
      return +this.clone().startOf(units) < +moment(input).startOf(units);
    },
    isSame: function (input, units) {
      units = typeof units !== 'undefined' ? units : 'millisecond';
      return +this.clone().startOf(units) === +moment(input).startOf(units);
    },
    min: function (other) {
      other = moment.apply(null, arguments);
      return other < this ? this : other;
    },
    max: function (other) {
      other = moment.apply(null, arguments);
      return other > this ? this : other;
    },
    zone: function (input) {
      var offset = this._offset || 0;
      if (input != null) {
        if (typeof input === 'string') {
          input = timezoneMinutesFromString(input);
        }
        if (Math.abs(input) < 16) {
          input = input * 60;
        }
        this._offset = input;
        this._isUTC = true;
        if (offset !== input) {
          addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
        }
      } else {
        return this._isUTC ? offset : this._d.getTimezoneOffset();
      }
      return this;
    },
    zoneAbbr: function () {
      return this._isUTC ? 'UTC' : '';
    },
    zoneName: function () {
      return this._isUTC ? 'Coordinated Universal Time' : '';
    },
    daysInMonth: function () {
      return moment.utc([
        this.year(),
        this.month() + 1,
        0
      ]).date();
    },
    dayOfYear: function (input) {
      var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 86400000) + 1;
      return input == null ? dayOfYear : this.add('d', input - dayOfYear);
    },
    weekYear: function (input) {
      var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
      return input == null ? year : this.add('y', input - year);
    },
    isoWeekYear: function (input) {
      var year = weekOfYear(this, 1, 4).year;
      return input == null ? year : this.add('y', input - year);
    },
    week: function (input) {
      var week = this.lang().week(this);
      return input == null ? week : this.add('d', (input - week) * 7);
    },
    isoWeek: function (input) {
      var week = weekOfYear(this, 1, 4).week;
      return input == null ? week : this.add('d', (input - week) * 7);
    },
    weekday: function (input) {
      var weekday = (this._d.getDay() + 7 - this.lang()._week.dow) % 7;
      return input == null ? weekday : this.add('d', input - weekday);
    },
    isoWeekday: function (input) {
      var weekday = (this._d.getDay() + 6) % 7;
      return input == null ? weekday : this.add('d', input - weekday);
    },
    lang: function (key) {
      if (key === undefined) {
        return this._lang;
      } else {
        this._lang = getLangDefinition(key);
        return this;
      }
    }
  };
  function makeGetterAndSetter(name, key) {
    moment.fn[name] = moment.fn[name + 's'] = function (input) {
      var utc = this._isUTC ? 'UTC' : '';
      if (input != null) {
        this._d['set' + utc + key](input);
        moment.updateOffset(this);
        return this;
      } else {
        return this._d['get' + utc + key]();
      }
    };
  }
  for (i = 0; i < proxyGettersAndSetters.length; i++) {
    makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
  }
  makeGetterAndSetter('year', 'FullYear');
  moment.fn.days = moment.fn.day;
  moment.fn.months = moment.fn.month;
  moment.fn.weeks = moment.fn.week;
  moment.fn.isoWeeks = moment.fn.isoWeek;
  moment.fn.toJSON = moment.fn.toISOString;
  moment.duration.fn = Duration.prototype = {
    weeks: function () {
      return absRound(this.days() / 7);
    },
    valueOf: function () {
      return this._milliseconds + this._days * 86400000 + this._months % 12 * 2592000000 + ~~(this._months / 12) * 31536000000;
    },
    humanize: function (withSuffix) {
      var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
      if (withSuffix) {
        output = this.lang().pastFuture(difference, output);
      }
      return this.lang().postformat(output);
    },
    add: function (input, val) {
      var dur = moment.duration(input, val);
      this._milliseconds += dur._milliseconds;
      this._days += dur._days;
      this._months += dur._months;
      return this;
    },
    subtract: function (input, val) {
      var dur = moment.duration(input, val);
      this._milliseconds -= dur._milliseconds;
      this._days -= dur._days;
      this._months -= dur._months;
      return this;
    },
    get: function (units) {
      units = normalizeUnits(units);
      return this[units.toLowerCase() + 's']();
    },
    as: function (units) {
      units = normalizeUnits(units);
      return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
    },
    lang: moment.fn.lang
  };
  function makeDurationGetter(name) {
    moment.duration.fn[name] = function () {
      return this._data[name];
    };
  }
  function makeDurationAsGetter(name, factor) {
    moment.duration.fn['as' + name] = function () {
      return +this / factor;
    };
  }
  for (i in unitMillisecondFactors) {
    if (unitMillisecondFactors.hasOwnProperty(i)) {
      makeDurationAsGetter(i, unitMillisecondFactors[i]);
      makeDurationGetter(i.toLowerCase());
    }
  }
  makeDurationAsGetter('Weeks', 604800000);
  moment.duration.fn.asMonths = function () {
    return (+this - this.years() * 31536000000) / 2592000000 + this.years() * 12;
  };
  moment.lang('en', {
    ordinal: function (number) {
      var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
      return number + output;
    }
  });
  if (hasModule) {
    module.exports = moment;
  }
  if (typeof ender === 'undefined') {
    this['moment'] = moment;
  }
  if (typeof define === 'function' && define.amd) {
    define('moment', [], function () {
      return moment;
    });
  }
}.call(this));
(function () {
  function onload(moment) {
    (function () {
      moment.lang('ar-ma', {
        months: '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648\u0632_\u063a\u0634\u062a_\u0634\u062a\u0646\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062f\u062c\u0646\u0628\u0631'.split('_'),
        monthsShort: '\u064a\u0646\u0627\u064a\u0631_\u0641\u0628\u0631\u0627\u064a\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064a\u0644_\u0645\u0627\u064a_\u064a\u0648\u0646\u064a\u0648_\u064a\u0648\u0644\u064a\u0648\u0632_\u063a\u0634\u062a_\u0634\u062a\u0646\u0628\u0631_\u0623\u0643\u062a\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062f\u062c\u0646\u0628\u0631'.split('_'),
        weekdays: '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062a\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split('_'),
        weekdaysShort: '\u0627\u062d\u062f_\u0627\u062a\u0646\u064a\u0646_\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0631\u0628\u0639\u0627\u0621_\u062e\u0645\u064a\u0633_\u062c\u0645\u0639\u0629_\u0633\u0628\u062a'.split('_'),
        weekdaysMin: '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          nextDay: '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          nextWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          lastDay: '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          lastWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '\u0641\u064a %s',
          past: '\u0645\u0646\u0630 %s',
          s: '\u062b\u0648\u0627\u0646',
          m: '\u062f\u0642\u064a\u0642\u0629',
          mm: '%d \u062f\u0642\u0627\u0626\u0642',
          h: '\u0633\u0627\u0639\u0629',
          hh: '%d \u0633\u0627\u0639\u0627\u062a',
          d: '\u064a\u0648\u0645',
          dd: '%d \u0623\u064a\u0627\u0645',
          M: '\u0634\u0647\u0631',
          MM: '%d \u0623\u0634\u0647\u0631',
          y: '\u0633\u0646\u0629',
          yy: '%d \u0633\u0646\u0648\u0627\u062a'
        },
        week: {
          dow: 6,
          doy: 12
        }
      });
    }());
    (function () {
      moment.lang('ar', {
        months: '\u064a\u0646\u0627\u064a\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u062b\u0627\u0646\u064a_\u0641\u0628\u0631\u0627\u064a\u0631/ \u0634\u0628\u0627\u0637_\u0645\u0627\u0631\u0633/ \u0622\u0630\u0627\u0631_\u0623\u0628\u0631\u064a\u0644/ \u0646\u064a\u0633\u0627\u0646_\u0645\u0627\u064a\u0648/ \u0623\u064a\u0627\u0631_\u064a\u0648\u0646\u064a\u0648/ \u062d\u0632\u064a\u0631\u0627\u0646_\u064a\u0648\u0644\u064a\u0648/ \u062a\u0645\u0648\u0632_\u0623\u063a\u0633\u0637\u0633/ \u0622\u0628_\u0633\u0628\u062a\u0645\u0628\u0631/ \u0623\u064a\u0644\u0648\u0644_\u0623\u0643\u062a\u0648\u0628\u0631/ \u062a\u0634\u0631\u064a\u0646 \u0627\u0644\u0623\u0648\u0644_\u0646\u0648\u0641\u0645\u0628\u0631/ \u062a\u0634\u0631\u064a\u0646 \u0627\u0644\u062b\u0627\u0646\u064a_\u062f\u064a\u0633\u0645\u0628\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0623\u0648\u0644'.split('_'),
        monthsShort: '\u064a\u0646\u0627\u064a\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u062b\u0627\u0646\u064a_\u0641\u0628\u0631\u0627\u064a\u0631/ \u0634\u0628\u0627\u0637_\u0645\u0627\u0631\u0633/ \u0622\u0630\u0627\u0631_\u0623\u0628\u0631\u064a\u0644/ \u0646\u064a\u0633\u0627\u0646_\u0645\u0627\u064a\u0648/ \u0623\u064a\u0627\u0631_\u064a\u0648\u0646\u064a\u0648/ \u062d\u0632\u064a\u0631\u0627\u0646_\u064a\u0648\u0644\u064a\u0648/ \u062a\u0645\u0648\u0632_\u0623\u063a\u0633\u0637\u0633/ \u0622\u0628_\u0633\u0628\u062a\u0645\u0628\u0631/ \u0623\u064a\u0644\u0648\u0644_\u0623\u0643\u062a\u0648\u0628\u0631/ \u062a\u0634\u0631\u064a\u0646 \u0627\u0644\u0623\u0648\u0644_\u0646\u0648\u0641\u0645\u0628\u0631/ \u062a\u0634\u0631\u064a\u0646 \u0627\u0644\u062b\u0627\u0646\u064a_\u062f\u064a\u0633\u0645\u0628\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0623\u0648\u0644'.split('_'),
        weekdays: '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split('_'),
        weekdaysShort: '\u0627\u0644\u0623\u062d\u062f_\u0627\u0644\u0625\u062b\u0646\u064a\u0646_\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062e\u0645\u064a\u0633_\u0627\u0644\u062c\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062a'.split('_'),
        weekdaysMin: '\u062d_\u0646_\u062b_\u0631_\u062e_\u062c_\u0633'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[\u0627\u0644\u064a\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          nextDay: '[\u063a\u062f\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          nextWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          lastDay: '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          lastWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '\u0641\u064a %s',
          past: '\u0645\u0646\u0630 %s',
          s: '\u062b\u0648\u0627\u0646',
          m: '\u062f\u0642\u064a\u0642\u0629',
          mm: '%d \u062f\u0642\u0627\u0626\u0642',
          h: '\u0633\u0627\u0639\u0629',
          hh: '%d \u0633\u0627\u0639\u0627\u062a',
          d: '\u064a\u0648\u0645',
          dd: '%d \u0623\u064a\u0627\u0645',
          M: '\u0634\u0647\u0631',
          MM: '%d \u0623\u0634\u0647\u0631',
          y: '\u0633\u0646\u0629',
          yy: '%d \u0633\u0646\u0648\u0627\u062a'
        },
        week: {
          dow: 6,
          doy: 12
        }
      });
    }());
    (function () {
      moment.lang('bg', {
        months: '\u044f\u043d\u0443\u0430\u0440\u0438_\u0444\u0435\u0432\u0440\u0443\u0430\u0440\u0438_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0438\u043b_\u043c\u0430\u0439_\u044e\u043d\u0438_\u044e\u043b\u0438_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043f\u0442\u0435\u043c\u0432\u0440\u0438_\u043e\u043a\u0442\u043e\u043c\u0432\u0440\u0438_\u043d\u043e\u0435\u043c\u0432\u0440\u0438_\u0434\u0435\u043a\u0435\u043c\u0432\u0440\u0438'.split('_'),
        monthsShort: '\u044f\u043d\u0440_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u0439_\u044e\u043d\u0438_\u044e\u043b\u0438_\u0430\u0432\u0433_\u0441\u0435\u043f_\u043e\u043a\u0442_\u043d\u043e\u0435_\u0434\u0435\u043a'.split('_'),
        weekdays: '\u043d\u0435\u0434\u0435\u043b\u044f_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u044f\u0434\u0430_\u0447\u0435\u0442\u0432\u044a\u0440\u0442\u044a\u043a_\u043f\u0435\u0442\u044a\u043a_\u0441\u044a\u0431\u043e\u0442\u0430'.split('_'),
        weekdaysShort: '\u043d\u0435\u0434_\u043f\u043e\u043d_\u0432\u0442\u043e_\u0441\u0440\u044f_\u0447\u0435\u0442_\u043f\u0435\u0442_\u0441\u044a\u0431'.split('_'),
        weekdaysMin: '\u043d\u0434_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split('_'),
        longDateFormat: {
          LT: 'h:mm',
          L: 'D.MM.YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[\u0414\u043d\u0435\u0441 \u0432] LT',
          nextDay: '[\u0423\u0442\u0440\u0435 \u0432] LT',
          nextWeek: 'dddd [\u0432] LT',
          lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432] LT',
          lastWeek: function () {
            switch (this.day()) {
            case 0:
            case 3:
            case 6:
              return '[\u0412 \u0438\u0437\u043c\u0438\u043d\u0430\u043b\u0430\u0442\u0430] dddd [\u0432] LT';
            case 1:
            case 2:
            case 4:
            case 5:
              return '[\u0412 \u0438\u0437\u043c\u0438\u043d\u0430\u043b\u0438\u044f] dddd [\u0432] LT';
            }
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: '\u0441\u043b\u0435\u0434 %s',
          past: '\u043f\u0440\u0435\u0434\u0438 %s',
          s: '\u043d\u044f\u043a\u043e\u043b\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434\u0438',
          m: '\u043c\u0438\u043d\u0443\u0442\u0430',
          mm: '%d \u043c\u0438\u043d\u0443\u0442\u0438',
          h: '\u0447\u0430\u0441',
          hh: '%d \u0447\u0430\u0441\u0430',
          d: '\u0434\u0435\u043d',
          dd: '%d \u0434\u043d\u0438',
          M: '\u043c\u0435\u0441\u0435\u0446',
          MM: '%d \u043c\u0435\u0441\u0435\u0446\u0430',
          y: '\u0433\u043e\u0434\u0438\u043d\u0430',
          yy: '%d \u0433\u043e\u0434\u0438\u043d\u0438'
        },
        ordinal: function (number) {
          var lastDigit = number % 10, last2Digits = number % 100;
          if (number === 0) {
            return number + '-\u0435\u0432';
          } else if (last2Digits === 0) {
            return number + '-\u0435\u043d';
          } else if (last2Digits > 10 && last2Digits < 20) {
            return number + '-\u0442\u0438';
          } else if (lastDigit === 1) {
            return number + '-\u0432\u0438';
          } else if (lastDigit === 2) {
            return number + '-\u0440\u0438';
          } else if (lastDigit === 7 || lastDigit === 8) {
            return number + '-\u043c\u0438';
          } else {
            return number + '-\u0442\u0438';
          }
        },
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('ca', {
        months: 'Gener_Febrer_Mar\xe7_Abril_Maig_Juny_Juliol_Agost_Setembre_Octubre_Novembre_Desembre'.split('_'),
        monthsShort: 'Gen._Febr._Mar._Abr._Mai._Jun._Jul._Ag._Set._Oct._Nov._Des.'.split('_'),
        weekdays: 'Diumenge_Dilluns_Dimarts_Dimecres_Dijous_Divendres_Dissabte'.split('_'),
        weekdaysShort: 'Dg._Dl._Dt._Dc._Dj._Dv._Ds.'.split('_'),
        weekdaysMin: 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: function () {
            return '[avui a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
          },
          nextDay: function () {
            return '[dem\xe0 a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
          },
          nextWeek: function () {
            return 'dddd [a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
          },
          lastDay: function () {
            return '[ahir a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
          },
          lastWeek: function () {
            return '[el] dddd [passat a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: 'en %s',
          past: 'fa %s',
          s: 'uns segons',
          m: 'un minut',
          mm: '%d minuts',
          h: 'una hora',
          hh: '%d hores',
          d: 'un dia',
          dd: '%d dies',
          M: 'un mes',
          MM: '%d mesos',
          y: 'un any',
          yy: '%d anys'
        },
        ordinal: '%d\xba',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      var months = 'leden_\xfanor_b\u0159ezen_duben_kv\u011bten_\u010derven_\u010dervenec_srpen_z\xe1\u0159\xed_\u0159\xedjen_listopad_prosinec'.split('_'), monthsShort = 'led_\xfano_b\u0159e_dub_kv\u011b_\u010dvn_\u010dvc_srp_z\xe1\u0159_\u0159\xedj_lis_pro'.split('_');
      function plural(n) {
        return n > 1 && n < 5 && ~~(n / 10) !== 1;
      }
      function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
          return withoutSuffix || isFuture ? 'p\xe1r vte\u0159in' : 'p\xe1r vte\u0159inami';
        case 'm':
          return withoutSuffix ? 'minuta' : isFuture ? 'minutu' : 'minutou';
        case 'mm':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'minuty' : 'minut');
          } else {
            return result + 'minutami';
          }
          break;
        case 'h':
          return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
        case 'hh':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'hodiny' : 'hodin');
          } else {
            return result + 'hodinami';
          }
          break;
        case 'd':
          return withoutSuffix || isFuture ? 'den' : 'dnem';
        case 'dd':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'dny' : 'dn\xed');
          } else {
            return result + 'dny';
          }
          break;
        case 'M':
          return withoutSuffix || isFuture ? 'm\u011bs\xedc' : 'm\u011bs\xedcem';
        case 'MM':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'm\u011bs\xedce' : 'm\u011bs\xedc\u016f');
          } else {
            return result + 'm\u011bs\xedci';
          }
          break;
        case 'y':
          return withoutSuffix || isFuture ? 'rok' : 'rokem';
        case 'yy':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'roky' : 'let');
          } else {
            return result + 'lety';
          }
          break;
        }
      }
      moment.lang('cs', {
        months: months,
        monthsShort: monthsShort,
        monthsParse: function (months, monthsShort) {
          var i, _monthsParse = [];
          for (i = 0; i < 12; i++) {
            _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
          }
          return _monthsParse;
        }(months, monthsShort),
        weekdays: 'ned\u011ble_pond\u011bl\xed_\xfater\xfd_st\u0159eda_\u010dtvrtek_p\xe1tek_sobota'.split('_'),
        weekdaysShort: 'ne_po_\xfat_st_\u010dt_p\xe1_so'.split('_'),
        weekdaysMin: 'ne_po_\xfat_st_\u010dt_p\xe1_so'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'DD.MM.YYYY',
          LL: 'D. MMMM YYYY',
          LLL: 'D. MMMM YYYY LT',
          LLLL: 'dddd D. MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[dnes v] LT',
          nextDay: '[z\xedtra v] LT',
          nextWeek: function () {
            switch (this.day()) {
            case 0:
              return '[v ned\u011bli v] LT';
            case 1:
            case 2:
              return '[v] dddd [v] LT';
            case 3:
              return '[ve st\u0159edu v] LT';
            case 4:
              return '[ve \u010dtvrtek v] LT';
            case 5:
              return '[v p\xe1tek v] LT';
            case 6:
              return '[v sobotu v] LT';
            }
          },
          lastDay: '[v\u010dera v] LT',
          lastWeek: function () {
            switch (this.day()) {
            case 0:
              return '[minulou ned\u011bli v] LT';
            case 1:
            case 2:
              return '[minul\xe9] dddd [v] LT';
            case 3:
              return '[minulou st\u0159edu v] LT';
            case 4:
            case 5:
              return '[minul\xfd] dddd [v] LT';
            case 6:
              return '[minulou sobotu v] LT';
            }
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: 'za %s',
          past: 'p\u0159ed %s',
          s: translate,
          m: translate,
          mm: translate,
          h: translate,
          hh: translate,
          d: translate,
          dd: translate,
          M: translate,
          MM: translate,
          y: translate,
          yy: translate
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('cv', {
        months: '\u043a\u0103\u0440\u043b\u0430\u0447_\u043d\u0430\u0440\u0103\u0441_\u043f\u0443\u0448_\u0430\u043a\u0430_\u043c\u0430\u0439_\xe7\u0115\u0440\u0442\u043c\u0435_\u0443\u0442\u0103_\xe7\u0443\u0440\u043b\u0430_\u0430\u0432\u0103\u043d_\u044e\u043f\u0430_\u0447\u04f3\u043a_\u0440\u0430\u0448\u0442\u0430\u0432'.split('_'),
        monthsShort: '\u043a\u0103\u0440_\u043d\u0430\u0440_\u043f\u0443\u0448_\u0430\u043a\u0430_\u043c\u0430\u0439_\xe7\u0115\u0440_\u0443\u0442\u0103_\xe7\u0443\u0440_\u0430\u0432_\u044e\u043f\u0430_\u0447\u04f3\u043a_\u0440\u0430\u0448'.split('_'),
        weekdays: '\u0432\u044b\u0440\u0441\u0430\u0440\u043d\u0438\u043a\u0443\u043d_\u0442\u0443\u043d\u0442\u0438\u043a\u0443\u043d_\u044b\u0442\u043b\u0430\u0440\u0438\u043a\u0443\u043d_\u044e\u043d\u043a\u0443\u043d_\u043a\u0115\xe7\u043d\u0435\u0440\u043d\u0438\u043a\u0443\u043d_\u044d\u0440\u043d\u0435\u043a\u0443\u043d_\u0448\u0103\u043c\u0430\u0442\u043a\u0443\u043d'.split('_'),
        weekdaysShort: '\u0432\u044b\u0440_\u0442\u0443\u043d_\u044b\u0442\u043b_\u044e\u043d_\u043a\u0115\xe7_\u044d\u0440\u043d_\u0448\u0103\u043c'.split('_'),
        weekdaysMin: '\u0432\u0440_\u0442\u043d_\u044b\u0442_\u044e\u043d_\u043a\xe7_\u044d\u0440_\u0448\u043c'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD-MM-YYYY',
          LL: 'YYYY [\xe7\u0443\u043b\u0445\u0438] MMMM [\u0443\u0439\u0103\u0445\u0115\u043d] D[-\u043c\u0115\u0448\u0115]',
          LLL: 'YYYY [\xe7\u0443\u043b\u0445\u0438] MMMM [\u0443\u0439\u0103\u0445\u0115\u043d] D[-\u043c\u0115\u0448\u0115], LT',
          LLLL: 'dddd, YYYY [\xe7\u0443\u043b\u0445\u0438] MMMM [\u0443\u0439\u0103\u0445\u0115\u043d] D[-\u043c\u0115\u0448\u0115], LT'
        },
        calendar: {
          sameDay: '[\u041f\u0430\u044f\u043d] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
          nextDay: '[\u042b\u0440\u0430\u043d] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
          lastDay: '[\u0114\u043d\u0435\u0440] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
          nextWeek: '[\xc7\u0438\u0442\u0435\u0441] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
          lastWeek: '[\u0418\u0440\u0442\u043d\u0115] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
          sameElse: 'L'
        },
        relativeTime: {
          future: function (output) {
            var affix = /сехет$/i.exec(output) ? '\u0440\u0435\u043d' : /çул$/i.exec(output) ? '\u0442\u0430\u043d' : '\u0440\u0430\u043d';
            return output + affix;
          },
          past: '%s \u043a\u0430\u044f\u043b\u043b\u0430',
          s: '\u043f\u0115\u0440-\u0438\u043a \xe7\u0435\u043a\u043a\u0443\u043d\u0442',
          m: '\u043f\u0115\u0440 \u043c\u0438\u043d\u0443\u0442',
          mm: '%d \u043c\u0438\u043d\u0443\u0442',
          h: '\u043f\u0115\u0440 \u0441\u0435\u0445\u0435\u0442',
          hh: '%d \u0441\u0435\u0445\u0435\u0442',
          d: '\u043f\u0115\u0440 \u043a\u0443\u043d',
          dd: '%d \u043a\u0443\u043d',
          M: '\u043f\u0115\u0440 \u0443\u0439\u0103\u0445',
          MM: '%d \u0443\u0439\u0103\u0445',
          y: '\u043f\u0115\u0440 \xe7\u0443\u043b',
          yy: '%d \xe7\u0443\u043b'
        },
        ordinal: '%d-\u043c\u0115\u0448',
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('da', {
        months: 'Januar_Februar_Marts_April_Maj_Juni_Juli_August_September_Oktober_November_December'.split('_'),
        monthsShort: 'Jan_Feb_Mar_Apr_Maj_Jun_Jul_Aug_Sep_Okt_Nov_Dec'.split('_'),
        weekdays: 'S\xf8ndag_Mandag_Tirsdag_Onsdag_Torsdag_Fredag_L\xf8rdag'.split('_'),
        weekdaysShort: 'S\xf8n_Man_Tir_Ons_Tor_Fre_L\xf8r'.split('_'),
        weekdaysMin: 'S\xf8_Ma_Ti_On_To_Fr_L\xf8'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D. MMMM, YYYY LT'
        },
        calendar: {
          sameDay: '[I dag kl.] LT',
          nextDay: '[I morgen kl.] LT',
          nextWeek: 'dddd [kl.] LT',
          lastDay: '[I g\xe5r kl.] LT',
          lastWeek: '[sidste] dddd [kl] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'om %s',
          past: '%s siden',
          s: 'f\xe5 sekunder',
          m: 'et minut',
          mm: '%d minutter',
          h: 'en time',
          hh: '%d timer',
          d: 'en dag',
          dd: '%d dage',
          M: 'en m\xe5ned',
          MM: '%d m\xe5neder',
          y: 'et \xe5r',
          yy: '%d \xe5r'
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('de', {
        months: 'Januar_Februar_M\xe4rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort: 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays: 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat: {
          LT: 'H:mm [Uhr]',
          L: 'DD.MM.YYYY',
          LL: 'D. MMMM YYYY',
          LLL: 'D. MMMM YYYY LT',
          LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[Heute um] LT',
          sameElse: 'L',
          nextDay: '[Morgen um] LT',
          nextWeek: 'dddd [um] LT',
          lastDay: '[Gestern um] LT',
          lastWeek: '[letzten] dddd [um] LT'
        },
        relativeTime: {
          future: 'in %s',
          past: 'vor %s',
          s: 'ein paar Sekunden',
          m: 'einer Minute',
          mm: '%d Minuten',
          h: 'einer Stunde',
          hh: '%d Stunden',
          d: 'einem Tag',
          dd: '%d Tagen',
          M: 'einem Monat',
          MM: '%d Monaten',
          y: 'einem Jahr',
          yy: '%d Jahren'
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('el', {
        monthsNominativeEl: '\u0399\u03b1\u03bd\u03bf\u03c5\u03ac\u03c1\u03b9\u03bf\u03c2_\u03a6\u03b5\u03b2\u03c1\u03bf\u03c5\u03ac\u03c1\u03b9\u03bf\u03c2_\u039c\u03ac\u03c1\u03c4\u03b9\u03bf\u03c2_\u0391\u03c0\u03c1\u03af\u03bb\u03b9\u03bf\u03c2_\u039c\u03ac\u03b9\u03bf\u03c2_\u0399\u03bf\u03cd\u03bd\u03b9\u03bf\u03c2_\u0399\u03bf\u03cd\u03bb\u03b9\u03bf\u03c2_\u0391\u03cd\u03b3\u03bf\u03c5\u03c3\u03c4\u03bf\u03c2_\u03a3\u03b5\u03c0\u03c4\u03ad\u03bc\u03b2\u03c1\u03b9\u03bf\u03c2_\u039f\u03ba\u03c4\u03ce\u03b2\u03c1\u03b9\u03bf\u03c2_\u039d\u03bf\u03ad\u03bc\u03b2\u03c1\u03b9\u03bf\u03c2_\u0394\u03b5\u03ba\u03ad\u03bc\u03b2\u03c1\u03b9\u03bf\u03c2'.split('_'),
        monthsGenitiveEl: '\u0399\u03b1\u03bd\u03bf\u03c5\u03b1\u03c1\u03af\u03bf\u03c5_\u03a6\u03b5\u03b2\u03c1\u03bf\u03c5\u03b1\u03c1\u03af\u03bf\u03c5_\u039c\u03b1\u03c1\u03c4\u03af\u03bf\u03c5_\u0391\u03c0\u03c1\u03b9\u03bb\u03af\u03bf\u03c5_\u039c\u03b1\u0390\u03bf\u03c5_\u0399\u03bf\u03c5\u03bd\u03af\u03bf\u03c5_\u0399\u03bf\u03c5\u03bb\u03af\u03bf\u03c5_\u0391\u03c5\u03b3\u03bf\u03cd\u03c3\u03c4\u03bf\u03c5_\u03a3\u03b5\u03c0\u03c4\u03b5\u03bc\u03b2\u03c1\u03af\u03bf\u03c5_\u039f\u03ba\u03c4\u03c9\u03b2\u03c1\u03af\u03bf\u03c5_\u039d\u03bf\u03b5\u03bc\u03b2\u03c1\u03af\u03bf\u03c5_\u0394\u03b5\u03ba\u03b5\u03bc\u03b2\u03c1\u03af\u03bf\u03c5'.split('_'),
        months: function (momentToFormat, format) {
          if (/D/.test(format.substring(0, format.indexOf('MMMM')))) {
            return this._monthsGenitiveEl[momentToFormat.month()];
          } else {
            return this._monthsNominativeEl[momentToFormat.month()];
          }
        },
        monthsShort: '\u0399\u03b1\u03bd_\u03a6\u03b5\u03b2_\u039c\u03b1\u03c1_\u0391\u03c0\u03c1_\u039c\u03b1\u03ca_\u0399\u03bf\u03c5\u03bd_\u0399\u03bf\u03c5\u03bb_\u0391\u03c5\u03b3_\u03a3\u03b5\u03c0_\u039f\u03ba\u03c4_\u039d\u03bf\u03b5_\u0394\u03b5\u03ba'.split('_'),
        weekdays: '\u039a\u03c5\u03c1\u03b9\u03b1\u03ba\u03ae_\u0394\u03b5\u03c5\u03c4\u03ad\u03c1\u03b1_\u03a4\u03c1\u03af\u03c4\u03b7_\u03a4\u03b5\u03c4\u03ac\u03c1\u03c4\u03b7_\u03a0\u03ad\u03bc\u03c0\u03c4\u03b7_\u03a0\u03b1\u03c1\u03b1\u03c3\u03ba\u03b5\u03c5\u03ae_\u03a3\u03ac\u03b2\u03b2\u03b1\u03c4\u03bf'.split('_'),
        weekdaysShort: '\u039a\u03c5\u03c1_\u0394\u03b5\u03c5_\u03a4\u03c1\u03b9_\u03a4\u03b5\u03c4_\u03a0\u03b5\u03bc_\u03a0\u03b1\u03c1_\u03a3\u03b1\u03b2'.split('_'),
        weekdaysMin: '\u039a\u03c5_\u0394\u03b5_\u03a4\u03c1_\u03a4\u03b5_\u03a0\u03b5_\u03a0\u03b1_\u03a3\u03b1'.split('_'),
        meridiem: function (hours, minutes, isLower) {
          if (hours > 11) {
            return isLower ? '\u03bc\u03bc' : '\u039c\u039c';
          } else {
            return isLower ? '\u03c0\u03bc' : '\u03a0\u039c';
          }
        },
        longDateFormat: {
          LT: 'h:mm A',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendarEl: {
          sameDay: '[\u03a3\u03ae\u03bc\u03b5\u03c1\u03b1 {}] LT',
          nextDay: '[\u0391\u03cd\u03c1\u03b9\u03bf {}] LT',
          nextWeek: 'dddd [{}] LT',
          lastDay: '[\u03a7\u03b8\u03b5\u03c2 {}] LT',
          lastWeek: '[\u03c4\u03b7\u03bd \u03c0\u03c1\u03bf\u03b7\u03b3\u03bf\u03cd\u03bc\u03b5\u03bd\u03b7] dddd [{}] LT',
          sameElse: 'L'
        },
        calendar: function (key, mom) {
          var output = this._calendarEl[key], hours = mom && mom.hours();
          return output.replace('{}', hours % 12 === 1 ? '\u03c3\u03c4\u03b7' : '\u03c3\u03c4\u03b9\u03c2');
        },
        relativeTime: {
          future: '\u03c3\u03b5 %s',
          past: '%s \u03c0\u03c1\u03b9\u03bd',
          s: '\u03b4\u03b5\u03c5\u03c4\u03b5\u03c1\u03cc\u03bb\u03b5\u03c0\u03c4\u03b1',
          m: '\u03ad\u03bd\u03b1 \u03bb\u03b5\u03c0\u03c4\u03cc',
          mm: '%d \u03bb\u03b5\u03c0\u03c4\u03ac',
          h: '\u03bc\u03af\u03b1 \u03ce\u03c1\u03b1',
          hh: '%d \u03ce\u03c1\u03b5\u03c2',
          d: '\u03bc\u03af\u03b1 \u03bc\u03ad\u03c1\u03b1',
          dd: '%d \u03bc\u03ad\u03c1\u03b5\u03c2',
          M: '\u03ad\u03bd\u03b1\u03c2 \u03bc\u03ae\u03bd\u03b1\u03c2',
          MM: '%d \u03bc\u03ae\u03bd\u03b5\u03c2',
          y: '\u03ad\u03bd\u03b1\u03c2 \u03c7\u03c1\u03cc\u03bd\u03bf\u03c2',
          yy: '%d \u03c7\u03c1\u03cc\u03bd\u03b9\u03b1'
        },
        ordinal: function (number) {
          return number + '\u03b7';
        },
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('en-ca', {
        months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat: {
          LT: 'h:mm A',
          L: 'YYYY-MM-DD',
          LL: 'D MMMM, YYYY',
          LLL: 'D MMMM, YYYY LT',
          LLLL: 'dddd, D MMMM, YYYY LT'
        },
        calendar: {
          sameDay: '[Today at] LT',
          nextDay: '[Tomorrow at] LT',
          nextWeek: 'dddd [at] LT',
          lastDay: '[Yesterday at] LT',
          lastWeek: '[Last] dddd [at] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'in %s',
          past: '%s ago',
          s: 'a few seconds',
          m: 'a minute',
          mm: '%d minutes',
          h: 'an hour',
          hh: '%d hours',
          d: 'a day',
          dd: '%d days',
          M: 'a month',
          MM: '%d months',
          y: 'a year',
          yy: '%d years'
        },
        ordinal: function (number) {
          var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
          return number + output;
        }
      });
    }());
    (function () {
      moment.lang('en-gb', {
        months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat: {
          LT: 'h:mm A',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[Today at] LT',
          nextDay: '[Tomorrow at] LT',
          nextWeek: 'dddd [at] LT',
          lastDay: '[Yesterday at] LT',
          lastWeek: '[Last] dddd [at] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'in %s',
          past: '%s ago',
          s: 'a few seconds',
          m: 'a minute',
          mm: '%d minutes',
          h: 'an hour',
          hh: '%d hours',
          d: 'a day',
          dd: '%d days',
          M: 'a month',
          MM: '%d months',
          y: 'a year',
          yy: '%d years'
        },
        ordinal: function (number) {
          var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
          return number + output;
        },
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('eo', {
        months: 'januaro_februaro_marto_aprilo_majo_junio_julio_a\u016dgusto_septembro_oktobro_novembro_decembro'.split('_'),
        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_a\u016dg_sep_okt_nov_dec'.split('_'),
        weekdays: 'Diman\u0109o_Lundo_Mardo_Merkredo_\u0134a\u016ddo_Vendredo_Sabato'.split('_'),
        weekdaysShort: 'Dim_Lun_Mard_Merk_\u0134a\u016d_Ven_Sab'.split('_'),
        weekdaysMin: 'Di_Lu_Ma_Me_\u0134a_Ve_Sa'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'YYYY-MM-DD',
          LL: 'D[-an de] MMMM, YYYY',
          LLL: 'D[-an de] MMMM, YYYY LT',
          LLLL: 'dddd, [la] D[-an de] MMMM, YYYY LT'
        },
        meridiem: function (hours, minutes, isLower) {
          if (hours > 11) {
            return isLower ? 'p.t.m.' : 'P.T.M.';
          } else {
            return isLower ? 'a.t.m.' : 'A.T.M.';
          }
        },
        calendar: {
          sameDay: '[Hodia\u016d je] LT',
          nextDay: '[Morga\u016d je] LT',
          nextWeek: 'dddd [je] LT',
          lastDay: '[Hiera\u016d je] LT',
          lastWeek: '[pasinta] dddd [je] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'je %s',
          past: 'anta\u016d %s',
          s: 'sekundoj',
          m: 'minuto',
          mm: '%d minutoj',
          h: 'horo',
          hh: '%d horoj',
          d: 'tago',
          dd: '%d tagoj',
          M: 'monato',
          MM: '%d monatoj',
          y: 'jaro',
          yy: '%d jaroj'
        },
        ordinal: '%da',
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('es', {
        months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
        monthsShort: 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'),
        weekdays: 'domingo_lunes_martes_mi\xe9rcoles_jueves_viernes_s\xe1bado'.split('_'),
        weekdaysShort: 'dom._lun._mar._mi\xe9._jue._vie._s\xe1b.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_S\xe1'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'DD/MM/YYYY',
          LL: 'D [de] MMMM [de] YYYY',
          LLL: 'D [de] MMMM [de] YYYY LT',
          LLLL: 'dddd, D [de] MMMM [de] YYYY LT'
        },
        calendar: {
          sameDay: function () {
            return '[hoy a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
          },
          nextDay: function () {
            return '[ma\xf1ana a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
          },
          nextWeek: function () {
            return 'dddd [a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
          },
          lastDay: function () {
            return '[ayer a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
          },
          lastWeek: function () {
            return '[el] dddd [pasado a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: 'en %s',
          past: 'hace %s',
          s: 'unos segundos',
          m: 'un minuto',
          mm: '%d minutos',
          h: 'una hora',
          hh: '%d horas',
          d: 'un d\xeda',
          dd: '%d d\xedas',
          M: 'un mes',
          MM: '%d meses',
          y: 'un a\xf1o',
          yy: '%d a\xf1os'
        },
        ordinal: '%d\xba',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      function translateSeconds(number, withoutSuffix, key, isFuture) {
        return isFuture || withoutSuffix ? 'paari sekundi' : 'paar sekundit';
      }
      moment.lang('et', {
        months: 'jaanuar_veebruar_m\xe4rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
        monthsShort: 'jaan_veebr_m\xe4rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
        weekdays: 'p\xfchap\xe4ev_esmasp\xe4ev_teisip\xe4ev_kolmap\xe4ev_neljap\xe4ev_reede_laup\xe4ev'.split('_'),
        weekdaysShort: 'P_E_T_K_N_R_L'.split('_'),
        weekdaysMin: 'P_E_T_K_N_R_L'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'DD.MM.YYYY',
          LL: 'D. MMMM YYYY',
          LLL: 'D. MMMM YYYY LT',
          LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[T\xe4na,] LT',
          nextDay: '[Homme,] LT',
          nextWeek: '[J\xe4rgmine] dddd LT',
          lastDay: '[Eile,] LT',
          lastWeek: '[Eelmine] dddd LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s p\xe4rast',
          past: '%s tagasi',
          s: translateSeconds,
          m: 'minut',
          mm: '%d minutit',
          h: 'tund',
          hh: '%d tundi',
          d: 'p\xe4ev',
          dd: '%d p\xe4eva',
          M: 'kuu',
          MM: '%d kuud',
          y: 'aasta',
          yy: '%d aastat'
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('eu', {
        months: 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
        monthsShort: 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
        weekdays: 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
        weekdaysShort: 'ig._al._ar._az._og._ol._lr.'.split('_'),
        weekdaysMin: 'ig_al_ar_az_og_ol_lr'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'YYYY-MM-DD',
          LL: 'YYYY[ko] MMMM[ren] D[a]',
          LLL: 'YYYY[ko] MMMM[ren] D[a] LT',
          LLLL: 'dddd, YYYY[ko] MMMM[ren] D[a] LT',
          l: 'YYYY-M-D',
          ll: 'YYYY[ko] MMM D[a]',
          lll: 'YYYY[ko] MMM D[a] LT',
          llll: 'ddd, YYYY[ko] MMM D[a] LT'
        },
        calendar: {
          sameDay: '[gaur] LT[etan]',
          nextDay: '[bihar] LT[etan]',
          nextWeek: 'dddd LT[etan]',
          lastDay: '[atzo] LT[etan]',
          lastWeek: '[aurreko] dddd LT[etan]',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s barru',
          past: 'duela %s',
          s: 'segundo batzuk',
          m: 'minutu bat',
          mm: '%d minutu',
          h: 'ordu bat',
          hh: '%d ordu',
          d: 'egun bat',
          dd: '%d egun',
          M: 'hilabete bat',
          MM: '%d hilabete',
          y: 'urte bat',
          yy: '%d urte'
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      var numbers_past = 'nolla yksi kaksi kolme nelj\xe4 viisi kuusi seitsem\xe4n kahdeksan yhdeks\xe4n'.split(' '), numbers_future = [
          'nolla',
          'yhden',
          'kahden',
          'kolmen',
          'nelj\xe4n',
          'viiden',
          'kuuden',
          numbers_past[7],
          numbers_past[8],
          numbers_past[9]
        ];
      function translate(number, withoutSuffix, key, isFuture) {
        var result = '';
        switch (key) {
        case 's':
          return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
        case 'm':
          return isFuture ? 'minuutin' : 'minuutti';
        case 'mm':
          result = isFuture ? 'minuutin' : 'minuuttia';
          break;
        case 'h':
          return isFuture ? 'tunnin' : 'tunti';
        case 'hh':
          result = isFuture ? 'tunnin' : 'tuntia';
          break;
        case 'd':
          return isFuture ? 'p\xe4iv\xe4n' : 'p\xe4iv\xe4';
        case 'dd':
          result = isFuture ? 'p\xe4iv\xe4n' : 'p\xe4iv\xe4\xe4';
          break;
        case 'M':
          return isFuture ? 'kuukauden' : 'kuukausi';
        case 'MM':
          result = isFuture ? 'kuukauden' : 'kuukautta';
          break;
        case 'y':
          return isFuture ? 'vuoden' : 'vuosi';
        case 'yy':
          result = isFuture ? 'vuoden' : 'vuotta';
          break;
        }
        result = verbal_number(number, isFuture) + ' ' + result;
        return result;
      }
      function verbal_number(number, isFuture) {
        return number < 10 ? isFuture ? numbers_future[number] : numbers_past[number] : number;
      }
      moment.lang('fi', {
        months: 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kes\xe4kuu_hein\xe4kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
        monthsShort: 'tammi_helmi_maalis_huhti_touko_kes\xe4_hein\xe4_elo_syys_loka_marras_joulu'.split('_'),
        weekdays: 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
        weekdaysShort: 'su_ma_ti_ke_to_pe_la'.split('_'),
        weekdaysMin: 'su_ma_ti_ke_to_pe_la'.split('_'),
        longDateFormat: {
          LT: 'HH.mm',
          L: 'DD.MM.YYYY',
          LL: 'Do MMMM[ta] YYYY',
          LLL: 'Do MMMM[ta] YYYY, [klo] LT',
          LLLL: 'dddd, Do MMMM[ta] YYYY, [klo] LT',
          l: 'D.M.YYYY',
          ll: 'Do MMM YYYY',
          lll: 'Do MMM YYYY, [klo] LT',
          llll: 'ddd, Do MMM YYYY, [klo] LT'
        },
        calendar: {
          sameDay: '[t\xe4n\xe4\xe4n] [klo] LT',
          nextDay: '[huomenna] [klo] LT',
          nextWeek: 'dddd [klo] LT',
          lastDay: '[eilen] [klo] LT',
          lastWeek: '[viime] dddd[na] [klo] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s p\xe4\xe4st\xe4',
          past: '%s sitten',
          s: translate,
          m: translate,
          mm: translate,
          h: translate,
          hh: translate,
          d: translate,
          dd: translate,
          M: translate,
          MM: translate,
          y: translate,
          yy: translate
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('fr-ca', {
        months: 'janvier_f\xe9vrier_mars_avril_mai_juin_juillet_ao\xfbt_septembre_octobre_novembre_d\xe9cembre'.split('_'),
        monthsShort: 'janv._f\xe9vr._mars_avr._mai_juin_juil._ao\xfbt_sept._oct._nov._d\xe9c.'.split('_'),
        weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'YYYY-MM-DD',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[Aujourd\'hui \xe0] LT',
          nextDay: '[Demain \xe0] LT',
          nextWeek: 'dddd [\xe0] LT',
          lastDay: '[Hier \xe0] LT',
          lastWeek: 'dddd [dernier \xe0] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'dans %s',
          past: 'il y a %s',
          s: 'quelques secondes',
          m: 'une minute',
          mm: '%d minutes',
          h: 'une heure',
          hh: '%d heures',
          d: 'un jour',
          dd: '%d jours',
          M: 'un mois',
          MM: '%d mois',
          y: 'un an',
          yy: '%d ans'
        },
        ordinal: function (number) {
          return number + (number === 1 ? 'er' : '');
        }
      });
    }());
    (function () {
      moment.lang('fr', {
        months: 'janvier_f\xe9vrier_mars_avril_mai_juin_juillet_ao\xfbt_septembre_octobre_novembre_d\xe9cembre'.split('_'),
        monthsShort: 'janv._f\xe9vr._mars_avr._mai_juin_juil._ao\xfbt_sept._oct._nov._d\xe9c.'.split('_'),
        weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[Aujourd\'hui \xe0] LT',
          nextDay: '[Demain \xe0] LT',
          nextWeek: 'dddd [\xe0] LT',
          lastDay: '[Hier \xe0] LT',
          lastWeek: 'dddd [dernier \xe0] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'dans %s',
          past: 'il y a %s',
          s: 'quelques secondes',
          m: 'une minute',
          mm: '%d minutes',
          h: 'une heure',
          hh: '%d heures',
          d: 'un jour',
          dd: '%d jours',
          M: 'un mois',
          MM: '%d mois',
          y: 'un an',
          yy: '%d ans'
        },
        ordinal: function (number) {
          return number + (number === 1 ? 'er' : '');
        },
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('gl', {
        months: 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xu\xf1o_Xullo_Agosto_Setembro_Octubro_Novembro_Decembro'.split('_'),
        monthsShort: 'Xan._Feb._Mar._Abr._Mai._Xu\xf1._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
        weekdays: 'Domingo_Luns_Martes_M\xe9rcores_Xoves_Venres_S\xe1bado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._M\xe9r._Xov._Ven._S\xe1b.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_M\xe9_Xo_Ve_S\xe1'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: function () {
            return '[hoxe ' + (this.hours() !== 1 ? '\xe1s' : 'a') + '] LT';
          },
          nextDay: function () {
            return '[ma\xf1\xe1 ' + (this.hours() !== 1 ? '\xe1s' : 'a') + '] LT';
          },
          nextWeek: function () {
            return 'dddd [' + (this.hours() !== 1 ? '\xe1s' : 'a') + '] LT';
          },
          lastDay: function () {
            return '[onte ' + (this.hours() !== 1 ? '\xe1' : 'a') + '] LT';
          },
          lastWeek: function () {
            return '[o] dddd [pasado ' + (this.hours() !== 1 ? '\xe1s' : 'a') + '] LT';
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: 'en %s',
          past: 'fai %s',
          s: 'uns segundo',
          m: 'un minuto',
          mm: '%d minutos',
          h: 'unha hora',
          hh: '%d horas',
          d: 'un d\xeda',
          dd: '%d d\xedas',
          M: 'un mes',
          MM: '%d meses',
          y: 'un ano',
          yy: '%d anos'
        },
        ordinal: '%d\xba',
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('he', {
        months: '\u05d9\u05e0\u05d5\u05d0\u05e8_\u05e4\u05d1\u05e8\u05d5\u05d0\u05e8_\u05de\u05e8\u05e5_\u05d0\u05e4\u05e8\u05d9\u05dc_\u05de\u05d0\u05d9_\u05d9\u05d5\u05e0\u05d9_\u05d9\u05d5\u05dc\u05d9_\u05d0\u05d5\u05d2\u05d5\u05e1\u05d8_\u05e1\u05e4\u05d8\u05de\u05d1\u05e8_\u05d0\u05d5\u05e7\u05d8\u05d5\u05d1\u05e8_\u05e0\u05d5\u05d1\u05de\u05d1\u05e8_\u05d3\u05e6\u05de\u05d1\u05e8'.split('_'),
        monthsShort: '\u05d9\u05e0\u05d5\u05f3_\u05e4\u05d1\u05e8\u05f3_\u05de\u05e8\u05e5_\u05d0\u05e4\u05e8\u05f3_\u05de\u05d0\u05d9_\u05d9\u05d5\u05e0\u05d9_\u05d9\u05d5\u05dc\u05d9_\u05d0\u05d5\u05d2\u05f3_\u05e1\u05e4\u05d8\u05f3_\u05d0\u05d5\u05e7\u05f3_\u05e0\u05d5\u05d1\u05f3_\u05d3\u05e6\u05de\u05f3'.split('_'),
        weekdays: '\u05e8\u05d0\u05e9\u05d5\u05df_\u05e9\u05e0\u05d9_\u05e9\u05dc\u05d9\u05e9\u05d9_\u05e8\u05d1\u05d9\u05e2\u05d9_\u05d7\u05de\u05d9\u05e9\u05d9_\u05e9\u05d9\u05e9\u05d9_\u05e9\u05d1\u05ea'.split('_'),
        weekdaysShort: '\u05d0\u05f3_\u05d1\u05f3_\u05d2\u05f3_\u05d3\u05f3_\u05d4\u05f3_\u05d5\u05f3_\u05e9\u05f3'.split('_'),
        weekdaysMin: '\u05d0_\u05d1_\u05d2_\u05d3_\u05d4_\u05d5_\u05e9'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D [\u05d1]MMMM YYYY',
          LLL: 'D [\u05d1]MMMM YYYY LT',
          LLLL: 'dddd, D [\u05d1]MMMM YYYY LT',
          l: 'D/M/YYYY',
          ll: 'D MMM YYYY',
          lll: 'D MMM YYYY LT',
          llll: 'ddd, D MMM YYYY LT'
        },
        calendar: {
          sameDay: '[\u05d4\u05d9\u05d5\u05dd \u05d1\u05be]LT',
          nextDay: '[\u05de\u05d7\u05e8 \u05d1\u05be]LT',
          nextWeek: 'dddd [\u05d1\u05e9\u05e2\u05d4] LT',
          lastDay: '[\u05d0\u05ea\u05de\u05d5\u05dc \u05d1\u05be]LT',
          lastWeek: '[\u05d1\u05d9\u05d5\u05dd] dddd [\u05d4\u05d0\u05d7\u05e8\u05d5\u05df \u05d1\u05e9\u05e2\u05d4] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '\u05d1\u05e2\u05d5\u05d3 %s',
          past: '\u05dc\u05e4\u05e0\u05d9 %s',
          s: '\u05de\u05e1\u05e4\u05e8 \u05e9\u05e0\u05d9\u05d5\u05ea',
          m: '\u05d3\u05e7\u05d4',
          mm: '%d \u05d3\u05e7\u05d5\u05ea',
          h: '\u05e9\u05e2\u05d4',
          hh: '%d \u05e9\u05e2\u05d5\u05ea',
          d: '\u05d9\u05d5\u05dd',
          dd: '%d \u05d9\u05de\u05d9\u05dd',
          M: '\u05d7\u05d5\u05d3\u05e9',
          MM: '%d \u05d7\u05d5\u05d3\u05e9\u05d9\u05dd',
          y: '\u05e9\u05e0\u05d4',
          yy: '%d \u05e9\u05e0\u05d9\u05dd'
        }
      });
    }());
    (function () {
      var symbolMap = {
          '1': '\u0967',
          '2': '\u0968',
          '3': '\u0969',
          '4': '\u096a',
          '5': '\u096b',
          '6': '\u096c',
          '7': '\u096d',
          '8': '\u096e',
          '9': '\u096f',
          '0': '\u0966'
        }, numberMap = {
          '\u0967': '1',
          '\u0968': '2',
          '\u0969': '3',
          '\u096a': '4',
          '\u096b': '5',
          '\u096c': '6',
          '\u096d': '7',
          '\u096e': '8',
          '\u096f': '9',
          '\u0966': '0'
        };
      moment.lang('hi', {
        months: '\u091c\u0928\u0935\u0930\u0940_\u092b\u093c\u0930\u0935\u0930\u0940_\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u0948\u0932_\u092e\u0908_\u091c\u0942\u0928_\u091c\u0941\u0932\u093e\u0908_\u0905\u0917\u0938\u094d\u0924_\u0938\u093f\u0924\u092e\u094d\u092c\u0930_\u0905\u0915\u094d\u091f\u0942\u092c\u0930_\u0928\u0935\u092e\u094d\u092c\u0930_\u0926\u093f\u0938\u092e\u094d\u092c\u0930'.split('_'),
        monthsShort: '\u091c\u0928._\u092b\u093c\u0930._\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u0948._\u092e\u0908_\u091c\u0942\u0928_\u091c\u0941\u0932._\u0905\u0917._\u0938\u093f\u0924._\u0905\u0915\u094d\u091f\u0942._\u0928\u0935._\u0926\u093f\u0938.'.split('_'),
        weekdays: '\u0930\u0935\u093f\u0935\u093e\u0930_\u0938\u094b\u092e\u0935\u093e\u0930_\u092e\u0902\u0917\u0932\u0935\u093e\u0930_\u092c\u0941\u0927\u0935\u093e\u0930_\u0917\u0941\u0930\u0942\u0935\u093e\u0930_\u0936\u0941\u0915\u094d\u0930\u0935\u093e\u0930_\u0936\u0928\u093f\u0935\u093e\u0930'.split('_'),
        weekdaysShort: '\u0930\u0935\u093f_\u0938\u094b\u092e_\u092e\u0902\u0917\u0932_\u092c\u0941\u0927_\u0917\u0941\u0930\u0942_\u0936\u0941\u0915\u094d\u0930_\u0936\u0928\u093f'.split('_'),
        weekdaysMin: '\u0930_\u0938\u094b_\u092e\u0902_\u092c\u0941_\u0917\u0941_\u0936\u0941_\u0936'.split('_'),
        longDateFormat: {
          LT: 'A h:mm \u092c\u091c\u0947',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY, LT',
          LLLL: 'dddd, D MMMM YYYY, LT'
        },
        calendar: {
          sameDay: '[\u0906\u091c] LT',
          nextDay: '[\u0915\u0932] LT',
          nextWeek: 'dddd, LT',
          lastDay: '[\u0915\u0932] LT',
          lastWeek: '[\u092a\u093f\u091b\u0932\u0947] dddd, LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s \u092e\u0947\u0902',
          past: '%s \u092a\u0939\u0932\u0947',
          s: '\u0915\u0941\u091b \u0939\u0940 \u0915\u094d\u0937\u0923',
          m: '\u090f\u0915 \u092e\u093f\u0928\u091f',
          mm: '%d \u092e\u093f\u0928\u091f',
          h: '\u090f\u0915 \u0918\u0902\u091f\u093e',
          hh: '%d \u0918\u0902\u091f\u0947',
          d: '\u090f\u0915 \u0926\u093f\u0928',
          dd: '%d \u0926\u093f\u0928',
          M: '\u090f\u0915 \u092e\u0939\u0940\u0928\u0947',
          MM: '%d \u092e\u0939\u0940\u0928\u0947',
          y: '\u090f\u0915 \u0935\u0930\u094d\u0937',
          yy: '%d \u0935\u0930\u094d\u0937'
        },
        preparse: function (string) {
          return string.replace(/[१२३४५६७८९०]/g, function (match) {
            return numberMap[match];
          });
        },
        postformat: function (string) {
          return string.replace(/\d/g, function (match) {
            return symbolMap[match];
          });
        },
        meridiem: function (hour, minute, isLower) {
          if (hour < 4) {
            return '\u0930\u093e\u0924';
          } else if (hour < 10) {
            return '\u0938\u0941\u092c\u0939';
          } else if (hour < 17) {
            return '\u0926\u094b\u092a\u0939\u0930';
          } else if (hour < 20) {
            return '\u0936\u093e\u092e';
          } else {
            return '\u0930\u093e\u0924';
          }
        },
        week: {
          dow: 0,
          doy: 6
        }
      });
    }());
    (function () {
      var weekEndings = 'vas\xe1rnap h\xe9tf\u0151n kedden szerd\xe1n cs\xfct\xf6rt\xf6k\xf6n p\xe9nteken szombaton'.split(' ');
      function translate(number, withoutSuffix, key, isFuture) {
        var num = number, suffix;
        switch (key) {
        case 's':
          return isFuture || withoutSuffix ? 'n\xe9h\xe1ny m\xe1sodperc' : 'n\xe9h\xe1ny m\xe1sodperce';
        case 'm':
          return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'mm':
          return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'h':
          return 'egy' + (isFuture || withoutSuffix ? ' \xf3ra' : ' \xf3r\xe1ja');
        case 'hh':
          return num + (isFuture || withoutSuffix ? ' \xf3ra' : ' \xf3r\xe1ja');
        case 'd':
          return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'dd':
          return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'M':
          return 'egy' + (isFuture || withoutSuffix ? ' h\xf3nap' : ' h\xf3napja');
        case 'MM':
          return num + (isFuture || withoutSuffix ? ' h\xf3nap' : ' h\xf3napja');
        case 'y':
          return 'egy' + (isFuture || withoutSuffix ? ' \xe9v' : ' \xe9ve');
        case 'yy':
          return num + (isFuture || withoutSuffix ? ' \xe9v' : ' \xe9ve');
        }
        return '';
      }
      function week(isFuture) {
        return (isFuture ? '' : 'm\xfalt ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
      }
      moment.lang('hu', {
        months: 'janu\xe1r_febru\xe1r_m\xe1rcius_\xe1prilis_m\xe1jus_j\xfanius_j\xfalius_augusztus_szeptember_okt\xf3ber_november_december'.split('_'),
        monthsShort: 'jan_feb_m\xe1rc_\xe1pr_m\xe1j_j\xfan_j\xfal_aug_szept_okt_nov_dec'.split('_'),
        weekdays: 'vas\xe1rnap_h\xe9tf\u0151_kedd_szerda_cs\xfct\xf6rt\xf6k_p\xe9ntek_szombat'.split('_'),
        weekdaysShort: 'v_h_k_sze_cs_p_szo'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'YYYY.MM.DD.',
          LL: 'YYYY. MMMM D.',
          LLL: 'YYYY. MMMM D., LT',
          LLLL: 'YYYY. MMMM D., dddd LT'
        },
        calendar: {
          sameDay: '[ma] LT[-kor]',
          nextDay: '[holnap] LT[-kor]',
          nextWeek: function () {
            return week.call(this, true);
          },
          lastDay: '[tegnap] LT[-kor]',
          lastWeek: function () {
            return week.call(this, false);
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s m\xfalva',
          past: '%s',
          s: translate,
          m: translate,
          mm: translate,
          h: translate,
          hh: translate,
          d: translate,
          dd: translate,
          M: translate,
          MM: translate,
          y: translate,
          yy: translate
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('id', {
        months: 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
        monthsShort: 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
        weekdays: 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
        weekdaysShort: 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
        weekdaysMin: 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat: {
          LT: 'HH.mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY [pukul] LT',
          LLLL: 'dddd, D MMMM YYYY [pukul] LT'
        },
        meridiem: function (hours, minutes, isLower) {
          if (hours < 11) {
            return 'pagi';
          } else if (hours < 15) {
            return 'siang';
          } else if (hours < 19) {
            return 'sore';
          } else {
            return 'malam';
          }
        },
        calendar: {
          sameDay: '[Hari ini pukul] LT',
          nextDay: '[Besok pukul] LT',
          nextWeek: 'dddd [pukul] LT',
          lastDay: '[Kemarin pukul] LT',
          lastWeek: 'dddd [lalu pukul] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'dalam %s',
          past: '%s yang lalu',
          s: 'beberapa detik',
          m: 'semenit',
          mm: '%d menit',
          h: 'sejam',
          hh: '%d jam',
          d: 'sehari',
          dd: '%d hari',
          M: 'sebulan',
          MM: '%d bulan',
          y: 'setahun',
          yy: '%d tahun'
        },
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      function plural(n) {
        if (n % 100 === 11) {
          return true;
        } else if (n % 10 === 1) {
          return false;
        }
        return true;
      }
      function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
          return withoutSuffix || isFuture ? 'nokkrar sek\xfandur' : 'nokkrum sek\xfandum';
        case 'm':
          return withoutSuffix ? 'm\xedn\xfata' : 'm\xedn\xfatu';
        case 'mm':
          if (plural(number)) {
            return result + (withoutSuffix || isFuture ? 'm\xedn\xfatur' : 'm\xedn\xfatum');
          } else if (withoutSuffix) {
            return result + 'm\xedn\xfata';
          }
          return result + 'm\xedn\xfatu';
        case 'hh':
          if (plural(number)) {
            return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
          }
          return result + 'klukkustund';
        case 'd':
          if (withoutSuffix) {
            return 'dagur';
          }
          return isFuture ? 'dag' : 'degi';
        case 'dd':
          if (plural(number)) {
            if (withoutSuffix) {
              return result + 'dagar';
            }
            return result + (isFuture ? 'daga' : 'd\xf6gum');
          } else if (withoutSuffix) {
            return result + 'dagur';
          }
          return result + (isFuture ? 'dag' : 'degi');
        case 'M':
          if (withoutSuffix) {
            return 'm\xe1nu\xf0ur';
          }
          return isFuture ? 'm\xe1nu\xf0' : 'm\xe1nu\xf0i';
        case 'MM':
          if (plural(number)) {
            if (withoutSuffix) {
              return result + 'm\xe1nu\xf0ir';
            }
            return result + (isFuture ? 'm\xe1nu\xf0i' : 'm\xe1nu\xf0um');
          } else if (withoutSuffix) {
            return result + 'm\xe1nu\xf0ur';
          }
          return result + (isFuture ? 'm\xe1nu\xf0' : 'm\xe1nu\xf0i');
        case 'y':
          return withoutSuffix || isFuture ? '\xe1r' : '\xe1ri';
        case 'yy':
          if (plural(number)) {
            return result + (withoutSuffix || isFuture ? '\xe1r' : '\xe1rum');
          }
          return result + (withoutSuffix || isFuture ? '\xe1r' : '\xe1ri');
        }
      }
      moment.lang('is', {
        months: 'jan\xfaar_febr\xfaar_mars_apr\xedl_ma\xed_j\xfan\xed_j\xfal\xed_\xe1g\xfast_september_okt\xf3ber_n\xf3vember_desember'.split('_'),
        monthsShort: 'jan_feb_mar_apr_ma\xed_j\xfan_j\xfal_\xe1g\xfa_sep_okt_n\xf3v_des'.split('_'),
        weekdays: 'sunnudagur_m\xe1nudagur_\xferi\xf0judagur_mi\xf0vikudagur_fimmtudagur_f\xf6studagur_laugardagur'.split('_'),
        weekdaysShort: 'sun_m\xe1n_\xferi_mi\xf0_fim_f\xf6s_lau'.split('_'),
        weekdaysMin: 'Su_M\xe1_\xder_Mi_Fi_F\xf6_La'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'DD/MM/YYYY',
          LL: 'D. MMMM YYYY',
          LLL: 'D. MMMM YYYY [kl.] LT',
          LLLL: 'dddd, D. MMMM YYYY [kl.] LT'
        },
        calendar: {
          sameDay: '[\xed dag kl.] LT',
          nextDay: '[\xe1 morgun kl.] LT',
          nextWeek: 'dddd [kl.] LT',
          lastDay: '[\xed g\xe6r kl.] LT',
          lastWeek: '[s\xed\xf0asta] dddd [kl.] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'eftir %s',
          past: 'fyrir %s s\xed\xf0an',
          s: translate,
          m: translate,
          mm: translate,
          h: 'klukkustund',
          hh: translate,
          d: translate,
          dd: translate,
          M: translate,
          MM: translate,
          y: translate,
          yy: translate
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('it', {
        months: 'Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre'.split('_'),
        monthsShort: 'Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic'.split('_'),
        weekdays: 'Domenica_Luned\xec_Marted\xec_Mercoled\xec_Gioved\xec_Venerd\xec_Sabato'.split('_'),
        weekdaysShort: 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
        weekdaysMin: 'D_L_Ma_Me_G_V_S'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[Oggi alle] LT',
          nextDay: '[Domani alle] LT',
          nextWeek: 'dddd [alle] LT',
          lastDay: '[Ieri alle] LT',
          lastWeek: '[lo scorso] dddd [alle] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'in %s',
          past: '%s fa',
          s: 'secondi',
          m: 'un minuto',
          mm: '%d minuti',
          h: 'un\'ora',
          hh: '%d ore',
          d: 'un giorno',
          dd: '%d giorni',
          M: 'un mese',
          MM: '%d mesi',
          y: 'un anno',
          yy: '%d anni'
        },
        ordinal: '%d\xba',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('ja', {
        months: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        weekdays: '\u65e5\u66dc\u65e5_\u6708\u66dc\u65e5_\u706b\u66dc\u65e5_\u6c34\u66dc\u65e5_\u6728\u66dc\u65e5_\u91d1\u66dc\u65e5_\u571f\u66dc\u65e5'.split('_'),
        weekdaysShort: '\u65e5_\u6708_\u706b_\u6c34_\u6728_\u91d1_\u571f'.split('_'),
        weekdaysMin: '\u65e5_\u6708_\u706b_\u6c34_\u6728_\u91d1_\u571f'.split('_'),
        longDateFormat: {
          LT: 'Ah\u6642m\u5206',
          L: 'YYYY/MM/DD',
          LL: 'YYYY\u5e74M\u6708D\u65e5',
          LLL: 'YYYY\u5e74M\u6708D\u65e5LT',
          LLLL: 'YYYY\u5e74M\u6708D\u65e5LT dddd'
        },
        meridiem: function (hour, minute, isLower) {
          if (hour < 12) {
            return '\u5348\u524d';
          } else {
            return '\u5348\u5f8c';
          }
        },
        calendar: {
          sameDay: '[\u4eca\u65e5] LT',
          nextDay: '[\u660e\u65e5] LT',
          nextWeek: '[\u6765\u9031]dddd LT',
          lastDay: '[\u6628\u65e5] LT',
          lastWeek: '[\u524d\u9031]dddd LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s\u5f8c',
          past: '%s\u524d',
          s: '\u6570\u79d2',
          m: '1\u5206',
          mm: '%d\u5206',
          h: '1\u6642\u9593',
          hh: '%d\u6642\u9593',
          d: '1\u65e5',
          dd: '%d\u65e5',
          M: '1\u30f6\u6708',
          MM: '%d\u30f6\u6708',
          y: '1\u5e74',
          yy: '%d\u5e74'
        }
      });
    }());
    (function () {
      function monthsCaseReplace(m, format) {
        var months = {
            'nominative': '\u10d8\u10d0\u10dc\u10d5\u10d0\u10e0\u10d8_\u10d7\u10d4\u10d1\u10d4\u10e0\u10d5\u10d0\u10da\u10d8_\u10db\u10d0\u10e0\u10e2\u10d8_\u10d0\u10de\u10e0\u10d8\u10da\u10d8_\u10db\u10d0\u10d8\u10e1\u10d8_\u10d8\u10d5\u10dc\u10d8\u10e1\u10d8_\u10d8\u10d5\u10da\u10d8\u10e1\u10d8_\u10d0\u10d2\u10d5\u10d8\u10e1\u10e2\u10dd_\u10e1\u10d4\u10e5\u10e2\u10d4\u10db\u10d1\u10d4\u10e0\u10d8_\u10dd\u10e5\u10e2\u10dd\u10db\u10d1\u10d4\u10e0\u10d8_\u10dc\u10dd\u10d4\u10db\u10d1\u10d4\u10e0\u10d8_\u10d3\u10d4\u10d9\u10d4\u10db\u10d1\u10d4\u10e0\u10d8'.split('_'),
            'accusative': '\u10d8\u10d0\u10dc\u10d5\u10d0\u10e0\u10e1_\u10d7\u10d4\u10d1\u10d4\u10e0\u10d5\u10d0\u10da\u10e1_\u10db\u10d0\u10e0\u10e2\u10e1_\u10d0\u10de\u10e0\u10d8\u10da\u10d8\u10e1_\u10db\u10d0\u10d8\u10e1\u10e1_\u10d8\u10d5\u10dc\u10d8\u10e1\u10e1_\u10d8\u10d5\u10da\u10d8\u10e1\u10e1_\u10d0\u10d2\u10d5\u10d8\u10e1\u10e2\u10e1_\u10e1\u10d4\u10e5\u10e2\u10d4\u10db\u10d1\u10d4\u10e0\u10e1_\u10dd\u10e5\u10e2\u10dd\u10db\u10d1\u10d4\u10e0\u10e1_\u10dc\u10dd\u10d4\u10db\u10d1\u10d4\u10e0\u10e1_\u10d3\u10d4\u10d9\u10d4\u10db\u10d1\u10d4\u10e0\u10e1'.split('_')
          }, nounCase = /D[oD] *MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
      }
      function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': '\u10d9\u10d5\u10d8\u10e0\u10d0_\u10dd\u10e0\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10e1\u10d0\u10db\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10dd\u10d7\u10ee\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10ee\u10e3\u10d7\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8_\u10de\u10d0\u10e0\u10d0\u10e1\u10d9\u10d4\u10d5\u10d8_\u10e8\u10d0\u10d1\u10d0\u10d7\u10d8'.split('_'),
            'accusative': '\u10d9\u10d5\u10d8\u10e0\u10d0\u10e1_\u10dd\u10e0\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10e1\u10d0\u10db\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10dd\u10d7\u10ee\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10ee\u10e3\u10d7\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1_\u10de\u10d0\u10e0\u10d0\u10e1\u10d9\u10d4\u10d5\u10e1_\u10e8\u10d0\u10d1\u10d0\u10d7\u10e1'.split('_')
          }, nounCase = /(წინა|შემდეგ)/.test(format) ? 'accusative' : 'nominative';
        return weekdays[nounCase][m.day()];
      }
      moment.lang('ka', {
        months: monthsCaseReplace,
        monthsShort: '\u10d8\u10d0\u10dc_\u10d7\u10d4\u10d1_\u10db\u10d0\u10e0_\u10d0\u10de\u10e0_\u10db\u10d0\u10d8_\u10d8\u10d5\u10dc_\u10d8\u10d5\u10da_\u10d0\u10d2\u10d5_\u10e1\u10d4\u10e5_\u10dd\u10e5\u10e2_\u10dc\u10dd\u10d4_\u10d3\u10d4\u10d9'.split('_'),
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u10d9\u10d5\u10d8_\u10dd\u10e0\u10e8_\u10e1\u10d0\u10db_\u10dd\u10d7\u10ee_\u10ee\u10e3\u10d7_\u10de\u10d0\u10e0_\u10e8\u10d0\u10d1'.split('_'),
        weekdaysMin: '\u10d9\u10d5_\u10dd\u10e0_\u10e1\u10d0_\u10dd\u10d7_\u10ee\u10e3_\u10de\u10d0_\u10e8\u10d0'.split('_'),
        longDateFormat: {
          LT: 'h:mm A',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[\u10d3\u10e6\u10d4\u10e1] LT[-\u10d6\u10d4]',
          nextDay: '[\u10ee\u10d5\u10d0\u10da] LT[-\u10d6\u10d4]',
          lastDay: '[\u10d2\u10e3\u10e8\u10d8\u10dc] LT[-\u10d6\u10d4]',
          nextWeek: '[\u10e8\u10d4\u10db\u10d3\u10d4\u10d2] dddd LT[-\u10d6\u10d4]',
          lastWeek: '[\u10ec\u10d8\u10dc\u10d0] dddd LT-\u10d6\u10d4',
          sameElse: 'L'
        },
        relativeTime: {
          future: function (s) {
            return /(წამი|წუთი|საათი|წელი)/.test(s) ? s.replace(/ი$/, '\u10e8\u10d8') : s + '\u10e8\u10d8';
          },
          past: function (s) {
            if (/(წამი|წუთი|საათი|დღე|თვე)/.test(s)) {
              return s.replace(/(ი|ე)$/, '\u10d8\u10e1 \u10ec\u10d8\u10dc');
            }
            if (/წელი/.test(s)) {
              return s.replace(/წელი$/, '\u10ec\u10da\u10d8\u10e1 \u10ec\u10d8\u10dc');
            }
          },
          s: '\u10e0\u10d0\u10db\u10d3\u10d4\u10dc\u10d8\u10db\u10d4 \u10ec\u10d0\u10db\u10d8',
          m: '\u10ec\u10e3\u10d7\u10d8',
          mm: '%d \u10ec\u10e3\u10d7\u10d8',
          h: '\u10e1\u10d0\u10d0\u10d7\u10d8',
          hh: '%d \u10e1\u10d0\u10d0\u10d7\u10d8',
          d: '\u10d3\u10e6\u10d4',
          dd: '%d \u10d3\u10e6\u10d4',
          M: '\u10d7\u10d5\u10d4',
          MM: '%d \u10d7\u10d5\u10d4',
          y: '\u10ec\u10d4\u10da\u10d8',
          yy: '%d \u10ec\u10d4\u10da\u10d8'
        },
        ordinal: function (number) {
          if (number === 0) {
            return number;
          }
          if (number === 1) {
            return number + '-\u10da\u10d8';
          }
          if (number < 20 || number <= 100 && number % 20 === 0 || number % 100 === 0) {
            return '\u10db\u10d4-' + number;
          }
          return number + '-\u10d4';
        },
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('ko', {
        months: '1\uc6d4_2\uc6d4_3\uc6d4_4\uc6d4_5\uc6d4_6\uc6d4_7\uc6d4_8\uc6d4_9\uc6d4_10\uc6d4_11\uc6d4_12\uc6d4'.split('_'),
        monthsShort: '1\uc6d4_2\uc6d4_3\uc6d4_4\uc6d4_5\uc6d4_6\uc6d4_7\uc6d4_8\uc6d4_9\uc6d4_10\uc6d4_11\uc6d4_12\uc6d4'.split('_'),
        weekdays: '\uc77c\uc694\uc77c_\uc6d4\uc694\uc77c_\ud654\uc694\uc77c_\uc218\uc694\uc77c_\ubaa9\uc694\uc77c_\uae08\uc694\uc77c_\ud1a0\uc694\uc77c'.split('_'),
        weekdaysShort: '\uc77c_\uc6d4_\ud654_\uc218_\ubaa9_\uae08_\ud1a0'.split('_'),
        weekdaysMin: '\uc77c_\uc6d4_\ud654_\uc218_\ubaa9_\uae08_\ud1a0'.split('_'),
        longDateFormat: {
          LT: 'A h\uc2dc mm\ubd84',
          L: 'YYYY.MM.DD',
          LL: 'YYYY\ub144 MMMM D\uc77c',
          LLL: 'YYYY\ub144 MMMM D\uc77c LT',
          LLLL: 'YYYY\ub144 MMMM D\uc77c dddd LT'
        },
        meridiem: function (hour, minute, isUpper) {
          return hour < 12 ? '\uc624\uc804' : '\uc624\ud6c4';
        },
        calendar: {
          sameDay: '\uc624\ub298 LT',
          nextDay: '\ub0b4\uc77c LT',
          nextWeek: 'dddd LT',
          lastDay: '\uc5b4\uc81c LT',
          lastWeek: '\uc9c0\ub09c\uc8fc dddd LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s \ud6c4',
          past: '%s \uc804',
          s: '\uba87\ucd08',
          ss: '%d\ucd08',
          m: '\uc77c\ubd84',
          mm: '%d\ubd84',
          h: '\ud55c\uc2dc\uac04',
          hh: '%d\uc2dc\uac04',
          d: '\ud558\ub8e8',
          dd: '%d\uc77c',
          M: '\ud55c\ub2ec',
          MM: '%d\ub2ec',
          y: '\uc77c\ub144',
          yy: '%d\ub144'
        },
        ordinal: '%d\uc77c'
      });
    }());
    (function () {
      var units = {
          'mm': 'min\u016bti_min\u016btes_min\u016bte_min\u016btes',
          'hh': 'stundu_stundas_stunda_stundas',
          'dd': 'dienu_dienas_diena_dienas',
          'MM': 'm\u0113nesi_m\u0113ne\u0161us_m\u0113nesis_m\u0113ne\u0161i',
          'yy': 'gadu_gadus_gads_gadi'
        };
      function format(word, number, withoutSuffix) {
        var forms = word.split('_');
        if (withoutSuffix) {
          return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
        } else {
          return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
        }
      }
      function relativeTimeWithPlural(number, withoutSuffix, key) {
        return number + ' ' + format(units[key], number, withoutSuffix);
      }
      moment.lang('lv', {
        months: 'janv\u0101ris_febru\u0101ris_marts_apr\u012blis_maijs_j\u016bnijs_j\u016blijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
        monthsShort: 'jan_feb_mar_apr_mai_j\u016bn_j\u016bl_aug_sep_okt_nov_dec'.split('_'),
        weekdays: 'sv\u0113tdiena_pirmdiena_otrdiena_tre\u0161diena_ceturtdiena_piektdiena_sestdiena'.split('_'),
        weekdaysShort: 'Sv_P_O_T_C_Pk_S'.split('_'),
        weekdaysMin: 'Sv_P_O_T_C_Pk_S'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD.MM.YYYY',
          LL: 'YYYY. [gada] D. MMMM',
          LLL: 'YYYY. [gada] D. MMMM, LT',
          LLLL: 'YYYY. [gada] D. MMMM, dddd, LT'
        },
        calendar: {
          sameDay: '[\u0160odien pulksten] LT',
          nextDay: '[R\u012bt pulksten] LT',
          nextWeek: 'dddd [pulksten] LT',
          lastDay: '[Vakar pulksten] LT',
          lastWeek: '[Pag\u0101ju\u0161\u0101] dddd [pulksten] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s v\u0113l\u0101k',
          past: '%s agr\u0101k',
          s: 'da\u017eas sekundes',
          m: 'min\u016bti',
          mm: relativeTimeWithPlural,
          h: 'stundu',
          hh: relativeTimeWithPlural,
          d: 'dienu',
          dd: relativeTimeWithPlural,
          M: 'm\u0113nesi',
          MM: relativeTimeWithPlural,
          y: 'gadu',
          yy: relativeTimeWithPlural
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('ms-my', {
        months: 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
        monthsShort: 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
        weekdays: 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
        weekdaysShort: 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
        weekdaysMin: 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat: {
          LT: 'HH.mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY [pukul] LT',
          LLLL: 'dddd, D MMMM YYYY [pukul] LT'
        },
        meridiem: function (hours, minutes, isLower) {
          if (hours < 11) {
            return 'pagi';
          } else if (hours < 15) {
            return 'tengahari';
          } else if (hours < 19) {
            return 'petang';
          } else {
            return 'malam';
          }
        },
        calendar: {
          sameDay: '[Hari ini pukul] LT',
          nextDay: '[Esok pukul] LT',
          nextWeek: 'dddd [pukul] LT',
          lastDay: '[Kelmarin pukul] LT',
          lastWeek: 'dddd [lepas pukul] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'dalam %s',
          past: '%s yang lepas',
          s: 'beberapa saat',
          m: 'seminit',
          mm: '%d minit',
          h: 'sejam',
          hh: '%d jam',
          d: 'sehari',
          dd: '%d hari',
          M: 'sebulan',
          MM: '%d bulan',
          y: 'setahun',
          yy: '%d tahun'
        },
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('nb', {
        months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays: 's\xf8ndag_mandag_tirsdag_onsdag_torsdag_fredag_l\xf8rdag'.split('_'),
        weekdaysShort: 's\xf8n_man_tir_ons_tor_fre_l\xf8r'.split('_'),
        weekdaysMin: 's\xf8_ma_ti_on_to_fr_l\xf8'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'YYYY-MM-DD',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[I dag klokken] LT',
          nextDay: '[I morgen klokken] LT',
          nextWeek: 'dddd [klokken] LT',
          lastDay: '[I g\xe5r klokken] LT',
          lastWeek: '[Forrige] dddd [klokken] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'om %s',
          past: 'for %s siden',
          s: 'noen sekunder',
          m: 'ett minutt',
          mm: '%d minutter',
          h: 'en time',
          hh: '%d timer',
          d: 'en dag',
          dd: '%d dager',
          M: 'en m\xe5ned',
          MM: '%d m\xe5neder',
          y: 'ett \xe5r',
          yy: '%d \xe5r'
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      var symbolMap = {
          '1': '\u0967',
          '2': '\u0968',
          '3': '\u0969',
          '4': '\u096a',
          '5': '\u096b',
          '6': '\u096c',
          '7': '\u096d',
          '8': '\u096e',
          '9': '\u096f',
          '0': '\u0966'
        }, numberMap = {
          '\u0967': '1',
          '\u0968': '2',
          '\u0969': '3',
          '\u096a': '4',
          '\u096b': '5',
          '\u096c': '6',
          '\u096d': '7',
          '\u096e': '8',
          '\u096f': '9',
          '\u0966': '0'
        };
      moment.lang('ne', {
        months: '\u091c\u0928\u0935\u0930\u0940_\u092b\u0947\u092c\u094d\u0930\u0941\u0935\u0930\u0940_\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u093f\u0932_\u092e\u0908_\u091c\u0941\u0928_\u091c\u0941\u0932\u093e\u0908_\u0905\u0917\u0937\u094d\u091f_\u0938\u0947\u092a\u094d\u091f\u0947\u092e\u094d\u092c\u0930_\u0905\u0915\u094d\u091f\u094b\u092c\u0930_\u0928\u094b\u092d\u0947\u092e\u094d\u092c\u0930_\u0921\u093f\u0938\u0947\u092e\u094d\u092c\u0930'.split('_'),
        monthsShort: '\u091c\u0928._\u092b\u0947\u092c\u094d\u0930\u0941._\u092e\u093e\u0930\u094d\u091a_\u0905\u092a\u094d\u0930\u093f._\u092e\u0908_\u091c\u0941\u0928_\u091c\u0941\u0932\u093e\u0908._\u0905\u0917._\u0938\u0947\u092a\u094d\u091f._\u0905\u0915\u094d\u091f\u094b._\u0928\u094b\u092d\u0947._\u0921\u093f\u0938\u0947.'.split('_'),
        weekdays: '\u0906\u0907\u0924\u092c\u093e\u0930_\u0938\u094b\u092e\u092c\u093e\u0930_\u092e\u0919\u094d\u0917\u0932\u092c\u093e\u0930_\u092c\u0941\u0927\u092c\u093e\u0930_\u092c\u093f\u0939\u093f\u092c\u093e\u0930_\u0936\u0941\u0915\u094d\u0930\u092c\u093e\u0930_\u0936\u0928\u093f\u092c\u093e\u0930'.split('_'),
        weekdaysShort: '\u0906\u0907\u0924._\u0938\u094b\u092e._\u092e\u0919\u094d\u0917\u0932._\u092c\u0941\u0927._\u092c\u093f\u0939\u093f._\u0936\u0941\u0915\u094d\u0930._\u0936\u0928\u093f.'.split('_'),
        weekdaysMin: '\u0906\u0907._\u0938\u094b._\u092e\u0919\u094d_\u092c\u0941._\u092c\u093f._\u0936\u0941._\u0936.'.split('_'),
        longDateFormat: {
          LT: 'A\u0915\u094b h:mm \u092c\u091c\u0947',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY, LT',
          LLLL: 'dddd, D MMMM YYYY, LT'
        },
        preparse: function (string) {
          return string.replace(/[१२३४५६७८९०]/g, function (match) {
            return numberMap[match];
          });
        },
        postformat: function (string) {
          return string.replace(/\d/g, function (match) {
            return symbolMap[match];
          });
        },
        meridiem: function (hour, minute, isLower) {
          if (hour < 3) {
            return '\u0930\u093e\u0924\u0940';
          } else if (hour < 10) {
            return '\u092c\u093f\u0939\u093e\u0928';
          } else if (hour < 15) {
            return '\u0926\u093f\u0909\u0901\u0938\u094b';
          } else if (hour < 18) {
            return '\u092c\u0947\u0932\u0941\u0915\u093e';
          } else if (hour < 20) {
            return '\u0938\u093e\u0901\u091d';
          } else {
            return '\u0930\u093e\u0924\u0940';
          }
        },
        calendar: {
          sameDay: '[\u0906\u091c] LT',
          nextDay: '[\u092d\u094b\u0932\u0940] LT',
          nextWeek: '[\u0906\u0909\u0901\u0926\u094b] dddd[,] LT',
          lastDay: '[\u0939\u093f\u091c\u094b] LT',
          lastWeek: '[\u0917\u090f\u0915\u094b] dddd[,] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s\u092e\u093e',
          past: '%s \u0905\u0917\u093e\u0921\u0940',
          s: '\u0915\u0947\u0939\u0940 \u0938\u092e\u092f',
          m: '\u090f\u0915 \u092e\u093f\u0928\u0947\u091f',
          mm: '%d \u092e\u093f\u0928\u0947\u091f',
          h: '\u090f\u0915 \u0918\u0923\u094d\u091f\u093e',
          hh: '%d \u0918\u0923\u094d\u091f\u093e',
          d: '\u090f\u0915 \u0926\u093f\u0928',
          dd: '%d \u0926\u093f\u0928',
          M: '\u090f\u0915 \u092e\u0939\u093f\u0928\u093e',
          MM: '%d \u092e\u0939\u093f\u0928\u093e',
          y: '\u090f\u0915 \u092c\u0930\u094d\u0937',
          yy: '%d \u092c\u0930\u094d\u0937'
        },
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      var monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'), monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');
      moment.lang('nl', {
        months: 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
        monthsShort: function (m, format) {
          if (/-MMM-/.test(format)) {
            return monthsShortWithoutDots[m.month()];
          } else {
            return monthsShortWithDots[m.month()];
          }
        },
        weekdays: 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
        weekdaysShort: 'zo._ma._di._wo._do._vr._za.'.split('_'),
        weekdaysMin: 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD-MM-YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[Vandaag om] LT',
          nextDay: '[Morgen om] LT',
          nextWeek: 'dddd [om] LT',
          lastDay: '[Gisteren om] LT',
          lastWeek: '[afgelopen] dddd [om] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'over %s',
          past: '%s geleden',
          s: 'een paar seconden',
          m: '\xe9\xe9n minuut',
          mm: '%d minuten',
          h: '\xe9\xe9n uur',
          hh: '%d uur',
          d: '\xe9\xe9n dag',
          dd: '%d dagen',
          M: '\xe9\xe9n maand',
          MM: '%d maanden',
          y: '\xe9\xe9n jaar',
          yy: '%d jaar'
        },
        ordinal: function (number) {
          return number + (number === 1 || number === 8 || number >= 20 ? 'ste' : 'de');
        },
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('nn', {
        months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays: 'sundag_m\xe5ndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
        weekdaysShort: 'sun_m\xe5n_tys_ons_tor_fre_lau'.split('_'),
        weekdaysMin: 'su_m\xe5_ty_on_to_fr_l\xf8'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'YYYY-MM-DD',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[I dag klokka] LT',
          nextDay: '[I morgon klokka] LT',
          nextWeek: 'dddd [klokka] LT',
          lastDay: '[I g\xe5r klokka] LT',
          lastWeek: '[F\xf8reg\xe5ende] dddd [klokka] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'om %s',
          past: 'for %s siden',
          s: 'noen sekund',
          m: 'ett minutt',
          mm: '%d minutt',
          h: 'en time',
          hh: '%d timar',
          d: 'en dag',
          dd: '%d dagar',
          M: 'en m\xe5nad',
          MM: '%d m\xe5nader',
          y: 'ett \xe5r',
          yy: '%d \xe5r'
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      function plural(n) {
        return n % 10 < 5 && n % 10 > 1 && ~~(n / 10) !== 1;
      }
      function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
          return withoutSuffix ? 'minuta' : 'minut\u0119';
        case 'mm':
          return result + (plural(number) ? 'minuty' : 'minut');
        case 'h':
          return withoutSuffix ? 'godzina' : 'godzin\u0119';
        case 'hh':
          return result + (plural(number) ? 'godziny' : 'godzin');
        case 'MM':
          return result + (plural(number) ? 'miesi\u0105ce' : 'miesi\u0119cy');
        case 'yy':
          return result + (plural(number) ? 'lata' : 'lat');
        }
      }
      moment.lang('pl', {
        months: 'stycze\u0144_luty_marzec_kwiecie\u0144_maj_czerwiec_lipiec_sierpie\u0144_wrzesie\u0144_pa\u017adziernik_listopad_grudzie\u0144'.split('_'),
        monthsShort: 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_pa\u017a_lis_gru'.split('_'),
        weekdays: 'niedziela_poniedzia\u0142ek_wtorek_\u015broda_czwartek_pi\u0105tek_sobota'.split('_'),
        weekdaysShort: 'nie_pon_wt_\u015br_czw_pt_sb'.split('_'),
        weekdaysMin: 'N_Pn_Wt_\u015ar_Cz_Pt_So'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD-MM-YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[Dzi\u015b o] LT',
          nextDay: '[Jutro o] LT',
          nextWeek: '[W] dddd [o] LT',
          lastDay: '[Wczoraj o] LT',
          lastWeek: function () {
            switch (this.day()) {
            case 0:
              return '[W zesz\u0142\u0105 niedziel\u0119 o] LT';
            case 3:
              return '[W zesz\u0142\u0105 \u015brod\u0119 o] LT';
            case 6:
              return '[W zesz\u0142\u0105 sobot\u0119 o] LT';
            default:
              return '[W zesz\u0142y] dddd [o] LT';
            }
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: 'za %s',
          past: '%s temu',
          s: 'kilka sekund',
          m: translate,
          mm: translate,
          h: translate,
          hh: translate,
          d: '1 dzie\u0144',
          dd: '%d dni',
          M: 'miesi\u0105c',
          MM: translate,
          y: 'rok',
          yy: translate
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('pt-br', {
        months: 'Janeiro_Fevereiro_Mar\xe7o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
        monthsShort: 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
        weekdays: 'Domingo_Segunda-feira_Ter\xe7a-feira_Quarta-feira_Quinta-feira_Sexta-feira_S\xe1bado'.split('_'),
        weekdaysShort: 'Dom_Seg_Ter_Qua_Qui_Sex_S\xe1b'.split('_'),
        weekdaysMin: 'Dom_2\xaa_3\xaa_4\xaa_5\xaa_6\xaa_S\xe1b'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D [de] MMMM [de] YYYY',
          LLL: 'D [de] MMMM [de] YYYY LT',
          LLLL: 'dddd, D [de] MMMM [de] YYYY LT'
        },
        calendar: {
          sameDay: '[Hoje \xe0s] LT',
          nextDay: '[Amanh\xe3 \xe0s] LT',
          nextWeek: 'dddd [\xe0s] LT',
          lastDay: '[Ontem \xe0s] LT',
          lastWeek: function () {
            return this.day() === 0 || this.day() === 6 ? '[\xdaltimo] dddd [\xe0s] LT' : '[\xdaltima] dddd [\xe0s] LT';
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: 'em %s',
          past: '%s atr\xe1s',
          s: 'segundos',
          m: 'um minuto',
          mm: '%d minutos',
          h: 'uma hora',
          hh: '%d horas',
          d: 'um dia',
          dd: '%d dias',
          M: 'um m\xeas',
          MM: '%d meses',
          y: 'um ano',
          yy: '%d anos'
        },
        ordinal: '%d\xba'
      });
    }());
    (function () {
      moment.lang('pt', {
        months: 'Janeiro_Fevereiro_Mar\xe7o_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
        monthsShort: 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
        weekdays: 'Domingo_Segunda-feira_Ter\xe7a-feira_Quarta-feira_Quinta-feira_Sexta-feira_S\xe1bado'.split('_'),
        weekdaysShort: 'Dom_Seg_Ter_Qua_Qui_Sex_S\xe1b'.split('_'),
        weekdaysMin: 'Dom_2\xaa_3\xaa_4\xaa_5\xaa_6\xaa_S\xe1b'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D [de] MMMM [de] YYYY',
          LLL: 'D [de] MMMM [de] YYYY LT',
          LLLL: 'dddd, D [de] MMMM [de] YYYY LT'
        },
        calendar: {
          sameDay: '[Hoje \xe0s] LT',
          nextDay: '[Amanh\xe3 \xe0s] LT',
          nextWeek: 'dddd [\xe0s] LT',
          lastDay: '[Ontem \xe0s] LT',
          lastWeek: function () {
            return this.day() === 0 || this.day() === 6 ? '[\xdaltimo] dddd [\xe0s] LT' : '[\xdaltima] dddd [\xe0s] LT';
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: 'em %s',
          past: '%s atr\xe1s',
          s: 'segundos',
          m: 'um minuto',
          mm: '%d minutos',
          h: 'uma hora',
          hh: '%d horas',
          d: 'um dia',
          dd: '%d dias',
          M: 'um m\xeas',
          MM: '%d meses',
          y: 'um ano',
          yy: '%d anos'
        },
        ordinal: '%d\xba',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('ro', {
        months: 'Ianuarie_Februarie_Martie_Aprilie_Mai_Iunie_Iulie_August_Septembrie_Octombrie_Noiembrie_Decembrie'.split('_'),
        monthsShort: 'Ian_Feb_Mar_Apr_Mai_Iun_Iul_Aug_Sep_Oct_Noi_Dec'.split('_'),
        weekdays: 'Duminic\u0103_Luni_Mar\u0163i_Miercuri_Joi_Vineri_S\xe2mb\u0103t\u0103'.split('_'),
        weekdaysShort: 'Dum_Lun_Mar_Mie_Joi_Vin_S\xe2m'.split('_'),
        weekdaysMin: 'Du_Lu_Ma_Mi_Jo_Vi_S\xe2'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY H:mm',
          LLLL: 'dddd, D MMMM YYYY H:mm'
        },
        calendar: {
          sameDay: '[azi la] LT',
          nextDay: '[m\xe2ine la] LT',
          nextWeek: 'dddd [la] LT',
          lastDay: '[ieri la] LT',
          lastWeek: '[fosta] dddd [la] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'peste %s',
          past: '%s \xeen urm\u0103',
          s: 'c\xe2teva secunde',
          m: 'un minut',
          mm: '%d minute',
          h: 'o or\u0103',
          hh: '%d ore',
          d: 'o zi',
          dd: '%d zile',
          M: 'o lun\u0103',
          MM: '%d luni',
          y: 'un an',
          yy: '%d ani'
        },
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
      }
      function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': '\u043c\u0438\u043d\u0443\u0442\u0430_\u043c\u0438\u043d\u0443\u0442\u044b_\u043c\u0438\u043d\u0443\u0442',
            'hh': '\u0447\u0430\u0441_\u0447\u0430\u0441\u0430_\u0447\u0430\u0441\u043e\u0432',
            'dd': '\u0434\u0435\u043d\u044c_\u0434\u043d\u044f_\u0434\u043d\u0435\u0439',
            'MM': '\u043c\u0435\u0441\u044f\u0446_\u043c\u0435\u0441\u044f\u0446\u0430_\u043c\u0435\u0441\u044f\u0446\u0435\u0432',
            'yy': '\u0433\u043e\u0434_\u0433\u043e\u0434\u0430_\u043b\u0435\u0442'
          };
        if (key === 'm') {
          return withoutSuffix ? '\u043c\u0438\u043d\u0443\u0442\u0430' : '\u043c\u0438\u043d\u0443\u0442\u0443';
        } else {
          return number + ' ' + plural(format[key], +number);
        }
      }
      function monthsCaseReplace(m, format) {
        var months = {
            'nominative': '\u044f\u043d\u0432\u0430\u0440\u044c_\u0444\u0435\u0432\u0440\u0430\u043b\u044c_\u043c\u0430\u0440\u0442_\u0430\u043f\u0440\u0435\u043b\u044c_\u043c\u0430\u0439_\u0438\u044e\u043d\u044c_\u0438\u044e\u043b\u044c_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c_\u043e\u043a\u0442\u044f\u0431\u0440\u044c_\u043d\u043e\u044f\u0431\u0440\u044c_\u0434\u0435\u043a\u0430\u0431\u0440\u044c'.split('_'),
            'accusative': '\u044f\u043d\u0432\u0430\u0440\u044f_\u0444\u0435\u0432\u0440\u0430\u043b\u044f_\u043c\u0430\u0440\u0442\u0430_\u0430\u043f\u0440\u0435\u043b\u044f_\u043c\u0430\u044f_\u0438\u044e\u043d\u044f_\u0438\u044e\u043b\u044f_\u0430\u0432\u0433\u0443\u0441\u0442\u0430_\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044f_\u043e\u043a\u0442\u044f\u0431\u0440\u044f_\u043d\u043e\u044f\u0431\u0440\u044f_\u0434\u0435\u043a\u0430\u0431\u0440\u044f'.split('_')
          }, nounCase = /D[oD]? *MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
      }
      function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': '\u0432\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043f\u044f\u0442\u043d\u0438\u0446\u0430_\u0441\u0443\u0431\u0431\u043e\u0442\u0430'.split('_'),
            'accusative': '\u0432\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435_\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a_\u0432\u0442\u043e\u0440\u043d\u0438\u043a_\u0441\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043f\u044f\u0442\u043d\u0438\u0446\u0443_\u0441\u0443\u0431\u0431\u043e\u0442\u0443'.split('_')
          }, nounCase = /\[ ?[Вв] ?(?:прошлую|следующую)? ?\] ?dddd/.test(format) ? 'accusative' : 'nominative';
        return weekdays[nounCase][m.day()];
      }
      moment.lang('ru', {
        months: monthsCaseReplace,
        monthsShort: '\u044f\u043d\u0432_\u0444\u0435\u0432_\u043c\u0430\u0440_\u0430\u043f\u0440_\u043c\u0430\u0439_\u0438\u044e\u043d_\u0438\u044e\u043b_\u0430\u0432\u0433_\u0441\u0435\u043d_\u043e\u043a\u0442_\u043d\u043e\u044f_\u0434\u0435\u043a'.split('_'),
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u0432\u0441\u043a_\u043f\u043d\u0434_\u0432\u0442\u0440_\u0441\u0440\u0434_\u0447\u0442\u0432_\u043f\u0442\u043d_\u0441\u0431\u0442'.split('_'),
        weekdaysMin: '\u0432\u0441_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD.MM.YYYY',
          LL: 'D MMMM YYYY \u0433.',
          LLL: 'D MMMM YYYY \u0433., LT',
          LLLL: 'dddd, D MMMM YYYY \u0433., LT'
        },
        calendar: {
          sameDay: '[\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u0432] LT',
          nextDay: '[\u0417\u0430\u0432\u0442\u0440\u0430 \u0432] LT',
          lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432] LT',
          nextWeek: function () {
            return this.day() === 2 ? '[\u0412\u043e] dddd [\u0432] LT' : '[\u0412] dddd [\u0432] LT';
          },
          lastWeek: function () {
            switch (this.day()) {
            case 0:
              return '[\u0412 \u043f\u0440\u043e\u0448\u043b\u043e\u0435] dddd [\u0432] LT';
            case 1:
            case 2:
            case 4:
              return '[\u0412 \u043f\u0440\u043e\u0448\u043b\u044b\u0439] dddd [\u0432] LT';
            case 3:
            case 5:
            case 6:
              return '[\u0412 \u043f\u0440\u043e\u0448\u043b\u0443\u044e] dddd [\u0432] LT';
            }
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: '\u0447\u0435\u0440\u0435\u0437 %s',
          past: '%s \u043d\u0430\u0437\u0430\u0434',
          s: '\u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0441\u0435\u043a\u0443\u043d\u0434',
          m: relativeTimeWithPlural,
          mm: relativeTimeWithPlural,
          h: '\u0447\u0430\u0441',
          hh: relativeTimeWithPlural,
          d: '\u0434\u0435\u043d\u044c',
          dd: relativeTimeWithPlural,
          M: '\u043c\u0435\u0441\u044f\u0446',
          MM: relativeTimeWithPlural,
          y: '\u0433\u043e\u0434',
          yy: relativeTimeWithPlural
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      var months = 'janu\xe1r_febru\xe1r_marec_apr\xedl_m\xe1j_j\xfan_j\xfal_august_september_okt\xf3ber_november_december'.split('_'), monthsShort = 'jan_feb_mar_apr_m\xe1j_j\xfan_j\xfal_aug_sep_okt_nov_dec'.split('_');
      function plural(n) {
        return n > 1 && n < 5;
      }
      function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
          return withoutSuffix || isFuture ? 'p\xe1r sek\xfand' : 'p\xe1r sekundami';
        case 'm':
          return withoutSuffix ? 'min\xfata' : isFuture ? 'min\xfatu' : 'min\xfatou';
        case 'mm':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'min\xfaty' : 'min\xfat');
          } else {
            return result + 'min\xfatami';
          }
          break;
        case 'h':
          return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
        case 'hh':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'hodiny' : 'hod\xedn');
          } else {
            return result + 'hodinami';
          }
          break;
        case 'd':
          return withoutSuffix || isFuture ? 'de\u0148' : 'd\u0148om';
        case 'dd':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'dni' : 'dn\xed');
          } else {
            return result + 'd\u0148ami';
          }
          break;
        case 'M':
          return withoutSuffix || isFuture ? 'mesiac' : 'mesiacom';
        case 'MM':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'mesiace' : 'mesiacov');
          } else {
            return result + 'mesiacmi';
          }
          break;
        case 'y':
          return withoutSuffix || isFuture ? 'rok' : 'rokom';
        case 'yy':
          if (withoutSuffix || isFuture) {
            return result + (plural(number) ? 'roky' : 'rokov');
          } else {
            return result + 'rokmi';
          }
          break;
        }
      }
      moment.lang('sk', {
        months: months,
        monthsShort: monthsShort,
        monthsParse: function (months, monthsShort) {
          var i, _monthsParse = [];
          for (i = 0; i < 12; i++) {
            _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
          }
          return _monthsParse;
        }(months, monthsShort),
        weekdays: 'nede\u013ea_pondelok_utorok_streda_\u0161tvrtok_piatok_sobota'.split('_'),
        weekdaysShort: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
        weekdaysMin: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'DD.MM.YYYY',
          LL: 'D. MMMM YYYY',
          LLL: 'D. MMMM YYYY LT',
          LLLL: 'dddd D. MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[dnes o] LT',
          nextDay: '[zajtra o] LT',
          nextWeek: function () {
            switch (this.day()) {
            case 0:
              return '[v nede\u013eu o] LT';
            case 1:
            case 2:
              return '[v] dddd [o] LT';
            case 3:
              return '[v stredu o] LT';
            case 4:
              return '[vo \u0161tvrtok o] LT';
            case 5:
              return '[v piatok o] LT';
            case 6:
              return '[v sobotu o] LT';
            }
          },
          lastDay: '[v\u010dera o] LT',
          lastWeek: function () {
            switch (this.day()) {
            case 0:
              return '[minul\xfa nede\u013eu o] LT';
            case 1:
            case 2:
              return '[minul\xfd] dddd [o] LT';
            case 3:
              return '[minul\xfa stredu o] LT';
            case 4:
            case 5:
              return '[minul\xfd] dddd [o] LT';
            case 6:
              return '[minul\xfa sobotu o] LT';
            }
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: 'za %s',
          past: 'pred %s',
          s: translate,
          m: translate,
          mm: translate,
          h: translate,
          hh: translate,
          d: translate,
          dd: translate,
          M: translate,
          MM: translate,
          y: translate,
          yy: translate
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
          return withoutSuffix ? 'ena minuta' : 'eno minuto';
        case 'mm':
          if (number === 1) {
            result += 'minuta';
          } else if (number === 2) {
            result += 'minuti';
          } else if (number === 3 || number === 4) {
            result += 'minute';
          } else {
            result += 'minut';
          }
          return result;
        case 'h':
          return withoutSuffix ? 'ena ura' : 'eno uro';
        case 'hh':
          if (number === 1) {
            result += 'ura';
          } else if (number === 2) {
            result += 'uri';
          } else if (number === 3 || number === 4) {
            result += 'ure';
          } else {
            result += 'ur';
          }
          return result;
        case 'dd':
          if (number === 1) {
            result += 'dan';
          } else {
            result += 'dni';
          }
          return result;
        case 'MM':
          if (number === 1) {
            result += 'mesec';
          } else if (number === 2) {
            result += 'meseca';
          } else if (number === 3 || number === 4) {
            result += 'mesece';
          } else {
            result += 'mesecev';
          }
          return result;
        case 'yy':
          if (number === 1) {
            result += 'leto';
          } else if (number === 2) {
            result += 'leti';
          } else if (number === 3 || number === 4) {
            result += 'leta';
          } else {
            result += 'let';
          }
          return result;
        }
      }
      moment.lang('sl', {
        months: 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
        monthsShort: 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
        weekdays: 'nedelja_ponedeljek_torek_sreda_\u010detrtek_petek_sobota'.split('_'),
        weekdaysShort: 'ned._pon._tor._sre._\u010det._pet._sob.'.split('_'),
        weekdaysMin: 'ne_po_to_sr_\u010de_pe_so'.split('_'),
        longDateFormat: {
          LT: 'H:mm',
          L: 'DD. MM. YYYY',
          LL: 'D. MMMM YYYY',
          LLL: 'D. MMMM YYYY LT',
          LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[danes ob] LT',
          nextDay: '[jutri ob] LT',
          nextWeek: function () {
            switch (this.day()) {
            case 0:
              return '[v] [nedeljo] [ob] LT';
            case 3:
              return '[v] [sredo] [ob] LT';
            case 6:
              return '[v] [soboto] [ob] LT';
            case 1:
            case 2:
            case 4:
            case 5:
              return '[v] dddd [ob] LT';
            }
          },
          lastDay: '[v\u010deraj ob] LT',
          lastWeek: function () {
            switch (this.day()) {
            case 0:
            case 3:
            case 6:
              return '[prej\u0161nja] dddd [ob] LT';
            case 1:
            case 2:
            case 4:
            case 5:
              return '[prej\u0161nji] dddd [ob] LT';
            }
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: '\u010dez %s',
          past: '%s nazaj',
          s: 'nekaj sekund',
          m: translate,
          mm: translate,
          h: translate,
          hh: translate,
          d: 'en dan',
          dd: translate,
          M: 'en mesec',
          MM: translate,
          y: 'eno leto',
          yy: translate
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('sv', {
        months: 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays: 's\xf6ndag_m\xe5ndag_tisdag_onsdag_torsdag_fredag_l\xf6rdag'.split('_'),
        weekdaysShort: 's\xf6n_m\xe5n_tis_ons_tor_fre_l\xf6r'.split('_'),
        weekdaysMin: 's\xf6_m\xe5_ti_on_to_fr_l\xf6'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'YYYY-MM-DD',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[Idag klockan] LT',
          nextDay: '[Imorgon klockan] LT',
          lastDay: '[Ig\xe5r klockan] LT',
          nextWeek: 'dddd [klockan] LT',
          lastWeek: '[F\xf6rra] dddd[en klockan] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'om %s',
          past: 'f\xf6r %s sedan',
          s: 'n\xe5gra sekunder',
          m: 'en minut',
          mm: '%d minuter',
          h: 'en timme',
          hh: '%d timmar',
          d: 'en dag',
          dd: '%d dagar',
          M: 'en m\xe5nad',
          MM: '%d m\xe5nader',
          y: 'ett \xe5r',
          yy: '%d \xe5r'
        },
        ordinal: function (number) {
          var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'e' : b === 1 ? 'a' : b === 2 ? 'a' : b === 3 ? 'e' : 'e';
          return number + output;
        },
        week: {
          dow: 1,
          doy: 4
        }
      });
    }());
    (function () {
      moment.lang('th', {
        months: '\u0e21\u0e01\u0e23\u0e32\u0e04\u0e21_\u0e01\u0e38\u0e21\u0e20\u0e32\u0e1e\u0e31\u0e19\u0e18\u0e4c_\u0e21\u0e35\u0e19\u0e32\u0e04\u0e21_\u0e40\u0e21\u0e29\u0e32\u0e22\u0e19_\u0e1e\u0e24\u0e29\u0e20\u0e32\u0e04\u0e21_\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32\u0e22\u0e19_\u0e01\u0e23\u0e01\u0e0e\u0e32\u0e04\u0e21_\u0e2a\u0e34\u0e07\u0e2b\u0e32\u0e04\u0e21_\u0e01\u0e31\u0e19\u0e22\u0e32\u0e22\u0e19_\u0e15\u0e38\u0e25\u0e32\u0e04\u0e21_\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32\u0e22\u0e19_\u0e18\u0e31\u0e19\u0e27\u0e32\u0e04\u0e21'.split('_'),
        monthsShort: '\u0e21\u0e01\u0e23\u0e32_\u0e01\u0e38\u0e21\u0e20\u0e32_\u0e21\u0e35\u0e19\u0e32_\u0e40\u0e21\u0e29\u0e32_\u0e1e\u0e24\u0e29\u0e20\u0e32_\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32_\u0e01\u0e23\u0e01\u0e0e\u0e32_\u0e2a\u0e34\u0e07\u0e2b\u0e32_\u0e01\u0e31\u0e19\u0e22\u0e32_\u0e15\u0e38\u0e25\u0e32_\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32_\u0e18\u0e31\u0e19\u0e27\u0e32'.split('_'),
        weekdays: '\u0e2d\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c_\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c_\u0e2d\u0e31\u0e07\u0e04\u0e32\u0e23_\u0e1e\u0e38\u0e18_\u0e1e\u0e24\u0e2b\u0e31\u0e2a\u0e1a\u0e14\u0e35_\u0e28\u0e38\u0e01\u0e23\u0e4c_\u0e40\u0e2a\u0e32\u0e23\u0e4c'.split('_'),
        weekdaysShort: '\u0e2d\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c_\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c_\u0e2d\u0e31\u0e07\u0e04\u0e32\u0e23_\u0e1e\u0e38\u0e18_\u0e1e\u0e24\u0e2b\u0e31\u0e2a_\u0e28\u0e38\u0e01\u0e23\u0e4c_\u0e40\u0e2a\u0e32\u0e23\u0e4c'.split('_'),
        weekdaysMin: '\u0e2d\u0e32._\u0e08._\u0e2d._\u0e1e._\u0e1e\u0e24._\u0e28._\u0e2a.'.split('_'),
        longDateFormat: {
          LT: 'H \u0e19\u0e32\u0e2c\u0e34\u0e01\u0e32 m \u0e19\u0e32\u0e17\u0e35',
          L: 'YYYY/MM/DD',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY \u0e40\u0e27\u0e25\u0e32 LT',
          LLLL: '\u0e27\u0e31\u0e19dddd\u0e17\u0e35\u0e48 D MMMM YYYY \u0e40\u0e27\u0e25\u0e32 LT'
        },
        meridiem: function (hour, minute, isLower) {
          if (hour < 12) {
            return '\u0e01\u0e48\u0e2d\u0e19\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07';
          } else {
            return '\u0e2b\u0e25\u0e31\u0e07\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07';
          }
        },
        calendar: {
          sameDay: '[\u0e27\u0e31\u0e19\u0e19\u0e35\u0e49 \u0e40\u0e27\u0e25\u0e32] LT',
          nextDay: '[\u0e1e\u0e23\u0e38\u0e48\u0e07\u0e19\u0e35\u0e49 \u0e40\u0e27\u0e25\u0e32] LT',
          nextWeek: 'dddd[\u0e2b\u0e19\u0e49\u0e32 \u0e40\u0e27\u0e25\u0e32] LT',
          lastDay: '[\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e27\u0e32\u0e19\u0e19\u0e35\u0e49 \u0e40\u0e27\u0e25\u0e32] LT',
          lastWeek: '[\u0e27\u0e31\u0e19]dddd[\u0e17\u0e35\u0e48\u0e41\u0e25\u0e49\u0e27 \u0e40\u0e27\u0e25\u0e32] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '\u0e2d\u0e35\u0e01 %s',
          past: '%s\u0e17\u0e35\u0e48\u0e41\u0e25\u0e49\u0e27',
          s: '\u0e44\u0e21\u0e48\u0e01\u0e35\u0e48\u0e27\u0e34\u0e19\u0e32\u0e17\u0e35',
          m: '1 \u0e19\u0e32\u0e17\u0e35',
          mm: '%d \u0e19\u0e32\u0e17\u0e35',
          h: '1 \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07',
          hh: '%d \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07',
          d: '1 \u0e27\u0e31\u0e19',
          dd: '%d \u0e27\u0e31\u0e19',
          M: '1 \u0e40\u0e14\u0e37\u0e2d\u0e19',
          MM: '%d \u0e40\u0e14\u0e37\u0e2d\u0e19',
          y: '1 \u0e1b\u0e35',
          yy: '%d \u0e1b\u0e35'
        }
      });
    }());
    (function () {
      var suffixes = {
          1: '\'inci',
          5: '\'inci',
          8: '\'inci',
          70: '\'inci',
          80: '\'inci',
          2: '\'nci',
          7: '\'nci',
          20: '\'nci',
          50: '\'nci',
          3: '\'\xfcnc\xfc',
          4: '\'\xfcnc\xfc',
          100: '\'\xfcnc\xfc',
          6: '\'nc\u0131',
          9: '\'uncu',
          10: '\'uncu',
          30: '\'uncu',
          60: '\'\u0131nc\u0131',
          90: '\'\u0131nc\u0131'
        };
      moment.lang('tr', {
        months: 'Ocak_\u015eubat_Mart_Nisan_May\u0131s_Haziran_Temmuz_A\u011fustos_Eyl\xfcl_Ekim_Kas\u0131m_Aral\u0131k'.split('_'),
        monthsShort: 'Oca_\u015eub_Mar_Nis_May_Haz_Tem_A\u011fu_Eyl_Eki_Kas_Ara'.split('_'),
        weekdays: 'Pazar_Pazartesi_Sal\u0131_\xc7ar\u015famba_Per\u015fembe_Cuma_Cumartesi'.split('_'),
        weekdaysShort: 'Paz_Pts_Sal_\xc7ar_Per_Cum_Cts'.split('_'),
        weekdaysMin: 'Pz_Pt_Sa_\xc7a_Pe_Cu_Ct'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD.MM.YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[bug\xfcn saat] LT',
          nextDay: '[yar\u0131n saat] LT',
          nextWeek: '[haftaya] dddd [saat] LT',
          lastDay: '[d\xfcn] LT',
          lastWeek: '[ge\xe7en hafta] dddd [saat] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '%s sonra',
          past: '%s \xf6nce',
          s: 'birka\xe7 saniye',
          m: 'bir dakika',
          mm: '%d dakika',
          h: 'bir saat',
          hh: '%d saat',
          d: 'bir g\xfcn',
          dd: '%d g\xfcn',
          M: 'bir ay',
          MM: '%d ay',
          y: 'bir y\u0131l',
          yy: '%d y\u0131l'
        },
        ordinal: function (number) {
          if (number === 0) {
            return number + '\'\u0131nc\u0131';
          }
          var a = number % 10, b = number % 100 - a, c = number >= 100 ? 100 : null;
          return number + (suffixes[a] || suffixes[b] || suffixes[c]);
        },
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('tzm-la', {
        months: 'innayr_br\u02e4ayr\u02e4_mar\u02e4s\u02e4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02e4wbr\u02e4_nwwanbir_dwjnbir'.split('_'),
        monthsShort: 'innayr_br\u02e4ayr\u02e4_mar\u02e4s\u02e4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02e4wbr\u02e4_nwwanbir_dwjnbir'.split('_'),
        weekdays: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1e0dyas'.split('_'),
        weekdaysShort: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1e0dyas'.split('_'),
        weekdaysMin: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1e0dyas'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[asdkh g] LT',
          nextDay: '[aska g] LT',
          nextWeek: 'dddd [g] LT',
          lastDay: '[assant g] LT',
          lastWeek: 'dddd [g] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: 'dadkh s yan %s',
          past: 'yan %s',
          s: 'imik',
          m: 'minu\u1e0d',
          mm: '%d minu\u1e0d',
          h: 'sa\u025ba',
          hh: '%d tassa\u025bin',
          d: 'ass',
          dd: '%d ossan',
          M: 'ayowr',
          MM: '%d iyyirn',
          y: 'asgas',
          yy: '%d isgasn'
        },
        week: {
          dow: 6,
          doy: 12
        }
      });
    }());
    (function () {
      moment.lang('tzm', {
        months: '\u2d49\u2d4f\u2d4f\u2d30\u2d62\u2d54_\u2d31\u2d55\u2d30\u2d62\u2d55_\u2d4e\u2d30\u2d55\u2d5a_\u2d49\u2d31\u2d54\u2d49\u2d54_\u2d4e\u2d30\u2d62\u2d62\u2d53_\u2d62\u2d53\u2d4f\u2d62\u2d53_\u2d62\u2d53\u2d4d\u2d62\u2d53\u2d63_\u2d56\u2d53\u2d5b\u2d5c_\u2d5b\u2d53\u2d5c\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d3d\u2d5f\u2d53\u2d31\u2d55_\u2d4f\u2d53\u2d61\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d37\u2d53\u2d4a\u2d4f\u2d31\u2d49\u2d54'.split('_'),
        monthsShort: '\u2d49\u2d4f\u2d4f\u2d30\u2d62\u2d54_\u2d31\u2d55\u2d30\u2d62\u2d55_\u2d4e\u2d30\u2d55\u2d5a_\u2d49\u2d31\u2d54\u2d49\u2d54_\u2d4e\u2d30\u2d62\u2d62\u2d53_\u2d62\u2d53\u2d4f\u2d62\u2d53_\u2d62\u2d53\u2d4d\u2d62\u2d53\u2d63_\u2d56\u2d53\u2d5b\u2d5c_\u2d5b\u2d53\u2d5c\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d3d\u2d5f\u2d53\u2d31\u2d55_\u2d4f\u2d53\u2d61\u2d30\u2d4f\u2d31\u2d49\u2d54_\u2d37\u2d53\u2d4a\u2d4f\u2d31\u2d49\u2d54'.split('_'),
        weekdays: '\u2d30\u2d59\u2d30\u2d4e\u2d30\u2d59_\u2d30\u2d62\u2d4f\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4f\u2d30\u2d59_\u2d30\u2d3d\u2d54\u2d30\u2d59_\u2d30\u2d3d\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4e\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d39\u2d62\u2d30\u2d59'.split('_'),
        weekdaysShort: '\u2d30\u2d59\u2d30\u2d4e\u2d30\u2d59_\u2d30\u2d62\u2d4f\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4f\u2d30\u2d59_\u2d30\u2d3d\u2d54\u2d30\u2d59_\u2d30\u2d3d\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4e\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d39\u2d62\u2d30\u2d59'.split('_'),
        weekdaysMin: '\u2d30\u2d59\u2d30\u2d4e\u2d30\u2d59_\u2d30\u2d62\u2d4f\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4f\u2d30\u2d59_\u2d30\u2d3d\u2d54\u2d30\u2d59_\u2d30\u2d3d\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d4e\u2d61\u2d30\u2d59_\u2d30\u2d59\u2d49\u2d39\u2d62\u2d30\u2d59'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD/MM/YYYY',
          LL: 'D MMMM YYYY',
          LLL: 'D MMMM YYYY LT',
          LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
          sameDay: '[\u2d30\u2d59\u2d37\u2d45 \u2d34] LT',
          nextDay: '[\u2d30\u2d59\u2d3d\u2d30 \u2d34] LT',
          nextWeek: 'dddd [\u2d34] LT',
          lastDay: '[\u2d30\u2d5a\u2d30\u2d4f\u2d5c \u2d34] LT',
          lastWeek: 'dddd [\u2d34] LT',
          sameElse: 'L'
        },
        relativeTime: {
          future: '\u2d37\u2d30\u2d37\u2d45 \u2d59 \u2d62\u2d30\u2d4f %s',
          past: '\u2d62\u2d30\u2d4f %s',
          s: '\u2d49\u2d4e\u2d49\u2d3d',
          m: '\u2d4e\u2d49\u2d4f\u2d53\u2d3a',
          mm: '%d \u2d4e\u2d49\u2d4f\u2d53\u2d3a',
          h: '\u2d59\u2d30\u2d44\u2d30',
          hh: '%d \u2d5c\u2d30\u2d59\u2d59\u2d30\u2d44\u2d49\u2d4f',
          d: '\u2d30\u2d59\u2d59',
          dd: '%d o\u2d59\u2d59\u2d30\u2d4f',
          M: '\u2d30\u2d62o\u2d53\u2d54',
          MM: '%d \u2d49\u2d62\u2d62\u2d49\u2d54\u2d4f',
          y: '\u2d30\u2d59\u2d33\u2d30\u2d59',
          yy: '%d \u2d49\u2d59\u2d33\u2d30\u2d59\u2d4f'
        },
        week: {
          dow: 6,
          doy: 12
        }
      });
    }());
    (function () {
      function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
      }
      function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': '\u0445\u0432\u0438\u043b\u0438\u043d\u0430_\u0445\u0432\u0438\u043b\u0438\u043d\u0438_\u0445\u0432\u0438\u043b\u0438\u043d',
            'hh': '\u0433\u043e\u0434\u0438\u043d\u0430_\u0433\u043e\u0434\u0438\u043d\u0438_\u0433\u043e\u0434\u0438\u043d',
            'dd': '\u0434\u0435\u043d\u044c_\u0434\u043d\u044f_\u0434\u043d\u0456\u0432',
            'MM': '\u043c\u0456\u0441\u044f\u0446\u044c_\u043c\u0456\u0441\u044f\u0446\u044f_\u043c\u0456\u0441\u044f\u0446\u0456\u0432',
            'yy': '\u0440\u0456\u043a_\u0440\u043e\u043a\u0438_\u0440\u043e\u043a\u0456\u0432'
          };
        if (key === 'm') {
          return withoutSuffix ? '\u0445\u0432\u0438\u043b\u0438\u043d\u0430' : '\u0445\u0432\u0438\u043b\u0438\u043d\u0443';
        } else {
          return number + ' ' + plural(format[key], +number);
        }
      }
      function monthsCaseReplace(m, format) {
        var months = {
            'nominative': '\u0441\u0456\u0447\u0435\u043d\u044c_\u043b\u044e\u0442\u0438\u0439_\u0431\u0435\u0440\u0435\u0437\u0435\u043d\u044c_\u043a\u0432\u0456\u0442\u0435\u043d\u044c_\u0442\u0440\u0430\u0432\u0435\u043d\u044c_\u0447\u0435\u0440\u0432\u0435\u043d\u044c_\u043b\u0438\u043f\u0435\u043d\u044c_\u0441\u0435\u0440\u043f\u0435\u043d\u044c_\u0432\u0435\u0440\u0435\u0441\u0435\u043d\u044c_\u0436\u043e\u0432\u0442\u0435\u043d\u044c_\u043b\u0438\u0441\u0442\u043e\u043f\u0430\u0434_\u0433\u0440\u0443\u0434\u0435\u043d\u044c'.split('_'),
            'accusative': '\u0441\u0456\u0447\u043d\u044f_\u043b\u044e\u0442\u043e\u0433\u043e_\u0431\u0435\u0440\u0435\u0437\u043d\u044f_\u043a\u0432\u0456\u0442\u043d\u044f_\u0442\u0440\u0430\u0432\u043d\u044f_\u0447\u0435\u0440\u0432\u043d\u044f_\u043b\u0438\u043f\u043d\u044f_\u0441\u0435\u0440\u043f\u043d\u044f_\u0432\u0435\u0440\u0435\u0441\u043d\u044f_\u0436\u043e\u0432\u0442\u043d\u044f_\u043b\u0438\u0441\u0442\u043e\u043f\u0430\u0434\u0430_\u0433\u0440\u0443\u0434\u043d\u044f'.split('_')
          }, nounCase = /D[oD]? *MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
      }
      function weekdaysCaseReplace(m, format) {
        var weekdays = {
            'nominative': '\u043d\u0435\u0434\u0456\u043b\u044f_\u043f\u043e\u043d\u0435\u0434\u0456\u043b\u043e\u043a_\u0432\u0456\u0432\u0442\u043e\u0440\u043e\u043a_\u0441\u0435\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440_\u043f\u2019\u044f\u0442\u043d\u0438\u0446\u044f_\u0441\u0443\u0431\u043e\u0442\u0430'.split('_'),
            'accusative': '\u043d\u0435\u0434\u0456\u043b\u044e_\u043f\u043e\u043d\u0435\u0434\u0456\u043b\u043e\u043a_\u0432\u0456\u0432\u0442\u043e\u0440\u043e\u043a_\u0441\u0435\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440_\u043f\u2019\u044f\u0442\u043d\u0438\u0446\u044e_\u0441\u0443\u0431\u043e\u0442\u0443'.split('_'),
            'genitive': '\u043d\u0435\u0434\u0456\u043b\u0456_\u043f\u043e\u043d\u0435\u0434\u0456\u043b\u043a\u0430_\u0432\u0456\u0432\u0442\u043e\u0440\u043a\u0430_\u0441\u0435\u0440\u0435\u0434\u0438_\u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430_\u043f\u2019\u044f\u0442\u043d\u0438\u0446\u0456_\u0441\u0443\u0431\u043e\u0442\u0438'.split('_')
          }, nounCase = /(\[[ВвУу]\]) ?dddd/.test(format) ? 'accusative' : /\[?(?:минулої|наступної)? ?\] ?dddd/.test(format) ? 'genitive' : 'nominative';
        return weekdays[nounCase][m.day()];
      }
      moment.lang('uk', {
        months: monthsCaseReplace,
        monthsShort: '\u0441\u0456\u0447_\u043b\u044e\u0442_\u0431\u0435\u0440_\u043a\u0432\u0456_\u0442\u0440\u0430_\u0447\u0435\u0440_\u043b\u0438\u043f_\u0441\u0435\u0440_\u0432\u0435\u0440_\u0436\u043e\u0432_\u043b\u0438\u0441_\u0433\u0440\u0443'.split('_'),
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u043d\u0435\u0434_\u043f\u043e\u043d_\u0432\u0456\u0432_\u0441\u0440\u0434_\u0447\u0435\u0442_\u043f\u0442\u043d_\u0441\u0443\u0431'.split('_'),
        weekdaysMin: '\u043d\u0434_\u043f\u043d_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043f\u0442_\u0441\u0431'.split('_'),
        longDateFormat: {
          LT: 'HH:mm',
          L: 'DD.MM.YYYY',
          LL: 'D MMMM YYYY \u0440.',
          LLL: 'D MMMM YYYY \u0440., LT',
          LLLL: 'dddd, D MMMM YYYY \u0440., LT'
        },
        calendar: {
          sameDay: '[\u0421\u044c\u043e\u0433\u043e\u0434\u043d\u0456 \u043e] LT',
          nextDay: '[\u0417\u0430\u0432\u0442\u0440\u0430 \u043e] LT',
          lastDay: '[\u0412\u0447\u043e\u0440\u0430 \u043e] LT',
          nextWeek: '[\u0423] dddd [\u043e] LT',
          lastWeek: function () {
            switch (this.day()) {
            case 0:
            case 3:
            case 5:
            case 6:
              return '[\u041c\u0438\u043d\u0443\u043b\u043e\u0457] dddd [\u043e] LT';
            case 1:
            case 2:
            case 4:
              return '[\u041c\u0438\u043d\u0443\u043b\u043e\u0433\u043e] dddd [\u043e] LT';
            }
          },
          sameElse: 'L'
        },
        relativeTime: {
          future: '\u0437\u0430 %s',
          past: '%s \u0442\u043e\u043c\u0443',
          s: '\u0434\u0435\u043a\u0456\u043b\u044c\u043a\u0430 \u0441\u0435\u043a\u0443\u043d\u0434',
          m: relativeTimeWithPlural,
          mm: relativeTimeWithPlural,
          h: '\u0433\u043e\u0434\u0438\u043d\u0443',
          hh: relativeTimeWithPlural,
          d: '\u0434\u0435\u043d\u044c',
          dd: relativeTimeWithPlural,
          M: '\u043c\u0456\u0441\u044f\u0446\u044c',
          MM: relativeTimeWithPlural,
          y: '\u0440\u0456\u043a',
          yy: relativeTimeWithPlural
        },
        ordinal: '%d.',
        week: {
          dow: 1,
          doy: 7
        }
      });
    }());
    (function () {
      moment.lang('zh-cn', {
        months: '\u4e00\u6708_\u4e8c\u6708_\u4e09\u6708_\u56db\u6708_\u4e94\u6708_\u516d\u6708_\u4e03\u6708_\u516b\u6708_\u4e5d\u6708_\u5341\u6708_\u5341\u4e00\u6708_\u5341\u4e8c\u6708'.split('_'),
        monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        weekdays: '\u661f\u671f\u65e5_\u661f\u671f\u4e00_\u661f\u671f\u4e8c_\u661f\u671f\u4e09_\u661f\u671f\u56db_\u661f\u671f\u4e94_\u661f\u671f\u516d'.split('_'),
        weekdaysShort: '\u5468\u65e5_\u5468\u4e00_\u5468\u4e8c_\u5468\u4e09_\u5468\u56db_\u5468\u4e94_\u5468\u516d'.split('_'),
        weekdaysMin: '\u65e5_\u4e00_\u4e8c_\u4e09_\u56db_\u4e94_\u516d'.split('_'),
        longDateFormat: {
          LT: 'Ah\u70b9mm',
          L: 'YYYY\u5e74MMMD\u65e5',
          LL: 'YYYY\u5e74MMMD\u65e5',
          LLL: 'YYYY\u5e74MMMD\u65e5LT',
          LLLL: 'YYYY\u5e74MMMD\u65e5ddddLT',
          l: 'YYYY\u5e74MMMD\u65e5',
          ll: 'YYYY\u5e74MMMD\u65e5',
          lll: 'YYYY\u5e74MMMD\u65e5LT',
          llll: 'YYYY\u5e74MMMD\u65e5ddddLT'
        },
        meridiem: function (hour, minute, isLower) {
          if (hour < 9) {
            return '\u65e9\u4e0a';
          } else if (hour < 11 && minute < 30) {
            return '\u4e0a\u5348';
          } else if (hour < 13 && minute < 30) {
            return '\u4e2d\u5348';
          } else if (hour < 18) {
            return '\u4e0b\u5348';
          } else {
            return '\u665a\u4e0a';
          }
        },
        calendar: {
          sameDay: '[\u4eca\u5929]LT',
          nextDay: '[\u660e\u5929]LT',
          nextWeek: '[\u4e0b]ddddLT',
          lastDay: '[\u6628\u5929]LT',
          lastWeek: '[\u4e0a]ddddLT',
          sameElse: 'L'
        },
        ordinal: function (number, period) {
          switch (period) {
          case 'd':
          case 'D':
          case 'DDD':
            return number + '\u65e5';
          case 'M':
            return number + '\u6708';
          case 'w':
          case 'W':
            return number + '\u5468';
          default:
            return number;
          }
        },
        relativeTime: {
          future: '%s\u5185',
          past: '%s\u524d',
          s: '\u51e0\u79d2',
          m: '1\u5206\u949f',
          mm: '%d\u5206\u949f',
          h: '1\u5c0f\u65f6',
          hh: '%d\u5c0f\u65f6',
          d: '1\u5929',
          dd: '%d\u5929',
          M: '1\u4e2a\u6708',
          MM: '%d\u4e2a\u6708',
          y: '1\u5e74',
          yy: '%d\u5e74'
        }
      });
    }());
    (function () {
      moment.lang('zh-tw', {
        months: '\u4e00\u6708_\u4e8c\u6708_\u4e09\u6708_\u56db\u6708_\u4e94\u6708_\u516d\u6708_\u4e03\u6708_\u516b\u6708_\u4e5d\u6708_\u5341\u6708_\u5341\u4e00\u6708_\u5341\u4e8c\u6708'.split('_'),
        monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        weekdays: '\u661f\u671f\u65e5_\u661f\u671f\u4e00_\u661f\u671f\u4e8c_\u661f\u671f\u4e09_\u661f\u671f\u56db_\u661f\u671f\u4e94_\u661f\u671f\u516d'.split('_'),
        weekdaysShort: '\u9031\u65e5_\u9031\u4e00_\u9031\u4e8c_\u9031\u4e09_\u9031\u56db_\u9031\u4e94_\u9031\u516d'.split('_'),
        weekdaysMin: '\u65e5_\u4e00_\u4e8c_\u4e09_\u56db_\u4e94_\u516d'.split('_'),
        longDateFormat: {
          LT: 'Ah\u9edemm',
          L: 'YYYY\u5e74MMMD\u65e5',
          LL: 'YYYY\u5e74MMMD\u65e5',
          LLL: 'YYYY\u5e74MMMD\u65e5LT',
          LLLL: 'YYYY\u5e74MMMD\u65e5ddddLT',
          l: 'YYYY\u5e74MMMD\u65e5',
          ll: 'YYYY\u5e74MMMD\u65e5',
          lll: 'YYYY\u5e74MMMD\u65e5LT',
          llll: 'YYYY\u5e74MMMD\u65e5ddddLT'
        },
        meridiem: function (hour, minute, isLower) {
          if (hour < 9) {
            return '\u65e9\u4e0a';
          } else if (hour < 11 && minute < 30) {
            return '\u4e0a\u5348';
          } else if (hour < 13 && minute < 30) {
            return '\u4e2d\u5348';
          } else if (hour < 18) {
            return '\u4e0b\u5348';
          } else {
            return '\u665a\u4e0a';
          }
        },
        calendar: {
          sameDay: '[\u4eca\u5929]LT',
          nextDay: '[\u660e\u5929]LT',
          nextWeek: '[\u4e0b]ddddLT',
          lastDay: '[\u6628\u5929]LT',
          lastWeek: '[\u4e0a]ddddLT',
          sameElse: 'L'
        },
        ordinal: function (number, period) {
          switch (period) {
          case 'd':
          case 'D':
          case 'DDD':
            return number + '\u65e5';
          case 'M':
            return number + '\u6708';
          case 'w':
          case 'W':
            return number + '\u9031';
          default:
            return number;
          }
        },
        relativeTime: {
          future: '%s\u5167',
          past: '%s\u524d',
          s: '\u5e7e\u79d2',
          m: '\u4e00\u5206\u9418',
          mm: '%d\u5206\u9418',
          h: '\u4e00\u5c0f\u6642',
          hh: '%d\u5c0f\u6642',
          d: '\u4e00\u5929',
          dd: '%d\u5929',
          M: '\u4e00\u500b\u6708',
          MM: '%d\u500b\u6708',
          y: '\u4e00\u5e74',
          yy: '%d\u5e74'
        }
      });
    }());
    moment.lang('en');
  }
  if (typeof define === 'function' && define.amd) {
    define(['moment'], onload);
  }
  if (typeof window !== 'undefined' && window.moment) {
    onload(window.moment);
  }
}());
(function () {
  var Twix, extend, moment, __slice = [].slice;
  if (typeof module !== 'undefined') {
    moment = require('moment');
  } else {
    moment = this.moment;
  }
  if (typeof moment === 'undefined') {
    throw 'Can\'t find moment';
  }
  Twix = function () {
    function Twix(start, end, allDay) {
      this.start = moment(start);
      this.end = moment(end);
      this.allDay = allDay || false;
    }
    Twix.prototype.isSame = function (period) {
      return this.start.isSame(this.end, period);
    };
    Twix.prototype.length = function (period) {
      return this._trueEnd().add(1, 'millisecond').diff(this._trueStart(), period);
    };
    Twix.prototype.count = function (period) {
      var end, start;
      start = this.start.clone().startOf(period);
      end = this.end.clone().startOf(period);
      return end.diff(start, period) + 1;
    };
    Twix.prototype.countInner = function (period) {
      var end, start, _ref;
      _ref = this._inner(period), start = _ref[0], end = _ref[1];
      if (start >= end) {
        return 0;
      }
      return end.diff(start, period);
    };
    Twix.prototype.iterate = function (period, minHours) {
      var end, hasNext, start, _this = this;
      start = this.start.clone().startOf(period);
      end = this.end.clone().startOf(period);
      hasNext = function () {
        return start <= end && (!minHours || start.valueOf() !== end.valueOf() || _this.end.hours() > minHours || _this.allDay);
      };
      return this._iterateHelper(period, start, hasNext);
    };
    Twix.prototype.iterateInner = function (period) {
      var end, hasNext, start, _ref;
      _ref = this._inner(period), start = _ref[0], end = _ref[1];
      hasNext = function () {
        return start < end;
      };
      return this._iterateHelper(period, start, hasNext);
    };
    Twix.prototype.humanizeLength = function () {
      if (this.allDay) {
        if (this.isSame('day')) {
          return 'all day';
        } else {
          return this.start.from(this.end.clone().add(1, 'day'), true);
        }
      } else {
        return this.start.from(this.end, true);
      }
    };
    Twix.prototype.asDuration = function (units) {
      var diff;
      diff = this.end.diff(this.start);
      return moment.duration(diff);
    };
    Twix.prototype.isPast = function () {
      if (this.allDay) {
        return this.end.clone().endOf('day') < moment();
      } else {
        return this.end < moment();
      }
    };
    Twix.prototype.isFuture = function () {
      if (this.allDay) {
        return this.start.clone().startOf('day') > moment();
      } else {
        return this.start > moment();
      }
    };
    Twix.prototype.isCurrent = function () {
      return !this.isPast() && !this.isFuture();
    };
    Twix.prototype.contains = function (mom) {
      mom = moment(mom);
      return this._trueStart() <= mom && this._trueEnd() >= mom;
    };
    Twix.prototype.overlaps = function (other) {
      return this._trueEnd().isAfter(other._trueStart()) && this._trueStart().isBefore(other._trueEnd());
    };
    Twix.prototype.engulfs = function (other) {
      return this._trueStart() <= other._trueStart() && this._trueEnd() >= other._trueEnd();
    };
    Twix.prototype.union = function (other) {
      var allDay, newEnd, newStart;
      allDay = this.allDay && other.allDay;
      if (allDay) {
        newStart = this.start < other.start ? this.start : other.start;
        newEnd = this.end > other.end ? this.end : other.end;
      } else {
        newStart = this._trueStart() < other._trueStart() ? this._trueStart() : other._trueStart();
        newEnd = this._trueEnd() > other._trueEnd() ? this._trueEnd() : other._trueEnd();
      }
      return new Twix(newStart, newEnd, allDay);
    };
    Twix.prototype.intersection = function (other) {
      var allDay, end, newEnd, newStart;
      newStart = this.start > other.start ? this.start : other.start;
      if (this.allDay) {
        end = moment(this.end);
        end.add(1, 'day');
        end.subtract(1, 'millisecond');
        if (other.allDay) {
          newEnd = end < other.end ? this.end : other.end;
        } else {
          newEnd = end < other.end ? end : other.end;
        }
      } else {
        newEnd = this.end < other.end ? this.end : other.end;
      }
      allDay = this.allDay && other.allDay;
      return new Twix(newStart, newEnd, allDay);
    };
    Twix.prototype.isValid = function () {
      return this._trueStart() <= this._trueEnd();
    };
    Twix.prototype.equals = function (other) {
      return other instanceof Twix && this.allDay === other.allDay && this.start.valueOf() === other.start.valueOf() && this.end.valueOf() === other.end.valueOf();
    };
    Twix.prototype.toString = function () {
      var _ref;
      return '{start: ' + this.start.format() + ', end: ' + this.end.format() + ', allDay: ' + ((_ref = this.allDay) != null ? _ref : { 'true': 'false' }) + '}';
    };
    Twix.prototype.simpleFormat = function (momentOpts, inopts) {
      var options, s;
      options = { allDay: '(all day)' };
      extend(options, inopts || {});
      s = '' + this.start.format(momentOpts) + ' - ' + this.end.format(momentOpts);
      if (this.allDay && options.allDay) {
        s += ' ' + options.allDay;
      }
      return s;
    };
    Twix.prototype.format = function (inopts) {
      var common_bucket, end_bucket, fold, format, fs, global_first, goesIntoTheMorning, needDate, options, process, start_bucket, together, _i, _len, _this = this;
      options = {
        groupMeridiems: true,
        spaceBeforeMeridiem: true,
        showDate: true,
        showDayOfWeek: false,
        twentyFourHour: false,
        implicitMinutes: true,
        implicitYear: true,
        yearFormat: 'YYYY',
        monthFormat: 'MMM',
        weekdayFormat: 'ddd',
        dayFormat: 'D',
        meridiemFormat: 'A',
        hourFormat: 'h',
        minuteFormat: 'mm',
        allDay: 'all day',
        explicitAllDay: false,
        lastNightEndsAt: 0
      };
      extend(options, inopts || {});
      fs = [];
      if (options.twentyFourHour) {
        options.hourFormat = options.hourFormat.replace('h', 'H');
      }
      goesIntoTheMorning = options.lastNightEndsAt > 0 && !this.allDay && this.end.clone().startOf('day').valueOf() === this.start.clone().add(1, 'day').startOf('day').valueOf() && this.start.hours() > 12 && this.end.hours() < options.lastNightEndsAt;
      needDate = options.showDate || !this.isSame('day') && !goesIntoTheMorning;
      if (this.allDay && this.isSame('day') && (!options.showDate || options.explicitAllDay)) {
        fs.push({
          name: 'all day simple',
          fn: function () {
            return options.allDay;
          },
          slot: 0,
          pre: ' '
        });
      }
      if (needDate && (!options.implicitYear || this.start.year() !== moment().year() || !this.isSame('year'))) {
        fs.push({
          name: 'year',
          fn: function (date) {
            return date.format(options.yearFormat);
          },
          pre: ', ',
          slot: 4
        });
      }
      if (!this.allDay && needDate) {
        fs.push({
          name: 'all day month',
          fn: function (date) {
            return date.format('' + options.monthFormat + ' ' + options.dayFormat);
          },
          ignoreEnd: function () {
            return goesIntoTheMorning;
          },
          slot: 2,
          pre: ' '
        });
      }
      if (this.allDay && needDate) {
        fs.push({
          name: 'month',
          fn: function (date) {
            return date.format(options.monthFormat);
          },
          slot: 2,
          pre: ' '
        });
      }
      if (this.allDay && needDate) {
        fs.push({
          name: 'date',
          fn: function (date) {
            return date.format(options.dayFormat);
          },
          slot: 3,
          pre: ' '
        });
      }
      if (needDate && options.showDayOfWeek) {
        fs.push({
          name: 'day of week',
          fn: function (date) {
            return date.format(options.weekdayFormat);
          },
          pre: ' ',
          slot: 1
        });
      }
      if (options.groupMeridiems && !options.twentyFourHour && !this.allDay) {
        fs.push({
          name: 'meridiem',
          fn: function (t) {
            return t.format(options.meridiemFormat);
          },
          slot: 6,
          pre: options.spaceBeforeMeridiem ? ' ' : ''
        });
      }
      if (!this.allDay) {
        fs.push({
          name: 'time',
          fn: function (date) {
            var str;
            str = date.minutes() === 0 && options.implicitMinutes && !options.twentyFourHour ? date.format(options.hourFormat) : date.format('' + options.hourFormat + ':' + options.minuteFormat);
            if (!options.groupMeridiems && !options.twentyFourHour) {
              if (options.spaceBeforeMeridiem) {
                str += ' ';
              }
              str += date.format(options.meridiemFormat);
            }
            return str;
          },
          pre: ', ',
          slot: 5
        });
      }
      start_bucket = [];
      end_bucket = [];
      common_bucket = [];
      together = true;
      process = function (format) {
        var end_str, start_group, start_str;
        start_str = format.fn(_this.start);
        end_str = format.ignoreEnd && format.ignoreEnd() ? start_str : format.fn(_this.end);
        start_group = {
          format: format,
          value: function () {
            return start_str;
          }
        };
        if (end_str === start_str && together) {
          return common_bucket.push(start_group);
        } else {
          if (together) {
            together = false;
            common_bucket.push({
              format: {
                slot: format.slot,
                pre: ''
              },
              value: function () {
                return '' + fold(start_bucket) + ' -' + fold(end_bucket, true);
              }
            });
          }
          start_bucket.push(start_group);
          return end_bucket.push({
            format: format,
            value: function () {
              return end_str;
            }
          });
        }
      };
      for (_i = 0, _len = fs.length; _i < _len; _i++) {
        format = fs[_i];
        process(format);
      }
      global_first = true;
      fold = function (array, skip_pre) {
        var local_first, section, str, _j, _len1, _ref;
        local_first = true;
        str = '';
        _ref = array.sort(function (a, b) {
          return a.format.slot - b.format.slot;
        });
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          section = _ref[_j];
          if (!global_first) {
            if (local_first && skip_pre) {
              str += ' ';
            } else {
              str += section.format.pre;
            }
          }
          str += section.value();
          global_first = false;
          local_first = false;
        }
        return str;
      };
      return fold(common_bucket);
    };
    Twix.prototype._trueStart = function () {
      if (this.allDay) {
        return this.start.clone().startOf('day');
      } else {
        return this.start;
      }
    };
    Twix.prototype._trueEnd = function () {
      if (this.allDay) {
        return this.end.clone().endOf('day');
      } else {
        return this.end;
      }
    };
    Twix.prototype._iterateHelper = function (period, iter, hasNext) {
      var _this = this;
      return {
        next: function () {
          var val;
          if (!hasNext()) {
            return null;
          } else {
            val = iter.clone();
            iter.add(1, period);
            return val;
          }
        },
        hasNext: hasNext
      };
    };
    Twix.prototype._inner = function (period) {
      var end, start;
      start = this.start.clone().startOf(period);
      end = this.end.clone().startOf(period);
      (this.allDay ? end : start).add(period, 1);
      return [
        start,
        end
      ];
    };
    Twix.prototype._deprecate = function (name, instead, fn) {
      if (console && console.warn) {
        console.warn('#' + name + ' is deprecated. Use #' + instead + ' instead.');
      }
      return fn.apply(this);
    };
    Twix.prototype.sameDay = function () {
      return this._deprecate('sameDay', 'isSame(\'day\')', function () {
        return this.isSame('day');
      });
    };
    Twix.prototype.sameYear = function () {
      return this._deprecate('sameYear', 'isSame(\'year\')', function () {
        return this.isSame('year');
      });
    };
    Twix.prototype.countDays = function () {
      return this._deprecate('countDays', 'countOuter(\'days\')', function () {
        return this.countOuter('days');
      });
    };
    Twix.prototype.daysIn = function (minHours) {
      return this._deprecate('daysIn', 'iterate(\'days\' [,minHours])', function () {
        return this.iterate('days', minHours);
      });
    };
    Twix.prototype.past = function () {
      return this._deprecate('past', 'isPast()', function () {
        return this.isPast();
      });
    };
    Twix.prototype.duration = function () {
      return this._deprecate('duration', 'humanizeLength()', function () {
        return this.humanizeLength();
      });
    };
    Twix.prototype.merge = function (other) {
      return this._deprecate('merge', 'union(other)', function () {
        return this.union(other);
      });
    };
    return Twix;
  }();
  extend = function (first, second) {
    var attr, _results;
    _results = [];
    for (attr in second) {
      if (typeof second[attr] !== 'undefined') {
        _results.push(first[attr] = second[attr]);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  if (typeof module !== 'undefined') {
    module.exports = Twix;
  } else {
    window.Twix = Twix;
  }
  moment.twix = function () {
    return function (func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor(), result = func.apply(child, args);
      return Object(result) === result ? result : child;
    }(Twix, arguments, function () {
    });
  };
  moment.fn.twix = function () {
    return function (func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor(), result = func.apply(child, args);
      return Object(result) === result ? result : child;
    }(Twix, [this].concat(__slice.call(arguments)), function () {
    });
  };
  moment.fn.forDuration = function (duration, allDay) {
    return new Twix(this, this.clone().add(duration), allDay);
  };
  moment.duration.fn.afterMoment = function (startingTime, allDay) {
    return new Twix(startingTime, moment(startingTime).clone().add(this), allDay);
  };
  moment.duration.fn.beforeMoment = function (startingTime, allDay) {
    return new Twix(moment(startingTime).clone().subtract(this), startingTime, allDay);
  };
}.call(this));