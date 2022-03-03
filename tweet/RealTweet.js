class RealTweet extends Tweet {
	constructor (tweet) {
		super();
		this.tweetElement = tweet;
		this.tweetElementContentContainer = tweet.querySelector("div[lang]")
			.parentElement
			.parentElement;
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

	like_handler(fakeTweet) {
		// if we are replacing a real tweet, we assign the like to the fake tweet.
		// if not, we are on a singe tweet page and keep the real tweet id
		const tweet_id = fakeTweet ? fakeTweet.id : this.id;
		this.tweetElement.querySelector("[data-testid='like']").addEventListener('click', (e) => {
			logEvent('clicked on like', tweet_id)
			e.stopPropagation();
			const orig_target = e.currentTarget;
			const dialog = this.tweetElement.parentElement.querySelector(".nudgeConfirmDialog")
			if (this.tweetElement.dataset.liked !== "1") {
				if (!show_nudge) {
					e.currentTarget.querySelector("svg").outerHTML = filled_heart
					this.tweetElement.dataset.liked = "1"
					logEvent('liked', tweet_id);
				} else if (dialog == null) {
					const n_text = like_dialog(tweet_id);
					const appended = this.tweetElement.querySelector("div[role=group]");
					appended.parentElement.insertAdjacentHTML('afterbegin', n_text);
					this.tweetElement.querySelector("div.close").addEventListener('click',  (f) => {
						f.currentTarget.closest(".nudgeConfirmDialog").remove()
					})
					this.tweetElement.dataset.liked = "0"
					document.querySelector(".nudgeConfirmDialog div[data-testid='tweetButton']").addEventListener('click', (g) => {
						orig_target.querySelector("svg").outerHTML = filled_heart
						g.currentTarget.closest(".nudgeConfirmDialog").remove();
						this.tweetElement.dataset.liked = "1"
						logEvent('liked', tweet_id)
					})
				} else {
					e.currentTarget.closest(".nudgeConfirmDialog").remove()
				}
			} else {
				logEvent('unliked', tweet_id)
				this.tweetElement.dataset.liked = "0"
				e.currentTarget.querySelector("svg").outerHTML = empty_heart
			}
		})
	}

}