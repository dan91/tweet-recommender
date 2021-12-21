// Initialize butotn with users's prefered color
let input = document.getElementById("prolificID");
let button = document.getElementById("submitID");
// let reset = document.getElementById("resetID");
let reset = document.getElementById("resetLocalStorage");
let messageDiv = document.getElementById("message");
let durationSpan = document.getElementById("duration");
let completionLink = document.getElementById("completionLink");
var firebaseConfig = {
  apiKey: "AIzaSyDtR1bR2loAJhBITEWHLKYEFO6nMoEExWg",
  authDomain: "cov-misinfo.firebaseapp.com",
  projectId: "cov-misinfo",
  storageBucket: "cov-misinfo.appspot.com",
  messagingSenderId: "707334142124",
  appId: "1:707334142124:web:2c4b1f681ccec80cfa4709"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

var docRef = db.collection("condition_assignments").doc("w7ErNVXJSnM51XdEdoCU");
condition = undefined
function checkConditionAndProID() {
  chrome.storage.local.get(['condition', 'prolificID'], function (result) {
    console.log('init', result)
    if (!result.condition) {
      receiveCondition()
    }
    if (result.prolificID) {
      input.value = result.prolificID
      chrome.storage.local.get(['running'], function (result) {
        if(result.running) 
          sendMessage('success')
      })
    } else {
      sendMessage('warning', 'Your Prolific ID has not been set yet.')
    }
  })
}
function receiveCondition() {
  docRef.get().then((doc) => {
    if (doc.exists) {
      current_assignment = doc.data().current_assignment
      console.log("Current Assignment:", current_assignment);
      condition = assignments[current_assignment]

      const study = current_assignment <= 325 ? 1 : 2;

      docRef.update({ current_assignment: firebase.firestore.FieldValue.increment(1) });
      chrome.storage.local.set({ 'condition': condition });
      chrome.storage.local.set({ 'study': study });
    } else {
      console.log("No such document!");
      return false
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
    return false
  });
}
chrome.runtime.onMessage.addListener(
  function (request) {
    console.log(request)
    if (request.running === true) {
      sendMessage('success')
    } else  if (request.running === false) {
      sendMessage('warning', 'Your Prolific ID has not been set yet or the study is completed.')
    }
  }
)

function updateDuration() {
  chrome.storage.local.get(['duration', 'currentStudyPart'], function (result) {
    duration = isNaN(result.duration) ? 0 : Math.floor(result.duration / 60)
    currentStudyPart = result.currentStudyPart ? result.currentStudyPart : 1
    // limit duration to 5min
    // duration = result.duration < 5*60 ? result.duration : 5*60
    // total duration is study part multiplied by duration
    totalDuration = ((currentStudyPart-1)*5) + duration
    if(currentStudyPart >= 3 && duration >= 5*60)
      durationSpan.innerHTML = "You completed the study! If you responded to the third questionnaire, you can remove the extension now."
    else
      durationSpan.innerHTML = "You have spent " + totalDuration + " minutes using Tweet Recommender."
  })
}
updateDuration()

checkConditionAndProID()

button.addEventListener('click', function () {
  if (input.value.length == 24) {
    chrome.storage.local.set({ 'prolificID': input.value }, function () {
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          console.log(input.value)
          chrome.tabs.sendMessage(tab.id, { allSet: true });
          sendMessage('warning', "Your Prolific ID has been set. Now, please go to <a href='https://www.twitter.com' target='_blank'>https://www.twitter.com</a> or reload the tab if you already opened Twitter.com.")
        });
      });
    });
  } else {
    sendMessage('error', 'Please make sure you enter a valid Prolific ID (24 characters).')
  }
})
reset.addEventListener('click', function () {
  chrome.storage.local.remove(['currentStudyPart', 'duration', 'start', 'condition', 'prolificID', 'completionLink']);
})

function sendMessage(type, message = '', title = '') {
  if (type == 'error') {
    chrome.action.setBadgeText({ text: '!' })
    chrome.action.setBadgeBackgroundColor({ color: [247, 82, 82, 1] });
    title = 'Oooops.'
    messageDiv.style.backgroundColor = '#f75252'
    status = ''
  } else if (type == 'warning') {
    chrome.action.setBadgeText({ text: '!' })
    chrome.action.setBadgeBackgroundColor({ color: [247, 82, 82, 1] });
    title = 'Heads up'
    messageDiv.style.backgroundColor = '#ffc107'
    status = ''
  } else if (type == 'success') {
    chrome.action.setBadgeText({ text: 'OK' })
    chrome.action.setBadgeBackgroundColor({ color: [76, 175, 80, 1] });
    if (title == '')
      title = 'You are good to go.'
    messageDiv.style.backgroundColor = '#4caf50'
    status = 'Tweet Recommender is running. You can now start browsing.'
  }
  messageDiv.innerHTML = '<h2>' + title + '</h2>' + message + ' ' + '<br>' + status
}
chrome.storage.local.get(['completionLink', 'currentStudyPart'], function (result) {
  console.log(result)
  if (result.completionLink && result.currentStudyPart != 3) {
    link = '<p>A new tab with the questionnaire should have opened. If not, <a href="'+result.completionLink+'" target="_blank">proceed to questionnaire</a> now.';
    completionLink.innerHTML = link
  }
})