function requestListener() {}

browser.webRequest.onBeforeRequest(
  requestListener,
  {
    urls: [
      "https://play.kahoot.it/v2/*",
      "https://assets-cdn.kahoot.it/player/v2/assets/js/main.*.chunk.js",
      "https://assets-cdn.kahoot.it/player/v2/assets/js/vendors~main.*.chunk.js"
    ]
  }
);
