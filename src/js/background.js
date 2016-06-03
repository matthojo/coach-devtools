const tab_log = function(json_args) {
  var args = JSON.parse(unescape(json_args));
  console[args[0]].apply(console, Array.prototype.slice.call(args, 1));
}

function parseResults(results, cb) {
  cb(results)
}

chrome.extension.onRequest.addListener(function(request, sender, callback) {
  var tabId = request.tabId;

  if (request.command === 'init') {
    chrome.tabs.executeScript(tabId, { file: "assets/js/content.js", runAt: "document_end" },
      function() {
        alert('done!')
        chrome.tabs.sendRequest(tabId, {}, function(results) {
          parseResults(results, callback)
      });
    });
  }
  else if (request.command === 'sendToConsole') {
    chrome.tabs.executeScript(tabId, {
        code: "("+ tab_log + ")('" + request.args + "');",
    });
  } else if (request.command === 'runScript') {
    chrome.tabs.executeScript(tabId, {
        code: request.args,
    });
  } else {
    return;
  }
});
