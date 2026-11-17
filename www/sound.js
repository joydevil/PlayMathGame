window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

window.playShortSuccess = function() {
    if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
};

window.playErrorSound = function() {
    if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
};

window.playFanfare = function() {
    if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, index) => {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.07);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + index * 0.07);
        osc.stop(now + 1.4);
    });
};

const Sound = {
    click: () => window.playShortSuccess(),
    win: () => window.playFanfare(),
    err: () => window.playErrorSound(),
    boom: () => window.playErrorSound()
};
