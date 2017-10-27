//  Fluxi v1.1.1
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmx1eGkuanMiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9jdXJyeS5qcyIsIi4uL3NvdXJjZS9kZWJ1Zy5qcyIsIi4uL3NvdXJjZS9maWxsZXIuanMiLCIuLi9zb3VyY2UvcGlwZTIuanMiLCIuLi9zb3VyY2UvaXMuanMiLCIuLi9zb3VyY2UvaXNCb29sZWFuLmpzIiwiLi4vc291cmNlL3N5bmNQaXBlMi5qcyIsIi4uL3NvdXJjZS9waXBlTi5qcyIsIi4uL3NvdXJjZS9zeW5jUGlwZU4uanMiLCIuLi9zb3VyY2UvcmFuZG9tVG9rZW4uanMiLCIuLi9zb3VyY2UvaXNPYmplY3QuanMiLCIuLi9zb3VyY2UvaXNTdHJpbmcuanMiLCIuLi9zb3VyY2UvcHJveHIuanMiLCIuLi9zb3VyY2UvaXNBcnJheS5qcyIsIi4uL3NvdXJjZS9pc0RhdGUuanMiLCIuLi9zb3VyY2UvaXNGdW5jdGlvbi5qcyIsIi4uL3NvdXJjZS9pc05hTi5qcyIsIi4uL3NvdXJjZS9pc051bGwuanMiLCIuLi9zb3VyY2UvaXNOdW1iZXIuanMiLCIuLi9zb3VyY2UvaXNQcm9taXNlLmpzIiwiLi4vc291cmNlL2lzUmVnZXguanMiLCIuLi9zb3VyY2UvaXNTeW1ib2wuanMiLCIuLi9zb3VyY2UvaXNVbmRlZmluZWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3VycnlOKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZuLmxlbmd0aCA9PSBhcmd1bWVudHMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIGZuKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBmbi5iaW5kKG51bGwsIC4uLmFyZ3VtZW50cyk7XG4gICAgfTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWJ1Zyh0ZXh0KSB7XG4gICAgaWYgKHdpbmRvdy5wZXJmb3JtYW5jZSkge1xuICAgICAgICB2YXIgbm93ID0gKHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSAvIDEwMDApLnRvRml4ZWQoMyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCcgOiAnK25vdyArICc6ICcgKyB0ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhEYXRlKCkrJyA6ICcrdGV4dCk7XG4gICAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbGxlcigpe1xuICAgIHJldHVybiAnX19FTVBUWV9fJztcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwaXBlMihmbjEsIGZuMikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmbjIuY2FsbCh0aGlzLCBmbjEuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfTtcbn0iLCIvKipcbiAqIExlZ2FjeSBtZXRob2RzIGFuZCBwcml2YXRlIG1ldGhvZHMgYXJlIHByZWZpeGVkIHdpdGggXyh1bmRlcnNjb3JlKS5cbiAqL1xuXG5jb25zdCBpcyA9IHR5cGUgPT4gdGFyZ2V0ID0+IE9iamVjdCh0YXJnZXQpIGluc3RhbmNlb2YgdHlwZTtcblxuZXhwb3J0IGRlZmF1bHQgaXM7XG4iLCJpbXBvcnQgaXMgZnJvbSAnLi9pcy5qcyc7XG5cbmNvbnN0IGlzQm9vbGVhbiA9IHRhcmdldCA9PiBpcyhCb29sZWFuKSh0YXJnZXQpO1xuXG5leHBvcnQgZGVmYXVsdCBpc0Jvb2xlYW47IiwiLyoqXG4gKiBcbiAqIFVzYWdlOiBTeW5jaHJvbm91cyBwaXBlIHdpbGwgd29ya3MgZXhhY2x5IGFzIHlvdSB0aGlua1xuICogICAgICAgICAgdGhhdCB0aGlzIHdpbGwgd2FpdCBmb3IgZWFjaCBhY3Rpb24gdG8gZ2V0IGNvbXBsZXRlZFxuICogXG4gKiB2YXIgam9pbkFjdGlvbnMgPSBzeW5jUGlwZTIodGltZXIxLHRpbWVyMix0aW1lcjMpO1xuICogXG4gKiBqb2luQWN0aW9ucygpIC8vICAgICAtPiB5b3UgY2FuIGVpdGhlciBqdXN0IGluaXRhdGUgdGhlIGFjdGlvblxuICogXG4gKiBqb2luQWN0aW9ucygpLnRoZW4oICAvLyAtPiBBZGQgYSBsaXN0ZW5lciB0byBnZXQgdGhlIGNvbXBsZXRlZCBzdGF0dXNcbiAqICAgICAgZnVuY3Rpb24oKXtcbiAqICAgICAgY29uc29sZS5sb2coXCJDb21wbGV0ZWQhXCIpXG4gKiB9KTtcbiAqIFxuICogQHBhcmFtIHsqRnVuY3Rpb259IGZuMSBcbiAqIEBwYXJhbSB7KkZ1bmN0aW9ufSBmbjIgXG4gKiBcbiAqIEByZXR1cm4gUHJvbWlzZVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN5bmNQaXBlMihmbjEsIGZuMikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBmbjEuYXBwbHkodGhpcywgYXJndW1lbnRzKS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZm4yLmNhbGwodGhpcywgZGF0YSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgICAgIHJldHVybiBmbjI7XG4gICAgICAgIH0pO1xuICAgIH07XG59IiwiLyoqXG4gKiBcbiAqIFVzYWdlOiBBc3ljaHJvbm91cyBwaXBlIHdoaWNoIGp1c3QgYmlsZHMgbXVsdGlwbGVcbiAqICAgICAgICAgIEZ1bmN0aW9ucyB0byBvbmUgYW5kIHdhaXQgZm9yIGNvbW1hbmRcbiAqIFxuICogdmFyIGpvaW5BY3Rpb25zID0gcGlwZU4oYWRkT25lLCBhZGRUd28sIGFkZFRocmVlKTtcbiAqIGpvaW5BY3Rpb25zKCk7XG4gKiBcbiAqIEBwYXJhbSB7KkZ1bmN0aW9ufSBmbjEgXG4gKiBAcGFyYW0geypGdW5jdGlvbn0gZm4yIFxuICogXG4gKiBAcmV0dXJuIFByb21pc2VcbiAqL1xuXG5cbmltcG9ydCBwaXBlMiBmcm9tICcuL3BpcGUyJztcbmltcG9ydCBpc0Jvb2xlYW4gZnJvbSAnLi9pc0Jvb2xlYW4nO1xuaW1wb3J0IHN5bmNQaXBlMiBmcm9tICcuL3N5bmNQaXBlMic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBpcGVOKCkge1xuICAgIHZhciBpc0FzeW5jO1xuICAgIGlmIChpc0Jvb2xlYW4oYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBpc0FzeW5jID0gYXJndW1lbnRzWzBdO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmd1bWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlzQXN5bmMgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgdmFyIGxhc3RSZXN1bHQgPSBhcmd1bWVudHNbMF07XG4gICAgdmFyIF9waXBlMiA9IGlzQXN5bmMgPyBwaXBlMiA6IHN5bmNQaXBlMjtcbiAgICBpZiAobGVuZ3RoID09IDEpXG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgaWYgKGxlbmd0aCA9PSAyKVxuICAgICAgICByZXR1cm4gKF9waXBlMihhcmdzWzBdLCBhcmdzWzFdKSk7XG4gICAgZm9yICg7IGkgPCBsZW5ndGggLSAxOykge1xuICAgICAgICBsYXN0UmVzdWx0ID0gX3BpcGUyKGxhc3RSZXN1bHQsIGFyZ3NbaSArIDFdKTtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiBsYXN0UmVzdWx0O1xufSIsImltcG9ydCBwaXBlTiBmcm9tICcuL3BpcGVOJztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN5bmNQaXBlTigpIHtcbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3VtZW50cywgZmFsc2UpO1xuICAgIHJldHVybiBwaXBlTi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJhbmRvbVRva2VuKGxlbmd0aCkge1xuICAgIHZhciBoYXNoID0gJyc7XG4gICAgdmFyIGxhbmd1YWdlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Xy0nO1xuXG4gICAgZm9yICh2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgbGVuZ3RoOyBvZmZzZXQrKylcbiAgICAgICAgaGFzaCArPSBsYW5ndWFnZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGFuZ3VhZ2UubGVuZ3RoKSk7XG5cbiAgICByZXR1cm4gaGFzaDtcbn0iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgaXNPYmplY3QgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBPYmplY3RdJztcbmV4cG9ydCBkZWZhdWx0IGlzT2JqZWN0OyIsImltcG9ydCBpcyBmcm9tICcuL2lzLmpzJztcbmNvbnN0IGlzU3RyaW5nID0gdGFyZ2V0ID0+IGlzKFN0cmluZykodGFyZ2V0KTtcblxuZXhwb3J0IGRlZmF1bHQgaXNTdHJpbmc7IiwiaW1wb3J0IGlzIGZyb20gJy4vaXMnO1xuaW1wb3J0IHJhbmRvbVRva2VuIGZyb20gJy4vcmFuZG9tVG9rZW4nO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QnO1xuaW1wb3J0IGlzU3RyaW5nIGZyb20gJy4vaXNTdHJpbmcnO1xuXG52YXIgaGFzaDMyID0gKCkgPT4gcmFuZG9tVG9rZW4oMzIpO1xuXG5mdW5jdGlvbiBfcHJveHlPYmplY3RQcm9wZXJ0eShkYXRhLCBzdWJzY3JpYmVycykge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICAgIGlmIChpc09iamVjdChkYXRhW2tleV0pKSB7XG4gICAgICAgICAgICBkYXRhW2tleV0gPSBwcm94cihkYXRhW2tleV0sIHN1YnNjcmliZXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBfX3B1YnN1Yl9fKGRhdGEsIHN1YnNjcmliZXJzKSB7XG4gICAgZGF0YS5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgaWYgKGlzKEZ1bmN0aW9uKShmbikpIHtcbiAgICAgICAgICAgIHZhciBpZCA9IGhhc2gzMigpO1xuICAgICAgICAgICAgc3Vic2NyaWJlcnMuc2V0KGlkLCBmbik7XG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKCdUeXBlIEVycm9yOiBzdWJzY3JpYmVyIHNob3VsZCBiZSBvZiB0eXBlIEZ1bmN0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZGF0YS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBpZiAoc3Vic2NyaWJlcnMuaGFzKGlkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1YnNjcmliZXJzLmRlbGV0ZShpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKCdUeXBlIEVycm9yOiBzdWJzY3JpYmVyIHNob3VsZCBiZSBvZiB0eXBlIEZ1bmN0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBkYXRhO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcm94cihkYXRhLCBfc3Vic2NyaWJlcnMpIHtcbiAgICB2YXIgaXNSb290ID0gIV9zdWJzY3JpYmVycztcbiAgICB2YXIgc3Vic2NyaWJlcnMgPSBfc3Vic2NyaWJlcnMgPyBfc3Vic2NyaWJlcnMgOiBuZXcgTWFwKCk7XG4gICAgdmFyIF9oYW5kbGVyID0ge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCh0YXJnZXQsIGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtrZXldO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh0YXJnZXQsIGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBudWxsLCBvbGRWYWx1ZSA9IG51bGwsIGFjdGlvbkRhdGEgPSB7fTtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0W2tleV0pIHtcbiAgICAgICAgICAgICAgICBhY3Rpb24gPSAnTkVXJztcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IGlzU3RyaW5nKHZhbHVlKSA/IHZhbHVlIDogcHJveHIodmFsdWUsIHN1YnNjcmliZXJzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uID0gJ1VQREFURSc7XG4gICAgICAgICAgICAgICAgb2xkVmFsdWUgPSB0YXJnZXRba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAob2xkVmFsdWUgPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRG8gbm90aGluZyBpZiB0aGUgdmFsdWUgYXJlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhY3Rpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICdhY3Rpb24nOiBhY3Rpb24sXG4gICAgICAgICAgICAgICAgJ2FjdGlvblJvb3QnOiB0YXJnZXQsXG4gICAgICAgICAgICAgICAgJ2tleSc6IGtleSxcbiAgICAgICAgICAgICAgICAndmFsdWUnOiB2YWx1ZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PSAndXBkYXRlJykge1xuICAgICAgICAgICAgICAgIGFjdGlvbkRhdGEub2xkVmFsdWUgPSBvbGRWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vdGlmeShhY3Rpb25EYXRhKTtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRba2V5XTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBub3RpZnkoZGF0YSkge1xuICAgICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgZm4oZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRhdGEgPSBuZXcgUHJveHkoX3Byb3h5T2JqZWN0UHJvcGVydHkoZGF0YSwgc3Vic2NyaWJlcnMpLCBfaGFuZGxlcik7XG5cbiAgICByZXR1cm4gaXNSb290ID8gX19wdWJzdWJfXyhkYXRhLCBzdWJzY3JpYmVycykgOiBkYXRhO1xufSIsImltcG9ydCBpcyBmcm9tICcuL2lzLmpzJztcblxuY29uc3QgaXNBcnJheSA9IHRhcmdldCA9PiBpcyhBcnJheSkodGFyZ2V0KTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcnJheTsiLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5jb25zdCBpc0RhdGUgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBEYXRlXSc7XG5cbmV4cG9ydCBkZWZhdWx0IGlzRGF0ZTsiLCJpbXBvcnQgaXMgZnJvbSAnLi9pcy5qcyc7XG5cbmNvbnN0IGlzRnVuY3Rpb24gPSB0YXJnZXQgPT4gaXMoRnVuY3Rpb24pKHRhcmdldCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzRnVuY3Rpb247IiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuY29uc3QgaXNOYU4gPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBOYU5dJztcblxuZXhwb3J0IGRlZmF1bHQgaXNOYU47IiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuY29uc3QgaXNOdWxsID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgTnVsbF0nO1xuXG5leHBvcnQgZGVmYXVsdCBpc051bGw7IiwiaW1wb3J0IGlzIGZyb20gJy4vaXMuanMnO1xuXG5jb25zdCBpc051bWJlciA9IHRhcmdldCA9PiBpcyhOdW1iZXIpKHRhcmdldCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzTnVtYmVyOyIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmNvbnN0IGlzUHJvbWlzZSA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IFByb21pc2VdJztcblxuZXhwb3J0IGRlZmF1bHQgaXNQcm9taXNlOyIsImltcG9ydCBpcyBmcm9tICcuL2lzLmpzJztcbmNvbnN0IGlzUmVnZXggPSB0YXJnZXQgPT4gaXMoUmVnRXhwKSh0YXJnZXQpO1xuXG5leHBvcnQgZGVmYXVsdCBpc1JlZ2V4OyIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmNvbnN0IGlzU3ltYm9sID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbmV4cG9ydCBkZWZhdWx0IGlzU3ltYm9sOyIsIlxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuY29uc3QgaXNVbmRlZmluZWQgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuZXhwb3J0IGRlZmF1bHQgaXNVbmRlZmluZWQ7Il0sIm5hbWVzIjpbImN1cnJ5TiIsImZuIiwibGVuZ3RoIiwiYXJndW1lbnRzIiwiYmluZCIsImRlYnVnIiwidGV4dCIsIndpbmRvdyIsInBlcmZvcm1hbmNlIiwibm93IiwidG9GaXhlZCIsImxvZyIsIkRhdGUiLCJmaWxsZXIiLCJwaXBlMiIsImZuMSIsImZuMiIsImNhbGwiLCJhcHBseSIsImlzIiwidHlwZSIsInRhcmdldCIsIk9iamVjdCIsImlzQm9vbGVhbiIsIkJvb2xlYW4iLCJzeW5jUGlwZTIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInRoZW4iLCJkYXRhIiwiY2F0Y2giLCJwaXBlTiIsImlzQXN5bmMiLCJwcm90b3R5cGUiLCJzaGlmdCIsImFyZ3MiLCJpIiwibGFzdFJlc3VsdCIsIl9waXBlMiIsInN5bmNQaXBlTiIsInVuc2hpZnQiLCJyYW5kb21Ub2tlbiIsImhhc2giLCJsYW5ndWFnZSIsIm9mZnNldCIsImNoYXJBdCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsInRvU3RyaW5nIiwiaXNPYmplY3QiLCJpc1N0cmluZyIsIlN0cmluZyIsImhhc2gzMiIsIl9wcm94eU9iamVjdFByb3BlcnR5Iiwic3Vic2NyaWJlcnMiLCJrZXkiLCJwcm94ciIsIl9fcHVic3ViX18iLCJzdWJzY3JpYmUiLCJGdW5jdGlvbiIsImlkIiwic2V0IiwiRXJyb3IiLCJ1bnN1YnNjcmliZSIsImhhcyIsImRlbGV0ZSIsIl9zdWJzY3JpYmVycyIsImlzUm9vdCIsIk1hcCIsIl9oYW5kbGVyIiwiZ2V0IiwidmFsdWUiLCJhY3Rpb24iLCJvbGRWYWx1ZSIsImFjdGlvbkRhdGEiLCJub3RpZnkiLCJmb3JFYWNoIiwiUHJveHkiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJpc0Z1bmN0aW9uIiwiaXNOYU4iLCJpc051bGwiLCJpc051bWJlciIsIk51bWJlciIsImlzUHJvbWlzZSIsImlzUmVnZXgiLCJSZWdFeHAiLCJpc1N5bWJvbCIsImlzVW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFlLFNBQVNBLE1BQVQsQ0FBZ0JDLEVBQWhCLEVBQW9CO1dBQ3hCLFlBQVk7WUFDWEEsR0FBR0MsTUFBSCxJQUFhQyxVQUFVRCxNQUEzQixFQUNJLE9BQU9ELEdBQUcsR0FBR0UsU0FBTixDQUFQLENBREosS0FHSSxPQUFPRixHQUFHRyxJQUFILENBQVEsSUFBUixF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
