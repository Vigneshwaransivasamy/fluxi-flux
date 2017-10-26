var toString = Object.prototype.toString;

const isDate = target => toString.call(target) === '[object Date]';

module.exports = isDate;