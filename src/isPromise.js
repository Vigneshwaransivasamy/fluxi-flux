var toString = Object.prototype.toString;

const isPromise = target => toString.call(target) === '[object Promise]';

module.exports = isPromise;