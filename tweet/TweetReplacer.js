class TweetReplacer {
	constructor(realTweet, fakeTweet) {
		this.realTweet = realTweet;
		this.fakeTweet = fakeTweet;
	}

	replace() {
		this.realTweet.tweetElement.dataset.misinfoId = this.fakeTweet.index;
		this.realTweet.tweetElement.dataset.misinfoTweetId = this.fakeTweet.id;

		this.realTweet.removeSocialContext();
		this.realTweet.removePromotedMessage();

		this.realTweet.setLink(this.fakeTweet.username, this.fakeTweet.id);
		this.realTweet.setProfileImage(this.fakeTweet.profile_image_url);
		this.realTweet.setUserName(this.fakeTweet.username);
		this.realTweet.setName(this.fakeTweet.name);

		// FIXME: does not call the getters in FakeTweet.js -> does not show manipulated engagement
		this.realTweet.setReplies(this.fakeTweet._replies);
		this.realTweet.setRetweets(this.fakeTweet._retweets);
		this.realTweet.setLikes(this.fakeTweet._likes);

		this.realTweet.tweetElementContentContainer.querySelectorAll(":scope > :not(:last-child").forEach(e => e.remove());
		this.realTweet.tweetElementContentContainer.prepend(this.fakeTweet.tweetElement);

		// all of this could be done in python too
		this.fakeTweet.removeHeader()
		this.fakeTweet.removeDateAndTime()
		this.fakeTweet.removeSocialBar()
		this.fakeTweet.removeShareButtons()
		this.fakeTweet.removeSpacer()
		this.fakeTweet.removeShowThread()
		
		this.fakeTweet.styling()
		
		// TODO: make class method (needs some refactoring first, e.g. an Experiment class)
		modifyLikeButton(this.realTweet.tweetElement, this.fakeTweet.id)

		observer.observe(this.realTweet.tweetElement);
	}
}