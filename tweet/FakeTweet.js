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
		this.content = DOM.createElementFromHTML(tweet['html'])
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
}