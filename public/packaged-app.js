'use strict';

chrome.app.runtime.onLaunched.addListener(function () {
  chrome.app.window.create('index.html', {
    id : 'nolla-app-main',
    transparentBackground: true
  });
});