# fluxi-flux  ![CircleCI Build Status](https://circleci.com/gh/Vigneshwaransivasamy/fluxi-flux.svg?style=shield)

flux-flux tries to implement the exact flux architectural pattern



# How to use?
 
```
import debug from 'fluxi';
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
 * Bound Action Creators
 */

var boundAddTodo = text => store.dispatch(addTodo(text));
var boundSetVisibilityFilter = index => store.dispatch(setVisibilityFilter(index));

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
      completed: true,
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
};

var store = createStore(todoApp, STATE_FROM_SERVER);

// Log the initial state
debug(store.getState());

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
var unsubscribe = store.subscribe(() =>
  debug(store.getState())
);

// Dispatch some actions
store.dispatch(addTodo('Learn about actions'));
boundAddTodo('Learn about actions from bound functions');
store.dispatch(addTodo('Learn about reducers'));
store.dispatch(addTodo('Learn about store'));
store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED));
boundSetVisibilityFilter('Learn about store from bound visibility filter');
unsubscribe();

```
