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

// todo: here we need an init function

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


feed = new Feed();

const new_tweet_observer_config = { childList: true, subTree: true };

const new_tweet_observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		mutation.addedNodes.forEach(n => {
			observer.observe(n)
		});
		// could maintain an array of observers, so we could disconnect when tweets is removed from feed
		// mutation.removedNodes.forEach(n => { observer.disconnect()})
		feed.updateFeed()
		// if new tweets (articles) are loaded, inject new misinfo
		if (window.location.pathname.includes('home') && condition && prolificID) {
			replaced = 0;
			feed.inject();
			attachClickHandlers()
		}
	});
});

// first we need to wait for Twitter's react to load before we can observe new tweets
const selector = "article"
DOM.waitForElm(selector).then(() => {
	console.log(document.querySelector(selector))
	new_tweet_observer.observe(document.querySelector("div[aria-label='Timeline: Your Home Timeline'] > div"), new_tweet_observer_config);
});

function injectMisinfoOLD() {
	let num_tweets = $("article").length
	misinfo_proportion = 0.5

	// Feed.replaceable_tweets
	filtered = []
	// filter out tweets that have replies (so we don't break existing conversations)
	for (var i = 0; i < $("article").length; i++) {
		// this should be replaced by Feed.replacable_tweets
		noreplies = $('article').eq(i).find('div').filter(function () {
			return $(this).css('width') === '2px';
		});
		if (noreplies.length > 0) {
			filtered.push(i)
		}
	}
	// get the last tweet that was considered for replacement and only replace afterwards
	var replaced = $("article[data-misinfo-id]").length
	for (var j = 0; j <= num_tweets * misinfo_proportion; j++) {
		if (replaced < (num_tweets * misinfo_proportion)) {
			tweet_idx_to_replace = Maths.getRandomInt(0, num_tweets)
			if (!filtered.includes(tweet_idx_to_replace) && !isElementInViewport($("article").eq(tweet_idx_to_replace)[0])) {
				replaceArticle($("article").eq(tweet_idx_to_replace))
				replaced++;
				console.log('continue with more misinfo: ', replaced / num_tweets, ' - should be ', misinfo_proportion)

			} else {
				console.log('skipping, this is a reply')
			}
		} else {
			console.log('replace ratio exceeded', replaced / num_tweets, ' - should be ', misinfo_proportion)

		}
	}
	lastArticleLength = num_tweets
	attachClickHandlers()
}

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

nudgeActivated = false




