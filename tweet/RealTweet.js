class RealTweet extends Tweet {
	constructor (articleHTML) {
		super();
		this._article = $(articleHTML);
	}

	replaceWith(article, ran_misinfo, fakeTweet) {
		// article = $(article)
		to_replace = $(article)
		// choose random fake tweet
		// var ran_misinfo = new_random()
		// if (ran_misinfo == undefined) {
		// 	return;
		// } else if ($(to_replace).attr('data-misinfo-id') != undefined) {
		// 	const index = alreadyInjected.indexOf(ran_misinfo);
		// 	if (index > -1) {
		// 		alreadyInjected = alreadyInjected.splice(index - 1, 1);
		// 	}
		// 	return;
		// }

		let tweet = manipulated_tweets[ran_misinfo]
		let username = tweet['username']
		let name = tweet['name']
		let profile_image_url = tweet['profile_image_url']
		let tweet_id = tweet['id']

		let replies = tweet['public_metrics.reply_count']
		let retweets = tweet['public_metrics.retweet_count']
		let likes = tweet['public_metrics.like_count']


		let text = $(tweet['html']).first()[0]

		$(to_replace).attr('data-misinfo-id', ran_misinfo)
		$(to_replace).attr('data-misinfo-tweet-id', fakeTweet.id)

		$(to_replace).find("[data-testid='socialContext']").parents().eq(5).remove()
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

		$(to_replace).find("[data-testid='reply'] span[data-testid='app-text-transition-container'] span").text(fakeTweet.replies)
		$(to_replace).find("[data-testid='retweet'] span[data-testid='app-text-transition-container'] span").text(fakeTweet.retweets)
		$(to_replace).find("[data-testid='like'] span[data-testid='app-text-transition-container'] span").text(fakeTweet.likes)
		let contentContainer = $(article).find("div[lang]").parent().parent()
		console.log('article', $(article))
		contentContainer.css('border', '0px solid red')
		$(contentContainer).children().not(":last").remove()

		contentContainer = $(contentContainer)[0]
		contentContainer.prepend(text);
		// var wrapper = document.createElement('div');
		// wrapper.innerHTML = tweet['html'];
		const n = contentContainer.querySelector("a[role=link] > div > div > div[dir=auto] > span > span")
		try {
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
		$(contentContainer).find("div[lang]").css('font-size', '15px')
		$(contentContainer).find("div[lang]").css('line-height', '20px')
		$(contentContainer).find("div[lang]").parent().css('margin-top', '0')
		modifyLikeButton(article, tweet_id)

		observer.observe($(to_replace)[0]);
	
}

	static new_random(firstHalfExhausted = false) {
	half = (manipulated_tweets.length - 1) / 2
	full = (manipulated_tweets.length - 1)
	limit = firstHalfExhausted ? full : half

	console.log("[ran] select misinfo between 0 and ", limit)
	console.log("[ran] alreadyInjected ", alreadyInjected.length)
	var ran_misinfo = FakeTweet.getRandomInt(0, limit)
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

	removePromotedMessage() {
	let res = Array.from(this._article.get()[0].querySelectorAll('span'))
		.find(el => el.textContent.includes('SomeText, text continues.'));
		console.log("promoted", res)
			// $(this._article).find("span:contains('Promoted')").parent().parent().remove()
	}

	removeSocialContext() {
		$(this._article).find("[data-testid='socialContext']").parents().eq(5).remove()
	}

	replaceLink() {
		$(this._article).find("a").eq(2).attr('href', '/' + this._fakeTweet.username + '/status/' + this._fakeTweet.id)
	}

	replaceProfileImage() {
		$(this._article).find("a").eq(0).find("img").attr('src', this._fakeTweet.profile_image_url)
		$(this._article).find("a").eq(0).find("img").prev().attr("style", "background-image: url('" + this._fakeTweet.profile_image_url + "')")

	}

	replaceUserName() {
		$(this._article).find("a[role=link] div[dir=auto]:first-child span span").text(this._fakeTweet.username)
		.parents().eq(4).attr('href', '/' + this._fakeTweet.username)
		.hover(function (e) { e.stopPropagation() })
	}

	replaceName() {
		$(this._article).find("a[role=link] div[dir=ltr] span").text("@" + this._fakeTweet.name)
	}

	replaceReplies() {
		$(this._article).find("[data-testid='reply'] span[data-testid='app-text-transition-container'] span").text(this._fakeTweet.replies)	
	}
	
	replaceRetweets() {
		$(this._article).find("[data-testid='retweet'] span[data-testid='app-text-transition-container'] span").text(this._fakeTweet.retweets)
	}
	
	replaceLikes() {
		$(this._article).find("[data-testid='like'] span[data-testid='app-text-transition-container'] span").text(this._fakeTweet.likes)
	}

}