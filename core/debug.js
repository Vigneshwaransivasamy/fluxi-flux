module.exports = function debug(text) {
  var from = arguments.callee.caller.name;
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log("From : "+from+" : "+now + ": " + text);
  } else {
    console.log("From : "+from+" : "+text);
  }
}