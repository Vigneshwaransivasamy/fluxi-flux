(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.fluxi = factory());
}(this, (function () { 'use strict';

function curryN(fn) {
	return function () {
		if (fn.length == arguments.length) return fn.apply(undefined, arguments);else return fn.bind.apply(fn, [null].concat(Array.prototype.slice.call(arguments)));
	};
}

function debug(text) {
  var from = arguments.callee.caller.name;
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log("From : " + from + " : " + now + ": " + text);
  } else {
    console.log("From : " + from + " : " + text);
  }
}

function filler() {
    return "__EMPTY__";
}

function pipe2(fn1, fn2) {
  return function () {
    return fn2.call(this, fn1.apply(this, arguments));
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
        var _this = this,
            _arguments = arguments;

        return new Promise(function (resolve, reject) {
            fn1.apply(_this, _arguments).then(function (data) {
                resolve(fn2.call(this, data));
            });
            return fn2;
        });
    };
}

function syncPipeN() {
  Array.prototype.unshift.call(arguments, false);
  return pipeN.apply(this, arguments);
}

/**
 * Legacy methods and private methods are prefixed with _(underscore).
 */
var is = function is(type) {
  return function (target) {
    return Object(target) instanceof type;
  };
};

var isObject = function isObject(target) {
  return toString.call(target) === '[object Object]';
};

var isDate = function isDate(target) {
  return toString.call(target) === '[object Date]';
};

var isPromise = function isPromise(target) {
  return toString.call(target) === '[object Promise]';
};

var isSymbol = function isSymbol(target) {
  return toString.call(target) === '[object Symbol]';
};

var isNaN = function isNaN(target) {
  return toString.call(target) === '[object NaN]';
};

var isNull = function isNull(target) {
  return toString.call(target) === '[object Null]';
};

var isUndefined = function isUndefined(target) {
  return toString.call(target) === '[object Undefined]';
};

var isArray = function isArray(target) {
  return is(Array)(target);
};

var isBoolean$1 = function isBoolean(target) {
  return is(Boolean)(target);
};

var isFunction = function isFunction(target) {
  return is(Function)(target);
};

var isNumber = function isNumber(target) {
  return is(Number)(target);
};

var isRegex = function isRegex(target) {
  return is(RegExp)(target);
};

var isString = function isString(target) {
  return is(String)(target);
};

var typers = Object.freeze({
	default: is,
	isObject: isObject,
	isDate: isDate,
	isPromise: isPromise,
	isSymbol: isSymbol,
	isNaN: isNaN,
	isNull: isNull,
	isUndefined: isUndefined,
	isArray: isArray,
	isBoolean: isBoolean$1,
	isFunction: isFunction,
	isNumber: isNumber,
	isRegex: isRegex,
	isString: isString
});

function randomToken(length) {
  var hash = "";
  var language = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

  for (var offset = 0; offset < length; offset++) {
    hash += language.charAt(Math.floor(Math.random() * language.length));
  }return hash;
}

var hash32 = function hash32() {
    return randomToken(32);
};

function proxr(data) {
    var subscribers = new Map();
    var _handler = {
        get: function get(target, key) {
            return target[key];
        },
        set: function set(target, key, value) {
            var action = 'update';
            if (!target[key]) {
                action = 'add';
                target[key] = _proxy(value);
            } else {
                target[key] = value;
            }

            notify({
                'action': action,
                'key': key,
                'value': value
            });
            return target[key];
        }
    };
    function notify(data) {
        subscribers.forEach(function (fn) {
            fn(data);
        });
    }
    data.subscribe = function (fn) {
        if (is(Function)(fn)) {
            var id = hash32();
            subscribers.set(id, fn);
            return id;
        } else {
            return new Error("Type Error: subscriber should be of type Function");
        }
    };

    data.unsubscribe = function (id) {
        if (subscribers.has(id)) {
            return subscribers.delete(id);
        } else {
            return new Error("Type Error: subscriber should be of type Function");
        }
    };
    data = new Proxy(data, _handler);
    return data;
}

var core = Object.assign({}, {
    curry: curryN,
    debug: debug,
    filler: filler,
    pipe2: pipe2,
    pipeN: pipeN,
    syncPipe2: syncPipe2$1,
    syncPipeN: syncPipeN,
    proxr: proxr
}, typers);

/**
 * fluxi a functional programming style, library which aids in creating functional
 * pipelines
 * @module fluxi
 * @memberOf Fluxi
 * @since v0.0.1
 * @return {Object}
 * @author Vigneshwaran Sivasamy
 */

console.log(core);

return core;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmx1eGkuanMiLCJzb3VyY2VzIjpbIi4uL2NvcmUvY3VycnkubWpzIiwiLi4vY29yZS9kZWJ1Zy5tanMiLCIuLi9jb3JlL2ZpbGxlci5tanMiLCIuLi9jb3JlL3BpcGUyLm1qcyIsIi4uL2NvcmUvcGlwZU4ubWpzIiwiLi4vY29yZS9zeW5jUGlwZTIubWpzIiwiLi4vY29yZS9zeW5jUGlwZU4ubWpzIiwiLi4vY29yZS90eXBlQ2hlY2tlci5tanMiLCIuLi9jb3JlL3JhbmRvbVRva2VuLm1qcyIsIi4uL2NvcmUvcHJveHIubWpzIiwiLi4vY29yZS9pbmRleC5tanMiLCIuLi9pbmRleC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3VycnlOKGZuKXtcblx0cmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICBpZihmbi5sZW5ndGggPT0gYXJndW1lbnRzLmxlbmd0aCkgIFxuICAgICAgICByZXR1cm4gZm4oLi4uYXJndW1lbnRzKTtcblx0ICBlbHNlICAgIFxuXHQgICAgcmV0dXJuIGZuLmJpbmQobnVsbCwuLi5hcmd1bWVudHMpOyAgIFxuXHR9XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVidWcodGV4dCkge1xuICB2YXIgZnJvbSA9IGFyZ3VtZW50cy5jYWxsZWUuY2FsbGVyLm5hbWU7XG4gIGlmICh3aW5kb3cucGVyZm9ybWFuY2UpIHtcbiAgICB2YXIgbm93ID0gKHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSAvIDEwMDApLnRvRml4ZWQoMyk7XG4gICAgY29uc29sZS5sb2coXCJGcm9tIDogXCIrZnJvbStcIiA6IFwiK25vdyArIFwiOiBcIiArIHRleHQpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiRnJvbSA6IFwiK2Zyb20rXCIgOiBcIit0ZXh0KTtcbiAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbGxlcigpe1xuICAgIHJldHVybiBcIl9fRU1QVFlfX1wiO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBpcGUyKGZuMSwgZm4yKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZuMi5jYWxsKHRoaXMsIGZuMS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfTtcbn07IiwiLyoqXG4gKiBcbiAqIFVzYWdlOiBBc3ljaHJvbm91cyBwaXBlIHdoaWNoIGp1c3QgYmlsZHMgbXVsdGlwbGVcbiAqICAgICAgICAgIEZ1bmN0aW9ucyB0byBvbmUgYW5kIHdhaXQgZm9yIGNvbW1hbmRcbiAqIFxuICogdmFyIGpvaW5BY3Rpb25zID0gcGlwZU4oYWRkT25lLCBhZGRUd28sIGFkZFRocmVlKTtcbiAqIGpvaW5BY3Rpb25zKCk7XG4gKiBcbiAqIEBwYXJhbSB7KkZ1bmN0aW9ufSBmbjEgXG4gKiBAcGFyYW0geypGdW5jdGlvbn0gZm4yIFxuICogXG4gKiBAcmV0dXJuIFByb21pc2VcbiAqL1xuXG5cbmltcG9ydCBwaXBlMiBmcm9tICcuL3BpcGUyLm1qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBpcGVOKCkge1xuICB2YXIgaXNBc3luYztcbiAgaWYgKGlzQm9vbGVhbihhcmd1bWVudHNbMF0pKSB7XG4gICAgICBpc0FzeW5jID0gYXJndW1lbnRzWzBdO1xuICAgICAgQXJyYXkucHJvdG90eXBlLnNoaWZ0LmNhbGwoYXJndW1lbnRzKTtcbiAgfSBlbHNlIHtcbiAgICAgIGlzQXN5bmMgPSB0cnVlO1xuICB9XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgaSA9IDA7XG4gIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICB2YXIgbGFzdFJlc3VsdCA9IGFyZ3VtZW50c1swXTtcbiAgdmFyIF9waXBlMiA9IGlzQXN5bmMgPyBwaXBlMiA6IHN5bmNQaXBlMjtcbiAgaWYgKGxlbmd0aCA9PSAxKVxuICAgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgaWYgKGxlbmd0aCA9PSAyKVxuICAgICAgcmV0dXJuIChfcGlwZTIoYXJnc1swXSwgYXJnc1sxXSkpXG4gIGZvciAoOyBpIDwgbGVuZ3RoIC0gMTspIHtcbiAgICAgIGxhc3RSZXN1bHQgPSBfcGlwZTIobGFzdFJlc3VsdCwgYXJnc1tpICsgMV0pO1xuICAgICAgaSsrO1xuICB9XG5cbiAgcmV0dXJuIGxhc3RSZXN1bHQ7XG59OyIsIi8qKlxuICogXG4gKiBVc2FnZTogU3luY2hyb25vdXMgcGlwZSB3aWxsIHdvcmtzIGV4YWNseSBhcyB5b3UgdGhpbmtcbiAqICAgICAgICAgIHRoYXQgdGhpcyB3aWxsIHdhaXQgZm9yIGVhY2ggYWN0aW9uIHRvIGdldCBjb21wbGV0ZWRcbiAqIFxuICogdmFyIGpvaW5BY3Rpb25zID0gc3luY1BpcGUyKHRpbWVyMSx0aW1lcjIsdGltZXIzKTtcbiAqIFxuICogam9pbkFjdGlvbnMoKSAvLyAgICAgLT4geW91IGNhbiBlaXRoZXIganVzdCBpbml0YXRlIHRoZSBhY3Rpb25cbiAqIFxuICogam9pbkFjdGlvbnMoKS50aGVuKCAgLy8gLT4gQWRkIGEgbGlzdGVuZXIgdG8gZ2V0IHRoZSBjb21wbGV0ZWQgc3RhdHVzXG4gKiAgICAgIGZ1bmN0aW9uKCl7XG4gKiAgICAgIGNvbnNvbGUubG9nKFwiQ29tcGxldGVkIVwiKVxuICogfSk7XG4gKiBcbiAqIEBwYXJhbSB7KkZ1bmN0aW9ufSBmbjEgXG4gKiBAcGFyYW0geypGdW5jdGlvbn0gZm4yIFxuICogXG4gKiBAcmV0dXJuIFByb21pc2VcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzeW5jUGlwZTIoZm4xLCBmbjIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgZm4xLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykudGhlbihcbiAgICAgICAgICAgICAgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoZm4yLmNhbGwodGhpcywgZGF0YSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gZm4yO1xuICAgICAgfSk7XG4gIH1cbn07IiwiaW1wb3J0IHBpcGVOIGZyb20gJy4vcGlwZU4ubWpzJztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN5bmNQaXBlTigpIHtcbiAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuY2FsbChhcmd1bWVudHMsIGZhbHNlKTtcbiAgcmV0dXJuIHBpcGVOLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59OyIsIi8qKlxuICogTGVnYWN5IG1ldGhvZHMgYW5kIHByaXZhdGUgbWV0aG9kcyBhcmUgcHJlZml4ZWQgd2l0aCBfKHVuZGVyc2NvcmUpLlxuICovXG52YXIgcFN0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbmNvbnN0IGlzID0gdHlwZSA9PiB0YXJnZXQgPT4gT2JqZWN0KHRhcmdldCkgaW5zdGFuY2VvZiB0eXBlO1xuXG5leHBvcnQgZGVmYXVsdCBpcztcblxuZXhwb3J0IGNvbnN0IGlzT2JqZWN0ID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbmV4cG9ydCBjb25zdCBpc0RhdGUgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBEYXRlXSc7XG5cbmV4cG9ydCBjb25zdCBpc1Byb21pc2UgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBQcm9taXNlXSc7XG5cbmV4cG9ydCBjb25zdCBpc1N5bWJvbCA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG5leHBvcnQgY29uc3QgaXNOYU4gPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBOYU5dJztcblxuZXhwb3J0IGNvbnN0IGlzTnVsbCA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IE51bGxdJztcblxuZXhwb3J0IGNvbnN0IGlzVW5kZWZpbmVkID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbmV4cG9ydCBjb25zdCBpc0FycmF5ID0gdGFyZ2V0ID0+IGlzKEFycmF5KSh0YXJnZXQpO1xuXG5leHBvcnQgY29uc3QgaXNCb29sZWFuID0gdGFyZ2V0ID0+IGlzKEJvb2xlYW4pKHRhcmdldCk7XG5cbmV4cG9ydCBjb25zdCBpc0Z1bmN0aW9uID0gdGFyZ2V0ID0+IGlzKEZ1bmN0aW9uKSh0YXJnZXQpO1xuXG5leHBvcnQgY29uc3QgaXNOdW1iZXIgPSB0YXJnZXQgPT4gaXMoTnVtYmVyKSh0YXJnZXQpO1xuXG5leHBvcnQgY29uc3QgaXNSZWdleCA9IHRhcmdldCA9PiBpcyhSZWdFeHApKHRhcmdldCk7XG5cbmV4cG9ydCBjb25zdCBpc1N0cmluZyA9IHRhcmdldCA9PiBpcyhTdHJpbmcpKHRhcmdldCk7IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmFuZG9tVG9rZW4obGVuZ3RoKSB7XG4gIHZhciBoYXNoID0gXCJcIjtcbiAgdmFyIGxhbmd1YWdlID0gXCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OV8tXCI7XG5cbiAgZm9yICh2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgbGVuZ3RoOyBvZmZzZXQrKylcbiAgICAgIGhhc2ggKz0gbGFuZ3VhZ2UuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxhbmd1YWdlLmxlbmd0aCkpO1xuXG4gIHJldHVybiBoYXNoO1xufTsiLCJpbXBvcnQgaXMgZnJvbSAnLi90eXBlQ2hlY2tlci5tanMnO1xuaW1wb3J0IHJhbmRvbVRva2VuIGZyb20gJy4vcmFuZG9tVG9rZW4ubWpzJztcblxudmFyIGhhc2gzMiA9ICgpID0+IHJhbmRvbVRva2VuKDMyKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJveHIoZGF0YSl7XG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSBuZXcgTWFwKCk7XG4gICAgbGV0IF9oYW5kbGVyID0ge1xuICAgICAgZ2V0KHRhcmdldCwga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFtrZXldO1xuICAgICAgfSxcbiAgICAgIHNldCh0YXJnZXQsIGtleSwgdmFsdWUpIHtcbiAgICAgICAgICBsZXQgYWN0aW9uID0gJ3VwZGF0ZSdcbiAgICAgICAgICBpZighdGFyZ2V0W2tleV0pe1xuICAgICAgICAgICAgICBhY3Rpb24gPSAnYWRkJztcbiAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBfcHJveHkodmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIG5vdGlmeShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAnYWN0aW9uJzphY3Rpb24sIFxuICAgICAgICAgICAgICAgICdrZXknOmtleSwgXG4gICAgICAgICAgICAgICAgJ3ZhbHVlJzp2YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFtrZXldO1xuICAgICAgfVxuICAgIH07XG4gICAgZnVuY3Rpb24gbm90aWZ5KGRhdGEpe1xuICAgICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uKGZuKXtcbiAgICAgICAgICAgIGZuKGRhdGEpO1xuICAgICAgICB9KVxuICAgIH07XG4gICAgZGF0YS5zdWJzY3JpYmUgPSBmdW5jdGlvbihmbil7XG4gICAgICAgIGlmKGlzKEZ1bmN0aW9uKShmbikpe1xuICAgICAgICAgICAgbGV0IGlkID0gaGFzaDMyKCk7XG4gICAgICAgICAgICBzdWJzY3JpYmVycy5zZXQoaWQsZm4pO1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcIlR5cGUgRXJyb3I6IHN1YnNjcmliZXIgc2hvdWxkIGJlIG9mIHR5cGUgRnVuY3Rpb25cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkYXRhLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24oaWQpe1xuICAgICAgICBpZihzdWJzY3JpYmVycy5oYXMoaWQpKXtcbiAgICAgICAgICAgIHJldHVybiBzdWJzY3JpYmVycy5kZWxldGUoaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcIlR5cGUgRXJyb3I6IHN1YnNjcmliZXIgc2hvdWxkIGJlIG9mIHR5cGUgRnVuY3Rpb25cIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGF0YSA9IG5ldyBQcm94eShkYXRhLCBfaGFuZGxlcik7XG4gICAgcmV0dXJuIGRhdGE7XG59IiwiaW1wb3J0IGN1cnJ5IGZyb20gJy4vY3VycnkubWpzJztcbmltcG9ydCBkZWJ1ZyBmcm9tICcuL2RlYnVnLm1qcyc7XG5pbXBvcnQgZmlsbGVyIGZyb20gJy4vZmlsbGVyLm1qcyc7XG5pbXBvcnQgcGlwZTIgZnJvbSAnLi9waXBlMi5tanMnO1xuaW1wb3J0IHBpcGVOIGZyb20gJy4vcGlwZU4ubWpzJztcbmltcG9ydCBzeW5jUGlwZTIgZnJvbSAnLi9zeW5jUGlwZTIubWpzJztcbmltcG9ydCBzeW5jUGlwZU4gZnJvbSAnLi9zeW5jUGlwZU4ubWpzJztcbmltcG9ydCAgcHJveHIgZnJvbSAnLi9wcm94ci5tanMnO1xuaW1wb3J0ICogYXMgdHlwZXJzIGZyb20gJy4vdHlwZUNoZWNrZXIubWpzJztcblxuXG5jb25zdCBjb3JlID0gT2JqZWN0LmFzc2lnbih7fSx7XG4gICAgY3VycnksXG4gICAgZGVidWcsXG4gICAgZmlsbGVyLFxuICAgIHBpcGUyLFxuICAgIHBpcGVOLFxuICAgIHN5bmNQaXBlMixcbiAgICBzeW5jUGlwZU4sXG4gICAgcHJveHJcbn0sdHlwZXJzKTtcblxuXG5leHBvcnQgZGVmYXVsdCBjb3JlOyIsIi8qKlxuICogZmx1eGkgYSBmdW5jdGlvbmFsIHByb2dyYW1taW5nIHN0eWxlLCBsaWJyYXJ5IHdoaWNoIGFpZHMgaW4gY3JlYXRpbmcgZnVuY3Rpb25hbFxuICogcGlwZWxpbmVzXG4gKiBAbW9kdWxlIGZsdXhpXG4gKiBAbWVtYmVyT2YgRmx1eGlcbiAqIEBzaW5jZSB2MC4wLjFcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhdXRob3IgVmlnbmVzaHdhcmFuIFNpdmFzYW15XG4gKi9cblxuXG5pbXBvcnQgZmx1eGkgZnJvbSAnLi9jb3JlL2luZGV4Lm1qcyc7XG4vKipcbiAqIFdyYXBwZWQgb3IgRmFjYWRlZCBtZXRob2RzIHdoaWNoIGlzIGdvaW5nIHB1YmxpY1xuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZsdXhpO1xuXG5jb25zb2xlLmxvZyhmbHV4aSk7XG4iXSwibmFtZXMiOlsiY3VycnlOIiwiZm4iLCJsZW5ndGgiLCJhcmd1bWVudHMiLCJiaW5kIiwiZGVidWciLCJ0ZXh0IiwiZnJvbSIsImNhbGxlZSIsImNhbGxlciIsIm5hbWUiLCJ3aW5kb3ciLCJwZXJmb3JtYW5jZSIsIm5vdyIsInRvRml4ZWQiLCJsb2ciLCJmaWxsZXIiLCJwaXBlMiIsImZuMSIsImZuMiIsImNhbGwiLCJhcHBseSIsInBpcGVOIiwiaXNBc3luYyIsImlzQm9vbGVhbiIsInByb3RvdHlwZSIsInNoaWZ0IiwiYXJncyIsImkiLCJsYXN0UmVzdWx0IiwiX3BpcGUyIiwic3luY1BpcGUyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ0aGVuIiwiZGF0YSIsInN5bmNQaXBlTiIsInVuc2hpZnQiLCJpcyIsIk9iamVjdCIsInRhcmdldCIsInR5cGUiLCJpc09iamVjdCIsInRvU3RyaW5nIiwiaXNEYXRlIiwiaXNQcm9taXNlIiwiaXNTeW1ib2wiLCJpc05hTiIsImlzTnVsbCIsImlzVW5kZWZpbmVkIiwiaXNBcnJheSIsIkFycmF5IiwiQm9vbGVhbiIsImlzRnVuY3Rpb24iLCJGdW5jdGlvbiIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNSZWdleCIsIlJlZ0V4cCIsImlzU3RyaW5nIiwiU3RyaW5nIiwicmFuZG9tVG9rZW4iLCJoYXNoIiwibGFuZ3VhZ2UiLCJvZmZzZXQiLCJjaGFyQXQiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJoYXNoMzIiLCJwcm94ciIsInN1YnNjcmliZXJzIiwiTWFwIiwiX2hhbmRsZXIiLCJrZXkiLCJ2YWx1ZSIsImFjdGlvbiIsIl9wcm94eSIsIm5vdGlmeSIsImZvckVhY2giLCJzdWJzY3JpYmUiLCJpZCIsInNldCIsIkVycm9yIiwidW5zdWJzY3JpYmUiLCJoYXMiLCJkZWxldGUiLCJQcm94eSIsImNvcmUiLCJhc3NpZ24iLCJ0eXBlcnMiLCJjb25zb2xlIiwiZmx1eGkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFlLFNBQVNBLE1BQVQsQ0FBZ0JDLEVBQWhCLEVBQW1CO1FBQzFCLFlBQVU7TUFDVEEsR0FBR0MsTUFBSCxJQUFhQyxVQUFVRCxNQUExQixFQUNFLE9BQU9ELG9CQUFNRSxTQUFOLENBQVAsQ0FERixLQUdELE9BQU9GLEdBQUdHLElBQUgsWUFBUSxJQUFSLG9DQUFnQkQsU0FBaEIsR0FBUDtFQUpKOzs7QUNEYyxTQUFTRSxLQUFULENBQWVDLElBQWYsRUFBcUI7TUFDOUJDLE9BQU9KLFVBQVVLLE1BQVYsQ0FBaUJDLE1BQWpCLENBQXdCQyxJQUFuQztNQUNJQyxPQUFPQyxXQUFYLEVBQXdCO1FBQ2xCQyxNQUFNLENBQUNGLE9BQU9DLFdBQVAsQ0FBbUJDLEdBQW5CLEtBQTJCLElBQTVCLEVBQWtDQyxPQUFsQyxDQUEwQyxDQUExQyxDQUFWO1lBQ1FDLEdBQVIsQ0FBWSxZQUFVUixJQUFWLEdBQWUsS0FBZixHQUFxQk0sR0FBckIsR0FBMkIsSUFBM0IsR0FBa0NQLElBQTlDO0dBRkYsTUFHTztZQUNHUyxHQUFSLENBQVksWUFBVVIsSUFBVixHQUFlLEtBQWYsR0FBcUJELElBQWpDOzs7O0FDTlcsU0FBU1UsTUFBVCxH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
