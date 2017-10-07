const pipeN = require('./pipeN');
module.exports = function syncPipeN() {
  Array.prototype.unshift.call(arguments, false);
  return pipeN.apply(this, arguments);
};