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


import pipe2 from './pipe2';
import isBoolean from './isBoolean';

export default function pipeN() {
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
    if (length == 1)
        return arguments[0];
    if (length == 2)
        return (_pipe2(args[0], args[1]));
    for (; i < length - 1;) {
        lastResult = _pipe2(lastResult, args[i + 1]);
        i++;
    }

    return lastResult;
}