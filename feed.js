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

misinfo_ids = misinfo_tweets.map(e => e.id)
alreadyInjected = []
notifiedStudyCompleted = undefined
prolificID = undefined
condition = undefined
show_nudge = undefined
currentStudyPart = undefined
timer = undefined
study = undefined

urlParams = window.location.search
if (urlParams.includes('resettimer')) {
	resetTimer()
	if(urlParams.includes('sdfierwui4v')) {
		chrome.storage.local.set({ 'currentStudyPart': 2 })
		currentStudyPart = 2
        chrome.storage.local.set({ 'completionLink': false })
	} else if(urlParams.includes('5489fdu23')) {
		chrome.storage.local.set({ 'currentStudyPart': 3 })
		currentStudyPart = 3
		chrome.storage.local.set({ 'completionLink': false })
	}
}

function setupExp() {
	chrome.storage.local.get(['condition', 'prolificID', 'currentStudyPart', 'study', 'duration'], function (result) {
		console.log('setup Exp', result)
		notifiedStudyCompleted = result.currentStudyPart >= 3 && result.duration > 60*5
		if (result.condition && result.prolificID && !notifiedStudyCompleted) {
			condition = result.condition
			prolificID = result.prolificID
			study = result.study
			currentStudyPart = result.currentStudyPart ? result.currentStudyPart : 1
			timer = setInterval(checkTimer, 1000)
			if (condition == 1) {
				show_nudge = 0
			} else if (condition == 2) {
				show_nudge = 1
				nudge = 'network + flag'
			} else if (condition == 3) {
				show_nudge = 1
				nudge = 'overall + flag'
			} else if (condition == 4) {
				show_nudge = 1
				nudge = 'combined + flag'
			}
			checkIfLoaded()
		}
	});
}
setupExp()
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.allSet) {
			setupExp()
		}
	}
);
i = undefined;
idleLogoutCalled = false

function checkIfLoaded() {
	if (!prolificID || !condition || notifiedStudyCompleted) {
		console.log('prolificID or condition not set or study completed')
		chrome.runtime.sendMessage({ running: false });
		chrome.storage.local.set({ 'running': false })

		return;
	}
	chrome.runtime.sendMessage({ running: true });
	chrome.storage.local.set({ 'running': true })

	clearInterval(i)
	console.log(prolificID, 'prolificID')
	console.log(condition, 'condition')
	i = setInterval(function () {
		if ($("article").length >= 5 && window.location.pathname.includes('/home')) {
			clearInterval(i)
			injectMisinfo()
		} else if (window.location.pathname.includes('status') && !activated && $("article").length >= 1) {
			tweet_id = window.location.pathname.split('/').pop()
			if (misinfo_ids.includes(tweet_id)) {
				// $("article").eq(0).parent().parent().parent().parent().children().not(':first').remove()
				setTimeout(function () {


					// $('div[role=group]').closest("article").parent().parent().parent().nextAll().remove()

					activateObserver()
					activated = true;
					console.log('we are on a status page')
					clearInterval(i)
					$('div[role=group]').closest("article").attr("data-misinfo-id", 1)
					lastInteractionWithMisinfoTweetId = tweet_id
					$('div[role=group]').closest("article").attr("data-misinfo-tweet-id", tweet_id)

					modifyLikeButton($('div[role=group]').closest("article"), tweet_id)
					attachClickHandlers(false);
				}, 400)
			}
		}
	}, 1000);
}

lastArticleLength = 0;
lastInteractionWithMisinfo = false
lastInteractionWithMisinfoId = 0;
lastInteractionWithMisinfoTweetId = 0;
i2 = undefined;
chrome.storage.local.get(['alreadyInjected'], function (result) {
	alreadyInjected = result.alreadyInjected ? result.alreadyInjected : []
});
filled_heart = '<svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi"><g><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"></path></g></svg>'
empty_heart = '<svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi"><g><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z"></path></g></svg>'
empty_retweet = '<svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi"><g><path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"></path></g></svg>'
filled_retweet = '<svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi"><g><path d="M23.615 15.477c-.47-.47-1.23-.47-1.697 0l-1.326 1.326V7.4c0-2.178-1.772-3.95-3.95-3.95h-5.2c-.663 0-1.2.538-1.2 1.2s.537 1.2 1.2 1.2h5.2c.854 0 1.55.695 1.55 1.55v9.403l-1.326-1.326c-.47-.47-1.23-.47-1.697 0s-.47 1.23 0 1.697l3.374 3.375c.234.233.542.35.85.35s.613-.116.848-.35l3.375-3.376c.467-.47.467-1.23-.002-1.697zM12.562 18.5h-5.2c-.854 0-1.55-.695-1.55-1.55V7.547l1.326 1.326c.234.235.542.352.848.352s.614-.117.85-.352c.468-.47.468-1.23 0-1.697L5.46 3.8c-.47-.468-1.23-.468-1.697 0L.388 7.177c-.47.47-.47 1.23 0 1.697s1.23.47 1.697 0L3.41 7.547v9.403c0 2.178 1.773 3.95 3.95 3.95h5.2c.664 0 1.2-.538 1.2-1.2s-.535-1.2-1.198-1.2z"></path></g></svg>'

function nudge_text(tweet_id, like = false) {
	n_tweet = misinfo_tweets.filter(obj => {
		return obj.id === tweet_id
	})
	retweets = n_tweet[0]['public_metrics.retweet_count']
	network_factor = 10
	platform_factor = 500
	proportion_interacted = getRandomInt(95, 99)
	if (retweets < 2)
		retweets = getRandomInt(2, 5)
	else if (retweets > 100) {
		retweets = getRandomInt(70, 90)
	}
	network_not_interacted = new Intl.NumberFormat().format(Math.floor((retweets * network_factor * (proportion_interacted / 100)) / generateNum(retweets)) * generateNum(retweets))
	network_total = new Intl.NumberFormat().format(Math.ceil((retweets * network_factor) / generateNum(retweets)) * generateNum(retweets))
	platform_not_interacted = new Intl.NumberFormat().format(Math.round((retweets * platform_factor * (proportion_interacted / 100)) / generateNum(retweets)) * generateNum(retweets))
	platform_total = new Intl.NumberFormat().format(Math.round(((retweets * platform_factor)) / generateNum(retweets)) * generateNum(retweets))
	if (nudge == 'network + flag') {
		text = 'In your personal Twitter network, ' + network_not_interacted + ' out of ' + network_total + ' people saw but did not like, reply or retweet this Tweet. <p>Some or all of the content shared in this Tweet conflicts with guidance from public health experts regarding COVID-19.</p>'
		n_icon = 'group'
	} else if (nudge == 'overall + flag') {
		text = 'On Twitter, ' + platform_total + ' other users saw but did not like, reply or retweet this Tweet.<p>Some or all of the content shared in this Tweet conflicts with guidance from public health experts regarding COVID-19.</p>'
		n_icon = 'group'
	} else if (nudge = 'combined + flag') {
		n_icon = 'group'
		text = 'In your personal Twitter network, ' + network_not_interacted + ' out of ' + network_total + ' people saw but did not like, reply or retweet this Tweet. On Twitter, ' + platform_total + ' other users saw but did not like, reply or retweet this Tweet.<p>Some or all of the content shared in this Tweet conflicts with guidance from public health experts regarding COVID-19.</p>'
	}
	icon_path = 'src = "' + chrome.runtime.getURL("images/" + n_icon + "1x.png") + '" srcset="' + chrome.runtime.getURL("images/" + n_icon + "2x.png") + ' 1.5x"'
	padding = like ? '40px 0 0 20px' : '20px'
	return '<div style="padding: 0 10px; ' + (like ? '' : 'border: 1px solid #e6e6e6; background-color: #f7f7f7; border-radius:10px; margin:20px') + '" lang="en" dir="auto" class="css-901oao r-18jsvk2 r-1qd0xha r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0" id="id__sq5hsr8ka3k"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0"><span style="float: right;padding: ' + padding + '"><img ' + icon_path + '></span><p>' + text + '</p></div>';
}

function generateNum(v) {
	return Math.pow(10, v.toString().length - 1);
}

function like_dialog(misinfo_id, mode = 'like') {
	icon = (mode == 'like' ? empty_heart : empty_retweet)
	return '<div class="css-1dbjc4n nudgeConfirmDialog"><div lang="en" dir="auto" class="css-901oao r-18jsvk2 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0" id="id__vm2a74c5cwq" style="padding: 0 20px;margin: 20px 0; border: 1px solid #e6e6e6; background-color: #f7f7f7; border-radius:10px"><div class="css-1dbjc4n r-1habvwh r-1pz39u2 r-1777fci r-15ysp7h r-s8bhmr"><div aria-label="Close" role="button" tabindex="0" class="close css-18t94o4 css-1dbjc4n r-1niwhzg r-42olwf r-sdzlij r-1phboty r-rs99b7 r-2yi16 r-1qi8awa r-1ny4l3l r-o7ynqc r-6416eg r-lrvibr" style="margin-left: calc(-5px); padding-top:20px; "><div dir="auto" class="css-901oao r-1awozwy r-18jsvk2 r-6koalj r-18u37iz r-16y2uox r-37j5jr r-a023e6 r-b88u0q r-1777fci r-rjixqe r-bcqeeo r-q4m81j r-qvutc0"><svg viewBox="0 0 24 24" aria-hidden="true" class="r-18jsvk2 r-4qtqp9 r-yyyyoo r-z80fyv r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-19wmn03"><g><path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path></g></svg><span class="css-901oao css-16my406 css-bfa6kz r-poiln3 r-a023e6 r-rjixqe r-bcqeeo r-qvutc0" style="border-bottom: 2px solid rgb(15, 20, 25);"></span></div></div></div><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">' + nudge_text(misinfo_id, true) + '</span><div style="margin-bottom: 20px; margin-left: 40%; width: 20%; " role="button" tabindex="0" class="css-18t94o4 css-1dbjc4n r-l5o3uw r-42olwf r-sdzlij r-1phboty r-rs99b7 r-19u6a5r r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr" data-testid="tweetButton"><div dir="auto" class="css-901oao r-1awozwy r-jwli3a r-6koalj r-18u37iz r-16y2uox r-37j5jr r-a023e6 r-b88u0q r-1777fci r-rjixqe r-bcqeeo r-q4m81j r-qvutc0"><span class="css-901oao css-16my406 css-bfa6kz r-poiln3 r-a023e6 r-rjixqe r-bcqeeo r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">' + icon + '</span></span></div></div></div></div>'
}


// impressions = []
function onEntry(entry) {
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
				console.log('added to impressions', impressions)
			})
			// impressions.push(misinfo_ids.indexOf(tweetID) + 1)
			alreadyInjected.push(parseInt(change.target.dataset.misinfoId))
			chrome.storage.local.set({ 'alreadyInjected': alreadyInjected });
		}
	});
}

// list of options
let options = {
	threshold: .6
};

// instantiate a new Intersection Observer
let observer = new IntersectionObserver(onEntry, options);

function new_random(firstHalfExhausted = false) {
	half = (misinfo_tweets.length - 1) / 2
	full = (misinfo_tweets.length - 1)
	limit = firstHalfExhausted ? full : half

	console.log("[ran] select misinfo between 0 and ", limit)
	console.log("[ran] alreadyInjected ", alreadyInjected.length)
	var ran_misinfo = getRandomInt(0, limit)
	if (!alreadyInjected.includes(ran_misinfo)) {
		return ran_misinfo;
	} else if (alreadyInjected.length < limit) {
		return new_random(firstHalfExhausted)
	} else {
		console.log("[ran] no new tweets")
		if (!firstHalfExhausted) {
			console.log("[ran] first half exhausted, now choose between all")
			return new_random(true)
		} else {
			alreadyInjected = []
			chrome.storage.local.set({ 'alreadyInjected': [] });
			console.log("[ran] completely exhausted. RESET")
			return new_random(true)
		}
	}
}


function replaceArticle(article) {
	to_replace = $(article)
	// choose random fake tweet
	var ran_misinfo = new_random()
	if (ran_misinfo == undefined) {
		return;
	} else if ($(to_replace).attr('data-misinfo-id') != undefined) {
		const index = alreadyInjected.indexOf(ran_misinfo);
		if (index > -1) {
			alreadyInjected = alreadyInjected.splice(index - 1, 1);
		}
		return;
	}

	tweet = misinfo_tweets[ran_misinfo]
	username = tweet['username']
	name = tweet['name']
	profile_image_url = tweet['profile_image_url']
	tweet_id = tweet['id']

	replies = tweet['public_metrics.reply_count']
	retweets = tweet['public_metrics.retweet_count']
	likes = tweet['public_metrics.like_count']

	// text = $(tweet['html']).find("div[data-testid='tweet']")
	text = $(tweet['html']).first()[0]

	// text.querySelector("div div:nth-child(2)").remove()
	// $(text).children().first().children().first().hide()
	// $(text).children().first().children().first().hide()
	// console.log(articles.length)

	$(to_replace).attr('data-misinfo-id', ran_misinfo)
	$(to_replace).attr('data-misinfo-tweet-id', tweet_id)
	$(to_replace).find("[data-testid='socialContext']").parents().eq(5).remove()
	// $(to_replace).parent().parent().parent();
	// console.log($(to_replace).parent().parent().parent()find("*"))
	// $(to_replace).find("a").attr('href', 'https://www.google.com')
	$(to_replace).find("a").eq(2).attr('href', '/' + username + '/status/' + tweet_id)
	// image
	$(to_replace).find("a").eq(0).find("img").attr('src', profile_image_url)

	$(to_replace).find("a").eq(0).find("img").prev().attr("style", "background-image: url('" + profile_image_url + "')")
	// name
	$(article).find("a[role=link] div[dir=auto]:first-child span span").text(username)
		.parents().eq(4).attr('href', '/' + username)
		.hover(function (e) { e.stopPropagation() })

	// handle
	$(article).find("a[role=link] div[dir=ltr] span").text("@" + name)
	// text
	$(article).find("span:contains('Promoted')").parent().parent().remove()

	// reply count
	// fake some engagement if needed
	if (retweets < 5) {
		retweets = getRandomInt(11, 99)
	}
	if (likes == 0) { likes = Math.floor(retweets * 4) }
	if (replies == 0) { replies = Math.floor(retweets / 2) }
	$(to_replace).find("[data-testid='reply'] span[data-testid='app-text-transition-container'] span").text(replies)
	$(to_replace).find("[data-testid='retweet'] span[data-testid='app-text-transition-container'] span").text(retweets)
	$(to_replace).find("[data-testid='like'] span[data-testid='app-text-transition-container'] span").text(likes)
	// console.log($("div[lang='en']").eq(1).find("span:contains('Promoted')"))
	// contentContainer = $("div[data-testid='tweet']").eq(tweet_idx_to_replace).children().eq(1).children().eq(1)
	// contentContainer = $(article).find("div[data-testid='tweet']").children().eq(1).children().eq(1)
	contentContainer = $(article).find("div[lang]").parent().parent()
	contentContainer.css('border', '0px solid red')
	// console.log("contentContainer", $(contentContainer))
	$(contentContainer).children().not(":last").remove()

	// text = $(text)[0]
	// text = text.querySelector("div")
	// if ($(text).length == 0) {

	// 	text = $(tweet['html'])
	// }
	contentContainer = $(contentContainer)[0]
	contentContainer.prepend(text);
	var wrapper = document.createElement('div');
	wrapper.innerHTML = tweet['html'];
	// contentContainer.prepend(wrapper);
	const n = contentContainer.querySelector("a[role=link] > div > div > div[dir=auto] > span > span")
	// console.log(n)
	try {
		// if(n.querySelector("div:first-child").children[1].length == 1)
		// 	n.parentElement.style.border = '2px solid purple'
		n.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.border = '1px solid green'
		n.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
	} catch (error) {
		console.log(error)
	}

	// time and date of tweet
	const t = Array.from(contentContainer.querySelectorAll('span[aria-hidden="true"] > span')).find(el => el.textContent == '·');
	try {
		t.parentElement.parentElement.parentElement.parentElement.style.border = '1px solid orange'
		t.parentElement.parentElement.parentElement.parentElement.remove()
	} catch (error) {
		console.log(error)
	}

	const r = contentContainer.querySelector(":first-child").querySelector("[data-testid=app-text-transition-container]")
	try {
		r.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.border = '1px solid red'
		r.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
	} catch (error) {
		console.log(error)
	}

	// (duplicate) share buttons
	const g = contentContainer.querySelector(":first-child").querySelector("div[role=group]")
	try {
		g.style.border = '1px solid yellow'
		g.remove()
	} catch (error) {
		console.log(error)
	}

	// spacer div
	const s = contentContainer.querySelector("div:first-child > div:first-child > div:first-child > div:first-child > div:first-child > div:first-child")
	if (s != null) {
		s.parentElement.parentElement.style.border = '1px solid brown'
		s.parentElement.parentElement.remove()
	}


	// contentContainer.querySelector("div + div + div").remove()
	// contentContainer.querySelector("div + div + div").remove()

	// console.log(contentContainer)
	$(contentContainer).find("div[lang]").css('font-size', '15px')
	$(contentContainer).find("div[lang]").css('line-height', '20px')
	$(contentContainer).find("div[lang]").parent().css('margin-top', '0')
	modifyLikeButton(article, tweet_id)

	observer.observe($(to_replace)[0]);
}

function modifyLikeButton(article, current_tweet_id) {
	$(article).find("[data-testid='like']").click(function (e) {
		logEvent('clicked on like', current_tweet_id)
		likeClick = this
		e.stopPropagation()
		current_tweet = this.querySelector("div").closest("article")
		dialog = current_tweet.parentElement.querySelector(".nudgeConfirmDialog")
		if (current_tweet.dataset.liked != "1") {
			if (!show_nudge) {
				likeClick.querySelector("svg").outerHTML = filled_heart
				current_tweet.dataset.liked = "1"
				logEvent('liked', current_tweet_id)
			} else if (dialog == null) {
				n_text = like_dialog(current_tweet_id)
				appended = $(current_tweet).find("div[role=group]").parent().prepend(n_text)
				$(appended).find(".close").click(function () {
					$(this).parents().find(".nudgeConfirmDialog").remove()
				})
				current_tweet.dataset.liked = "0"
				document.querySelector(".nudgeConfirmDialog div[data-testid='tweetButton']").addEventListener('click', function () {
					likeClick.querySelector("svg").outerHTML = filled_heart
					$(this).parents().find(".nudgeConfirmDialog").remove()
					current_tweet.dataset.liked = "1"
					logEvent('liked', current_tweet_id)
				})
			} else {
				$(this).parents().find(".nudgeConfirmDialog").remove()
			}
		} else {
			logEvent('unliked', current_tweet_id)
			current_tweet.dataset.liked = "0"
			likeClick.querySelector("svg").outerHTML = empty_heart
		}
	})
}

$(window).scroll(function () {
	// if new tweets (articles) are loaded, inject new misinfo
	if (lastArticleLength != $("article").length && window.location.pathname.includes('home') && condition && prolificID) {
		replaced = 0;
		console.log("new articles have arrived. inject misinfo")
		injectMisinfo()
	}
});
activated = false
function isElementInViewport(el) {
	var rect = el.getBoundingClientRect();

	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
		rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
	);
}

function injectMisinfo() {
	num_tweets = $("article").length
	misinfo_proportion = 0.5
	filtered = []
	// filter out tweets that have replies (so we don't break existing conversations)
	for (var i = 0; i < $("article").length; i++) {
		noreplies = $('article').eq(i).find('div').filter(function () {
			return $(this).css('width') == '2px';
		});
		if (noreplies.length > 0) {
			filtered.push(i)
		}
	}
	// get the last article that was considered for replacement and only replace afterwards
	var replaced = $("article[data-misinfo-id]").length
	// console.log('currently replaced ', $("article[data-misinfo-id]").length, 'articles. In total: ', $("article").length)
	// console.log($("article").not("[data-misinfo-id]").length)
	for (var j = 0; j <= num_tweets * misinfo_proportion; j++) {
		// console.log('we are now at run ', j, ' from ', num_tweets*misinfo_proportion, '. So far replaced ', $("article[data-misinfo-id]").length, ' articles of ', num_tweets)
		if (replaced < (num_tweets * misinfo_proportion)) {
			tweet_idx_to_replace = getRandomInt(0, num_tweets)
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

function attachClickHandlers(redirect = true) {
	console.log("now attaching handlers", $("article").length)
	$("article:not([data-misinfo-id])").off('click')
	$("article:not([data-misinfo-id])").click(function () {
		clearInterval(i2);
		// logEvent('click on tweet')
		lastInteractionWithMisinfo = false
	})
	$("article[data-misinfo-id]").off('click')
	$("article[data-misinfo-id]").click(function (e) {
		clearInterval(i2)
		lastInteractionWithMisinfo = true
		lastInteractionWithMisinfoId = $(this).data('misinfo-id');
		lastInteractionWithMisinfoTweetId = $(this).data('misinfo-tweet-id');
		i2 = setInterval(checkIfVisible, 100)
		// go to misinfo tweet when clicked on tweet (except for the reply retweet, like buttons OR when on status page)
		if (redirect && $(e.target).parents('[data-testid="like"], [data-testid="retweet"], [data-testid="reply"], .nudgeConfirmDialog').length == 0 && !$(e.target).is('[data-testid="like"], [data-testid="retweet"], [data-testid="reply"]')) {
			e.stopPropagation()
			href = $(this).find("a").eq(2).attr('href')
			logEvent('click on misinformation', lastInteractionWithMisinfoTweetId, function () { window.location.href = href })
		} else if ($(e.target).parents('[data-testid="reply"]').length == 1) {
			logEvent('clicked on reply', lastInteractionWithMisinfoTweetId)
		}
		attachButtonHandler($(this))
	})
}
function getUsername() {
	username = $("a[aria-label='Profile']").attr('href').substr(1)
	return username
}
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
function logEvent(type, tweet = null, callback = null, content = null) {
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
}
function checkIfVisible() {
	popup = $("div[aria-modal='true']")
	if ($("div[aria-modal='true']:visible")) {
		clearInterval(i2)
		if (lastInteractionWithMisinfo) {
			$(popup).find("article").parent().parent().hide()
			if (show_nudge) {
				n_text = nudge_text(lastInteractionWithMisinfoTweetId)
				$(popup).find("article").parent().parent().parent().prepend(n_text)
			}
			tweetButton = $(popup).find("[data-testid='tweetButton']")
			$(tweetButton).find("span span").click(function (e) {
				logEvent('submitted reply', lastInteractionWithMisinfoTweetId, null, $("div[data-editor] span[data-text]").text())
				// $("div[data-editor] span[data-text]").text('')
				e.stopPropagation();
				$(tweetButton).css('background-color', 'green');
				$(this).text("Reply saved!");
				setTimeout(function () {
					$("#layers").children().last().remove()
					document.documentElement.setAttribute('style', 'overflow: auto scroll; overscroll-behavior-y: none; font-size: 15px;')
					window.history.pushState({}, '', '/home');
					location.reload();
				}, 2000)
			})
		}
	}
}
function attachButtonHandler(article) {
	setTimeout(function () {
		$("[role=menuitem]").first().click(function (e) {
			logEvent('clicked on retweet confirm', lastInteractionWithMisinfoTweetId)
			if (lastInteractionWithMisinfo) {

				tweet = $(article)[0]
				dialog = tweet.parentElement.querySelector(".nudgeConfirmDialog")
				svg_container = $("article[data-misinfo-id='" + lastInteractionWithMisinfoId + "'] div[data-testid='retweet']")
				if ($(svg_container).data('retweeted') != "1") {
					if (!show_nudge) {
						$(svg_container).data('retweeted', 1)
						$(svg_container).find("svg").replaceWith(filled_retweet)
						logEvent('retweeted', tweet_id)
					} else if (dialog == null) {
						n_text = like_dialog(tweet_id, mode = 'retweet')
						appended = $(tweet).find("div[role=group]").parent().prepend(n_text)
						$(appended).find(".close").click(function () {
							$(this).parents().find(".nudgeConfirmDialog").remove()
						})
						$(svg_container).data('retweeted', 0)
						document.querySelector(".nudgeConfirmDialog div[data-testid='tweetButton']").addEventListener('click', function () {
							$(svg_container).find("svg").replaceWith(filled_retweet)
							$(this).parents().find(".nudgeConfirmDialog").remove()
							$(svg_container).data('retweeted', 1)
							logEvent('retweeted', tweet_id)
						})
					} else {
						$(this).parents().find(".nudgeConfirmDialog").remove()
					}
				} else {
					logEvent('unretweeted', tweet_id)
					$(svg_container).data('retweeted', 0)
					$(svg_container).find("svg").replaceWith(empty_retweet)
				}
				$("div[role=dialog]").hide()
				e.stopPropagation()
			}
		})
		$("[role=menuitem]").eq(1).click(function () {
			logEvent('clicked on quote retweet', lastInteractionWithMisinfoTweetId)
			if (lastInteractionWithMisinfo) {
				setTimeout(function () {
					$("div[role=dialog] div[data-testid='attachments']").hide()
					if (show_nudge) {
						$("div[role=dialog] div[data-testid='attachments']").parent().parent().prepend(nudge_text(lastInteractionWithMisinfoTweetId))
					}
					popup = $("div[role=dialog]")
					tweetButton = $(popup).find("[data-testid='tweetButton']")
					$(tweetButton).find("span span").click(function (e) {
						e.stopPropagation();
						logEvent('submitted retweet with quote', lastInteractionWithMisinfoTweetId, null, $("div[data-editor] span[data-text]").text())
						// $("div[data-editor] span[data-text]").remove()
						window.history.pushState({}, '', '/home');
						$(tweetButton).css('background-color', 'green');
						$(tweetButton).find("span span").text("Tweet saved!");
						document.documentElement.setAttribute('style', 'overflow: auto scroll; overscroll-behavior-y: none; font-size: 15px;')
						svg_container = $("article[data-misinfo-id='" + lastInteractionWithMisinfoId + "'] div[data-testid='retweet']")
						$(svg_container).data('retweeted', 1)
						$(svg_container).find("svg").replaceWith(filled_retweet)
						setTimeout(function () {
							$(popup).remove();
							location.reload();
						}, 2000)
					})
				}, 200)

			}
		})
	}, 200);
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

function checkTimer() {
	chrome.storage.local.get(['start', 'currentStudyPart', 'impressions'], function (result) {
		if (!result.start) {
			start = Date.now()
			chrome.storage.local.set({ 'start': start })
		} else
			start = result.start
		duration = Math.floor((Date.now() - start) / 1000)
		console.log(duration)
		chrome.storage.local.set({ 'duration': duration })

		const minuteDuration = 2
		// DO NOT FORGET TO DISABLE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// const minuteDuration = 60
		if (duration == (minuteDuration * 5)) {
			currentStudyPart = result.currentStudyPart ? result.currentStudyPart : 1
			chrome.storage.local.set({ 'currentStudyPart': currentStudyPart })
			console.log('study part completed', currentStudyPart)
			clearInterval(timer)
			if (currentStudyPart <= 3) {
				chrome.runtime.sendMessage({ 'studyPartComplete': true });
			}
		}
	})
}

function resetTimer() {
	chrome.storage.local.set({ 'start': Date.now() })
}