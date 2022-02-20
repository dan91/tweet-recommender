class Tweet {
	constructor(articleElement, location) {
		this._articleElement = articleElement;
		this._location = location;
	}

	get content() {
		return this._content;
	}

	set content(content) {
		this._content = content
	}

	get username() {
		return this._username;
	}

	get name() {
		return this._name;
	}

	get profile_image_url() {
		return this._profile_image_url;
	}

	get id() {
		return this._id;
	}

	get replies() {
		return this._replies;
	}

	set replies(replies) {
		this._replies = replies;
	}

	get retweets() {
		return this._retweets;
	}

	set retweets(retweets) {
		this._retweets = retweets;
	}

	get likes() {
		return this._likes;
	}

	set likes(likes) {
		this._likes = likes;
	}
}