class RealTweet extends Tweet {
	constructor (tweet) {
		super();
		this.tweetElement = tweet;
		this.tweetElementContentContainer = tweet.querySelector("div[lang]").parentElement.parentElement;
	}

	removeSocialContext() {
		const so_con = this.tweetElement.querySelector("[data-testid='socialContext']");
		if(so_con) {
			so_con.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove();
		}
	}

	removePromotedMessage() {
		const res = Array.from(this.tweetElement.querySelectorAll('span'))
			.find(el => el.textContent === 'Promoted');
		if(res) {
			res.parentElement.parentElement.remove()
		}
	}

	setLink(username, id) {
		this.tweetElement.querySelectorAll("a")[2].setAttribute('href', '/' + username + '/status/' + id);
	}

	setProfileImage(profile_image_url) {
		const image_container = this.tweetElement.querySelector("a img")
		if(image_container) {
			image_container.src = profile_image_url;
			image_container.previousSibling.style.backgroundImage = "url('" + profile_image_url + "')";
		}
	}

	setUserName(username) {
		const username_container = this.tweetElement.querySelector("a[role=link] div[dir=auto]:first-child span span");
		username_container.textContent = (username);
		const profile_image_container = username_container.parentElement.parentElement.parentElement.parentElement.parentElement
		profile_image_container.setAttribute('href', '/' + username);
		profile_image_container.addEventListener('mouseover', function(e) { e.stopPropagation() })
		username_container.addEventListener('mouseover', function(e) { e.stopPropagation() })

	}

	setName(name) {
		this.tweetElement.querySelector("a[role=link] div[dir=ltr] span").textContent = "@" + name
	}

	setReplies(replies) {
		this.tweetElement.querySelector("[data-testid='reply'] span[data-testid='app-text-transition-container'] span").textContent = replies
	}
	
	setRetweets(retweets) {
		this.tweetElement.querySelector("[data-testid='retweet'] span[data-testid='app-text-transition-container'] span").textContent = retweets
	}
	
	setLikes(likes) {
		this.tweetElement.querySelector("[data-testid='like'] span[data-testid='app-text-transition-container'] span").textContent = likes
	}

	// this should not live here
	static new_random(firstHalfExhausted = false) {
		const half = (manipulated_tweets.length - 1) / 2
		const full = (manipulated_tweets.length - 1)
		const limit = firstHalfExhausted ? full : half

		console.log("[ran] select misinfo between 0 and ", limit)
		console.log("[ran] alreadyInjected ", alreadyInjected.length)
		var ran_misinfo = Maths.getRandomInt(0, limit)
		if (!alreadyInjected.includes(ran_misinfo)) {
			return ran_misinfo;
		} else if (alreadyInjected.length < limit) {
			return RealTweet.new_random(firstHalfExhausted)
		} else {
			console.log("[ran] no new tweets")
			if (!firstHalfExhausted) {
				console.log("[ran] first half exhausted, now choose between all")
				return RealTweet.new_random(true)
			} else {
				alreadyInjected = []
				chrome.storage.local.set({ 'alreadyInjected': [] });
				console.log("[ran] completely exhausted. RESET")
				return RealTweet.new_random(true)
			}
		}
	}

}