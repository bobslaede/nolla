
var assert = require("assert")

describe('Array', function(){

  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })

  describe('#push()', function(){
    it('should add an item to the end of an array', function(){
      var array = [];
      assert.equal(0, array.length);
      array.push('foo');
      assert.equal(1, array.length);
      assert.equal('foo', array[0]);
      array.push('bar');
      assert.equal('bar', array[1]);
    })
  })

})