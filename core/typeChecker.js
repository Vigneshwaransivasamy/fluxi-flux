/**
 * Legacy methods and private methods are prefixed with _(underscore).
 */
var is = function(type){
    return function(target){
      return Object(target) instanceof type
    }
  },

  _isObject = function (target) {
    return toString.call(target) === '[object Object]';
  },

  _isDate = function (target) {
    return toString.call(target) === '[object Date]';
  },

  _isPromise = function (target) {
    return toString.call(target) === '[object Promise]';
  },

  _isSymbol = function (target) {
    return toString.call(target) === '[object Symbol]';
  },

  _isNaN = function (target) {
    return toString.call(target) === '[object NaN]';
  },

  _isNull = function (target) {
    return toString.call(target) === '[object Null]';
  },

  _isUndefined = function (target) {
    return toString.call(target) === '[object Undefined]';
  };

module.exports = {
  is: is,
  isArray: is(Array),
  isBoolean: is(Boolean),
  isDate: _isDate,
  isFunction: is(Function),
  isNaN: _isNaN,
  isNull: _isNull,
  isNumber: is(Number),
  isObject: _isObject,
  isPromise: _isPromise,
  isRegex: is(RegExp),
  isString: is(String),
  isSymbol: _isSymbol,
}