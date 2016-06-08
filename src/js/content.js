/* global chrome */

var domconsole = require('../vendor/js/coach')

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var result = domconsole()
  sendResponse(result)
})
