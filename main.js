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
	gettingStoredSettings.then(load_experiment);
});

function load_experiment(result) {
	if(!result.experiment) {
		chrome.runtime.sendMessage({showOptionsPage: true});
		return;
	}
	console.log('setup Exp', result)
	// start the experiment timer
	let timer = setInterval(checkTimer, 1000);
	let nudge = result.experiment.nudge_message;
	let show_nudge = 1;
	// todo: use 2 separate content scripts and match patterns
	if (window.location.pathname.includes('/home')) {
		console.log('includes home, wait for article to appear');
		DOM.waitForElm("article", document.body).then(init_tweet_observer);
	} else if (window.location.pathname.includes('status')) {
		init_single_tweet();
	}
}

function init_tweet_observer() {
	const selector = "div[aria-label='Timeline: Your Home Timeline'] > div";
	console.log('start observer')
	new_tweet_observer.observe(document.querySelector(selector), new_tweet_observer_config);
}

function single_tweet_handlers(tweet_id) {
	replyButtonClickObserver();
	console.log('we are on a status page')
	const realTweet = new RealTweet(document.querySelector('div[role=group]').closest("article"));
	realTweet.tweetElement.setAttribute("data-misinfo-id", 1);
	realTweet.tweetElement.setAttribute("data-misinfo-tweet-id", tweet_id)

	realTweet.like_handler()
	// modifyLikeButton(tweet, tweet_id)
	attachClickHandlers(false);
}

function init_single_tweet() {
	const tweet_id = window.location.pathname.split('/').pop()
	if (!misinfo_ids.includes(tweet_id)) {
		return;
	}
	DOM.waitForElm("article").then((tweet_id) => { single_tweet_handlers(tweet_id) });
}


// setupExp()

// if all required fields in popup are filled in, set up the experiment
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.allSet) {
			setupExp()
		}
	}
);

function onEntry(entry) {
		entry.forEach((change) => {
			if (!change.isIntersecting) {
				return;
			}
			const tweetID = change.target.dataset.misinfoTweetId;
			const misinfoID = parseInt(change.target.dataset.misinfoId);
			logEvent('impression', tweetID);

			const getting_impressions = chrome.storage.local.get('impressions');
			getting_impressions.then(result => {
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
			observer.observe(n);
		});
		// could maintain an array of observers, so we could disconnect when tweet is removed from feed
		// mutation.removedNodes.forEach(n => { observer.disconnect()})
		feed.updateFeed();
		feed.inject();
		// attachClickHandlers();
	});
});



activated = false

function logEvent(type, tweet_id = null, callback = null, content = null) {
	const gettingExperiment = chrome.storage.local.get('experiment');
	gettingExperiment.then((result)  => {
		const experiment = result.experiment;
		db.collection("engagements").add({
			type: type,
			participant_id: experiment.participant_id,
			condition: experiment.condition,
			trial: experiment.trial,
			tweet: tweet_id,
			timestamp: Date.now(),
			browser: navigator.userAgent,
			content: content,
		}).then(() => {
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




