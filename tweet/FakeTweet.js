class FakeTweet extends Tweet {
	constructor(tweet) {
		super();
		this.alreadyInjected = false;

		this.username = tweet.username
		this.name = tweet.name
		this.profile_image_url = tweet.profile_image_url
		this.id = tweet.id
		this.index = tweet.index
		this._retweets = tweet['public_metrics.retweet_count']
		this._replies = tweet['public_metrics.reply_count']
		this._likes = tweet['public_metrics.like_count']
		this.tweetElement = DOM.createElementFromHTML(tweet['html'])
	}

	get replies() {
		if (this._replies == 0) { 
			return Math.floor(this._retweets / 2)
		}
	}

	set replies(replies) {
		this._replies = replies;
	}

	get retweets() {
		if (this._retweets < 5) {
			return Maths.getRandomInt(11, 99)
		}
	}

	set retweets(retweets) {
		this._retweets = retweets;
	}

	get likes() {
		if (this._likes == 0) { 
			return Math.floor(this._retweets * 4) 
		}
	}

	set likes(likes) {
		this.likes = likes
	}

	removeHeader() {
		const header = this.tweetElement.querySelector("a[role=link] > div > div > div[dir=auto] > span > span")
		header.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
	}

	removeDateAndTime() {
		const date_and_time = Array.from(this.tweetElement.querySelectorAll('span[aria-hidden="true"] > span')).find(el => el.textContent == '·');
		date_and_time.parentElement.parentElement.parentElement.parentElement.remove()
	}

	removeSocialBar() {
		const social_bar = this.tweetElement.querySelector(":first-child").querySelector("[data-testid=app-text-transition-container]")
		social_bar.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
	}

	removeShareButtons() {
		const share_buttons = this.tweetElement.querySelector(":first-child").querySelector("div[role=group]")
		share_buttons.remove()
	}

	removeSpacer() {
		const spacer = this.tweetElement.querySelector("div:first-child > div:first-child > div:first-child > div:first-child > div:first-child > div:first-child")
		spacer.parentElement.parentElement.remove()
	}

	styling() {
		this.tweetElement.querySelector("div[lang]").style.fontSize = '15px';
		this.tweetElement.querySelector("div[lang]").style.lineHeight = '20px';
		this.tweetElement.querySelector("div[lang]").parentElement.style.marginTop = '0';
	}
}