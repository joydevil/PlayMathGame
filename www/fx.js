const REWARD_ICONS = ['🌟', '🎉', '🏆', '👑', '🥳', '🚀'];

const fxCanvas = document.createElement('canvas');
fxCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
document.body.appendChild(fxCanvas);
const fxCtx = fxCanvas.getContext('2d');

const iconEl = document.createElement('div');
iconEl.style.cssText = 'position:fixed;top:45%;left:50%;transform:translate(-50%,-50%) scale(0);font-size:18vmin;filter:drop-shadow(0 1.5vmin 3vmin rgba(0,0,0,0.6));pointer-events:none;z-index:10000;transition:transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.3s;opacity:0;';
document.body.appendChild(iconEl);

let particles = [], fxAnim = null;

function launchBurst(cx, cy) {
    const colors = ['#facc15', '#ef4444', '#3b82f6', '#22c55e', '#ec4899', '#a855f7', '#38bdf8'];
    for (let i = 0; i < 45; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 10 + 3;
        particles.push({
            x: cx, y: cy,
            vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 2,
            size: Math.random() * 7 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1
        });
    }
    if (!fxAnim) runFxLoop();
}

function celebrate() {
    Sound.win();
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;

    iconEl.textContent = REWARD_ICONS[Math.floor(Math.random() * REWARD_ICONS.length)];
    iconEl.style.opacity = '1';
    iconEl.style.transform = 'translate(-50%, -50%) scale(1)';

    launchBurst(fxCanvas.width * 0.25, fxCanvas.height * 0.35);
    setTimeout(() => launchBurst(fxCanvas.width * 0.75, fxCanvas.height * 0.35), 200);
    setTimeout(() => launchBurst(fxCanvas.width * 0.5, fxCanvas.height * 0.25), 400);

    setTimeout(() => {
        iconEl.style.opacity = '0';
        iconEl.style.transform = 'translate(-50%, -50%) scale(0.3)';
    }, 1100);
}

function runFxLoop() {
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    particles.forEach((p, idx) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.alpha -= 0.015;
        if (p.alpha <= 0) particles.splice(idx, 1);
        else {
            fxCtx.globalAlpha = p.alpha;
            fxCtx.fillStyle = p.color;
            fxCtx.beginPath();
            fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            fxCtx.fill();
        }
    });
    fxCtx.globalAlpha = 1;
    if (particles.length > 0) fxAnim = requestAnimationFrame(runFxLoop);
    else fxAnim = null;
}
