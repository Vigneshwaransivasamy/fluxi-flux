/**
 * fluxi a functional programming style, library which aids in creating functional
 * pipelines
 * @module fluxi
 * @memberOf Fluxi
 * @since v0.0.1
 * @return {Object}
 * @author Vigneshwaran Sivasamy
 */


import * as core from './core';

var pObject = Object.prototype,
    pArray = Array.prototype,
    pString = String.prototype,
    pBoolean = Boolean.prototype,
    _toString = pObject.toString;


    /**
     * Legacy methods and private methods are prefixed with _(underscore).
     */

    function isArray(target){
       return _toString.call(target) === '[object Array]';
    };

    function isObject(target){
      return _toString.call(target) === '[object Object]';
    };

    function isString(target){
      return _toString.call(target) === '[object String]';
    };

    function isDate(target){
      return _toString.call(target) === '[object Date]';
    };

    function isNumber(target){
      return _toString.call(target) === '[object Number]';
    };

    function isNull(target){
      return toString.call(target) === '[object Null]';
    };

    function isUndefined(target){
      return _toString.call(target) === '[object Undefined]';
    };

    function isRegex(target){
      return _toString.call(target) === '[object Regex]';
    };

    function isBoolean(target){
      return _toString.call(target) === '[object Boolean]';
    };

    function isFunction(target){
      return _toString.call(target) === '[object Function]';
    }

    function isPromise(target){
      return _toString.call(target) === '[object Promise]';
    };

    /**
     * Wrapped or Facaded methods which is going public
     */

    function isValid(target){
      return (target !== undefined && target !== null);
    };

    // It checks the variable type
    function isOfType(variable, type){
      return (typeof variable === type) ? true : false;
    };

    function xNull(target){
      return !isNull(target);
    };

    function xUndefined(target){
      return !isUndefined(target);
    };

    function delay(duration){
        return new Promise((resolve, reject) => {
            setTimeout(function(){
                resolve();
            },duration);
        });
    };

    function pipe2(fn1, fn2) {
        return function () {
            return fn2.call(this, fn1.apply(this, arguments));
        };
    };


    /**
     * 
     * Usage: Asychronous pipe which just bilds multiple
     *          Functions to one and wait for command
     * 
     * var joinActions = pipeN(addOne, addTwo, addThree);
     * joinActions();
     * 
     * @param {*Function} fn1 
     * @param {*Function} fn2 
     * 
     * @return Promise
     */

     function pipeN() {
        var isAsync;
        if (isBoolean(arguments[0])) {
            isAsync = arguments[0];
            Array.prototype.shift.call(arguments);
        } else {
            isAsync = true;
        }
        var args = arguments;
        var i = 0;
        var length = arguments.length;
        var lastResult = arguments[0];
        var _pipe2 = isAsync ? pipe2 : syncPipe2;
        if (length == 1)
            return arguments[0];
        if (length == 2)
            return (_pipe2(args[0], args[1]))
        for (; i < length - 1;) {
            lastResult = _pipe2(lastResult, args[i + 1]);
            i++;
        }

        return lastResult;
    };

    /**
     * 
     * Usage: Synchronous pipe will works exacly as you think
     *          that this will wait for each action to get completed
     * 
     * var joinActions = syncPipe2(timer1,timer2,timer3);
     * 
     * joinActions() //     -> you can either just initate the action
     * 
     * joinActions().then(  // -> Add a listener to get the completed status
     *      function(){
     *      console.log("Completed!")
     * });
     * 
     * @param {*Function} fn1 
     * @param {*Function} fn2 
     * 
     * @return Promise
     */

     function syncPipe2(fn1, fn2) {
        return function () {
            return new Promise((resolve, reject) => {
                fn1.apply(this, arguments).then(
                    function (data) {
                        resolve(fn2.call(this, data));
                    }
                );
                return fn2;
            });
        }
    };


    function syncPipeN() {
        Array.prototype.unshift.call(arguments, false);
        return pipeN.apply(this, arguments);
    };

    module.exports = {
        isArray,
        isObject,
        isString,
        isNumber,
        isNull,
        isUndefined,
        isDate,
        isBoolean,
        isRegex,
        isPromise,
        isFunction,
        isOfType,
        pipe2,
        pipeN,
        syncPipe2,
        syncPipeN
    }
