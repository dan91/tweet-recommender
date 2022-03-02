const startExperimentButton = document.getElementById('startExperiment');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const participant_id = document.getElementById('participant_id');
startExperimentButton.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.remove("right-panel-active");
    set_condition();
});

function set_condition() {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const docRef = db.collection("condition_assignments").doc("w7ErNVXJSnM51XdEdoCU");
    docRef.get().then((doc) => {
        if (doc.exists) {
            const current_assignment = doc.data().current_assignment
            console.log("Current Assignment:", current_assignment);
            const condition = assignments[current_assignment]
            docRef.update({current_assignment: firebase.firestore.FieldValue.increment(1)});
            chrome.storage.local.set({'experiment': {'participant_id': participant_id.value, 'condition': condition, 'trial': 1}});
            setTimeout(() => { window.location.replace('https://www.twitter.com')}, 1000);
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
        return false
    });
}


function redirect_to_twitter() {
}