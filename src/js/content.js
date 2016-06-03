console.log('Initialised script...')

var domconsole = require('../vendor/js/domconsole')
  , result = domconsole()

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  sendResponse(result);
});
