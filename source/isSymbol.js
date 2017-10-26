var toString = Object.prototype.toString;

const isSymbol = target => toString.call(target) === '[object Symbol]';

export default isSymbol;