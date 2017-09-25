var curryN = require('../wrapper/curry');
var assert = require('assert');
describe('fluxi.fx', function() {
  describe('curryN', function() {
    it('case 1: it should work perfectly with the direct to values', function() {
      var add2 = function(a,b){
          return a+b;
      };
      var _addCurried = curryN(2, add2);
      var result = _addCurried(1,2);
      assert.equal(
          3,   
          result
      )
    });

    it('case 2: it should return a function for first argument and while \
    giving the next argument this should work like a charm', function() {
      var add2 = function(a,b){
          return a+b;
      };
      var _addCurried = curryN(2, add2);
      var _gotOne = _addCurried(2);
      assert.equal(
          3,   
          _gotOne(1)
      );
    });

    it('case 2: it should return the same function when both the values are placeholders', function() {
      var add2 = function(a,b){
          return a+b;
      };
      var _addCurried = curryN(2, add2);
      var _noArgs = _addCurried();
      assert.equal(
          3,   
          _noArgs(1,2)
      );
    });
  });
});