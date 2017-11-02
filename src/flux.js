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

var is = /*#__PURE__*/require('./is');

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

module.exports = {
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