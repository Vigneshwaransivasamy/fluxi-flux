var pipeN = /*#__PURE__*/require('./pipeN');

function syncPipeN() {
    Array.prototype.unshift.call(arguments, false);
    return pipeN.apply(this, arguments);
}
module.exports = syncPipeN;