class RealTweet extends Tweet {
	constructor(tweet) {
		super();
		this.tweetElement = tweet;
		this.tweetElementContentContainer = tweet.querySelector("div[lang]")
			.parentElement
			.parentElement;
	}

	// social context example "XYZ retweeted"
	removeSocialContext() {
		const so_con = this.tweetElement.querySelector("[data-testid='socialContext']");
		if (so_con) {
			so_con.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove();
		}
	}

	removePromotedMessage() {
		const res = Array.from(this.tweetElement.querySelectorAll('span'))
			.find(el => el.textContent === 'Promoted');
		if (res) {
			res.parentElement.parentElement.remove()
		}
	}

	setLink(username, id) {
		this.tweetElement.querySelectorAll("a")[2].setAttribute('href', '/' + username + '/status/' + id);
	}

	setProfileImage(profile_image_url) {
		const image_container = this.tweetElement.querySelector("a img")
		if (image_container) {
			image_container.src = profile_image_url;
			image_container.previousSibling.style.backgroundImage = "url('" + profile_image_url + "')";
		}
	}

	setUserName(username) {
		const username_container = this.tweetElement.querySelector("a[role=link] div[dir=auto]:first-child span span");
		username_container.textContent = (username);
		const profile_image_container = username_container.parentElement.parentElement.parentElement.parentElement.parentElement
		profile_image_container.setAttribute('href', '/' + username);
		profile_image_container.addEventListener('mouseover', function (e) {
			e.stopPropagation()
		})
		username_container.addEventListener('mouseover', function (e) {
			e.stopPropagation()
		})

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

	like_handler(e, fakeTweet) {
		// if we are replacing a real tweet, we assign the like to the fake tweet.
		// if not, we are on a singe tweet page and keep the real tweet id
		const tweet_id = fakeTweet ? fakeTweet.id : this.id;
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
				this.tweetElement.querySelector("div.close").addEventListener('click', (f) => {
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
			this.tweetElement.dataset.liked = "0";
			e.currentTarget.querySelector("svg").outerHTML = empty_heart;
		}
	}

	reply_handler(e, fakeTweet) {
		const reply_modal_config = {childList: true, subTree: true};
		const reply_modal_observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.addedNodes.length < 1)
					return;
				DOM.waitForElm("article", mutation.addedNodes[0]).then(() => {
					this.insert_nudge(mutation.addedNodes[0], fakeTweet);
				});
				reply_modal_observer.disconnect();
			});
		});
		reply_modal_observer.observe(document.getElementById("layers"), reply_modal_config);
	}

	retweet_handler(e, fakeTweet) {
		// mutation observer for when role='menuitem' appears in div[role='menu']
		// attach click handlers to both menu items (see attachClickHandlers function below)
		//

		const retweet_modal_config = {childList: true, subTree: true, attributes: true, characterData: true};
		const retweet_modal_observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				const addedNodes = mutation.addedNodes;
				const removedNodes = mutation.removedNodes;
				console.log('added nodes', addedNodes);
				console.log('removed nodes', removedNodes);
				if(removedNodes.length > 0) {
					// if(removedNodes[0].querySelector("[role='menuitem']") !== null) {
						console.log('menu closed, disconnect observer')
						retweet_modal_observer.disconnect();
						return;
				}
				if (addedNodes.length === 0) {
					console.log('no added nodes, skip')
					return;
				}

				if (document.getElementById("layers").querySelector("[role='menuitem']") !== null) {
					console.log('menuitem appeared')
				} else if(document.getElementById("layers").querySelector("[role='tooltip']") !== null) {
					console.log('tooltip appeared')
				} else if(document.getElementById("layers").querySelector("[role='dialog']") !== null) {
					console.log('modal appeared');
					return;
				}

				try {
					console.log('try to bind direct retweet');
					document.querySelector("div[role='menuitem'] span").addEventListener('click', (e) => {
						console.log('click direct retweet')
						this.direct_retweet_handler(e, fakeTweet);
					});
				} catch (e) {
					console.log('direct retweet not present, so probably clicked quote retweet?', e)
				}
				try {
					console.log('try to bind quote retweet');
					document.querySelector("a[role='menuitem'] span").addEventListener('click', (e) => {
						console.log('click quote retweet')
						this.quote_retweet_handler(e, fakeTweet);
					});
				} catch (e) {
					console.log('quote retweet not present, so probably clicked direct retweet?', e)
				}
			});
		});
		retweet_modal_observer.observe(document.getElementById("layers"), retweet_modal_config);
		console.log('observer started')
	}

	attachClickHandlers(fakeTweet, redirect = true) {
		this.tweetElement.addEventListener('click', (e) => {
			// this preserves functionality for all tweet icons, e.g. sharing and 3 dots on top right
			if (e.target.tagName === 'svg' || e.target.tagName === 'path')
				return;

			const link = this.tweetElement.querySelectorAll("a")[2].getAttribute('href');
			console.log('redirect to tweet', e.target)
			e.stopPropagation();
			logEvent('click on misinformation', fakeTweet.id, function () {
				window.location.href = link
			})
		});
		this.tweetElement.querySelector("[data-testid='reply']").addEventListener('click', (e) => {
			this.reply_handler(e, fakeTweet)
		});
		this.tweetElement.querySelector("[data-testid='like']").addEventListener('click', (e) => {
			this.like_handler(e, fakeTweet)
		});
		this.tweetElement.querySelector("[data-testid='retweet']").addEventListener('mouseenter', (e) => {
			console.log('hovered on retweet');
			this.retweet_handler(e, fakeTweet)
		});

	}

	insert_nudge(modal, fakeTweet) {
		modal = modal.querySelector("div[aria-modal='true']");
		if (show_nudge) {
			const referred_tweet = modal.querySelector("article").parentElement.parentElement;
			const n_text = nudge_text(fakeTweet.id);
			referred_tweet.parentElement.insertAdjacentHTML('afterbegin', n_text);
			referred_tweet.remove();
		}
		const tweetButton = modal.querySelector("[data-testid='tweetButton']");
		tweetButton.querySelector("span span").addEventListener('click', (e) => {
			logEvent('submitted reply', fakeTweet.id, null, modal.querySelector("div[data-editor] span[data-text]").textContent)
			e.stopPropagation();
			tweetButton.style.backgroundColor = 'green';
			e.currentTarget.textContent = "Reply saved!";
			setTimeout(function () {
				document.getElementById("layers").lastChild.remove();
				document.documentElement.setAttribute('style', 'overflow: auto scroll; overscroll-behavior-y: none; font-size: 15px;')
				window.history.pushState({}, '', '/home');
				location.reload();
			}, 2000)
		});
	}


	direct_retweet_handler(e, fakeTweet) {
		logEvent('clicked on retweet confirm', lastInteractionWithMisinfoTweetId)

		const dialog = fakeTweet.parentElement.querySelector(".nudgeConfirmDialog")
		const svg_container = fakeTweet.tweetElement.querySelector("div[data-testid='retweet']");
		if (svg_container.dataset.retweeted !== "1") {
			if (!show_nudge) {
				svg_container.dataset.retweeted = "1";
				svg_container.replaceChild(svg_container.querySelector("svg"), filled_retweet)
				logEvent('retweeted', tweet_id)
			} else if (dialog == null) {
				const n_text = like_dialog(fakeTweet.id, 'retweet')
				const appended = fakeTweet.tweetElement.querySelector("div[role=group]").parentElement;
				appended.insertAdjacentHTML('afterbegin', n_text);
				appended.querySelector(".close").addEventListener('click', (e) => {
					e.currentTarget.closest(".nudgeConfirmDialog").remove();
				})
				svg_container.dataset.retweeted = "0";
				document.querySelector(".nudgeConfirmDialog div[data-testid='tweetButton']").addEventListener('click', (f) => {
					svg_container.replaceChild(svg_container.querySelector("svg"), filled_retweet)
					f.closest(".nudgeConfirmDialog").remove();
					svg_container.dataset.retweeted = "1";
					logEvent('retweeted', fakeTweet.id);
				})
			} else {
				e.closest(".nudgeConfirmDialog").remove();
			}
		} else {
			logEvent('unretweeted', fakeTweet.id)
			svg_container.dataset.retweeted = "0";
			svg_container.replaceChild(svg_container.querySelector("svg"), empty_retweet)

		}
		document.querySelector("div[role=dialog]").style.visibility = 'hidden';
		e.stopPropagation()
	}

	quote_retweet_handler(e, fakeTweet) {
		logEvent('clicked on quote retweet', fakeTweet.id);
		const attachments = document.querySelector("div[role=dialog] div[data-testid='attachments']")
		attachments.style.visibility = 'hidden';
		if (show_nudge) {
			attachments.parentElement.parentElement.insertAdjacentHTML('afterbegin', nudge_text(fakeTweet.id));
		}
		const popup = document.querySelector("div[role=dialog]");
		const tweetButton = popup.querySelector("[data-testid='tweetButton']")
		tweetButton.querySelector("span span").addEventListener('click', (e) => {
			e.stopPropagation();
			logEvent('submitted retweet with quote', fakeTweet.id, null, popup.querySelector("div[data-editor] span[data-text]").textContent)
			window.history.pushState({}, '', '/home');
			tweetButton.backgroundColor = 'green';
			tweetButton.querySelector("span span").textContent = "Tweet saved!";
			document.documentElement.setAttribute('style', 'overflow: auto scroll; overscroll-behavior-y: none; font-size: 15px;')
			const svg_container = fakeTweet.tweetElement.querySelector("div[data-testid='retweet']");
			svg_container.dataset.retweeted = "1";
			svg_container.replaceChild(svg_container.querySelector("svg"), filled_retweet)
			setTimeout(function () {
				popup.remove();
				location.reload();
			}, 2000)
		});
	}
}