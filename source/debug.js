export default function debug(text, ...rest) {
  if(window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    var log = ' : ' + now + ': ' + text;
    var restLength = rest.length;
    for (let i = 0; i < restLength; i++) {
      log += ' : ' + rest[i];
    }
    console.log(log);
  } else {
    console.log(Date() + ' : ' + text);
  }
}