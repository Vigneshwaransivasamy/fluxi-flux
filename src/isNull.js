var toString = Object.prototype.toString;

const isNull = target => toString.call(target) === '[object Null]';

module.exports = isNull;