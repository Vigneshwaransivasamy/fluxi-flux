var toString = Object.prototype.toString;

const isNaN = target => toString.call(target) === '[object NaN]';

module.exports = isNaN;