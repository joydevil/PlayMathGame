let currentScreen = 'hub';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function openGame(mode) {
    Sound.click();
    document.getElementById('end-overlay').style.display = 'none';
    if (mode === 'kids') {
        showScreen('screen-kids');
        initKidsGame('words');
    } else {
        showScreen('screen-balls');
        startBallsGame(mode);
    }
}

function goHome() {
    Sound.click();
    if (typeof stopBallsGame === 'function') stopBallsGame();
    document.getElementById('end-overlay').style.display = 'none';
    document.getElementById('calc-overlay').style.display = 'none';
    showScreen('hub-screen');
}
