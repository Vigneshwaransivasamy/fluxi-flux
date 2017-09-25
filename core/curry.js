var filler = require('./filler');
console.log(filler);

add2 = function (a,b){
    return a+b;
}

curryN(2, add2);

function curry2(targetFunction){
    switch(arguments.length){
        case 0:
            return targetFunction;
        case 1:
            
    }
}

module.exports = function curryN(argumentCount, targetFunction){
    switch(arguments.length){
        case 0:
            return targetFunction;
        case 1:
    }
}