export default class Tweet {
    constructor(tweetElement) {
        const authorElement = tweetElement.querySelector("a[role=link] div[dir=auto]:first-child span span")
        this._author = authorElement.textContent
        console.log(authorElement)
    }

    set author(author) {
        this._author = author
    }

    get author() {
        return this._author
    }

}

