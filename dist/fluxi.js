//  Fluxi v0.0.1
//  https://github.com/vigneshwaransivasamy/fluxi
//  (c)2017 Vigneshwaran Sivasamy
//  Fluxi may be freely distributed under the MIT license.

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.flux = factory());
}(this, (function () { 'use strict';

/**
 * Flux tries to implement the exact flux architectural pattern.
 * @module Flux
 * @memberOf Fluxi
 * @dependOn fluxi
 * @author Vigneshwaran Sivasamy
 * @since v1.1.3
 * @param {*}
 * @return {Object}
 * @example
 *
 * var store = flux.createStore(todoApp, STATE_FROM_SERVER);
 * For complete usage refer: test/index.js
 */

var is = type => target => Object(target) instanceof type;

function _hash(length) {
  var hash = '';
  var language = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

  for (var offset = 0; offset < length; offset++) hash += language.charAt(Math.floor(Math.random() * language.length));

  return hash;
}

function _hash32() {
  return _hash(32);
}

function _addId(obj) {
  return Object.assign({}, obj, { _id: _hash32() });
}

function store(reducer, state) {

  var _state = state || {};
  _state = _addId(_state);
  var _reducer = reducer || function (state) {
    return state;
  };

  var _subscribers = new Map();

  function _invokeCallback(payload) {
    _subscribers.forEach(function (fn) {
      fn({ state: _state, action: payload });
    });
  }

  this.subscribe = function subscribe(fn) {
    if (is(Function)(fn)) {
      var id = _hash32();
      _subscribers.set(id, fn);
      return this.unsubscribe.bind(this, id);
    } else {
      return new Error('Type Error: Subscribers should be of type Function');
    }
  };

  this.unsubscribe = function unsubscribe(id) {
    if (_subscribers.has(id)) {
      return _subscribers.delete(id);
    } else {
      return new Error('Type Error: subscriber should be of type Function');
    }
  };

  this.dispatch = function dispatch(action) {
    let _newState = _reducer(_state, action);
    if (JSON.stringify(_state) == JSON.stringify(_newState)) {
      // do nothing
      // console.log('States are same');
    } else {
      _state = _addId(_newState);
      _invokeCallback(action);
    }
  };

  this.getState = function getState() {
    return _state;
  };
}

function createStore(reducers, initialState) {
  return new store(reducers, initialState);
}

function combineReducers(reducerObject) {
  return function (state, action) {
    var nextState = {};
    for (let prop in reducerObject) {
      nextState[prop] = reducerObject[prop](state[prop], action);
    }
    return nextState;
  };
}

var index = {
  createStore,
  combineReducers
};

/**
  * Registers a callback to be invoked with every dispatched payload.
  * Returns a token that can be used with `waitFor()`.
  * @module createStore
  * @since v0.0.1
  * @category Function
  * @param {Function} reducer
  * @return {String}
  * @example test/index.js
  *
  */

return index;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmx1eGkuanMiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEZsdXggdHJpZXMgdG8gaW1wbGVtZW50IHRoZSBleGFjdCBmbHV4IGFyY2hpdGVjdHVyYWwgcGF0dGVybi5cbiAqIEBtb2R1bGUgRmx1eFxuICogQG1lbWJlck9mIEZsdXhpXG4gKiBAZGVwZW5kT24gZmx1eGlcbiAqIEBhdXRob3IgVmlnbmVzaHdhcmFuIFNpdmFzYW15XG4gKiBAc2luY2UgdjEuMS4zXG4gKiBAcGFyYW0geyp9XG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBzdG9yZSA9IGZsdXguY3JlYXRlU3RvcmUodG9kb0FwcCwgU1RBVEVfRlJPTV9TRVJWRVIpO1xuICogRm9yIGNvbXBsZXRlIHVzYWdlIHJlZmVyOiB0ZXN0L2luZGV4LmpzXG4gKi9cblxudmFyIGlzID0gdHlwZSA9PiB0YXJnZXQgPT4gT2JqZWN0KHRhcmdldCkgaW5zdGFuY2VvZiB0eXBlO1xuXG5mdW5jdGlvbiBfaGFzaChsZW5ndGgpIHtcbiAgdmFyIGhhc2ggPSAnJztcbiAgdmFyIGxhbmd1YWdlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Xy0nO1xuXG4gIGZvciAodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IGxlbmd0aDsgb2Zmc2V0KyspXG4gICAgaGFzaCArPSBsYW5ndWFnZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGFuZ3VhZ2UubGVuZ3RoKSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cbmZ1bmN0aW9uIF9oYXNoMzIoKSB7XG4gIHJldHVybiBfaGFzaCgzMik7XG59XG5cbmZ1bmN0aW9uIF9hZGRJZChvYmope1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSxvYmose19pZCA6X2hhc2gzMigpfSk7XG59XG5cbmZ1bmN0aW9uIHN0b3JlKHJlZHVjZXIsIHN0YXRlKSB7XG5cbiAgdmFyIF9zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuICBfc3RhdGUgPSBfYWRkSWQoX3N0YXRlKTtcbiAgdmFyIF9yZWR1Y2VyID0gcmVkdWNlciB8fCBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH07XG5cbiAgdmFyIF9zdWJzY3JpYmVycyA9IG5ldyBNYXAoKTtcblxuICBmdW5jdGlvbiBfaW52b2tlQ2FsbGJhY2socGF5bG9hZCkge1xuICAgIF9zdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgZm4oe3N0YXRlOl9zdGF0ZSxhY3Rpb246cGF5bG9hZH0pO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5zdWJzY3JpYmUgPSBmdW5jdGlvbiBzdWJzY3JpYmUoZm4pIHtcbiAgICBpZiAoaXMoRnVuY3Rpb24pKGZuKSkge1xuICAgICAgdmFyIGlkID0gX2hhc2gzMigpO1xuICAgICAgX3N1YnNjcmliZXJzLnNldChpZCwgZm4pO1xuICAgICAgcmV0dXJuIHRoaXMudW5zdWJzY3JpYmUuYmluZCh0aGlzLCBpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ1R5cGUgRXJyb3I6IFN1YnNjcmliZXJzIHNob3VsZCBiZSBvZiB0eXBlIEZ1bmN0aW9uJyk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiB1bnN1YnNjcmliZShpZCkge1xuICAgIGlmIChfc3Vic2NyaWJlcnMuaGFzKGlkKSkge1xuICAgICAgcmV0dXJuIF9zdWJzY3JpYmVycy5kZWxldGUoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdUeXBlIEVycm9yOiBzdWJzY3JpYmVyIHNob3VsZCBiZSBvZiB0eXBlIEZ1bmN0aW9uJyk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuZGlzcGF0Y2ggPSBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICBsZXQgX25ld1N0YXRlID0gX3JlZHVjZXIoX3N0YXRlLCBhY3Rpb24pO1xuICAgIGlmKEpTT04uc3RyaW5naWZ5KF9zdGF0ZSkgPT0gSlNPTi5zdHJpbmdpZnkoX25ld1N0YXRlKSl7XG4gICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAvLyBjb25zb2xlLmxvZygnU3RhdGVzIGFyZSBzYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9zdGF0ZSA9IF9hZGRJZChfbmV3U3RhdGUpO1xuICAgICAgX2ludm9rZUNhbGxiYWNrKGFjdGlvbik7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuZ2V0U3RhdGUgPSBmdW5jdGlvbiBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gX3N0YXRlO1xuICB9O1xuXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKHJlZHVjZXJzLCBpbml0aWFsU3RhdGUpIHtcbiAgcmV0dXJuIG5ldyBzdG9yZShyZWR1Y2VycywgaW5pdGlhbFN0YXRlKTtcbn1cblxuZnVuY3Rpb24gY29tYmluZVJlZHVjZXJzKHJlZHVjZXJPYmplY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzdGF0ZSwgYWN0aW9uKSB7XG4gICAgdmFyIG5leHRTdGF0ZSA9IHt9O1xuICAgIGZvciAobGV0IHByb3AgaW4gcmVkdWNlck9iamVjdCkge1xuICAgICAgbmV4dFN0YXRlW3Byb3BdID0gcmVkdWNlck9iamVjdFtwcm9wXShzdGF0ZVtwcm9wXSwgYWN0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBjcmVhdGVTdG9yZSxcbiAgY29tYmluZVJlZHVjZXJzXG59O1xuXG5cbi8qKlxuICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2l0aCBldmVyeSBkaXNwYXRjaGVkIHBheWxvYWQuXG4gICogUmV0dXJucyBhIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBgd2FpdEZvcigpYC5cbiAgKiBAbW9kdWxlIGNyZWF0ZVN0b3JlXG4gICogQHNpbmNlIHYwLjAuMVxuICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAqIEBwYXJhbSB7RnVuY3Rpb259IHJlZHVjZXJcbiAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICogQGV4YW1wbGUgdGVzdC9pbmRleC5qc1xuICAqXG4gICovIl0sIm5hbWVzIjpbImlzIiwidHlwZSIsInRhcmdldCIsIk9iamVjdCIsIl9oYXNoIiwibGVuZ3RoIiwiaGFzaCIsImxhbmd1YWdlIiwib2Zmc2V0IiwiY2hhckF0IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiX2hhc2gzMiIsIl9hZGRJZCIsIm9iaiIsImFzc2lnbiIsIl9pZCIsInN0b3JlIiwicmVkdWNlciIsInN0YXRlIiwiX3N0YXRlIiwiX3JlZHVjZXIiLCJfc3Vic2NyaWJlcnMiLCJNYXAiLCJfaW52b2tlQ2FsbGJhY2siLCJwYXlsb2FkIiwiZm9yRWFjaCIsImZuIiwiYWN0aW9uIiwic3Vic2NyaWJlIiwiRnVuY3Rpb24iLCJpZCIsInNldCIsInVuc3Vic2NyaWJlIiwiYmluZCIsIkVycm9yIiwiaGFzIiwiZGVsZXRlIiwiZGlzcGF0Y2giLCJfbmV3U3RhdGUiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0U3RhdGUiLCJjcmVhdGVTdG9yZSIsInJlZHVjZXJzIiwiaW5pdGlhbFN0YXRlIiwiY29tYmluZVJlZHVjZXJzIiwicmVkdWNlck9iamVjdCIsIm5leHRTdGF0ZSIsInByb3AiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7OztBQWVBLElBQUlBLEtBQUtDLFFBQVFDLFVBQVVDLE9BQU9ELE1BQVAsYUFBMEJELElBQXJEOztBQUVBLFNBQVNHLEtBQVQsQ0FBZUMsTUFBZixFQUF1QjtNQUNqQkMsT0FBTyxFQUFYO01BQ0lDLFdBQVcsa0VBQWY7O09BRUssSUFBSUMsU0FBUyxDQUFsQixFQUFxQkEsU0FBU0gsTUFBOUIsRUFBc0NHLFFBQXRDLEVBQ0VGLFFBQVFDLFNBQVNFLE1BQVQsQ0FBZ0JDLEtBQUtDLEtBQUwsQ0FBV0QsS0FBS0UsTUFBTCxLQUFnQkwsU0FBU0YsTUFBcEMsQ0FBaEIsQ0FBUjs7U0FFS0MsSUFBUDs7O0FBR0YsU0FBU08sT0FBVCxHQUFtQjtTQUNWVCxNQUFNLEVBQU4sQ0FBUDs7O0FBR0YsU0FBU1UsTUFBVCxDQUFnQkMsR0FBaEIsRUFBb0I7U0FDWFosT0FBT2EsTUFBUCxDQUFjLEVBQWQsRUFBaUJELEdBQWpCLEVBQXFCLEVBQUNFLEtBQUtKLFNBQU4sRUFBckIsQ0FBUDs7O0FBR0YsU0FBU0ssS0FBVCxDQUFlQyxPQUFmLEVBQXdCQyxLQUF4QixFQUErQjs7TUFFekJDLFNBQVNELFNBQVMsRUFBdEI7V0FDU04sT0FBT08sTUFBUCxDQUFUO01BQ0lDLFdBQVdILFdBQVcsVUFBVUMsS0FBVixFQUFpQjtXQUNsQ0EsS0FBUDtHQURGOztNQUlJRyxlQUFlLElBQUlDLEdBQUosRUFBbkI7O1dBRVNDLGVBQVQsQ0FBeUJDLE9BQXpCLEVBQWtDO2lCQUNuQkMsT0FBYixDQUFxQixVQUFVQyxFQUFWLEVBQWM7U0FDOUIsRUFBQ1IsT0FBTUMsTUFBUCxFQUFjUSxRQUFPSCxPQUFyQixFQUFIO0tBREY7OztPQUtHSSxTQUFMLEdBQWlCLFNBQVNBLFNBQVQsQ0FBbUJGLEVBQW5CLEVBQXVCO1FBQ2xDNUIsR0FBRytCLFFBQUgsRUFBYUgsRUFBYixDQUFKLEVBQXNCO1VBQ2hCSSxLQUFLbkIsU0FBVDttQkFDYW9CLEdBQWIsQ0FBaUJELEVBQWpCLEVBQXFCSixFQUFyQjthQUNPLEtBQUtNLFdBQUwsQ0FBaUJDLElBQWpCLENBQXNCLElBQXRCLEVBQTRCSCxFQUE1QixDQUFQO0tBSEYsTUFJTzthQUNFLElBQUlJLEtBQUosQ0FBVSxvREFBVixDQUFQOztHQU5KOztPQVVLRixXQUFMLEdBQW1CLFNBQVNBLFdBQVQsQ0FBcUJGLEVBQXJCLEVBQXlCO1FBQ3RDVCxhQUFhYyxHQUFiLENBQWlCTCxFQUFqQixDQUFKLEVBQTBCO2FBQ2pCVCxhQUFhZSxNQUFiLENBQW9CTixFQUFwQixDQUFQO0tBREYsTUFFTzthQUNFLElBQUlJLEtBQUosQ0FBVSxtREFBVixDQUFQOztHQUpKOztPQVFLRyxRQUFMLEdBQWdCLFNBQVNBLFFBQVQsQ0FBa0JWLE1BQWxCLEVBQTBCO1FBQ3BDVyxZQUFZbEIsU0FBU0QsTUFBVCxFQUFpQlEsTUFBakIsQ0FBaEI7UUFDR1ksS0FBS0MsU0FBTCxDQUFlckIsTUFBZixLQUEwQm9CLEtBQUtDLFNBQUwsQ0FBZUYsU0FBZixDQUE3QixFQUF1RDs7O0tBQXZELE1BR087ZUFDSTFCLE9BQU8wQixTQUFQLENBQVQ7c0JBQ2dCWCxNQUFoQjs7R0FQSjs7T0FXS2MsUUFBTCxHQUFnQixTQUFTQSxRQUFULEdBQW9CO1dBQzNCdEIsTUFBUDtHQURGOzs7QUFNRixTQUFTdUIsV0FBVCxDQUFxQkMsUUFBckIsRUFBK0JDLFlBQS9CLEVBQTZDO1NBQ3BDLElBQUk1QixLQUFKLENBQVUyQixRQUFWLEVBQW9CQyxZQUFwQixDQUFQOzs7QUFHRixTQUFTQyxlQUFULENBQXlCQyxhQUF6QixFQUF3QztTQUMvQixVQUFVNUIsS0FBVixFQUFpQlMsTUFBakIsRUFBeUI7UUFDMUJvQixZQUFZLEVBQWhCO1NBQ0ssSUFBSUMsSUFBVCxJQUFpQkYsYUFBakIsRUFBZ0M7Z0JBQ3BCRSxJQUFWLElBQWtCRixjQUFjRSxJQUFkLEVBQW9COUIsTUFBTThCLElBQU4sQ0FBcEIsRUFBaUNyQixNQUFqQyxDQUFsQjs7V0FFS29CLFNBQVA7R0FMRjs7O0FBU0YsWUFBZTthQUFBOztDQUFmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
