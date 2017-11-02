const flux = require('src');
var assert = require('assert');
function compareObjLiteral(obj1, obj2){
	return JSON.stringify(obj1) === JSON.stringify(obj2);
}
import {createStore} from '../index';

/**
 * Action Types
 */

var ADD_TODO = 'ADD_TODO';
var SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';
var VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
};


/**
 * Action Creators
 */

function addTodo(text) {
  return { type: ADD_TODO, text };
}


function setVisibilityFilter(filter) {
  return { type: SET_VISIBILITY_FILTER, filter };
}

/**
 * InitialState
 */

var initialState = {
  visibilityFilter: VisibilityFilters.SHOW_ALL,
  todos: []
};



/**
 * Reducers
 */

function todoApp(state = initialState, action) {
  switch (action.type) {
  case SET_VISIBILITY_FILTER:
    return Object.assign({}, state, {
      visibilityFilter: action.filter
    });
  case ADD_TODO:
    return Object.assign({}, state, {
      todos: [
        ...state.todos,
        {
          text: action.text,
          completed: false
        }
      ]
    });
  default:
    return state;
  }
}

var STATE_FROM_SERVER = {
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: 'Consider using Redux',
      completed: true
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
};



// boundAddTodo('Learn about actions from bound functions');
// store.dispatch(addTodo('Learn about reducers'));
// store.dispatch(addTodo('Learn about store'));
// store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED));
// boundSetVisibilityFilter('Learn about store from bound visibility filter');
// unsubscribe();

describe('Flux test cases begins...', function () {
  describe('curryN', function () {

    var store = createStore(todoApp, STATE_FROM_SERVER);

    it('case 1: It should validate and return the\
     boolean of initialState and stores state', function () {
      
      // Log the initial state
      assert.equal(compareObjLiteral(store.getState(),initialState),true);
      
    });

    it('case 2: it should return a function for first argument and while \
    giving the next argument this should work like a charm', function () {
      var actionValue = 'Learn about actions';
      // Dispatch some actions
      store.dispatch(addTodo(actionValue));
      // Every time the state changes, log it
      // Note that subscribe() returns a function for unregistering the listener
      var unsubscribe = store.subscribe(() =>
        assert.equal(store.getState().todos.includes(actionValue),true)
      );

      unsubscribe();
    });
  });
});