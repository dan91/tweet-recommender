console.log('config')


// import('config.js')
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  // this is needed to load extension on new tab since Twitter updates navigation history
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id, allFrames: true },
      files: ['feed.js'],
    });
  })
});
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  // if (temporary) return; // skip during development
  switch (reason) {
    case "install":
    {
      const url = chrome.runtime.getURL("options.html");
      await chrome.tabs.create({ url });
    }
      break;
      // see below
  }
});
chrome.action.setBadgeText({ text: '!' })
chrome.action.setBadgeBackgroundColor({ color: [247, 82, 82, 1] });
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(request)
    if (request.running === true) {
      chrome.action.setBadgeText({ text: 'OK' })
      chrome.action.setBadgeBackgroundColor({ color: [76, 175, 80, 1] });
    } else if (request.running === false) {
      chrome.action.setBadgeText({ text: '!' })
      chrome.action.setBadgeBackgroundColor({ color: [247, 82, 82, 1] });
    } else if (request.studyPartComplete) {
      chrome.storage.local.get(['prolificID', 'impressions', 'study', 'currentStudyPart'], function (result) {
        // randomly sample some tweets for accuracy judgement
        max = 10
        impressions = result.impressions ? Arrays.getRandomSubarray(result.impressions, max).join(',') : ''
        url = 'https://www.soscisurvey.de/tweet-recommender/?q=' + questionnaires[result.study][result.currentStudyPart] + '&p='+result.currentStudyPart+'&impressions=' + impressions + '&r=' + result.prolificID
        chrome.storage.local.set({ 'completionLink': url })
        chrome.tabs.getCurrent(function () {
          chrome.tabs.query({
            currentWindow: true,
            active: true
          }, function (tabs) {
            chrome.tabs.create({ 'url': url }, function () {
              // this might not work always > do not close tab automatically in the future
              chrome.tabs.remove(tabs[0].id);
            });
          });
        });
      })
    }
  }
);

const questionnaires = {
  1: {
    1: 'Followup_1_SocialIdentityPostBlock',
    2: 'Followup_1_SocialIdentityPostBlock',
    3: 'Followup_1_SocialIdentityPost'
  },
  2: {
    1: 'Followup_2_SocialNormsPostBlock',
    2: 'Followup_2_SocialNormsPostBlock',
    3: 'Followup_2_SocialNormsPost'
  },
}