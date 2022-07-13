// remove from repo, since too study specific
function nudge_text(tweet_id, like = false) {
	n_tweet = manipulated_tweets.filter(obj => {
		return obj.id === tweet_id
	})
	retweets = n_tweet[0]['public_metrics.retweet_count']
	network_factor = 10
	platform_factor = 500
	proportion_interacted = Maths.getRandomInt(95, 99)
	if (retweets < 2)
		retweets = Maths.getRandomInt(2, 5)
	else if (retweets > 100) {
		retweets = Maths.getRandomInt(70, 90)
	}
	network_not_interacted = new Intl.NumberFormat().format(Math.floor((retweets * network_factor * (proportion_interacted / 100)) / Maths.generateNum(retweets)) * Maths.generateNum(retweets))
	network_total = new Intl.NumberFormat().format(Math.ceil((retweets * network_factor) / Maths.generateNum(retweets)) * Maths.generateNum(retweets))
	platform_not_interacted = new Intl.NumberFormat().format(Math.round((retweets * platform_factor * (proportion_interacted / 100)) / Maths.generateNum(retweets)) * Maths.generateNum(retweets))
	platform_total = new Intl.NumberFormat().format(Math.round(((retweets * platform_factor)) / Maths.generateNum(retweets)) * Maths.generateNum(retweets))
	if (nudge == 'network + flag') {
		text = 'In your personal Twitter network, ' + network_not_interacted + ' out of ' + network_total + ' people saw but did not like, reply or retweet this Tweet. <p>Some or all of the content shared in this Tweet conflicts with guidance from public health experts regarding COVID-19.</p>'
		n_icon = 'group'
	} else if (nudge == 'overall + flag') {
		text = 'On Twitter, ' + platform_total + ' other users saw but did not like, reply or retweet this Tweet.<p>Some or all of the content shared in this Tweet conflicts with guidance from public health experts regarding COVID-19.</p>'
		n_icon = 'group'
	} else if (nudge = 'combined + flag') {
		n_icon = 'group'
		text = 'In your personal Twitter network, ' + network_not_interacted + ' out of ' + network_total + ' people saw but did not like, reply or retweet this Tweet. On Twitter, ' + platform_total + ' other users saw but did not like, reply or retweet this Tweet.<p>Some or all of the content shared in this Tweet conflicts with guidance from public health experts regarding COVID-19.</p>'
	}
	icon_path = 'src = "' + chrome.runtime.getURL("images/" + n_icon + "1x.png") + '" srcset="' + chrome.runtime.getURL("images/" + n_icon + "2x.png") + ' 1.5x"'
	padding = like ? '40px 0 0 20px' : '20px'
	return '<div style="padding: 0 10px; ' + (like ? '' : 'border: 1px solid #e6e6e6; background-color: #f7f7f7; border-radius:10px; margin:20px') + '" lang="en" dir="auto" class="css-901oao r-18jsvk2 r-1qd0xha r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0" id="id__sq5hsr8ka3k"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0"><span style="float: right;padding: ' + padding + '"><img ' + icon_path + '></span><p>' + text + '</p></div>';
}