const NATURE_ITEMS = [
    { icon: '🌱🌿', style: 'bottom:2vmin;left:8vmin;' },
    { icon: '🌳', style: 'bottom:3vmin;right:8vmin;font-size:13vmin;' },
    { icon: '🌸🌼', style: 'bottom:2vmin;left:28vmin;' },
    { icon: '☁️', style: 'top:14vmin;left:8vmin;font-size:11vmin;' },
    { icon: '🐦', style: 'top:26vmin;left:18vmin;' },
    { icon: '🦋', style: 'bottom:18vmin;right:16vmin;' },
    { icon: '🌈', style: 'top:13vmin;left:50%;margin-left:-7vmin;font-size:15vmin;' }
];

function triggerRainEffect() {
    const vig = document.getElementById('screen-vignette');
    if (vig) {
        vig.style.boxShadow = 'inset 0 0 15vmin rgba(56, 189, 248, 0.7)';
        setTimeout(() => { vig.style.boxShadow = 'none'; }, 1100);
    }
    for (let i = 0; i < 16; i++) {
        setTimeout(() => {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.textContent = '💧';
            drop.style.left = `${Math.random() * 94 + 2}vw`;
            document.body.appendChild(drop);
            setTimeout(() => drop.remove(), 1100);
        }, i * 50);
    }
}

function updateWarmSun(x, y, targetSlot, placedCount) {
    const sun = document.getElementById('warm-sun');
    const vig = document.getElementById('screen-vignette');
    const wrap = document.getElementById('pyr-slots');
    if (!sun || !targetSlot) return;

    const r = targetSlot.getBoundingClientRect();
    const dist = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
    const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.45;
    const heat = Math.max(0, Math.min(1, 1 - dist / maxDist));

    const baseScale = 0.85 + placedCount * 0.04;
    sun.style.opacity = (0.65 + heat * 0.35).toFixed(2);
    sun.style.transform = `scale(${(baseScale + heat * 0.35).toFixed(2)})`;
    sun.style.filter = `drop-shadow(0 0 ${(1 + heat * 3.5).toFixed(1)}vmin #facc15)`;

    const rays = sun.querySelector('.sun-rays');
    if (rays) {
        rays.style.animationDuration = `${Math.max(1.2, 8 - heat * 6.5).toFixed(1)}s`;
        rays.querySelectorAll('line').forEach(l => {
            l.style.transform = `scale(${(1 + heat * 0.45).toFixed(2)})`;
        });
    }

    if (vig) vig.style.boxShadow = heat > 0.2 ? `inset 0 0 ${(heat * 16).toFixed(1)}vmin rgba(250, 204, 21, ${(heat * 0.55).toFixed(2)})` : 'none';
    if (wrap) {
        if (heat > 0.45) wrap.classList.add('glow-tree');
        else wrap.classList.remove('glow-tree');
    }
}

function resetWarmSun(placedCount) {
    const sun = document.getElementById('warm-sun');
    const vig = document.getElementById('screen-vignette');
    const wrap = document.getElementById('pyr-slots');
    if (vig) vig.style.boxShadow = 'none';
    if (wrap) wrap.classList.remove('glow-tree');
    if (!sun) return;
    const baseScale = 0.85 + placedCount * 0.04;
    sun.style.opacity = '0.75';
    sun.style.transform = `scale(${baseScale.toFixed(2)})`;
    sun.style.filter = 'drop-shadow(0 0 1vmin rgba(250, 204, 21, 0.4))';
    const rays = sun.querySelector('.sun-rays');
    if (rays) {
        rays.style.animationDuration = '8s';
        rays.querySelectorAll('line').forEach(l => l.style.transform = 'scale(1)');
    }
}

function revealNatureStep(stepIdx) {
    const item = document.getElementById(`nat-${stepIdx}`);
    if (item) item.classList.add('show');
    resetWarmSun(stepIdx + 1);
}
