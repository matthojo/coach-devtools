/* global chrome */

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
  var scoreText = document.createTextNode(result.advice.score)
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

      $title.appendChild(document.createTextNode(key))
      $title.classList.add('js-toggle', 'toggle')
      $title.appendChild(createScore(result.advice[key].score))
      output.appendChild($title)

      $adviceSection = document.createElement('div')
      $adviceSection.classList.add('advice-section')
      $adviceSection.style.display = 'none'

      adviceList = Object.keys(result.advice[key].adviceList).sort()
      adviceList.forEach(function (advice) {
        var adviceObj = result.advice[key].adviceList[advice]

        // Add Advice title
        var $adviceTitle = document.createElement('h3')
        $adviceTitle.appendChild(document.createTextNode(adviceObj.title))
        $adviceTitle.classList.add('js-toggle', 'toggle')
        $adviceTitle.appendChild(createScore(adviceObj.score))
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

function createScore (score) {
  var $elem = document.createElement('span')
  $elem.classList.add('score-box')
  colourScore($elem, score)
  $elem.appendChild(document.createTextNode(score))

  return $elem
}

function colourScore ($elem, score) {
  if (score === 100) {
    $elem.classList.add('is-unicorn')
  }
  if (score > 75) {
    $elem.classList.add('is-good')
  } else if (score > 50) {
    $elem.classList.add('is-ok')
  } else {
    $elem.classList.add('is-bad')
  }
}
