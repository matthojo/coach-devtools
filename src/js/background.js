/* global chrome */

const tabLog = function (jsonArgs) {
  var args = JSON.parse(unescape(jsonArgs))
  console[args[0]].apply(console, Array.prototype.slice.call(args, 1))
}

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
  var tabId = request.tabId

  if (request.command === 'init') {
    chrome.tabs.executeScript(tabId,
      { file: 'assets/js/content.js', runAt: 'document_end' },
      function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {greeting: 'hello'}, function (response) {
            callback(response)
          })
        })
      }
    )
  } else if (request.command === 'sendToConsole') {
    chrome.tabs.executeScript(tabId, {
      code: '(' + tabLog + ')(\'' + request.args + '\');'
    })
  }
  return true
})
