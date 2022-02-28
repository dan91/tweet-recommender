class Feed {
	constructor() {
		this.updateFeed()
	}

	get num_tweets() {
		this.tweets.length;
	}


	get fake_tweets() {
		return this.tweets.filter(t => t.hasAttribute("data-misinfo-id"));
	}

	get real_tweets() {
		return this.tweets.filter(t => !t.hasAttribute("data-misinfo-id"));
	}

	get fakeTweetRatio() {
		return this.fake_tweets.length / this.tweets.length
	}


	updateFeed() {
		this.tweets = Array.from(document.querySelectorAll("article"));
		chrome.storage.local.get('impressions', result => {
			this.impressions = result.impressions ? result.impressions : []
		});
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
		const replaceable_tweets = this.replaceable_tweets;
		// todo: need to keep track of history of previously replaced tweets, so we have a reliable ratio
		// currently we only estimate ratio based on tweets in current feed, but when users scroll those get replaced all the time

		// if there is less replaceable tweets than we want to replace given the proportion, we replace all replaceable tweets
		const k = (this.tweets.length * ratio <= replaceable_tweets.length) ? Math.floor(this.tweets.length * ratio) : replaceable_tweets.length;
		return (replaceable_tweets.length === 0) ? [] : Arrays.sample(replaceable_tweets, k, false);
	}

	get injectable_fake_tweets() {
		const all_fake_tweets_ids = [...manipulated_tweets.keys()];

		//	https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
		return all_fake_tweets_ids.filter(x => {
			return (!this.fake_tweets.map(e => parseInt(e.dataset.misinfoId)).includes(x) && !this.impressions.includes(x));
		});
	}

	inject() {
		this.sample_real_tweets.forEach(t => {
			const realTweet = new RealTweet(t)
			const injectable_fake_tweets = this.injectable_fake_tweets;
			if(injectable_fake_tweets.length >= 1) {
				const random_misinfo_tweet_index = Arrays.sample(injectable_fake_tweets, 1, false);
				const tweet = manipulated_tweets[random_misinfo_tweet_index];
				tweet.index = random_misinfo_tweet_index;
				const fakeTweet = new FakeTweet(tweet);
				console.log('- injecting new fake tweet: ', fakeTweet)
				const r = new TweetReplacer(realTweet, fakeTweet);
				r.replace();
				this.updateFeed();
			}
		});
	}
}