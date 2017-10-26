export default function curryN(fn) {
    return function () {
        if (fn.length == arguments.length)
            return fn(...arguments);
        else
            return fn.bind(null, ...arguments);
    };
}