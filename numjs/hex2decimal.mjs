const hex2decimal = function hex2decimal(num) {
    num = num.toString();
    var numString = num.split('').reverse().join('');
    var map = Array.prototype.map;
    var final = map.call(numString, function (x, y) {
        switch (x) {
        case 'a': x = 10; break;
        case 'b': x = 11; break;
        case 'c': x = 12; break;
        case 'd': x = 13; break;
        case 'e': x = 14; break;
        case 'f': x = 15; break;
        default: break;
        }
        return x * Math.pow(16, y);
    }).reduce((a, b) => a + b);
    return final;
};
export default hex2decimal;