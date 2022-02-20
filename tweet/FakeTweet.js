class FakeTweet extends Tweet {
	constructor(tweet) {
		super();
		this._alreadyInjected = false;

		this._username = tweet.username
		this._name = tweet.name
		this._profile_image_url = tweet.profile_image_url
		this._id = tweet.id
		this._index = tweet.index
		this._retweets = tweet['public_metrics.retweet_count']
		this._replies = tweet['public_metrics.reply_count']
		this._likes = tweet['public_metrics.like_count']
		this._content = $(tweet['html']).first()[0]
	}

	get alreadyInjected() {
		return this._alreadyInjected;
	}

	set alreadyInjected(alreadyInjected) {
		this._alreadyInjected = alreadyInjected;
	}

	set replies(replies) {
		if (replies == 0) { 
			this._replies = Math.floor(this._retweets / 2) 
		}
	}

	set retweets(retweets) {
		if (retweets < 5) {
			this._retweets = FakeTweet.getRandomInt(11, 99)
		}
	}

	set likes(likes) {
		if (likes == 0) { 
			this._likes = Math.floor(this._retweets * 4) 
		}
	}

	static getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}
}