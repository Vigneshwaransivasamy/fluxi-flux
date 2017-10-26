var toString = Object.prototype.toString;
const isObject = target => toString.call(target) === '[object Object]';
export default isObject;