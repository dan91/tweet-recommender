(async () => {
  const src = chrome.runtime.getURL('js/init.js');
  const contentScript = await import(src);
  contentScript.main();
})();