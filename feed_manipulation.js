function injectMisinfo() {
	num_tweets = $("article").length
	misinfo_proportion = 0.5
	filtered = []
	// filter out tweets that have replies (so we don't break existing conversations)
	for (var i = 0; i < $("article").length; i++) {
		if (f.replacable_tweets.length > 0) {
			filtered.push(i)
		}
	}
	// get the last tweet that was considered for replacement and only replace afterwards
	var replaced = $("article[data-misinfo-id]").length
	for (var j = 0; j <= num_tweets * misinfo_proportion; j++) {
		if (replaced < (num_tweets * misinfo_proportion)) {
			tweet_idx_to_replace = Maths.getRandomInt(0, num_tweets)
			if (!filtered.includes(tweet_idx_to_replace) && !isElementInViewport($("article").eq(tweet_idx_to_replace)[0])) {
				replaceArticle($("article").eq(tweet_idx_to_replace))
				replaced++;
				console.log('continue with more misinfo: ', replaced / num_tweets, ' - should be ', misinfo_proportion)

			} else {
				console.log('skipping, this is a reply')
			}
		} else {
			console.log('replace ratio exceeded', replaced / num_tweets, ' - should be ', misinfo_proportion)

		}
	}
	lastArticleLength = num_tweets
	attachClickHandlers()
}

function isElementInViewport(el) {
	var rect = el.getBoundingClientRect();

	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
		rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
		);
}