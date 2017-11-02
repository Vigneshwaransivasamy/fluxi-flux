function buildLogs(rest){
  var log = [];
  var restLength = rest.length;
  for (let i = 0; i < restLength; i++) {
    log.push( rest[i] );
  }
  return log;
}
export default function debug(text, ...rest) {
  
  if(window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(buildLogs(rest).unshift(' : ' + now + ': ' + text));
  } else {
    console.log(buildLogs(rest).unshift(' : ' + Date() + ' : ' + text));
  }
}