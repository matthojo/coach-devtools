/* global chrome */

chrome.devtools.panels.create(
  'Coach',
  'assets/images/toolbarIcon.png',
  'panel.html',
  function (panel) {}
)
