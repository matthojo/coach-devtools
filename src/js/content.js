/* global chrome */

var domconsole = require('../vendor/js/domconsole')

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var result = domconsole()
  sendResponse(result)
})
