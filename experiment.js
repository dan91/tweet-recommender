function resetTimerAfterStudyPart() {
if (urlParams.includes('resettimer')) {
	resetTimer()
	if(urlParams.includes('sdfierwui4v')) {
		chrome.storage.local.set({ 'currentStudyPart': 2 })
        chrome.storage.local.set({ 'completionLink': false })
	} else if(urlParams.includes('5489fdu23')) {
		chrome.storage.local.set({ 'currentStudyPart': 3 })
		chrome.storage.local.set({ 'completionLink': false })
	}
}
}

function setupExp() {
	chrome.storage.local.get(['condition', 'prolificID', 'currentStudyPart', 'study', 'duration'], function (result) {
		console.log('setup Exp', result)
		notifiedStudyCompleted = result.currentStudyPart >= 3 && result.duration > 60*5
		if (result.condition && result.prolificID && !notifiedStudyCompleted) {
			condition = result.condition
			prolificID = result.prolificID
			study = result.study
			currentStudyPart = result.currentStudyPart ? result.currentStudyPart : 1
			timer = setInterval(checkTimer, 1000)
			if (condition == 1) {
				show_nudge = 0
			} else if (condition == 2) {
				show_nudge = 1
				nudge = 'network + flag'
			} else if (condition == 3) {
				show_nudge = 1
				nudge = 'overall + flag'
			} else if (condition == 4) {
				show_nudge = 1
				nudge = 'combined + flag'
			}
			checkIfLoaded()
		}
	});
}

// relation to setupExp() needs to be clearer
function checkIfLoaded() {
	// this seems redundant to first if in setupExp()
	if (!prolificID || !condition || notifiedStudyCompleted) {
		console.log('prolificID or condition not set or study completed')
		chrome.runtime.sendMessage({ running: false });
		chrome.storage.local.set({ 'running': false })

		return;
	}
	chrome.runtime.sendMessage({ running: true });
	chrome.storage.local.set({ 'running': true })

	clearInterval(i)
	console.log(prolificID, 'prolificID')
	console.log(condition, 'condition')
	
	i = setInterval(function () {
		if ($("article").length >= 5 && window.location.pathname.includes('/home')) {
			clearInterval(i)
			injectMisinfo()
		} else if (window.location.pathname.includes('status') && !activated && $("article").length >= 1) {
			tweet_id = window.location.pathname.split('/').pop()
			if (misinfo_ids.includes(tweet_id)) {
				setTimeout(function () {

					activateObserver()
					activated = true;
					console.log('we are on a status page')
					clearInterval(i)
					$('div[role=group]').closest("article").attr("data-misinfo-id", 1)
					lastInteractionWithMisinfoTweetId = tweet_id
					$('div[role=group]').closest("article").attr("data-misinfo-tweet-id", tweet_id)

					modifyLikeButton($('div[role=group]').closest("article"), tweet_id)
					attachClickHandlers(false);
				}, 400)
			}
		}
	}, 1000);
}

function resetTimer() {
	chrome.storage.local.set({ 'start': Date.now() })
}

function checkTimer() {
	chrome.storage.local.get(['start', 'currentStudyPart', 'impressions'], function (result) {
		if (!result.start) {
			start = Date.now()
			chrome.storage.local.set({ 'start': start })
		} else
			start = result.start
		duration = Math.floor((Date.now() - start) / 1000)
		chrome.storage.local.set({ 'duration': duration })

		const minuteDuration = 60
		if (duration == (minuteDuration * 5)) {
			currentStudyPart = result.currentStudyPart ? result.currentStudyPart : 1
			chrome.storage.local.set({ 'currentStudyPart': currentStudyPart })
			console.log('study part completed', currentStudyPart)
			clearInterval(timer)
			if (currentStudyPart <= 3) {
				chrome.runtime.sendMessage({ 'studyPartComplete': true });
			}
		}
	})
}
