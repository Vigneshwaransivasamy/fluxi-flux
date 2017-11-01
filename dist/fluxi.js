//  Fluxi v1.1.2
//  https://github.com/vigneshwaransivasamy/fluxi
//  (c)2017 Vigneshwaran Sivasamy
//  Fluxi may be freely distributed under the MIT license.

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.fluxi = {})));
}(this, (function (exports) { 'use strict';

function curryN(fn) {
    return function () {
        if (fn.length == arguments.length) return fn(...arguments);else return fn.bind(null, ...arguments);
    };
}

function debug(text, ...rest) {
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    var log = ' : ' + now + ': ' + text;
    var restLength = rest.length;
    for (let i = 0; i < restLength; i++) {
      log += ' : ' + rest[i];
    }
    console.log(log);
  } else {
    console.log(Date() + ' : ' + text);
  }
}

function filler() {
    return '__EMPTY__';
}

function pipe2(fn1, fn2) {
  return function () {
    return fn2.call(this, fn1.apply(this, arguments));
  };
}

/**
 * Legacy methods and private methods are prefixed with _(underscore).
 */

const is = type => target => Object(target) instanceof type;

const isBoolean = target => is(Boolean)(target);

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
            fn1.apply(this, arguments).then(function (data) {
                resolve(fn2.call(this, data));
            }).catch(reject);
            return fn2;
        });
    };
}

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
    if (length == 1) return arguments[0];
    if (length == 2) return _pipe2(args[0], args[1]);
    for (; i < length - 1;) {
        lastResult = _pipe2(lastResult, args[i + 1]);
        i++;
    }

    return lastResult;
}

function syncPipeN() {
    Array.prototype.unshift.call(arguments, false);
    return pipeN.apply(this, arguments);
}

function randomToken(length) {
    var hash = '';
    var language = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

    for (var offset = 0; offset < length; offset++) hash += language.charAt(Math.floor(Math.random() * language.length));

    return hash;
}

var toString = Object.prototype.toString;
const isObject = target => toString.call(target) === '[object Object]';

const isString = target => is(String)(target);

var hash32 = () => randomToken(32);

function _proxyObjectProperty(data, subscribers) {
    for (var key in data) {
        if (isObject(data[key])) {
            data[key] = proxr(data[key], subscribers);
        } else {
            // do nothing
        }
    }
    return data;
}

function __pubsub__(data, subscribers) {
    data.subscribe = function (fn) {
        if (is(Function)(fn)) {
            var id = hash32();
            subscribers.set(id, fn);
            return id;
        } else {
            return new Error('Type Error: subscriber should be of type Function');
        }
    };

    data.unsubscribe = function (id) {
        if (subscribers.has(id)) {
            return subscribers.delete(id);
        } else {
            return new Error('Type Error: subscriber should be of type Function');
        }
    };
    return data;
}

function proxr(data, _subscribers) {
    var isRoot = !_subscribers;
    var subscribers = _subscribers ? _subscribers : new Map();
    var _handler = {
        get: function get(target, key) {
            return target[key];
        },
        set: function set(target, key, value) {
            var action = null,
                oldValue = null,
                actionData = {};
            if (!target[key]) {
                action = 'NEW';
                target[key] = isString(value) ? value : proxr(value, subscribers);
            } else {
                action = 'UPDATE';
                oldValue = target[key];
                if (oldValue == value) {
                    // Do nothing if the value are same
                    return;
                }
                target[key] = value;
            }

            actionData = {
                'action': action,
                'actionRoot': target,
                'key': key,
                'value': value
            };

            if (action == 'update') {
                actionData.oldValue = oldValue;
            }
            notify(actionData);
            return target[key];
        }
    };

    function notify(data) {
        subscribers.forEach(function (fn) {
            fn(data);
        });
    }

    data = new Proxy(_proxyObjectProperty(data, subscribers), _handler);

    return isRoot ? __pubsub__(data, subscribers) : data;
}

const isArray = target => is(Array)(target);

var toString$1 = Object.prototype.toString;

const isDate = target => toString$1.call(target) === '[object Date]';

const isFunction = target => is(Function)(target);

var toString$2 = Object.prototype.toString;

const isNaN = target => toString$2.call(target) === '[object NaN]';

var toString$3 = Object.prototype.toString;

const isNull = target => toString$3.call(target) === '[object Null]';

const isNumber = target => is(Number)(target);

var toString$4 = Object.prototype.toString;

const isPromise = target => toString$4.call(target) === '[object Promise]';

const isRegex = target => is(RegExp)(target);

var toString$5 = Object.prototype.toString;

const isSymbol = target => toString$5.call(target) === '[object Symbol]';

var toString$6 = Object.prototype.toString;

const isUndefined = target => toString$6.call(target) === '[object Undefined]';

exports.curry = curryN;
exports.debug = debug;
exports.filler = filler;
exports.pipe2 = pipe2;
exports.pipeN = pipeN;
exports.syncPipe2 = syncPipe2;
exports.syncPipeN = syncPipeN;
exports.proxr = proxr;
exports.is = is;
exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isDate = isDate;
exports.isFunction = isFunction;
exports.isNaN = isNaN;
exports.isNull = isNull;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isPromise = isPromise;
exports.isRegex = isRegex;
exports.isString = isString;
exports.isSymbol = isSymbol;
exports.isUndefined = isUndefined;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmx1eGkuanMiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9jdXJyeS5qcyIsIi4uL3NvdXJjZS9kZWJ1Zy5qcyIsIi4uL3NvdXJjZS9maWxsZXIuanMiLCIuLi9zb3VyY2UvcGlwZTIuanMiLCIuLi9zb3VyY2UvaXMuanMiLCIuLi9zb3VyY2UvaXNCb29sZWFuLmpzIiwiLi4vc291cmNlL3N5bmNQaXBlMi5qcyIsIi4uL3NvdXJjZS9waXBlTi5qcyIsIi4uL3NvdXJjZS9zeW5jUGlwZU4uanMiLCIuLi9zb3VyY2UvcmFuZG9tVG9rZW4uanMiLCIuLi9zb3VyY2UvaXNPYmplY3QuanMiLCIuLi9zb3VyY2UvaXNTdHJpbmcuanMiLCIuLi9zb3VyY2UvcHJveHIuanMiLCIuLi9zb3VyY2UvaXNBcnJheS5qcyIsIi4uL3NvdXJjZS9pc0RhdGUuanMiLCIuLi9zb3VyY2UvaXNGdW5jdGlvbi5qcyIsIi4uL3NvdXJjZS9pc05hTi5qcyIsIi4uL3NvdXJjZS9pc051bGwuanMiLCIuLi9zb3VyY2UvaXNOdW1iZXIuanMiLCIuLi9zb3VyY2UvaXNQcm9taXNlLmpzIiwiLi4vc291cmNlL2lzUmVnZXguanMiLCIuLi9zb3VyY2UvaXNTeW1ib2wuanMiLCIuLi9zb3VyY2UvaXNVbmRlZmluZWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3VycnlOKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZuLmxlbmd0aCA9PSBhcmd1bWVudHMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIGZuKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBmbi5iaW5kKG51bGwsIC4uLmFyZ3VtZW50cyk7XG4gICAgfTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWJ1Zyh0ZXh0LCAuLi5yZXN0KSB7XG4gIGlmKHdpbmRvdy5wZXJmb3JtYW5jZSkge1xuICAgIHZhciBub3cgPSAod2luZG93LnBlcmZvcm1hbmNlLm5vdygpIC8gMTAwMCkudG9GaXhlZCgzKTtcbiAgICB2YXIgbG9nID0gJyA6ICcgKyBub3cgKyAnOiAnICsgdGV4dDtcbiAgICB2YXIgcmVzdExlbmd0aCA9IHJlc3QubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdExlbmd0aDsgaSsrKSB7XG4gICAgICBsb2cgKz0gJyA6ICcgKyByZXN0W2ldO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhsb2cpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKERhdGUoKSArICcgOiAnICsgdGV4dCk7XG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaWxsZXIoKXtcbiAgICByZXR1cm4gJ19fRU1QVFlfXyc7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGlwZTIoZm4xLCBmbjIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZm4yLmNhbGwodGhpcywgZm4xLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufSIsIi8qKlxuICogTGVnYWN5IG1ldGhvZHMgYW5kIHByaXZhdGUgbWV0aG9kcyBhcmUgcHJlZml4ZWQgd2l0aCBfKHVuZGVyc2NvcmUpLlxuICovXG5cbmNvbnN0IGlzID0gdHlwZSA9PiB0YXJnZXQgPT4gT2JqZWN0KHRhcmdldCkgaW5zdGFuY2VvZiB0eXBlO1xuXG5leHBvcnQgZGVmYXVsdCBpcztcbiIsImltcG9ydCBpcyBmcm9tICcuL2lzLmpzJztcblxuY29uc3QgaXNCb29sZWFuID0gdGFyZ2V0ID0+IGlzKEJvb2xlYW4pKHRhcmdldCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzQm9vbGVhbjsiLCIvKipcbiAqIFxuICogVXNhZ2U6IFN5bmNocm9ub3VzIHBpcGUgd2lsbCB3b3JrcyBleGFjbHkgYXMgeW91IHRoaW5rXG4gKiAgICAgICAgICB0aGF0IHRoaXMgd2lsbCB3YWl0IGZvciBlYWNoIGFjdGlvbiB0byBnZXQgY29tcGxldGVkXG4gKiBcbiAqIHZhciBqb2luQWN0aW9ucyA9IHN5bmNQaXBlMih0aW1lcjEsdGltZXIyLHRpbWVyMyk7XG4gKiBcbiAqIGpvaW5BY3Rpb25zKCkgLy8gICAgIC0+IHlvdSBjYW4gZWl0aGVyIGp1c3QgaW5pdGF0ZSB0aGUgYWN0aW9uXG4gKiBcbiAqIGpvaW5BY3Rpb25zKCkudGhlbiggIC8vIC0+IEFkZCBhIGxpc3RlbmVyIHRvIGdldCB0aGUgY29tcGxldGVkIHN0YXR1c1xuICogICAgICBmdW5jdGlvbigpe1xuICogICAgICBjb25zb2xlLmxvZyhcIkNvbXBsZXRlZCFcIilcbiAqIH0pO1xuICogXG4gKiBAcGFyYW0geypGdW5jdGlvbn0gZm4xIFxuICogQHBhcmFtIHsqRnVuY3Rpb259IGZuMiBcbiAqIFxuICogQHJldHVybiBQcm9taXNlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3luY1BpcGUyKGZuMSwgZm4yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGZuMS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLnRoZW4oXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmbjIuY2FsbCh0aGlzLCBkYXRhKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5jYXRjaChyZWplY3QpO1xuICAgICAgICAgICAgcmV0dXJuIGZuMjtcbiAgICAgICAgfSk7XG4gICAgfTtcbn0iLCIvKipcbiAqIFxuICogVXNhZ2U6IEFzeWNocm9ub3VzIHBpcGUgd2hpY2gganVzdCBiaWxkcyBtdWx0aXBsZVxuICogICAgICAgICAgRnVuY3Rpb25zIHRvIG9uZSBhbmQgd2FpdCBmb3IgY29tbWFuZFxuICogXG4gKiB2YXIgam9pbkFjdGlvbnMgPSBwaXBlTihhZGRPbmUsIGFkZFR3bywgYWRkVGhyZWUpO1xuICogam9pbkFjdGlvbnMoKTtcbiAqIFxuICogQHBhcmFtIHsqRnVuY3Rpb259IGZuMSBcbiAqIEBwYXJhbSB7KkZ1bmN0aW9ufSBmbjIgXG4gKiBcbiAqIEByZXR1cm4gUHJvbWlzZVxuICovXG5cblxuaW1wb3J0IHBpcGUyIGZyb20gJy4vcGlwZTInO1xuaW1wb3J0IGlzQm9vbGVhbiBmcm9tICcuL2lzQm9vbGVhbic7XG5pbXBvcnQgc3luY1BpcGUyIGZyb20gJy4vc3luY1BpcGUyJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGlwZU4oKSB7XG4gICAgdmFyIGlzQXN5bmM7XG4gICAgaWYgKGlzQm9vbGVhbihhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIGlzQXN5bmMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5jYWxsKGFyZ3VtZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaXNBc3luYyA9IHRydWU7XG4gICAgfVxuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB2YXIgbGFzdFJlc3VsdCA9IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgX3BpcGUyID0gaXNBc3luYyA/IHBpcGUyIDogc3luY1BpcGUyO1xuICAgIGlmIChsZW5ndGggPT0gMSlcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgICBpZiAobGVuZ3RoID09IDIpXG4gICAgICAgIHJldHVybiAoX3BpcGUyKGFyZ3NbMF0sIGFyZ3NbMV0pKTtcbiAgICBmb3IgKDsgaSA8IGxlbmd0aCAtIDE7KSB7XG4gICAgICAgIGxhc3RSZXN1bHQgPSBfcGlwZTIobGFzdFJlc3VsdCwgYXJnc1tpICsgMV0pO1xuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhc3RSZXN1bHQ7XG59IiwiaW1wb3J0IHBpcGVOIGZyb20gJy4vcGlwZU4nO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3luY1BpcGVOKCkge1xuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmNhbGwoYXJndW1lbnRzLCBmYWxzZSk7XG4gICAgcmV0dXJuIHBpcGVOLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmFuZG9tVG9rZW4obGVuZ3RoKSB7XG4gICAgdmFyIGhhc2ggPSAnJztcbiAgICB2YXIgbGFuZ3VhZ2UgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODlfLSc7XG5cbiAgICBmb3IgKHZhciBvZmZzZXQgPSAwOyBvZmZzZXQgPCBsZW5ndGg7IG9mZnNldCsrKVxuICAgICAgICBoYXNoICs9IGxhbmd1YWdlLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsYW5ndWFnZS5sZW5ndGgpKTtcblxuICAgIHJldHVybiBoYXNoO1xufSIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCBpc09iamVjdCA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuZXhwb3J0IGRlZmF1bHQgaXNPYmplY3Q7IiwiaW1wb3J0IGlzIGZyb20gJy4vaXMuanMnO1xuY29uc3QgaXNTdHJpbmcgPSB0YXJnZXQgPT4gaXMoU3RyaW5nKSh0YXJnZXQpO1xuXG5leHBvcnQgZGVmYXVsdCBpc1N0cmluZzsiLCJpbXBvcnQgaXMgZnJvbSAnLi9pcyc7XG5pbXBvcnQgcmFuZG9tVG9rZW4gZnJvbSAnLi9yYW5kb21Ub2tlbic7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdCc7XG5pbXBvcnQgaXNTdHJpbmcgZnJvbSAnLi9pc1N0cmluZyc7XG5cbnZhciBoYXNoMzIgPSAoKSA9PiByYW5kb21Ub2tlbigzMik7XG5cbmZ1bmN0aW9uIF9wcm94eU9iamVjdFByb3BlcnR5KGRhdGEsIHN1YnNjcmliZXJzKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgICAgaWYgKGlzT2JqZWN0KGRhdGFba2V5XSkpIHtcbiAgICAgICAgICAgIGRhdGFba2V5XSA9IHByb3hyKGRhdGFba2V5XSwgc3Vic2NyaWJlcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIF9fcHVic3ViX18oZGF0YSwgc3Vic2NyaWJlcnMpIHtcbiAgICBkYXRhLnN1YnNjcmliZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICBpZiAoaXMoRnVuY3Rpb24pKGZuKSkge1xuICAgICAgICAgICAgdmFyIGlkID0gaGFzaDMyKCk7XG4gICAgICAgICAgICBzdWJzY3JpYmVycy5zZXQoaWQsIGZuKTtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRXJyb3IoJ1R5cGUgRXJyb3I6IHN1YnNjcmliZXIgc2hvdWxkIGJlIG9mIHR5cGUgRnVuY3Rpb24nKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkYXRhLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIGlmIChzdWJzY3JpYmVycy5oYXMoaWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gc3Vic2NyaWJlcnMuZGVsZXRlKGlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRXJyb3IoJ1R5cGUgRXJyb3I6IHN1YnNjcmliZXIgc2hvdWxkIGJlIG9mIHR5cGUgRnVuY3Rpb24nKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGRhdGE7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHByb3hyKGRhdGEsIF9zdWJzY3JpYmVycykge1xuICAgIHZhciBpc1Jvb3QgPSAhX3N1YnNjcmliZXJzO1xuICAgIHZhciBzdWJzY3JpYmVycyA9IF9zdWJzY3JpYmVycyA/IF9zdWJzY3JpYmVycyA6IG5ldyBNYXAoKTtcbiAgICB2YXIgX2hhbmRsZXIgPSB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W2tleV07XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gc2V0KHRhcmdldCwga2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IG51bGwsIG9sZFZhbHVlID0gbnVsbCwgYWN0aW9uRGF0YSA9IHt9O1xuICAgICAgICAgICAgaWYgKCF0YXJnZXRba2V5XSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbiA9ICdORVcnO1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gaXNTdHJpbmcodmFsdWUpID8gdmFsdWUgOiBwcm94cih2YWx1ZSwgc3Vic2NyaWJlcnMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY3Rpb24gPSAnVVBEQVRFJztcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZSA9IHRhcmdldFtrZXldO1xuICAgICAgICAgICAgICAgIGlmIChvbGRWYWx1ZSA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEbyBub3RoaW5nIGlmIHRoZSB2YWx1ZSBhcmUgc2FtZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFjdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgJ2FjdGlvbic6IGFjdGlvbixcbiAgICAgICAgICAgICAgICAnYWN0aW9uUm9vdCc6IHRhcmdldCxcbiAgICAgICAgICAgICAgICAna2V5Jzoga2V5LFxuICAgICAgICAgICAgICAgICd2YWx1ZSc6IHZhbHVlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoYWN0aW9uID09ICd1cGRhdGUnKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uRGF0YS5vbGRWYWx1ZSA9IG9sZFZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm90aWZ5KGFjdGlvbkRhdGEpO1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtrZXldO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG5vdGlmeShkYXRhKSB7XG4gICAgICAgIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBmbihkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGF0YSA9IG5ldyBQcm94eShfcHJveHlPYmplY3RQcm9wZXJ0eShkYXRhLCBzdWJzY3JpYmVycyksIF9oYW5kbGVyKTtcblxuICAgIHJldHVybiBpc1Jvb3QgPyBfX3B1YnN1Yl9fKGRhdGEsIHN1YnNjcmliZXJzKSA6IGRhdGE7XG59IiwiaW1wb3J0IGlzIGZyb20gJy4vaXMuanMnO1xuXG5jb25zdCBpc0FycmF5ID0gdGFyZ2V0ID0+IGlzKEFycmF5KSh0YXJnZXQpO1xuXG5leHBvcnQgZGVmYXVsdCBpc0FycmF5OyIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmNvbnN0IGlzRGF0ZSA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IERhdGVdJztcblxuZXhwb3J0IGRlZmF1bHQgaXNEYXRlOyIsImltcG9ydCBpcyBmcm9tICcuL2lzLmpzJztcblxuY29uc3QgaXNGdW5jdGlvbiA9IHRhcmdldCA9PiBpcyhGdW5jdGlvbikodGFyZ2V0KTtcblxuZXhwb3J0IGRlZmF1bHQgaXNGdW5jdGlvbjsiLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5jb25zdCBpc05hTiA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IE5hTl0nO1xuXG5leHBvcnQgZGVmYXVsdCBpc05hTjsiLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5jb25zdCBpc051bGwgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBOdWxsXSc7XG5cbmV4cG9ydCBkZWZhdWx0IGlzTnVsbDsiLCJpbXBvcnQgaXMgZnJvbSAnLi9pcy5qcyc7XG5cbmNvbnN0IGlzTnVtYmVyID0gdGFyZ2V0ID0+IGlzKE51bWJlcikodGFyZ2V0KTtcblxuZXhwb3J0IGRlZmF1bHQgaXNOdW1iZXI7IiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuY29uc3QgaXNQcm9taXNlID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgUHJvbWlzZV0nO1xuXG5leHBvcnQgZGVmYXVsdCBpc1Byb21pc2U7IiwiaW1wb3J0IGlzIGZyb20gJy4vaXMuanMnO1xuY29uc3QgaXNSZWdleCA9IHRhcmdldCA9PiBpcyhSZWdFeHApKHRhcmdldCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzUmVnZXg7IiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuY29uc3QgaXNTeW1ib2wgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBTeW1ib2xdJztcblxuZXhwb3J0IGRlZmF1bHQgaXNTeW1ib2w7IiwiXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5jb25zdCBpc1VuZGVmaW5lZCA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG5leHBvcnQgZGVmYXVsdCBpc1VuZGVmaW5lZDsiXSwibmFtZXMiOlsiY3VycnlOIiwiZm4iLCJsZW5ndGgiLCJhcmd1bWVudHMiLCJiaW5kIiwiZGVidWciLCJ0ZXh0IiwicmVzdCIsIndpbmRvdyIsInBlcmZvcm1hbmNlIiwibm93IiwidG9GaXhlZCIsImxvZyIsInJlc3RMZW5ndGgiLCJpIiwiRGF0ZSIsImZpbGxlciIsInBpcGUyIiwiZm4xIiwiZm4yIiwiY2FsbCIsImFwcGx5IiwiaXMiLCJ0eXBlIiwidGFyZ2V0IiwiT2JqZWN0IiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsInN5bmNQaXBlMiIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGhlbiIsImRhdGEiLCJjYXRjaCIsInBpcGVOIiwiaXNBc3luYyIsInByb3RvdHlwZSIsInNoaWZ0IiwiYXJncyIsImxhc3RSZXN1bHQiLCJfcGlwZTIiLCJzeW5jUGlwZU4iLCJ1bnNoaWZ0IiwicmFuZG9tVG9rZW4iLCJoYXNoIiwibGFuZ3VhZ2UiLCJvZmZzZXQiLCJjaGFyQXQiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJ0b1N0cmluZyIsImlzT2JqZWN0IiwiaXNTdHJpbmciLCJTdHJpbmciLCJoYXNoMzIiLCJfcHJveHlPYmplY3RQcm9wZXJ0eSIsInN1YnNjcmliZXJzIiwia2V5IiwicHJveHIiLCJfX3B1YnN1Yl9fIiwic3Vic2NyaWJlIiwiRnVuY3Rpb24iLCJpZCIsInNldCIsIkVycm9yIiwidW5zdWJzY3JpYmUiLCJoYXMiLCJkZWxldGUiLCJfc3Vic2NyaWJlcnMiLCJpc1Jvb3QiLCJNYXAiLCJfaGFuZGxlciIsImdldCIsInZhbHVlIiwiYWN0aW9uIiwib2xkVmFsdWUiLCJhY3Rpb25EYXRhIiwibm90aWZ5IiwiZm9yRWFjaCIsIlByb3h5IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiaXNGdW5jdGlvbiIsImlzTmFOIiwiaXNOdWxsIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc1Byb21pc2UiLCJpc1JlZ2V4IiwiUmVnRXhwIiwiaXNTeW1ib2wiLCJpc1VuZGVmaW5lZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBZSxT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
