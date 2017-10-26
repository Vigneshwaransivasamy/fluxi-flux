var is = /*#__PURE__*/require('./is.js');

const isFunction = target => is(Function)(target);

module.exports = isFunction;