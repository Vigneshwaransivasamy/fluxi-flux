/**
 * Legacy methods and private methods are prefixed with _(underscore).
 */

const is = type => target => Object(target) instanceof type;

module.exports = is;