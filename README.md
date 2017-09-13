# fluxi

A functional library which aids in building apps in functional paradigm

## How to install?

```
$ npm install fluxi
```


## Features

 # How it works?
 
It returns a function that makes call to the functions sequentially in the order of arguments and the return value of each function will become as argument for the forthcoming function.


 # How to use?
 
 ```
 let pipeN = fluxi.pipeN;
 let addOne = x => x+1;
 let addTwo = x => x+2;
 let addThree = x => x+3;
 
 // Now we have a function that will do the functionality
 // of the combination
 
 let joinActions = pipeN(addOne, addTwo, addThree);
 
 joinActions(1);
 
 // how it works
 (1) addOne(1) => 2
        |
 (2) addTwo(2) => 4
        |
 (3) addThree(4) => 7
 
 // @return 7
 
```


 # How it works?
 
Asynchronous pipe will works exacly as you think
         that this will wait for each action to get completed
         
 # How to use?
 ```
 let syncPipeN = fluxi.pipeN;
 let delay = fluxi.delay;
 let delay500 = delay(500);
 let delay2000 = delay(2000);
 let delay5000 = delay(5000);
 
 let joinActions = syncPipeN(delay500, delay2000, delay5000);
 
 // Now we have a function that will do the functionality
 // of the combination and waits for each actions to get completed
 // sequentially
 
 
 // -> you can either just initate the action
 joinActions()  
 
 // -> Add a listener to get the completed status
 joinActions().then(  
      function(){
      console.log("Completed!")
 });
 ```
