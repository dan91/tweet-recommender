import Tweet from "./Tweet.js";

export default class Feed {
    constructor(twitterFeedHTML) {
        this._tweets = this.explodeTweets(twitterFeedHTML)
    }

    get tweets() {
        return this._tweets
    } 

    // converts Twitter Feed HTML string to an element (e.g. to use with querySelector)
    createElement(feedHTML) {
        // https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
        // this is just for testing. later we should directly manipulate the DOM
        const template = document.createElement('template');
        const html = feedHTML.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild
    }

    // creates a Tweet object for every tweet in the feed
    explodeTweets(feed) {
        // const feed = this.createElement(TwitterSectionElement)
        const tweets = Array.from(feed.querySelectorAll("div div article:first-of-type"))
        return tweets.map(tweet => new Tweet(tweet))
    }
}