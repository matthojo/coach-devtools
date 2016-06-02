chrome.extension.onRequest.addListener(function(request, sender, callback) {
  if (request.action == 'getJSON') {
    $.getJSON(request.url, callback);
  }
});

console.log('hello from the console')
