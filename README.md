# tweet-recommender

Chrome extension to add manipulated tweets to Twitter feed. For science only.
This extension works when a prolific ID is entered in the extension popup. It sends tweet engagement data (timestamp, browser, type of engagement - like, retweet etc.) to a Firebase server (make sure to add your credentials in firebase-credentials-example.js and rename it to firebase-credentials.js). Engagement with manipulated tweets is intercepted (and will not show up on participants' Twitter feed). After 5min users will be directed to a soscisurvey survey.

More documentation will be added soon. The plan is to split the extension into modules. Currently it's tied to our online experiment use case.
Feel free to contact me for questions.
