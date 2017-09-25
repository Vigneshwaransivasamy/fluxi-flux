
module.exports = function request(method, url, async, payload) {
  return new Promise(function(resolve, reject) {
    var xhr;
    var handleResponse = function() {
      if (xhr.status !== 200) {
        reject(Error("Status : " + xhr.status + " : Response : " + xhr.responseText));
        return;
      }
      resolve(xhr.responseText);
    };
    xhr = new XMLHttpRequest;
    if (async) {
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) {
          return;
        }
        handleResponse();
      };
    }
    xhr.open(method, url, async);
    xhr.send(payload);
    if (!async) {
      handleResponse();
    }
  });
}