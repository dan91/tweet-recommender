class RealTweet extends Tweet {
	constructor (articleHTML) {
		super();
		this.article = articleHTML;
		// DOM.createElementFromHTML(articleHTML);
	}

	replaceWith(fakeTweet) {
		this.fakeTweet = fakeTweet;

		this.article.dataset.misinfoId = fakeTweet.index;
		this.article.dataset.misinfoTweetId = fakeTweet.id;

		this.removeSocialContext();
		this.removePromotedMessage();

		this.replaceLink();
		this.replaceProfileImage();
		this.replaceUserName();
		this.replaceName();

		this.replaceReplies();
		this.replaceRetweets();
		this.replaceLikes();


		this.contentContainer = this.article.querySelector("div[lang]").parentElement.parentElement;


		this.contentContainer.querySelectorAll(":scope > :not(:last-child").forEach(e => e.remove());

		this.contentContainer.prepend(fakeTweet.content);

		this.removeHeader()
		this.removeDateAndTime()
		this.removeSocialBar()
		this.removeShareButtons()
		this.removeSpacer()
		

		this.contentContainer.querySelector("div[lang]").style.fontSize = '15px';
		this.contentContainer.querySelector("div[lang]").style.lineHeight = '20px';
		this.contentContainer.querySelector("div[lang]").parentElement.style.marginTop = '0';
		modifyLikeButton(this.article, fakeTweet.id)

		observer.observe(this.article);
	}

	removeSocialContext() {

		const so_con = this.article.querySelector("[data-testid='socialContext']");
		if(so_con) {
			so_con.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove();
		}
	}

	removePromotedMessage() {
		let res = Array.from(this.article.querySelectorAll('span'))
			.find(el => el.textContent === 'Promoted');
		if(res) {
			res.parentElement.parentElement.remove()
		}
	}

	replaceLink() {
		this.article.querySelectorAll("a")[2].setAttribute('href', '/' + this.fakeTweet.username + '/status/' + this.fakeTweet.id);
	}

	replaceProfileImage() {
		this.article.querySelector("a img").src = this.fakeTweet.profile_image_url
		this.article.querySelector("a img").previousSibling.style.backgroundImage = "url('" + this.fakeTweet.profile_image_url + "')"
	}

	replaceUserName() {
		const username_container = this.article.querySelector("a[role=link] div[dir=auto]:first-child span span");
		username_container.textContent = (this.fakeTweet.username);
		const profile_image_container = username_container.parentElement.parentElement.parentElement.parentElement.parentElement
		profile_image_container.setAttribute('href', '/' + this.fakeTweet.username);
		profile_image_container.addEventListener('mouseover', function(e) { e.stopPropagation() })
		username_container.addEventListener('mouseover', function(e) { e.stopPropagation() })

	}

	replaceName() {
		this.article.querySelector("a[role=link] div[dir=ltr] span").textContent = "@" + this.fakeTweet.name
	}

	replaceReplies() {
		this.article.querySelector("[data-testid='reply'] span[data-testid='app-text-transition-container'] span").textContent = this.fakeTweet._replies
	}
	
	replaceRetweets() {
		this.article.querySelector("[data-testid='retweet'] span[data-testid='app-text-transition-container'] span").textContent = this.fakeTweet._retweets
	}
	
	replaceLikes() {
		this.article.querySelector("[data-testid='like'] span[data-testid='app-text-transition-container'] span").textContent = this.fakeTweet._likes
	}

	removeHeader() {
		const header = this.contentContainer.querySelector("a[role=link] > div > div > div[dir=auto] > span > span")
		header.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
	}

	removeDateAndTime() {
		const date_and_time = Array.from(this.contentContainer.querySelectorAll('span[aria-hidden="true"] > span')).find(el => el.textContent == '·');
		date_and_time.parentElement.parentElement.parentElement.parentElement.remove()
	}

	removeSocialBar() {
		const social_bar = this.contentContainer.querySelector(":first-child").querySelector("[data-testid=app-text-transition-container]")
		social_bar.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
	}

	removeShareButtons() {
		const share_buttons = this.contentContainer.querySelector(":first-child").querySelector("div[role=group]")
		share_buttons.remove()
	}

	removeSpacer() {
		const spacer = this.contentContainer.querySelector("div:first-child > div:first-child > div:first-child > div:first-child > div:first-child > div:first-child")
		spacer.parentElement.parentElement.remove()
	}

	static new_random(firstHalfExhausted = false) {
		half = (manipulated_tweets.length - 1) / 2
		full = (manipulated_tweets.length - 1)
		limit = firstHalfExhausted ? full : half

		console.log("[ran] select misinfo between 0 and ", limit)
		console.log("[ran] alreadyInjected ", alreadyInjected.length)
		var ran_misinfo = FakeTweet.getRandomInt(0, limit)
		if (!alreadyInjected.includes(ran_misinfo)) {
			return ran_misinfo;
		} else if (alreadyInjected.length < limit) {
			return new_random(firstHalfExhausted)
		} else {
			console.log("[ran] no new tweets")
			if (!firstHalfExhausted) {
				console.log("[ran] first half exhausted, now choose between all")
				return new_random(true)
			} else {
				alreadyInjected = []
				chrome.storage.local.set({ 'alreadyInjected': [] });
				console.log("[ran] completely exhausted. RESET")
				return new_random(true)
			}
		}
	}

}