var is = /*#__PURE__*/require('./is.js');

const isRegex = target => is(RegExp)(target);

module.exports = isRegex;