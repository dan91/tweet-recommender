// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// we need to get rid of this evil gobal variables...
misinfo_ids = manipulated_tweets.map(e => e.id)
alreadyInjected = []
notifiedStudyCompleted = undefined
prolificID = undefined
condition = undefined
show_nudge = undefined
currentStudyPart = undefined
timer = undefined
study = undefined
urlParams = window.location.search
lastArticleLength = 0;
lastInteractionWithMisinfo = false
lastInteractionWithMisinfoId = 0;
lastInteractionWithMisinfoTweetId = 0;
i2 = undefined;
i = undefined;
idleLogoutCalled = false

setupExp()

// if all required fields in popup are filled in, set up the experiment
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.allSet) {
			setupExp()
		}
	}
	);


function generateNum(v) {
	return Math.pow(10, v.toString().length - 1);
}

function onEntry(entry) {

	chrome.storage.local.get(['alreadyInjected'], function (result) {
		alreadyInjected = result.alreadyInjected ? result.alreadyInjected : []


		entry.forEach((change) => {
			if (change.isIntersecting) {
				tweetID = change.target.dataset.misinfoTweetId
				logEvent('impression', tweetID);
				
			// this is needed so we can later ask in the survey how accurate participants think the tweet was
			// we store the index of the tweet in the array, so we can map it to the soscisurvey (here, IDs start with 0 and we can't control them, hence we map it here)

			chrome.storage.local.get('impressions', function (result) {
				impressions = result.impressions ? result.impressions : []
				impressions.push(misinfo_ids.indexOf(tweetID) + 1)
				chrome.storage.local.set({ 'impressions': impressions });
			})
			alreadyInjected.push(parseInt(change.target.dataset.misinfoId))
			chrome.storage.local.set({ 'alreadyInjected': alreadyInjected });
		}
	});
	});
}

// list of options
let options = {
	threshold: .6
};

let observer = new IntersectionObserver(onEntry, options);




$(window).scroll(function () {
	// if new tweets (articles) are loaded, inject new misinfo
	if (lastArticleLength != $("article").length && window.location.pathname.includes('home') && condition && prolificID) {
		replaced = 0;
		console.log("new articles have arrived. inject misinfo")
		injectMisinfo()
	}
});
activated = false



function getUsername() {
	username = $("a[aria-label='Profile']").attr('href').substr(1)
	return username
}

function logEvent(type, tweet = null, callback = null, content = null) {
	chrome.storage.local.get(['currentStudyPart'], function(result) {
		currentStudyPart = result.currentStudyPart ? result.currentStudyPart : 0
		db.collection("engagements").add({
			type: type,
			user: prolificID,
			tweet: tweet,
			timestamp: Date.now(),
			browser: navigator.userAgent,
			content: content,
			condition: condition,
			currentStudyPart: currentStudyPart,
			study: study
		})
		.then((docRef) => {
			console.log("Engagement detected:", type, tweet, docRef.id);
			if (callback != null) {
				callback()
			}
		})
		.catch((error) => {
			console.error("Error adding document: ", error);
		});
	})
}


history.pushState = (f => function pushState() {
	var ret = f.apply(this, arguments);
	window.dispatchEvent(new Event('pushstate'));
	window.dispatchEvent(new Event('locationchange'));
	return ret;
})(history.pushState);

history.replaceState = (f => function replaceState() {
	var ret = f.apply(this, arguments);
	window.dispatchEvent(new Event('replacestate'));
	window.dispatchEvent(new Event('locationchange'));
	return ret;
})(history.replaceState);

window.addEventListener('popstate', () => {
	window.dispatchEvent(new Event('locationchange'))
});

window.addEventListener('locationchange', function () {
	console.log('location changed!');
})

nudgeActivated = false

function activateObserver() {
	document.querySelector("[data-testid=reply").addEventListener('click', function () {
		clearInterval(i2)
		i2 = setInterval(checkIfVisible, 100)
	})
}


