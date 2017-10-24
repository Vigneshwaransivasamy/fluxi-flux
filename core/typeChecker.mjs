/**
 * Legacy methods and private methods are prefixed with _(underscore).
 */
var toString = Object.prototype.toString;

const is = type => target => Object(target) instanceof type;

export default is;

export const isObject = target => toString.call(target) === '[object Object]';

export const isDate = target => toString.call(target) === '[object Date]';

export const isPromise = target => toString.call(target) === '[object Promise]';

export const isSymbol = target => toString.call(target) === '[object Symbol]';

export const isNaN = target => toString.call(target) === '[object NaN]';

export const isNull = target => toString.call(target) === '[object Null]';

export const isUndefined = target => toString.call(target) === '[object Undefined]';

export const isArray = target => is(Array)(target);

export const isBoolean = target => is(Boolean)(target);

export const isFunction = target => is(Function)(target);

export const isNumber = target => is(Number)(target);

export const isRegex = target => is(RegExp)(target);

export const isString = target => is(String)(target);