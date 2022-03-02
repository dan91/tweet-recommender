const startExperimentButton = document.getElementById('startExperiment');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

startExperimentButton.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.remove("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});