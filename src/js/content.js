var domconsole = require('../vendor/js/domconsole')

console.log('Running Coach...')

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var result = domconsole()
  sendResponse(result);
});
