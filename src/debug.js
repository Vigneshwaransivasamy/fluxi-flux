function buildLogs(rest) {
  var log = [];
  var restLength = rest.length;
  let i = 0;
  for (; i < restLength;) {
    log.push(rest[i]);
    i++;
  }
  return log;
}
function debug(...rest) {
  var logs = buildLogs(rest);
  logs.splice(0, 0, window.performance ? ' : ' + (window.performance.now() / 1000).toFixed(3) + ': ' : ' : ' + Date() + ' : ');
  console.log(...logs);
}
module.exports = debug;