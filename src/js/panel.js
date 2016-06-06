/* global chrome */

function Console () {
}

Console.Type = {
  LOG: 'log',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  GROUP: 'group',
  GROUP_COLLAPSED: 'groupCollapsed',
  GROUP_END: 'groupEnd'
}

Console.addMessage = function (type, format, args) {
  chrome.runtime.sendMessage({
    command: 'sendToConsole',
    tabId: chrome.devtools.tabId,
    args: escape(JSON.stringify(Array.prototype.slice.call(arguments, 0)))
  })
};

// Generate Console output methods, i.e. Console.log(), Console.debug() etc.
(function () {
  var consoleTypes = Object.getOwnPropertyNames(Console.Type)
  for (var type = 0; type < consoleTypes.length; ++type) {
    var methodName = Console.Type[consoleTypes[type]]
    Console[methodName] = Console.addMessage.bind(Console, methodName)
  }
})()

var $results = document.getElementsByClassName('js-results')[0]
var $score = document.getElementsByClassName('.js-score')[0]

document.getElementsByClassName('js-analyse')[0].addEventListener('click', function () {
  chrome.runtime.sendMessage({
    command: 'init',
    tabId: chrome.devtools.tabId
  },
  function (response) {
    $results.innerHTML = ''
    outputResults(response)
  }
  )
}, false)

function outputResults (result) {
  Console.log(result)
  var output = document.createDocumentFragment()
  var postOutput = document.createDocumentFragment()

  // colourScore($score, result.advice.score)
  // var scoreText = document.createTextNode('Score: ' + result.advice.score + '/100')
  // $score.innerHTML = 'hello'
  delete result.advice.score

  var keys = Object.keys(result.advice).sort()

  keys.forEach(function (key) {
    var $title
    var adviceList

    if (result.advice[key].adviceList) {
      $title = document.createElement('h2')

      $title.appendChild(document.createTextNode(key + ' (' + result.advice[key].score + '/100)'))
      colourScore($title, result.advice[key].score)
      output.appendChild($title)

      adviceList = Object.keys(result.advice[key].adviceList).sort()

      adviceList.forEach(function (advice) {
        var adviceObj = result.advice[key].adviceList[advice]

        // Add Advice title
        var $adviceTitle = document.createElement('h3')
        $adviceTitle.appendChild(document.createTextNode(adviceObj.title + ' (' + adviceObj.score + '/100)'))
        colourScore($adviceTitle, adviceObj.score)
        output.appendChild($adviceTitle)

        // Add Advice summary
        var $adviceAdvice = document.createElement('p')
        $adviceAdvice.appendChild(document.createTextNode(adviceObj.advice))
        output.appendChild($adviceAdvice)

        // Add Advice description
        var $adviceDescription = document.createElement('p')
        $adviceDescription.appendChild(document.createTextNode(adviceObj.description))
        output.appendChild($adviceDescription)

        // Add Advice Offending Areas
        if (adviceObj.offending.length > 0) {
          var $adviceOffendigTitle = document.createElement('h4')
          $adviceOffendigTitle.appendChild(document.createTextNode('Offending Areas'))
          output.appendChild($adviceOffendigTitle)

          var $adviceOffending = document.createElement('pre')
          var offendingList = adviceObj.offending.join('\n')
          $adviceOffending.appendChild(document.createTextNode(offendingList))
          output.appendChild($adviceOffending)
        }
      })
    } else {
      $title = document.createElement('h2')
      $title.appendChild(document.createTextNode(key.toString()))
      postOutput.appendChild($title)

      if (typeof result.advice[key] === 'object') {
        // Output list of results
        adviceList = Object.keys(result.advice[key]).sort()
        adviceList.forEach(function (advice) {
          var adviceValue = result.advice[key][advice]
          var $adviceTitle = document.createElement('h3')
          $adviceTitle.appendChild(document.createTextNode(advice + ': ' + adviceValue))
          postOutput.appendChild($adviceTitle)
        })
      } else {
        // Output single result
        var adviceValue = result.advice[key]
        var $adviceTitle = document.createElement('h3')
        $adviceTitle.appendChild(document.createTextNode(key + ': ' + adviceValue))
        postOutput.appendChild($adviceTitle)
      }
    }
  })
  output.appendChild(postOutput)
  $results.appendChild(output)
}

function colourScore ($elem, score) {
  if (score > 75) {
    $elem.className += 'is-good'
  } else if (score > 50) {
    $elem.className += 'is-ok'
  } else {
    $elem.className += 'is-bad'
  }
}
