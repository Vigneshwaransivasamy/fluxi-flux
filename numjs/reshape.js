module.exports = function reshape() {
    var args = Array.from(arguments);
    var _me = args.shift();
    var arrayLength = _me.length;
    var argsCopy = Array.from(args);
    var spliced = null;
    var customerError = () => new Error('ValueError: cannot reshape array of size ' + arrayLength + ' into shape (' + args.join(',') + ')');
    if (args.length == 1) {
        if (args[0] == arrayLength) {
            return _me;
        } else {
            return customerError();
        }
    }
    var shapeLength = args.reduce((a, b) => a * b);
    var splicer = function (target, spliceLength) {
        var splicing = [];
        while (target.length > spliceLength)
            splicing.push(target.splice(0, spliceLength));
        splicing.push(target);
        return splicing;
    };
    if (arrayLength == shapeLength) {
        var i = 0;
        while (i < 5 && argsCopy.length > 0) {
            if (!spliced) {
                spliced = splicer(Array.from(_me), argsCopy.pop());
            } else {
                spliced = splicer(spliced, argsCopy.pop());
            }
            i++;
        }
        return spliced.length === 1 ? spliced[0] : spliced;
    } else {
        return customerError();
    }
};
