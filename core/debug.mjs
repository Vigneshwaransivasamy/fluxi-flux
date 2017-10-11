export default function debug(text) {
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(" : "+now + ": " + text);
  } else {
    console.log(Date()+" : "+text);
  }
}