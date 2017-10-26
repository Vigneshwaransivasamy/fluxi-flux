export default function pipe2(fn1, fn2) {
    return function () {
        return fn2.call(this, fn1.apply(this, arguments));
    };
}