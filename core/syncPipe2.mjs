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

export default function syncPipe2(fn1, fn2) {
  return function () {
      return new Promise((resolve, reject) => {
          fn1.apply(this, arguments).then(
              function (data) {
                  resolve(fn2.call(this, data));
              }
          );
          return fn2;
      });
  }
};