'use strict';

var assert = require('assert')

var utils = require('../src/utils');

describe('utils', function () {

  describe('#findModelFromCollection()', function () {
    it('should return false when given collection that doesnt exists', function () {
      assert.equal(false, utils.findModelFromCollection('foobarbaz'));
    });

    it('should return a model when given collection', function () {
      //assert.equal(true, utils.findModelFromCollection('app'));
    });
  });


})