var toString = Object.prototype.toString;

const isNull = target => toString.call(target) === '[object Null]';

export default isNull;