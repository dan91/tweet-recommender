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

window.addEventListener('load', () => {
	const gettingStoredSettings = chrome.storage.local.get("experiment");
	gettingStoredSettings.then((result) => {
		if(!result.experiment) {
			chrome.runtime.sendMessage({showOptionsPage: true});
			return;
		}
		console.log('setup Exp', result)
		const condition = result.condition;
		const prolificID = result.participant_id;
		const trial = result.trial;
		timer = setInterval(checkTimer, 1000)
		DOM.waitForElm("article").then(() => {
			new_tweet_observer.observe(
				document.querySelector("div[aria-label='Timeline: Your Home Timeline'] > div"),
				new_tweet_observer_config
			);
		});
	})
});
setupExp()

// if all required fields in popup are filled in, set up the experiment
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.allSet) {
			setupExp()
		}
	}
);

// todo: we need to observe impressions for fake AND real tweets, so we can determine exact proportion of seen fake tweets
function onEntry(entry) {
		entry.forEach((change) => {
			if (change.isIntersecting) {
				const tweetID = change.target.dataset.misinfoTweetId;
				const misinfoID = parseInt(change.target.dataset.misinfoId);
				logEvent('impression', tweetID);
				
			// this is needed so we can later ask in the survey how accurate participants think the tweet was
			// we store the index of the tweet in the array, so we can map it to the soscisurvey (here, IDs start with 0 and we can't control them, hence we map it here)

			chrome.storage.local.get('impressions', function (result) {
				// find a more elegant solution to deal with the impressions object -> background script?
				if(!result.impressions) {
					result.impressions = {};
				}
				let impressions = {};
				impressions.fake_tweets = result.impressions.fake_tweets ? result.impressions.fake_tweets : [];
				impressions.fake_tweets_counter = result.impressions.fake_tweets_counter ? result.impressions.fake_tweets_counter : 0;
				impressions.real_tweets_counter = result.impressions.real_tweets_counter ? result.impressions.real_tweets_counter : 0;

				if(tweetID) {
					if(!impressions.fake_tweets.includes(misinfoID)) {
						impressions.fake_tweets.push(misinfoID);
						impressions.fake_tweets_counter++;
					}
				} else {
					impressions.real_tweets_counter++;
				}

				chrome.storage.local.set({ 'impressions': impressions });

			});
		}
	});
}

// list of options
let options = {
	threshold: .6
};

let observer = new IntersectionObserver(onEntry, options);


feed = new Feed();

const new_tweet_observer_config = { childList: true, subTree: true };

const new_tweet_observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		mutation.addedNodes.forEach(n => {
			observer.observe(n)
		});
		// could maintain an array of observers, so we could disconnect when tweet is removed from feed
		// mutation.removedNodes.forEach(n => { observer.disconnect()})
		feed.updateFeed()
		// if new tweets (articles) are loaded, inject new misinfo
		if (window.location.pathname.includes('home')) {
			feed.inject();
			attachClickHandlers()
		}
	});
});



activated = false

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
		.then(() => {
			if (callback != null) {
				callback()
			}
		})
		.catch((error) => {
			console.error("Error adding document: ", error);
		});
	})
}

nudgeActivated = false




