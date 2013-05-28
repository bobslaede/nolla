'use strict';

module.exports.chunk = function chunk(array, n) {
  if (!array.length) {
    return [];
  }
  return [ array.slice(0, n) ].concat(chunk(array.slice(n), n));
};

module.exports.pathRegex = new RegExp('(\\w+)', 'g');