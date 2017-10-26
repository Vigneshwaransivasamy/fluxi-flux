
var toString = Object.prototype.toString;

const isUndefined = target => toString.call(target) === '[object Undefined]';

export default isUndefined;