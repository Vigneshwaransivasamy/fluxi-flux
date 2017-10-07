const is = require('./typeChecker').is;
const randomToken = require('./randomToken');

var hash32 = () => randomToken(32);

module.exports = function proxr(data){
    const subscribers = new Map();
    let _handler = {
      get(target, key) {
          return target[key];
      },
      set(target, key, value) {
          let action = 'update'
          if(!target[key]){
              action = 'add';
              target[key] = _proxy(value);
          } else {
              target[key] = value;
          }
          
          notify(
            {
                'action':action, 
                'key':key, 
                'value':value
            }
          );
          return target[key];
      }
    };
    function notify(data){
        subscribers.forEach(function(fn){
            fn(data);
        })
    };
    data.subscribe = function(fn){
        if(is(Function)(fn)){
            let id = hash32();
            subscribers.set(id,fn);
            return id;
        } else {
            return new Error("Type Error: subscriber should be of type Function");
        }
    }

    data.unsubscribe = function(id){
        if(subscribers.has(id)){
            return subscribers.delete(id);
        } else {
            return new Error("Type Error: subscriber should be of type Function");
        }
    }
    data = new Proxy(data, _handler);
    return data;
}