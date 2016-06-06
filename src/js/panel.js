
function Console() {
}

Console.Type = {
  LOG: "log",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  GROUP: "group",
  GROUP_COLLAPSED: "groupCollapsed",
  GROUP_END: "groupEnd"
};

Console.addMessage = function(type, format, args) {
  chrome.runtime.sendMessage({
      command: "sendToConsole",
      tabId: chrome.devtools.tabId,
      args: escape(JSON.stringify(Array.prototype.slice.call(arguments, 0)))
  });
};

// Generate Console output methods, i.e. Console.log(), Console.debug() etc.
(function() {
  var console_types = Object.getOwnPropertyNames(Console.Type);
  for (var type = 0; type < console_types.length; ++type) {
    var method_name = Console.Type[console_types[type]];
    Console[method_name] = Console.addMessage.bind(Console, method_name);
  }
})();

chrome.runtime.sendMessage({
  command: "init",
  tabId: chrome.devtools.tabId
  },
  function(response) {
    outputResults(results)
  }
)

function outputResults(results) {

}

$('.results').text('Hello')

// var score = result.advice.score;
// $('.score').text(score)
// delete result.advice.score;
// var keys = Object.keys(result.advice).sort();
// keys.forEach(function(key) {
//   if (result.advice[key].adviceList) {
//     Console.log('%c%s %c(%i/100)', 'font-weight: bold', key, 'font-weight: normal', result.advice[key].score);
//     Console.log(result.advice[key].adviceList, ['score','advice']);
//   }
//   else {
//     Console.log('%c%s', 'font-weight: bold', key);
//     if (typeof result.advice[key] === 'object')
//         Console.log('%O', result.advice[key]);
//     else
//         Console.log(result.advice[key]);
//   }
// });
//
// Console.log('%cScore: %i/100', 'font-weight: bold', score);
