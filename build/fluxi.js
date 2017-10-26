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
  var toString = Object.prototype.toString;

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

  var isBoolean = function isBoolean(target) {
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
    isBoolean: isBoolean,
    isFunction: isFunction,
    isNumber: isNumber,
    isRegex: isRegex,
    isString: isString
  });

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

    for (var offset = 0; offset < length; offset++) {
      hash += language.charAt(Math.floor(Math.random() * language.length));
    }return hash;
  }

  var hash32 = function hash32() {
    return randomToken(32);
  };

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

  return core;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmx1eGkuanMiLCJzb3VyY2VzIjpbIi4uL2NvcmUvY3VycnkubWpzIiwiLi4vY29yZS9kZWJ1Zy5tanMiLCIuLi9jb3JlL2ZpbGxlci5tanMiLCIuLi9jb3JlL3BpcGUyLm1qcyIsIi4uL2NvcmUvdHlwZUNoZWNrZXIubWpzIiwiLi4vY29yZS9waXBlTi5tanMiLCIuLi9jb3JlL3N5bmNQaXBlMi5tanMiLCIuLi9jb3JlL3N5bmNQaXBlTi5tanMiLCIuLi9jb3JlL3JhbmRvbVRva2VuLm1qcyIsIi4uL2NvcmUvcHJveHIubWpzIiwiLi4vY29yZS9pbmRleC5tanMiLCIuLi9pbmRleC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3VycnlOKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGZuLmxlbmd0aCA9PSBhcmd1bWVudHMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIGZuKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBmbi5iaW5kKG51bGwsIC4uLmFyZ3VtZW50cyk7XG4gICAgfTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWJ1Zyh0ZXh0KSB7XG4gICAgaWYgKHdpbmRvdy5wZXJmb3JtYW5jZSkge1xuICAgICAgICB2YXIgbm93ID0gKHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSAvIDEwMDApLnRvRml4ZWQoMyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCcgOiAnK25vdyArICc6ICcgKyB0ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhEYXRlKCkrJyA6ICcrdGV4dCk7XG4gICAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbGxlcigpe1xuICAgIHJldHVybiAnX19FTVBUWV9fJztcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwaXBlMihmbjEsIGZuMikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmbjIuY2FsbCh0aGlzLCBmbjEuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfTtcbn0iLCIvKipcbiAqIExlZ2FjeSBtZXRob2RzIGFuZCBwcml2YXRlIG1ldGhvZHMgYXJlIHByZWZpeGVkIHdpdGggXyh1bmRlcnNjb3JlKS5cbiAqL1xudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuY29uc3QgaXMgPSB0eXBlID0+IHRhcmdldCA9PiBPYmplY3QodGFyZ2V0KSBpbnN0YW5jZW9mIHR5cGU7XG5cbmV4cG9ydCBkZWZhdWx0IGlzO1xuXG5leHBvcnQgY29uc3QgaXNPYmplY3QgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBPYmplY3RdJztcblxuZXhwb3J0IGNvbnN0IGlzRGF0ZSA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IERhdGVdJztcblxuZXhwb3J0IGNvbnN0IGlzUHJvbWlzZSA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IFByb21pc2VdJztcblxuZXhwb3J0IGNvbnN0IGlzU3ltYm9sID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbmV4cG9ydCBjb25zdCBpc05hTiA9IHRhcmdldCA9PiB0b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IE5hTl0nO1xuXG5leHBvcnQgY29uc3QgaXNOdWxsID0gdGFyZ2V0ID0+IHRvU3RyaW5nLmNhbGwodGFyZ2V0KSA9PT0gJ1tvYmplY3QgTnVsbF0nO1xuXG5leHBvcnQgY29uc3QgaXNVbmRlZmluZWQgPSB0YXJnZXQgPT4gdG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuZXhwb3J0IGNvbnN0IGlzQXJyYXkgPSB0YXJnZXQgPT4gaXMoQXJyYXkpKHRhcmdldCk7XG5cbmV4cG9ydCBjb25zdCBpc0Jvb2xlYW4gPSB0YXJnZXQgPT4gaXMoQm9vbGVhbikodGFyZ2V0KTtcblxuZXhwb3J0IGNvbnN0IGlzRnVuY3Rpb24gPSB0YXJnZXQgPT4gaXMoRnVuY3Rpb24pKHRhcmdldCk7XG5cbmV4cG9ydCBjb25zdCBpc051bWJlciA9IHRhcmdldCA9PiBpcyhOdW1iZXIpKHRhcmdldCk7XG5cbmV4cG9ydCBjb25zdCBpc1JlZ2V4ID0gdGFyZ2V0ID0+IGlzKFJlZ0V4cCkodGFyZ2V0KTtcblxuZXhwb3J0IGNvbnN0IGlzU3RyaW5nID0gdGFyZ2V0ID0+IGlzKFN0cmluZykodGFyZ2V0KTsiLCIvKipcbiAqIFxuICogVXNhZ2U6IEFzeWNocm9ub3VzIHBpcGUgd2hpY2gganVzdCBiaWxkcyBtdWx0aXBsZVxuICogICAgICAgICAgRnVuY3Rpb25zIHRvIG9uZSBhbmQgd2FpdCBmb3IgY29tbWFuZFxuICogXG4gKiB2YXIgam9pbkFjdGlvbnMgPSBwaXBlTihhZGRPbmUsIGFkZFR3bywgYWRkVGhyZWUpO1xuICogam9pbkFjdGlvbnMoKTtcbiAqIFxuICogQHBhcmFtIHsqRnVuY3Rpb259IGZuMSBcbiAqIEBwYXJhbSB7KkZ1bmN0aW9ufSBmbjIgXG4gKiBcbiAqIEByZXR1cm4gUHJvbWlzZVxuICovXG5cblxuaW1wb3J0IHBpcGUyIGZyb20gJy4vcGlwZTIubWpzJztcbmltcG9ydCB7aXNCb29sZWFufSBmcm9tICcuL3R5cGVDaGVja2VyLm1qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBpcGVOKCkge1xuICAgIHZhciBpc0FzeW5jO1xuICAgIGlmIChpc0Jvb2xlYW4oYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBpc0FzeW5jID0gYXJndW1lbnRzWzBdO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuY2FsbChhcmd1bWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlzQXN5bmMgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgdmFyIGxhc3RSZXN1bHQgPSBhcmd1bWVudHNbMF07XG4gICAgdmFyIF9waXBlMiA9IGlzQXN5bmMgPyBwaXBlMiA6IHN5bmNQaXBlMjtcbiAgICBpZiAobGVuZ3RoID09IDEpXG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgaWYgKGxlbmd0aCA9PSAyKVxuICAgICAgICByZXR1cm4gKF9waXBlMihhcmdzWzBdLCBhcmdzWzFdKSk7XG4gICAgZm9yICg7IGkgPCBsZW5ndGggLSAxOykge1xuICAgICAgICBsYXN0UmVzdWx0ID0gX3BpcGUyKGxhc3RSZXN1bHQsIGFyZ3NbaSArIDFdKTtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiBsYXN0UmVzdWx0O1xufSIsIi8qKlxuICogXG4gKiBVc2FnZTogU3luY2hyb25vdXMgcGlwZSB3aWxsIHdvcmtzIGV4YWNseSBhcyB5b3UgdGhpbmtcbiAqICAgICAgICAgIHRoYXQgdGhpcyB3aWxsIHdhaXQgZm9yIGVhY2ggYWN0aW9uIHRvIGdldCBjb21wbGV0ZWRcbiAqIFxuICogdmFyIGpvaW5BY3Rpb25zID0gc3luY1BpcGUyKHRpbWVyMSx0aW1lcjIsdGltZXIzKTtcbiAqIFxuICogam9pbkFjdGlvbnMoKSAvLyAgICAgLT4geW91IGNhbiBlaXRoZXIganVzdCBpbml0YXRlIHRoZSBhY3Rpb25cbiAqIFxuICogam9pbkFjdGlvbnMoKS50aGVuKCAgLy8gLT4gQWRkIGEgbGlzdGVuZXIgdG8gZ2V0IHRoZSBjb21wbGV0ZWQgc3RhdHVzXG4gKiAgICAgIGZ1bmN0aW9uKCl7XG4gKiAgICAgIGNvbnNvbGUubG9nKFwiQ29tcGxldGVkIVwiKVxuICogfSk7XG4gKiBcbiAqIEBwYXJhbSB7KkZ1bmN0aW9ufSBmbjEgXG4gKiBAcGFyYW0geypGdW5jdGlvbn0gZm4yIFxuICogXG4gKiBAcmV0dXJuIFByb21pc2VcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzeW5jUGlwZTIoZm4xLCBmbjIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgZm4xLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykudGhlbihcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZuMi5jYWxsKHRoaXMsIGRhdGEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLmNhdGNoKHJlamVjdCk7XG4gICAgICAgICAgICByZXR1cm4gZm4yO1xuICAgICAgICB9KTtcbiAgICB9O1xufSIsImltcG9ydCBwaXBlTiBmcm9tICcuL3BpcGVOLm1qcyc7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzeW5jUGlwZU4oKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuY2FsbChhcmd1bWVudHMsIGZhbHNlKTtcbiAgICByZXR1cm4gcGlwZU4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYW5kb21Ub2tlbihsZW5ndGgpIHtcbiAgICB2YXIgaGFzaCA9ICcnO1xuICAgIHZhciBsYW5ndWFnZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OV8tJztcblxuICAgIGZvciAodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IGxlbmd0aDsgb2Zmc2V0KyspXG4gICAgICAgIGhhc2ggKz0gbGFuZ3VhZ2UuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxhbmd1YWdlLmxlbmd0aCkpO1xuXG4gICAgcmV0dXJuIGhhc2g7XG59IiwiaW1wb3J0IGlzIGZyb20gJy4vdHlwZUNoZWNrZXIubWpzJztcbmltcG9ydCByYW5kb21Ub2tlbiBmcm9tICcuL3JhbmRvbVRva2VuLm1qcyc7XG5pbXBvcnQge2lzT2JqZWN0LCBpc1N0cmluZ30gZnJvbSAnLi90eXBlQ2hlY2tlci5tanMnO1xuXG52YXIgaGFzaDMyID0gKCkgPT4gcmFuZG9tVG9rZW4oMzIpO1xuXG5mdW5jdGlvbiBfcHJveHlPYmplY3RQcm9wZXJ0eShkYXRhLCBzdWJzY3JpYmVycykge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICAgIGlmIChpc09iamVjdChkYXRhW2tleV0pKSB7XG4gICAgICAgICAgICBkYXRhW2tleV0gPSBwcm94cihkYXRhW2tleV0sIHN1YnNjcmliZXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBfX3B1YnN1Yl9fKGRhdGEsIHN1YnNjcmliZXJzKSB7XG4gICAgZGF0YS5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgaWYgKGlzKEZ1bmN0aW9uKShmbikpIHtcbiAgICAgICAgICAgIHZhciBpZCA9IGhhc2gzMigpO1xuICAgICAgICAgICAgc3Vic2NyaWJlcnMuc2V0KGlkLCBmbik7XG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKCdUeXBlIEVycm9yOiBzdWJzY3JpYmVyIHNob3VsZCBiZSBvZiB0eXBlIEZ1bmN0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZGF0YS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBpZiAoc3Vic2NyaWJlcnMuaGFzKGlkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1YnNjcmliZXJzLmRlbGV0ZShpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKCdUeXBlIEVycm9yOiBzdWJzY3JpYmVyIHNob3VsZCBiZSBvZiB0eXBlIEZ1bmN0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBkYXRhO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcm94cihkYXRhLCBfc3Vic2NyaWJlcnMpIHtcbiAgICB2YXIgaXNSb290ID0gIV9zdWJzY3JpYmVycztcbiAgICB2YXIgc3Vic2NyaWJlcnMgPSBfc3Vic2NyaWJlcnMgPyBfc3Vic2NyaWJlcnMgOiBuZXcgTWFwKCk7XG4gICAgdmFyIF9oYW5kbGVyID0ge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCh0YXJnZXQsIGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtrZXldO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh0YXJnZXQsIGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBudWxsLCBvbGRWYWx1ZSA9IG51bGwsIGFjdGlvbkRhdGEgPSB7fTtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0W2tleV0pIHtcbiAgICAgICAgICAgICAgICBhY3Rpb24gPSAnTkVXJztcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IGlzU3RyaW5nKHZhbHVlKSA/IHZhbHVlIDogcHJveHIodmFsdWUsIHN1YnNjcmliZXJzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uID0gJ1VQREFURSc7XG4gICAgICAgICAgICAgICAgb2xkVmFsdWUgPSB0YXJnZXRba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAob2xkVmFsdWUgPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRG8gbm90aGluZyBpZiB0aGUgdmFsdWUgYXJlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhY3Rpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICdhY3Rpb24nOiBhY3Rpb24sXG4gICAgICAgICAgICAgICAgJ2FjdGlvblJvb3QnOiB0YXJnZXQsXG4gICAgICAgICAgICAgICAgJ2tleSc6IGtleSxcbiAgICAgICAgICAgICAgICAndmFsdWUnOiB2YWx1ZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PSAndXBkYXRlJykge1xuICAgICAgICAgICAgICAgIGFjdGlvbkRhdGEub2xkVmFsdWUgPSBvbGRWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vdGlmeShhY3Rpb25EYXRhKTtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRba2V5XTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBub3RpZnkoZGF0YSkge1xuICAgICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgZm4oZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRhdGEgPSBuZXcgUHJveHkoX3Byb3h5T2JqZWN0UHJvcGVydHkoZGF0YSwgc3Vic2NyaWJlcnMpLCBfaGFuZGxlcik7XG5cbiAgICByZXR1cm4gaXNSb290ID8gX19wdWJzdWJfXyhkYXRhLCBzdWJzY3JpYmVycykgOiBkYXRhO1xufSIsImltcG9ydCBjdXJyeSBmcm9tICcuL2N1cnJ5Lm1qcyc7XG5pbXBvcnQgZGVidWcgZnJvbSAnLi9kZWJ1Zy5tanMnO1xuaW1wb3J0IGZpbGxlciBmcm9tICcuL2ZpbGxlci5tanMnO1xuaW1wb3J0IHBpcGUyIGZyb20gJy4vcGlwZTIubWpzJztcbmltcG9ydCBwaXBlTiBmcm9tICcuL3BpcGVOLm1qcyc7XG5pbXBvcnQgc3luY1BpcGUyIGZyb20gJy4vc3luY1BpcGUyLm1qcyc7XG5pbXBvcnQgc3luY1BpcGVOIGZyb20gJy4vc3luY1BpcGVOLm1qcyc7XG5pbXBvcnQgIHByb3hyIGZyb20gJy4vcHJveHIubWpzJztcbmltcG9ydCAqIGFzIHR5cGVycyBmcm9tICcuL3R5cGVDaGVja2VyLm1qcyc7XG5cblxuY29uc3QgY29yZSA9IE9iamVjdC5hc3NpZ24oe30se1xuICAgIGN1cnJ5LFxuICAgIGRlYnVnLFxuICAgIGZpbGxlcixcbiAgICBwaXBlMixcbiAgICBwaXBlTixcbiAgICBzeW5jUGlwZTIsXG4gICAgc3luY1BpcGVOLFxuICAgIHByb3hyXG59LHR5cGVycyk7XG5cblxuZXhwb3J0IGRlZmF1bHQgY29yZTsiLCIvKipcbiAqIGZsdXhpIGEgZnVuY3Rpb25hbCBwcm9ncmFtbWluZyBzdHlsZSwgbGlicmFyeSB3aGljaCBhaWRzIGluIGNyZWF0aW5nIGZ1bmN0aW9uYWxcbiAqIHBpcGVsaW5lc1xuICogQG1vZHVsZSBmbHV4aVxuICogQG1lbWJlck9mIEZsdXhpXG4gKiBAc2luY2UgdjAuMC4xXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXV0aG9yIFZpZ25lc2h3YXJhbiBTaXZhc2FteVxuICovXG5cblxuaW1wb3J0IGZsdXhpIGZyb20gJy4vY29yZS9pbmRleC5tanMnO1xuLyoqXG4gKiBXcmFwcGVkIG9yIEZhY2FkZWQgbWV0aG9kcyB3aGljaCBpcyBnb2luZyBwdWJsaWNcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmbHV4aTtcbiJdLCJuYW1lcyI6WyJjdXJyeU4iLCJmbiIsImxlbmd0aCIsImFyZ3VtZW50cyIsImJpbmQiLCJkZWJ1ZyIsInRleHQiLCJ3aW5kb3ciLCJwZXJmb3JtYW5jZSIsIm5vdyIsInRvRml4ZWQiLCJsb2ciLCJEYXRlIiwiZmlsbGVyIiwicGlwZTIiLCJmbjEiLCJmbjIiLCJjYWxsIiwiYXBwbHkiLCJ0b1N0cmluZyIsIk9iamVjdCIsInByb3RvdHlwZSIsImlzIiwidGFyZ2V0IiwidHlwZSIsImlzT2JqZWN0IiwiaXNEYXRlIiwiaXNQcm9taXNlIiwiaXNTeW1ib2wiLCJpc05hTiIsImlzTnVsbCIsImlzVW5kZWZpbmVkIiwiaXNBcnJheSIsIkFycmF5IiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsImlzRnVuY3Rpb24iLCJGdW5jdGlvbiIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNSZWdleCIsIlJlZ0V4cCIsImlzU3RyaW5nIiwiU3RyaW5nIiwicGlwZU4iLCJpc0FzeW5jIiwic2hpZnQiLCJhcmdzIiwiaSIsImxhc3RSZXN1bHQiLCJfcGlwZTIiLCJzeW5jUGlwZTIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInRoZW4iLCJkYXRhIiwiY2F0Y2giLCJzeW5jUGlwZU4iLCJ1bnNoaWZ0IiwicmFuZG9tVG9rZW4iLCJoYXNoIiwibGFuZ3VhZ2UiLCJvZmZzZXQiLCJjaGFyQXQiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJoYXNoMzIiLCJfcHJveHlPYmplY3RQcm9wZXJ0eSIsInN1YnNjcmliZXJzIiwia2V5IiwicHJveHIiLCJfX3B1YnN1Yl9fIiwic3Vic2NyaWJlIiwiaWQiLCJzZXQiLCJFcnJvciIsInVuc3Vic2NyaWJlIiwiaGFzIiwiZGVsZXRlIiwiX3N1YnNjcmliZXJzIiwiaXNSb290IiwiTWFwIiwiX2hhbmRsZXIiLCJnZXQiLCJ2YWx1ZSIsImFjdGlvbiIsIm9sZFZhbHVlIiwiYWN0aW9uRGF0YSIsIm5vdGlmeSIsImZvckVhY2giLCJQcm94eSIsImNvcmUiLCJhc3NpZ24iLCJ0eXBlcnMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFlLFNBQVNBLE1BQVQsQ0FBZ0JDLEVBQWhCLEVBQW9CO1dBQ3hCLFlBQVk7WUFDWEEsR0FBR0MsTUFBSCxJQUFhQyxVQUFVRCxNQUEzQixFQUNJLE9BQU9ELG9CQUFNRSxTQUFOLENBQVAsQ0FESixLQUdJLE9BQU9GLEdBQUdHLElBQUgsWUFBUSxJQUFSLG9DQUFpQkQsU0FBakIsR0FBUDtLQUpSOzs7QUNEVyxTQUFTRSxLQUFULENBQWVDLElBQWYsRUFBcUI7UUFDNUJDLE9BQU9DLFdBQVgsRUFBd0I7WUFDaEJDLE1BQU0sQ0FBQ0YsT0FBT0MsV0FBUCxD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
