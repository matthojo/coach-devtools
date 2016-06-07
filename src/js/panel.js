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

document.getElementsByClassName('js-analyse')[0].addEventListener('click', function (e) {
  chrome.runtime.sendMessage({
    command: 'init',
    tabId: chrome.devtools.tabId
  },
  function (response) {
    e.target.innerText = 'Re-Analyse'
    outputResults(response)
  }
  )
}, false)

function outputResults (result) {
  Console.log(result)

  // Get content containers
  var $results = document.getElementsByClassName('js-results')[0]
  var $score = document.getElementsByClassName('js-score')[0]

  // Reset content (for re-analysing)
  $results.innerHTML = ''
  $score.innerHTML = ''

  // Create fragments to reduce reflow
  var output = document.createDocumentFragment()
  var postOutput = document.createDocumentFragment()
  var scoreOutput = document.createDocumentFragment()

  // Append Score
  var scoreText = document.createTextNode('Overall: ' + result.advice.score + '/100')
  scoreOutput.appendChild(scoreText)
  $score.appendChild(scoreOutput)
  colourScore($score, result.advice.score)
  delete result.advice.score

  // Append Advice
  var keys = Object.keys(result.advice).sort()

  keys.forEach(function (key) {
    var $title
    var adviceList
    var $adviceSection

    if (result.advice[key].adviceList) {
      $title = document.createElement('h2')

      $title.appendChild(document.createTextNode(key + ' (' + result.advice[key].score + '/100)'))
      colourScore($title, result.advice[key].score)
      $title.classList.add('js-toggle', 'toggle')
      output.appendChild($title)

      $adviceSection = document.createElement('div')
      $adviceSection.classList.add('advice-section')
      $adviceSection.style.display = 'none'

      adviceList = Object.keys(result.advice[key].adviceList).sort()
      adviceList.forEach(function (advice) {
        var adviceObj = result.advice[key].adviceList[advice]

        // Add Advice title
        var $adviceTitle = document.createElement('h3')
        $adviceTitle.appendChild(document.createTextNode(adviceObj.title + ' (' + adviceObj.score + '/100)'))
        colourScore($adviceTitle, adviceObj.score)
        $adviceTitle.classList.add('js-toggle', 'toggle')
        $adviceSection.appendChild($adviceTitle)

        var $adviceSubSection = document.createElement('div')
        $adviceSubSection.classList.add('advice-section', 'advice-sub-section')
        $adviceSubSection.style.display = 'none'

        // Add Advice summary
        var $adviceAdvice = document.createElement('p')
        $adviceAdvice.appendChild(document.createTextNode(adviceObj.advice))
        $adviceSubSection.appendChild($adviceAdvice)

        // Add Advice description
        var $adviceDescription = document.createElement('p')
        $adviceDescription.classList.add('description')
        $adviceDescription.appendChild(document.createTextNode(adviceObj.description))
        $adviceSubSection.appendChild($adviceDescription)

        // Add Advice Offending Areas
        if (adviceObj.offending.length > 0) {
          var $adviceOffendigTitle = document.createElement('h4')
          $adviceOffendigTitle.appendChild(document.createTextNode('Offending Areas'))
          $adviceSubSection.appendChild($adviceOffendigTitle)

          var $adviceOffending = document.createElement('pre')
          var offendingList = adviceObj.offending.join('\n')
          $adviceOffending.appendChild(document.createTextNode(offendingList))
          $adviceSubSection.appendChild($adviceOffending)
        }
        $adviceSection.appendChild($adviceSubSection)
      })
      output.appendChild($adviceSection)
    } else {
      $title = document.createElement('h2')
      $title.appendChild(document.createTextNode(key.toString()))
      $title.classList.add('js-toggle', 'toggle')
      postOutput.appendChild($title)

      $adviceSection = document.createElement('div')
      $adviceSection.classList.add('advice-section')
      $adviceSection.style.display = 'none'

      if (typeof result.advice[key] === 'object') {
        // Output list of results
        var $adviceValueList = document.createElement('pre')

        adviceList = Object.keys(result.advice[key]).sort()
        var formattedValues = []

        adviceList.forEach(function (advice) {
          var adviceValue = result.advice[key][advice]
          if (typeof adviceValue === 'object') {
            adviceList = Object.keys(result.advice[key][advice]).sort()
            adviceList.forEach(function (subadvice) {
              var adviceSubValue = result.advice[key][advice][subadvice]
              if (Array.isArray(adviceSubValue) && adviceSubValue.length > 0) {
                formattedValues.push(subadvice + ': ' + adviceSubValue.join('\n') + '\n')
              } else {
                formattedValues.push(subadvice + ': ' + adviceSubValue + '\n')
              }
            })
          } else {
            formattedValues.push(advice + ': ' + adviceValue + '\n')
          }
        })
        var valuesList = formattedValues.join('\n')
        $adviceValueList.appendChild(document.createTextNode(valuesList))
        $adviceSection.appendChild($adviceValueList)
      } else {
        // Output single result
        var adviceValue = result.advice[key]
        var $adviceTitle = document.createElement('h3')
        $adviceTitle.appendChild(document.createTextNode(key + ': ' + adviceValue))
        $adviceSection.appendChild($adviceTitle)
      }
      postOutput.appendChild($adviceSection)
    }
  })
  output.appendChild(postOutput)
  $results.appendChild(output)

  unicornify()

  var toggles = document.getElementsByClassName('js-toggle')
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener('click', function (e) {
      var $target = closest(e.target, 'js-toggle')
      $target.classList.toggle('is-visible')
      if ($target.classList.contains('is-visible')) {
        $target.nextElementSibling.style.display = ''
      } else {
        $target.nextElementSibling.style.display = 'none'
      }
    }, true)
  }
}

var closest = function (el, target) {
  while (!el.classList.contains(target)) {
    el = el.parentNode
    if (!el) {
      return null
    }
  }
  return el
}

function colourScore ($elem, score) {
  if (score === 100) {
    $elem.classList.add('is-amazing', 'is-unicorn')
  } else if (score > 75) {
    $elem.classList.add('is-good')
  } else if (score > 50) {
    $elem.classList.add('is-ok')
  } else {
    $elem.classList.add('is-bad')
  }
}

function unicornify () {
  var step = 4 // colorChage step, use negative value to change direction
  var $unicorns = document.getElementsByClassName('is-unicorn')
  var itv

  for (var i = 0; i < $unicorns.length; i++) {
    var $uni = $unicorns[i]
    var txt = $uni.innerHTML
    var len = txt.length
    var lev = 360 / len
    var newCont = ''

    for (var j = 0; j < len; j++) {
      newCont += '<span style=\'color:hsla(' + j * lev + ', 100%, 50%, 1)\'>' + txt.charAt(j) + '</span>'
    }

    $uni.innerHTML = newCont // Replace with new content

    $uni.addEventListener('mouseover', function (e) {
      var $ch = e.target.parentNode.querySelectorAll('span')
      anim($ch)
    }, false)

    $uni.addEventListener('mouseout', function (e) {
      stop()
    }, false)
  }

  function anim ($ch) {
    $ch.forEach(function (k) {
      var h = +k.getAttribute('style').split(',')[0].split('(')[1] - step % 360
      k.setAttribute('style', 'color:hsla(' + h + ', 100%, 50%, 1)')
    })
    itv = window.requestAnimationFrame(function () {
      anim($ch)
    })
  }

  function stop () {
    window.cancelAnimationFrame(itv)
  }
}
