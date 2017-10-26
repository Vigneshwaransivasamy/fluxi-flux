//  Fluxi v1.0.6
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

function debug(text) {
    if (window.performance) {
        var now = (window.performance.now() / 1000).toFixed(3);
        console.log(' : ' + now + ': ' + text);
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

function syncPipe2$1(fn1, fn2) {
    return function () {
        return new Promise((resolve, reject) => {
            fn1.apply(this, arguments).then(function (data) {
                resolve(fn2.call(this, data));
            }).catch(reject);
            return fn2;
        });
    };
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
exports.syncPipe2 = syncPipe2$1;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmx1eGkuanMiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9jdXJyeS5qcyIsIi4uL3NvdXJjZS9kZWJ1Zy5qcyIsIi4uL3NvdXJjZS9maWxsZXIuanMiLCIuLi9zb3VyY2UvcGlwZTIuanMiLCIuLi9zb3VyY2UvaXMuanMiLCIuLi9zb3VyY2UvaXNCb29sZWFuLmpzIiwiLi4vc291cmNlL3BpcGVOLmpzIiwiLi4vc291cmNlL3N5bmNQaXBlMi5qcyIsIi4uL3NvdXJjZS9zeW5jUGlwZU4uanMiLCIuLi9zb3VyY2UvcmFuZG9tVG9rZW4uanMiLCIuLi9zb3VyY2UvaXNPYmplY3QuanMiLCIuLi9zb3VyY2UvaXNTdHJpbmcuanMiLCIuLi9zb3VyY2UvcHJveHIuanMiLCIuLi9zb3VyY2UvaXNBcnJheS5qcyIsIi4uL3NvdXJjZS9pc0RhdGUuanMiLCIuLi9zb3VyY2UvaXNGdW5jdGlvbi5qcyIsIi4uL3NvdXJjZS9pc05hTi5qcyIsIi4uL3NvdXJjZS9pc051bGwuanMiLCIuLi9zb3VyY2UvaXNOdW1iZXIuanMiLCIuLi9zb3VyY2UvaXNQcm9taXNlLmpzIiwiLi4vc291cmNlL2lzUmVnZXguanMiLCIuLi9zb3VyY2UvaXNTeW1ib2wuanMiLCIuLi9zb3VyY2UvaXNVbmRlZmluZWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3VycnlOKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZuLmxlbmd0aCA9PSBhcmd1bWVudHMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIGZuKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBmbi5iaW5kKG51bGwsIC4uLmFyZ3VtZW50cyk7XG4gICAgfTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWJ1Zyh0ZXh0KSB7XG4gICAgaWYgKHdpbmRvdy5wZXJmb3JtYW5jZSkge1xuICAgICAgICB2YXIgbm93ID0gKHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSAvIDEwMDApLnRvRml4ZWQoMyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCcgOiAnK25vdyArICc6ICcgKyB0ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhEYXRlKCkrJyA6ICcrdGV4dCk7XG4gICAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbGxlcigpe1xuICAgIHJldHVybiAnX19FTVBUWV9fJztcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwaXBlMihmbjEsIGZuMikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmbjIuY2FsbCh0aGlzLCBmbjEuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfTtcbn0iLCIvKipcbiAqIExlZ2FjeSBtZXRob2RzIGFuZCBwcml2YXRlIG1ldGhvZHMgYXJlIHByZWZpeGVkIHdpdGggXyh1bmRlcnNjb3JlKS5cbiAqL1xuXG5jb25zdCBpcyA9IHR5cGUgPT4gdGFyZ2V0ID0+IE9iamVjdCh0YXJnZXQpIGluc3RhbmNlb2YgdHlwZTtcblxuZXhwb3J0IGRlZmF1bHQgaXM7XG4iLCJpbXBvcnQgaXMgZnJvbSAnLi9pcy5qcyc7XG5cbmNvbnN0IGlzQm9vbGVhbiA9IHRhcmdldCA9PiBpcyhCb29sZWFuKSh0YXJnZXQpO1xuXG5leHBvcnQgZGVmYXVsdCBpc0Jvb2xlYW47IiwiLyoqXG4gKiBcbiAqIFVzYWdlOiBBc3ljaHJvbm91cyBwaXBlIHdoaWNoIGp1c3QgYmlsZHMgbXVsdGlwbGVcbiAqICAgICAgICAgIEZ1bmN0aW9ucyB0byBvbmUgYW5kIHdhaXQgZm9yIGNvbW1hbmRcbiAqIFxuICogdmFyIGpvaW5BY3Rpb25zID0gcGlwZU4oYWRkT25lLCBhZGRUd28sIGFkZFRocmVlKTtcbiAqIGpvaW5BY3Rpb25zKCk7XG4gKiBcbiAqIEBwYXJhbSB7KkZ1bmN0aW9ufSBmbjEgXG4gKiBAcGFyYW0geypGdW5jdGlvbn0gZm4yIFxuICogXG4gKiBAcmV0dXJuIFByb21pc2VcbiAqL1xuXG5cbmltcG9ydCBwaXBlMiBmcm9tICcuL3BpcGUyJztcbmltcG9ydCBpc0Jvb2xlYW4gZnJvbSAnLi9pc0Jvb2xlYW4nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwaXBlTigpIHtcbiAgICB2YXIgaXNBc3luYztcbiAgICBpZiAoaXNCb29sZWFuKGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgaXNBc3luYyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpc0FzeW5jID0gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHZhciBsYXN0UmVzdWx0ID0gYXJndW1lbnRzWzBdO1xuICAgIHZhciBfcGlwZTIgPSBpc0FzeW5jID8gcGlwZTIgOiBzeW5jUGlwZTI7XG4gICAgaWYgKGxlbmd0aCA9PSAxKVxuICAgICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuICAgIGlmIChsZW5ndGggPT0gMilcbiAgICAgICAgcmV0dXJuIChfcGlwZTIoYXJnc1swXSwgYXJnc1sxXSkpO1xuICAgIGZvciAoOyBpIDwgbGVuZ3RoIC0gMTspIHtcbiAgICAgICAgbGFzdFJlc3VsdCA9IF9waXBlMihsYXN0UmVzdWx0LCBhcmdzW2kgKyAxXSk7XG4gICAgICAgIGkrKztcbiAgICB9XG5cbiAgICByZXR1cm4gbGFzdFJlc3VsdDtcbn0iLCIvKipcbiAqIFxuICogVXNhZ2U6IFN5bmNocm9ub3VzIHBpcGUgd2lsbCB3b3JrcyBleGFjbHkgYXMgeW91IHRoaW5rXG4gKiAgICAgICAgICB0aGF0IHRoaXMgd2lsbCB3YWl0IGZvciBlYWNoIGFjdGlvbiB0byBnZXQgY29tcGxldGVkXG4gKiBcbiAqIHZhciBqb2luQWN0aW9ucyA9IHN5bmNQaXBlMih0aW1lcjEsdGltZXIyLHRpbWVyMyk7XG4gKiBcbiAqIGpvaW5BY3Rpb25zKCkgLy8gICAgIC0+IHlvdSBjYW4gZWl0aGVyIGp1c3QgaW5pdGF0ZSB0aGUgYWN0aW9uXG4gKiBcbiAqIGpvaW5BY3Rpb25zKCkudGhlbiggIC8vIC0+IEFkZCBhIGxpc3RlbmVyIHRvIGdldCB0aGUgY29tcGxldGVkIHN0YXR1c1xuICogICAgICBmdW5jdGlvbigpe1xuICogICAgICBjb25zb2xlLmxvZyhcIkNvbXBsZXRlZCFcIilcbiAqIH0pO1xuICogXG4gKiBAcGFyYW0geypGdW5jdGlvbn0gZm4xIFxuICogQHBhcmFtIHsqRnVuY3Rpb259IGZuMiBcbiAqIFxuICogQHJldHVybiBQcm9taXNlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3luY1BpcGUyKGZuMSwgZm4yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGZuMS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLnRoZW4oXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmbjIuY2FsbCh0aGlzLCBkYXRhKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5jYXRjaChyZWplY3QpO1xuICAgICAgICAgICAgcmV0dXJuIGZuMjtcbiAgICAgICAgfSk7XG4gICAgfTtcbn0iLCJpbXBvcnQgcGlwZU4gZnJvbSAnLi9waXBlTic7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzeW5jUGlwZU4oKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuY2FsbChhcmd1bWVudHMsIGZhbHNlKTtcbiAgICByZXR1cm4gcGlwZU4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYW5kb21Ub2tlbihsZW5ndGgpIHtcbiAgICB2YXIgaGFzaCA9ICcnO1xuICAgIHZhciBsYW5ndWFnZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OV8tJztcblxuICAgIGZvciAodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IGxlbmd0aDsgb2Zmc2V0KyspXG4gICAgICAgIGhhc2ggKz0gbGFuZ3VhZ2UuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxhbmd1YWdlLmxlbmd0aCkpO1xuXG4gICAgcmV0dXJuIGhhc2g7XG59IiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IGlzT2JqZWN0ID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG5leHBvcnQgZGVmYXVsdCBpc09iamVjdDsiLCJpbXBvcnQgaXMgZnJvbSAnLi9pcy5qcyc7XG5jb25zdCBpc1N0cmluZyA9IHRhcmdldCA9PiBpcyhTdHJpbmcpKHRhcmdldCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzU3RyaW5nOyIsImltcG9ydCBpcyBmcm9tICcuL2lzJztcbmltcG9ydCByYW5kb21Ub2tlbiBmcm9tICcuL3JhbmRvbVRva2VuJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0JztcbmltcG9ydCBpc1N0cmluZyBmcm9tICcuL2lzU3RyaW5nJztcblxudmFyIGhhc2gzMiA9ICgpID0+IHJhbmRvbVRva2VuKDMyKTtcblxuZnVuY3Rpb24gX3Byb3h5T2JqZWN0UHJvcGVydHkoZGF0YSwgc3Vic2NyaWJlcnMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgICBpZiAoaXNPYmplY3QoZGF0YVtrZXldKSkge1xuICAgICAgICAgICAgZGF0YVtrZXldID0gcHJveHIoZGF0YVtrZXldLCBzdWJzY3JpYmVycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gX19wdWJzdWJfXyhkYXRhLCBzdWJzY3JpYmVycykge1xuICAgIGRhdGEuc3Vic2NyaWJlID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIGlmIChpcyhGdW5jdGlvbikoZm4pKSB7XG4gICAgICAgICAgICB2YXIgaWQgPSBoYXNoMzIoKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXJzLnNldChpZCwgZm4pO1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcignVHlwZSBFcnJvcjogc3Vic2NyaWJlciBzaG91bGQgYmUgb2YgdHlwZSBGdW5jdGlvbicpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRhdGEudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgaWYgKHN1YnNjcmliZXJzLmhhcyhpZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWJzY3JpYmVycy5kZWxldGUoaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcignVHlwZSBFcnJvcjogc3Vic2NyaWJlciBzaG91bGQgYmUgb2YgdHlwZSBGdW5jdGlvbicpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gZGF0YTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJveHIoZGF0YSwgX3N1YnNjcmliZXJzKSB7XG4gICAgdmFyIGlzUm9vdCA9ICFfc3Vic2NyaWJlcnM7XG4gICAgdmFyIHN1YnNjcmliZXJzID0gX3N1YnNjcmliZXJzID8gX3N1YnNjcmliZXJzIDogbmV3IE1hcCgpO1xuICAgIHZhciBfaGFuZGxlciA9IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRba2V5XTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodGFyZ2V0LCBrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gbnVsbCwgb2xkVmFsdWUgPSBudWxsLCBhY3Rpb25EYXRhID0ge307XG4gICAgICAgICAgICBpZiAoIXRhcmdldFtrZXldKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uID0gJ05FVyc7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBpc1N0cmluZyh2YWx1ZSkgPyB2YWx1ZSA6IHByb3hyKHZhbHVlLCBzdWJzY3JpYmVycyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGlvbiA9ICdVUERBVEUnO1xuICAgICAgICAgICAgICAgIG9sZFZhbHVlID0gdGFyZ2V0W2tleV07XG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbHVlID09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvIG5vdGhpbmcgaWYgdGhlIHZhbHVlIGFyZSBzYW1lXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWN0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAnYWN0aW9uJzogYWN0aW9uLFxuICAgICAgICAgICAgICAgICdhY3Rpb25Sb290JzogdGFyZ2V0LFxuICAgICAgICAgICAgICAgICdrZXknOiBrZXksXG4gICAgICAgICAgICAgICAgJ3ZhbHVlJzogdmFsdWVcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25EYXRhLm9sZFZhbHVlID0gb2xkVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub3RpZnkoYWN0aW9uRGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W2tleV07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbm90aWZ5KGRhdGEpIHtcbiAgICAgICAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIGZuKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkYXRhID0gbmV3IFByb3h5KF9wcm94eU9iamVjdFByb3BlcnR5KGRhdGEsIHN1YnNjcmliZXJzKSwgX2hhbmRsZXIpO1xuXG4gICAgcmV0dXJuIGlzUm9vdCA/IF9fcHVic3ViX18oZGF0YSwgc3Vic2NyaWJlcnMpIDogZGF0YTtcbn0iLCJpbXBvcnQgaXMgZnJvbSAnLi9pcy5qcyc7XG5cbmNvbnN0IGlzQXJyYXkgPSB0YXJnZXQgPT4gaXMoQXJyYXkpKHRhcmdldCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJyYXk7IiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuY29uc3QgaXNEYXRlID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xuXG5leHBvcnQgZGVmYXVsdCBpc0RhdGU7IiwiaW1wb3J0IGlzIGZyb20gJy4vaXMuanMnO1xuXG5jb25zdCBpc0Z1bmN0aW9uID0gdGFyZ2V0ID0+IGlzKEZ1bmN0aW9uKSh0YXJnZXQpO1xuXG5leHBvcnQgZGVmYXVsdCBpc0Z1bmN0aW9uOyIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmNvbnN0IGlzTmFOID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgTmFOXSc7XG5cbmV4cG9ydCBkZWZhdWx0IGlzTmFOOyIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmNvbnN0IGlzTnVsbCA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IE51bGxdJztcblxuZXhwb3J0IGRlZmF1bHQgaXNOdWxsOyIsImltcG9ydCBpcyBmcm9tICcuL2lzLmpzJztcblxuY29uc3QgaXNOdW1iZXIgPSB0YXJnZXQgPT4gaXMoTnVtYmVyKSh0YXJnZXQpO1xuXG5leHBvcnQgZGVmYXVsdCBpc051bWJlcjsiLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5jb25zdCBpc1Byb21pc2UgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBQcm9taXNlXSc7XG5cbmV4cG9ydCBkZWZhdWx0IGlzUHJvbWlzZTsiLCJpbXBvcnQgaXMgZnJvbSAnLi9pcy5qcyc7XG5jb25zdCBpc1JlZ2V4ID0gdGFyZ2V0ID0+IGlzKFJlZ0V4cCkodGFyZ2V0KTtcblxuZXhwb3J0IGRlZmF1bHQgaXNSZWdleDsiLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5jb25zdCBpc1N5bWJvbCA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG5leHBvcnQgZGVmYXVsdCBpc1N5bWJvbDsiLCJcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmNvbnN0IGlzVW5kZWZpbmVkID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbmV4cG9ydCBkZWZhdWx0IGlzVW5kZWZpbmVkOyJdLCJuYW1lcyI6WyJjdXJyeU4iLCJmbiIsImxlbmd0aCIsImFyZ3VtZW50cyIsImJpbmQiLCJkZWJ1ZyIsInRleHQiLCJ3aW5kb3ciLCJwZXJmb3JtYW5jZSIsIm5vdyIsInRvRml4ZWQiLCJsb2ciLCJEYXRlIiwiZmlsbGVyIiwicGlwZTIiLCJmbjEiLCJmbjIiLCJjYWxsIiwiYXBwbHkiLCJpcyIsInR5cGUiLCJ0YXJnZXQiLCJPYmplY3QiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwicGlwZU4iLCJpc0FzeW5jIiwicHJvdG90eXBlIiwic2hpZnQiLCJhcmdzIiwiaSIsImxhc3RSZXN1bHQiLCJfcGlwZTIiLCJzeW5jUGlwZTIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInRoZW4iLCJkYXRhIiwiY2F0Y2giLCJzeW5jUGlwZU4iLCJ1bnNoaWZ0IiwicmFuZG9tVG9rZW4iLCJoYXNoIiwibGFuZ3VhZ2UiLCJvZmZzZXQiLCJjaGFyQXQiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJ0b1N0cmluZyIsImlzT2JqZWN0IiwiaXNTdHJpbmciLCJTdHJpbmciLCJoYXNoMzIiLCJfcHJveHlPYmplY3RQcm9wZXJ0eSIsInN1YnNjcmliZXJzIiwia2V5IiwicHJveHIiLCJfX3B1YnN1Yl9fIiwic3Vic2NyaWJlIiwiRnVuY3Rpb24iLCJpZCIsInNldCIsIkVycm9yIiwidW5zdWJzY3JpYmUiLCJoYXMiLCJkZWxldGUiLCJfc3Vic2NyaWJlcnMiLCJpc1Jvb3QiLCJNYXAiLCJfaGFuZGxlciIsImdldCIsInZhbHVlIiwiYWN0aW9uIiwib2xkVmFsdWUiLCJhY3Rpb25EYXRhIiwibm90aWZ5IiwiZm9yRWFjaCIsIlByb3h5IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiaXNGdW5jdGlvbiIsImlzTmFOIiwiaXNOdWxsIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc1Byb21pc2UiLCJpc1JlZ2V4IiwiUmVnRXhwIiwiaXNTeW1ib2wiLCJpc1VuZGVmaW5lZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBZSxTQUFTQSxNQUFULENBQWdCQyxFQUFoQixFQUFvQjtXQUN4QixZQUFZO1lBQ1hBLEdBQUdDLE1BQUgsSUFBYUMsVUFBVUQsTUFBM0IsRUFDSSxPQUFPRCxHQUFHLEdBQUdFLFNBQU4sQ0FBUCxDQURKLEtBR0ksT0FBT0YsR0FBR0csSUFBSCxDQUFRLElBQVIsRUFBYyxHQUFHRCxTQUFqQixDQUFQO0tBSlI7OztBQ0RXLFNBQVNF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
