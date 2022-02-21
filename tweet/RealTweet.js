class RealTweet extends Tweet {
	constructor (articleHTML) {
		super();
		this.article = $(articleHTML);
	}

	replaceWith(fakeTweet) {
		this.fakeTweet = fakeTweet;

		$(this.article).attr('data-misinfo-id', fakeTweet.index)
		$(this.article).attr('data-misinfo-tweet-id', fakeTweet.id)

		this.removeSocialContext();
		this.removePromotedMessage();

		this.replaceLink();
		this.replaceProfileImage();
		this.replaceUserName();
		this.replaceName();

		this.replaceReplies();
		this.replaceRetweets();
		this.replaceLikes();

		let contentContainer = $(this.article).find("div[lang]").parent().parent()
		contentContainer.css('border', '0px solid red')
		$(contentContainer).children().not(":last").remove()

		contentContainer = $(contentContainer)[0]
		contentContainer.prepend(fakeTweet.content);
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
		modifyLikeButton(this.article, fakeTweet.id)

		observer.observe($(this.article)[0]);
	}

	removePromotedMessage() {
		let res = Array.from(this.article.get()[0].querySelectorAll('span'))
			.find(el => el.textContent === 'Promoted');
		if(res) {
			res.parentElement.parentElement.remove()
		}
	}

	removeSocialContext() {
		$(this.article).find("[data-testid='socialContext']").parents().eq(5).remove()
	}

	replaceLink() {
		$(this.article).find("a").eq(2).attr('href', '/' + this.fakeTweet.username + '/status/' + this.fakeTweet.id)
	}

	replaceProfileImage() {
		$(this.article).find("a").eq(0).find("img").attr('src', this.fakeTweet.profile_image_url)
		$(this.article).find("a").eq(0).find("img").prev().attr("style", "background-image: url('" + this.fakeTweet.profile_image_url + "')")

	}

	replaceUserName() {
		$(this.article).find("a[role=link] div[dir=auto]:first-child span span").text(this.fakeTweet.username)
		.parents().eq(4).attr('href', '/' + this.fakeTweet.username)
		.hover(function (e) { e.stopPropagation() })
	}

	replaceName() {
		$(this.article).find("a[role=link] div[dir=ltr] span").text("@" + this.fakeTweet.name)
	}

	replaceReplies() {
		$(this.article).find("[data-testid='reply'] span[data-testid='app-text-transition-container'] span").text(this.fakeTweet._replies)	
	}
	
	replaceRetweets() {
		$(this.article).find("[data-testid='retweet'] span[data-testid='app-text-transition-container'] span").text(this.fakeTweet._retweets)
	}
	
	replaceLikes() {
		$(this.article).find("[data-testid='like'] span[data-testid='app-text-transition-container'] span").text(this.fakeTweet._likes)
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

}