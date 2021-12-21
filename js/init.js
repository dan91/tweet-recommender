import Feed from "./Feed.js";
import { TwitterFeedHTML } from "./TwitterFeedHTML.js";
import Tweet from "./Tweet.js";

export function main() {
    const targetNode = document.getElementById('react-root');

    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: true };

    let moreThan5Articles = false
    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        // Use traditional 'for loops' for IE 11
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                if (document.querySelectorAll("section div article:first-of-type").length > 5 && !moreThan5Articles) {
                    observer.disconnect();
                    moreThan5Articles = true
                    console.log("at least 5 articles loaded")
                    const feed = new Feed(document.querySelector("section[aria-labelledby='accessible-list-0']"))
                    console.log(feed.tweets)
                    feed.tweets.forEach(tweet => console.log(tweet))
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

}