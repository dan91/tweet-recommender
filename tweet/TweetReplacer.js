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

		this.realTweet.setRetweets(this.fakeTweet.retweets);
		this.realTweet.setReplies(this.fakeTweet.replies);
		this.realTweet.setLikes(this.fakeTweet.likes);

		this.realTweet.tweetElementContentContainer.querySelectorAll(":scope > :not(:last-child)").forEach(e => e.remove());
		// this.realTweet.tweetElementContentContainer.insertAdjacentHTML('afterbegin', this.fakeTweet.tweetHTML);
		this.realTweet.tweetElementContentContainer.prepend(this.fakeTweet.tweetElement);
		// this.realTweet.tweetElementContentContainer.prepend('NEW TWEET HERE');

		// all of this could be done in python too
		this.fakeTweet.removeHeader();
		this.fakeTweet.removeDateAndTime();
		this.fakeTweet.removeSocialBar();
		this.fakeTweet.removeShareButtons();
		this.fakeTweet.removeSpacer();
		this.fakeTweet.removeShowThread();

		this.fakeTweet.styling()
		
		// this.realTweet.like_handler(this.fakeTweet);
		this.realTweet.attachClickHandlers(this.fakeTweet);

		observer.observe(this.realTweet.tweetElement);
	}
}