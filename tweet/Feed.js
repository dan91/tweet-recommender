class Feed {
	constructor() {
		this._tweets = Array.from(document.querySelectorAll("article"));
	}

	get num_tweets() {
		this.tweets.length;
	}

	get tweets() {
		return this._tweets;
	}

	get fake_tweets() {
		return this._tweets.filter(t => t.hasAttribute("data-misinfo-id"));
	}

	get real_tweets() {
		return this._tweets.filter(t => !t.hasAttribute("data-misinfo-id"));
	}

	get fakeTweetRatio() {
		return this.fake_tweets.length / this.tweets.length
	}

	set tweets(tweets) {
		this._tweets = tweets;
	}

	updateFeed() {
		this.tweets = Array.from(document.querySelectorAll("article"));
	}

	// tweets that are (1) real tweets, (2) not in the viewport, (3) and are not replies can be replaced.
	get replaceable_tweets() {
		return this.real_tweets.filter(t => {
				// replies have a 2px wide div next to them
				return (Array.from(t.querySelectorAll("div")).find(d => getComputedStyle(d).width !== "2px")) &&
					!(DOM.isElementInViewport(t));
		})
	}

	get sample_real_tweets() {
		// todo: ratio needs to go to a Config object
		const ratio = 0.5;

		// todo: need to keep track of history of previously replaced tweets, so we have a reliable ratio
		// currently we only estimate ratio based on tweets in current feed, but when users scroll those get replaced all the time
		
		// if there is less replaceable tweets than we want to replace given the proportion, we only replace the ratio of replaceable tweets
		const k = (this.tweets.length * ratio >= this.replaceable_tweets.length) ? Math.floor(this.tweets.length * ratio) : this.replaceable_tweets.length * ratio;
		return Arrays.sample(this.replaceable_tweets, k, false);
	}
}