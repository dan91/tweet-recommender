function replaceArticle(article) {
	to_replace = $(article)
	var ran_misinfo = RealTweet.new_random()
		if (ran_misinfo == undefined) {
			return;
		} else if ($(to_replace).attr('data-misinfo-id') != undefined) {
			const index = alreadyInjected.indexOf(ran_misinfo);
			if (index > -1) {
				alreadyInjected = alreadyInjected.splice(index - 1, 1);
			}
			return;
	}
	let realTweet = new RealTweet(article[0])
	const tweet = manipulated_tweets[ran_misinfo];
	tweet.index = ran_misinfo;
	const fakeTweet = new FakeTweet(tweet);
	const r = new TweetReplacer(realTweet, fakeTweet);
	r.replace();
}

function like_dialog(misinfo_id, mode = 'like') {
	icon = (mode == 'like' ? empty_heart : empty_retweet)
	return '<div class="css-1dbjc4n nudgeConfirmDialog"><div lang="en" dir="auto" class="css-901oao r-18jsvk2 r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0" id="id__vm2a74c5cwq" style="padding: 0 20px;margin: 20px 0; border: 1px solid #e6e6e6; background-color: #f7f7f7; border-radius:10px"><div class="css-1dbjc4n r-1habvwh r-1pz39u2 r-1777fci r-15ysp7h r-s8bhmr"><div aria-label="Close" role="button" tabindex="0" class="close css-18t94o4 css-1dbjc4n r-1niwhzg r-42olwf r-sdzlij r-1phboty r-rs99b7 r-2yi16 r-1qi8awa r-1ny4l3l r-o7ynqc r-6416eg r-lrvibr" style="margin-left: calc(-5px); padding-top:20px; "><div dir="auto" class="css-901oao r-1awozwy r-18jsvk2 r-6koalj r-18u37iz r-16y2uox r-37j5jr r-a023e6 r-b88u0q r-1777fci r-rjixqe r-bcqeeo r-q4m81j r-qvutc0"><svg viewBox="0 0 24 24" aria-hidden="true" class="r-18jsvk2 r-4qtqp9 r-yyyyoo r-z80fyv r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-19wmn03"><g><path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path></g></svg><span class="css-901oao css-16my406 css-bfa6kz r-poiln3 r-a023e6 r-rjixqe r-bcqeeo r-qvutc0" style="border-bottom: 2px solid rgb(15, 20, 25);"></span></div></div></div><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">' + nudge_text(misinfo_id, true) + '</span><div style="margin-bottom: 20px; margin-left: 40%; width: 20%; " role="button" tabindex="0" class="css-18t94o4 css-1dbjc4n r-l5o3uw r-42olwf r-sdzlij r-1phboty r-rs99b7 r-19u6a5r r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr" data-testid="tweetButton"><div dir="auto" class="css-901oao r-1awozwy r-jwli3a r-6koalj r-18u37iz r-16y2uox r-37j5jr r-a023e6 r-b88u0q r-1777fci r-rjixqe r-bcqeeo r-q4m81j r-qvutc0"><span class="css-901oao css-16my406 css-bfa6kz r-poiln3 r-a023e6 r-rjixqe r-bcqeeo r-qvutc0"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">' + icon + '</span></span></div></div></div></div>'
}

function modifyLikeButton(article, current_tweet_id) {
	$(article).find("[data-testid='like']").click(function (e) {
		logEvent('clicked on like', current_tweet_id)
		likeClick = this
		e.stopPropagation()
		current_tweet = this.querySelector("div").closest("article")
		dialog = current_tweet.parentElement.querySelector(".nudgeConfirmDialog")
		if (current_tweet.dataset.liked != "1") {
			if (!show_nudge) {
				likeClick.querySelector("svg").outerHTML = filled_heart
				current_tweet.dataset.liked = "1"
				logEvent('liked', current_tweet_id)
			} else if (dialog == null) {
				n_text = like_dialog(current_tweet_id)
				appended = $(current_tweet).find("div[role=group]").parent().prepend(n_text)
				$(appended).find(".close").click(function () {
					$(this).parents().find(".nudgeConfirmDialog").remove()
				})
				current_tweet.dataset.liked = "0"
				document.querySelector(".nudgeConfirmDialog div[data-testid='tweetButton']").addEventListener('click', function () {
					likeClick.querySelector("svg").outerHTML = filled_heart
					$(this).parents().find(".nudgeConfirmDialog").remove()
					current_tweet.dataset.liked = "1"
					logEvent('liked', current_tweet_id)
				})
			} else {
				$(this).parents().find(".nudgeConfirmDialog").remove()
			}
		} else {
			logEvent('unliked', current_tweet_id)
			current_tweet.dataset.liked = "0"
			likeClick.querySelector("svg").outerHTML = empty_heart
		}
	})
}

function attachClickHandlers(redirect = true) {
	console.log("now attaching handlers", $("article").length)
	$("article:not([data-misinfo-id])").off('click')
	$("article:not([data-misinfo-id])").click(function () {
		clearInterval(i2);
		// logEvent('click on tweet')
		lastInteractionWithMisinfo = false
	})
	$("article[data-misinfo-id]").off('click')
	$("article[data-misinfo-id]").click(function (e) {
		clearInterval(i2)
		lastInteractionWithMisinfo = true
		lastInteractionWithMisinfoId = $(this).data('misinfo-id');
		lastInteractionWithMisinfoTweetId = $(this).data('misinfo-tweet-id');
		i2 = setInterval(checkIfVisible, 100)
		// go to misinfo tweet when clicked on tweet (except for the reply retweet, like buttons OR when on status page)
		if (redirect && $(e.target).parents('[data-testid="like"], [data-testid="retweet"], [data-testid="reply"], .nudgeConfirmDialog').length == 0 && !$(e.target).is('[data-testid="like"], [data-testid="retweet"], [data-testid="reply"]')) {
			e.stopPropagation()
			href = $(this).find("a").eq(2).attr('href')
			logEvent('click on misinformation', lastInteractionWithMisinfoTweetId, function () { window.location.href = href })
		} else if ($(e.target).parents('[data-testid="reply"]').length == 1) {
			logEvent('clicked on reply', lastInteractionWithMisinfoTweetId)
		}
		attachButtonHandler($(this))
	})
}

function checkIfVisible() {
	popup = $("div[aria-modal='true']")
	if ($("div[aria-modal='true']:visible")) {
		clearInterval(i2)
		if (lastInteractionWithMisinfo) {
			$(popup).find("article").parent().parent().hide()
			if (show_nudge) {
				n_text = nudge_text(lastInteractionWithMisinfoTweetId)
				$(popup).find("article").parent().parent().parent().prepend(n_text)
			}
			tweetButton = $(popup).find("[data-testid='tweetButton']")
			$(tweetButton).find("span span").click(function (e) {
				logEvent('submitted reply', lastInteractionWithMisinfoTweetId, null, $("div[data-editor] span[data-text]").text())
				e.stopPropagation();
				$(tweetButton).css('background-color', 'green');
				$(this).text("Reply saved!");
				setTimeout(function () {
					$("#layers").children().last().remove()
					document.documentElement.setAttribute('style', 'overflow: auto scroll; overscroll-behavior-y: none; font-size: 15px;')
					window.history.pushState({}, '', '/home');
					location.reload();
				}, 2000)
			})
		}
	}
}


function attachButtonHandler(article) {
	setTimeout(function () {
		$("[role=menuitem]").first().click(function (e) {
			logEvent('clicked on retweet confirm', lastInteractionWithMisinfoTweetId)
			if (lastInteractionWithMisinfo) {

				tweet = $(article)[0]
				dialog = tweet.parentElement.querySelector(".nudgeConfirmDialog")
				svg_container = $("article[data-misinfo-id='" + lastInteractionWithMisinfoId + "'] div[data-testid='retweet']")
				if ($(svg_container).data('retweeted') != "1") {
					if (!show_nudge) {
						$(svg_container).data('retweeted', 1)
						$(svg_container).find("svg").replaceWith(filled_retweet)
						logEvent('retweeted', tweet_id)
					} else if (dialog == null) {
						n_text = like_dialog(tweet_id, mode = 'retweet')
						appended = $(tweet).find("div[role=group]").parent().prepend(n_text)
						$(appended).find(".close").click(function () {
							$(this).parents().find(".nudgeConfirmDialog").remove()
						})
						$(svg_container).data('retweeted', 0)
						document.querySelector(".nudgeConfirmDialog div[data-testid='tweetButton']").addEventListener('click', function () {
							$(svg_container).find("svg").replaceWith(filled_retweet)
							$(this).parents().find(".nudgeConfirmDialog").remove()
							$(svg_container).data('retweeted', 1)
							logEvent('retweeted', tweet_id)
						})
					} else {
						$(this).parents().find(".nudgeConfirmDialog").remove()
					}
				} else {
					logEvent('unretweeted', tweet_id)
					$(svg_container).data('retweeted', 0)
					$(svg_container).find("svg").replaceWith(empty_retweet)
				}
				$("div[role=dialog]").hide()
				e.stopPropagation()
			}
		})
		$("[role=menuitem]").eq(1).click(function () {
			logEvent('clicked on quote retweet', lastInteractionWithMisinfoTweetId)
			if (lastInteractionWithMisinfo) {
				setTimeout(function () {
					$("div[role=dialog] div[data-testid='attachments']").hide()
					if (show_nudge) {
						$("div[role=dialog] div[data-testid='attachments']").parent().parent().prepend(nudge_text(lastInteractionWithMisinfoTweetId))
					}
					popup = $("div[role=dialog]")
					tweetButton = $(popup).find("[data-testid='tweetButton']")
					$(tweetButton).find("span span").click(function (e) {
						e.stopPropagation();
						logEvent('submitted retweet with quote', lastInteractionWithMisinfoTweetId, null, $("div[data-editor] span[data-text]").text())
						// $("div[data-editor] span[data-text]").remove()
						window.history.pushState({}, '', '/home');
						$(tweetButton).css('background-color', 'green');
						$(tweetButton).find("span span").text("Tweet saved!");
						document.documentElement.setAttribute('style', 'overflow: auto scroll; overscroll-behavior-y: none; font-size: 15px;')
						svg_container = $("article[data-misinfo-id='" + lastInteractionWithMisinfoId + "'] div[data-testid='retweet']")
						$(svg_container).data('retweeted', 1)
						$(svg_container).find("svg").replaceWith(filled_retweet)
						setTimeout(function () {
							$(popup).remove();
							location.reload();
						}, 2000)
					})
				}, 200)

			}
		})
	}, 200);
}