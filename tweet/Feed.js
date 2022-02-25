class Feed {
	constructor() {
		this._tweets = document.querySelectorAll("article")
	}

	get num_tweets() {
		this.tweets.length;
	}

	get tweets() {
		return this._tweets;
	}

	set tweets(tweets) {
		this._tweets = tweets;
	}

	updateFeed() {
		this.tweets = document.querySelectorAll("article");
	}

	get replacable_tweets() {
		return Array.from(this.tweets).filter(t => {
    		return Array.from(t.querySelectorAll("div")).find(d => getComputedStyle(d).width != "2px");
		})
	}
}