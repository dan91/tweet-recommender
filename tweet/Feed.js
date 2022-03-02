class Feed {
	constructor() {
		this.updateFeed(true);
	}

	get fake_tweets() {
		return this.tweets.filter(t => t.hasAttribute("data-misinfo-id"));
	}

	get real_tweets() {
		return this.tweets.filter(t => !t.hasAttribute("data-misinfo-id"));
	}

	reset_fake_tweets() {
		if ([...manipulated_tweets.keys()].length === this.impressions.fake_tweets.length) {
			console.log('we have seen all fake tweets now. lets go for another round...');
			this.impressions.fake_tweets = [];
			chrome.storage.local.set({'impressions': this.impressions});
		}
	}

	updateFeed(reset = false) {
		this.tweets = Array.from(document.querySelectorAll("article"));
		chrome.storage.local.get('impressions', result => {
			if(!result.impressions) {
				result.impressions = {};
			}

			this.impressions = {};
			this.impressions.real_tweets_counter = result.impressions.real_tweets_counter ? result.impressions.real_tweets_counter : 0;
			this.impressions.fake_tweets_counter = result.impressions.fake_tweets_counter ? result.impressions.fake_tweets_counter : 0;

			this.impressions.fake_tweets = result.impressions.fake_tweets ? result.impressions.fake_tweets : [];

			this.fake_tweets_proportion = this.impressions.fake_tweets_counter / this.impressions.real_tweets_counter;

			if(reset) {
				this.reset_fake_tweets();
			}
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

	// sample the correct amount of real tweets that will be replaced by fake tweets
	get sample_real_tweets() {
		// todo: ratio needs to go to a Config object
		const max_fake_tweets_proportion = 0.5;
		const replaceable_tweets = this.replaceable_tweets;

		console.log('I have seen ', this.impressions.real_tweets_counter, ' real tweets and ', this.impressions.fake_tweets_counter, ' fake tweets');
		console.log('Ratio: ', ( this.fake_tweets_proportion ));

		if(this.fake_tweets_proportion >= max_fake_tweets_proportion) {
			console.log('Ratio exceeded. Not replacing anything.')
			return [];
		}

		// if there is less replaceable tweets than we want to replace, we replace all replaceable tweets
		const k = (this.tweets.length * max_fake_tweets_proportion <= replaceable_tweets.length) ? Math.floor(this.tweets.length * max_fake_tweets_proportion) : replaceable_tweets.length;
		return (replaceable_tweets.length === 0) ? [] : Arrays.sample(replaceable_tweets, k, false);
	}

	get injectable_fake_tweets() {
		const all_fake_tweets_ids = [...manipulated_tweets.keys()];

		//	https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
		return all_fake_tweets_ids.filter(x => {
			return (!this.fake_tweets.map(e => parseInt(e.dataset.misinfoId)).includes(x) && !this.impressions.fake_tweets.includes(x));
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