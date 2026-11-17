let bMode = 'chill', bScore = 0, bLives = 5, bTarget = 100;
let balls = [], solvedPairs = new Set();
let animId = null, boomTimer = null, calcTimer = null, calcBarInt = null;
let dragBall = null, dragOffX = 0, dragOffY = 0, moved = false;
let actB1 = null, actB2 = null, mathSign = '+', userAns = '', rightAns = 0;

function startBallsGame(mode, keepScore = false) { stopBallsGame(); bMode = mode; if (!keepScore) bScore = 0; bLives = 5;
    solvedPairs.clear();
    document.getElementById('b-score').textContent = String(bScore);
    const livesEl = document.getElementById('b-lives');
    livesEl.style.display = mode === 'hard' ? 'block' : 'none';
    updateLives();

    const table = document.getElementById('table');
    const W = table.clientWidth, H = table.clientHeight;
    let count = mode === 'hard' ? 4 : 3;
    let parts = [];
    for (let i = 0; i < count; i++) {
        let v = mode === 'hard' ? Math.floor(Math.random() * 38) + 11 : Math.floor(Math.random() * 16) + 3;
        if (mode === 'hard' && v % 10 === 0) v += (Math.random() > 0.5 ? 3 : -3);
        parts.push(v);
    }
    bTarget = parts.reduce((a, b) => a + b, 0);

    parts.forEach((val, idx) => {
        let x = W * (0.2 + 0.6 * ((idx % 2) + Math.random() * 0.2));
        let y = H * (0.25 + 0.5 * (Math.floor(idx / 2) + Math.random() * 0.2));
        spawnBall(keepScore ? W/2 : x, keepScore ? H/2 : y, val, idx % 5, keepScore ? (Math.random()-0.5)*14 : null, keepScore ? (Math.random()-0.5)*14 : null);
    });

    buildKeyboard();
    if (bMode === 'hard') resetBoomTimer();
    physicsLoop();
}

function stopBallsGame() {
    if (animId) cancelAnimationFrame(animId);
    if (boomTimer) clearInterval(boomTimer);
    if (calcTimer) clearTimeout(calcTimer);
    if (calcBarInt) clearInterval(calcBarInt);
    balls.forEach(b => b.el.remove());
    balls = [];
}

function spawnBall(x, y, val, colorIdx, vx = null, vy = null) {
    const table = document.getElementById('table');
    const minSide = Math.min(table.clientWidth, table.clientHeight);
    const ratio = Math.max(0.22, Math.min(0.65, (val / bTarget) * 0.7));
    const r = (minSide * ratio) / 2;

    const el = document.createElement('div');
    el.className = `ball c${colorIdx}`;
    el.style.width = `${r * 2}px`; el.style.height = `${r * 2}px`;
    el.style.fontSize = `${r * 0.65}px`; el.textContent = val;
    table.appendChild(el);

    const b = {
        x, y, r, val, colorIdx, el, dragged: false,
        vx: vx !== null ? vx : (Math.random() - 0.5) * 4,
        vy: vy !== null ? vy : (Math.random() - 0.5) * 4
    };

    el.onpointerdown = (e) => {
        if (document.getElementById('calc-overlay').style.display === 'flex') return;
        dragBall = b; b.dragged = true; moved = false;
        dragOffX = e.clientX - b.x; dragOffY = e.clientY - b.y;
        el.setPointerCapture(e.pointerId);
    };
    el.onpointermove = (e) => {
        if (!b.dragged) return;
        let nx = e.clientX - dragOffX, ny = e.clientY - dragOffY;
        if (Math.hypot(nx - b.x, ny - b.y) > 6) moved = true;
        b.x = Math.max(b.r, Math.min(table.clientWidth - b.r, nx));
        b.y = Math.max(b.r, Math.min(table.clientHeight - b.r, ny));
    };
    el.onpointerup = (e) => {
        if (!b.dragged) return;
        b.dragged = false; dragBall = null;
        el.releasePointerCapture(e.pointerId);
        if (!moved) splitBall(b, false);
        else checkMerge(b);
    };
    balls.push(b);
}

function splitBall(b, isPenalty) {
    if (!balls.includes(b)) return;
    isPenalty ? Sound.boom() : Sound.click();
    balls.splice(balls.indexOf(b), 1); b.el.remove();

    const maxR = bMode === 'hard' ? 28 : 14;
    let v1 = Math.floor(Math.random() * maxR) + 2;
    let v2 = Math.floor(Math.random() * maxR) + 2;
    if (v1 === b.val) v1 += 2;
    if (v2 === b.val || v2 === v1) v2 += 3;

    let ang = Math.random() * Math.PI * 2, spd = isPenalty ? 8 : 4;
    spawnBall(b.x, b.y, v1, b.colorIdx, Math.cos(ang) * spd, Math.sin(ang) * spd);
    spawnBall(b.x, b.y, v2, (b.colorIdx + 1) % 5, -Math.cos(ang) * spd, -Math.sin(ang) * spd);
    bTarget = balls.reduce((sum, item) => sum + item.val, 0);

    if (isPenalty) {
        bLives--; updateLives();
        if (bLives <= 0) finishBalls(false);
    }
}

function checkMerge(b) {
    for (let t of balls) {
        if (t !== b && Math.hypot(t.x - b.x, t.y - b.y) < t.r + b.r) {
            openCalc(b, t); return;
        }
    }
    b.vx = (Math.random() - 0.5) * 4; b.vy = (Math.random() - 0.5) * 4;
}

function physicsLoop() {
    const table = document.getElementById('table');
    const W = table.clientWidth, H = table.clientHeight;
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let a = balls[i], b = balls[j];
            if (a.dragged || b.dragged) continue;
            let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.1;
            if (d < a.r + b.r) {
                let ov = (a.r + b.r - d) * 0.5, nx = dx / d, ny = dy / d;
                a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
                let p = nx * (a.vx - b.vx) + ny * (a.vy - b.vy);
                a.vx -= p * nx; a.vy -= p * ny; b.vx += p * nx; b.vy += p * ny;
            }
        }
    }
    balls.forEach(b => {
        if (!b.dragged) {
            b.x += b.vx; b.y += b.vy; b.vx *= 0.992; b.vy *= 0.992;
            if (b.x < b.r) { b.x = b.r; b.vx *= -1; }
            if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -1; }
            if (b.y < b.r) { b.y = b.r; b.vy *= -1; }
            if (b.y > H - b.r) { b.y = H - b.r; b.vy *= -1; }
        }
        b.el.style.left = `${b.x}px`; b.el.style.top = `${b.y}px`;
    });
    animId = requestAnimationFrame(physicsLoop);
}

function buildKeyboard() {
    const kb = document.getElementById('calc-keyboard');
    kb.innerHTML = '';
    const keys = ['1','2','3','4','5','6','7','8','9','+/-','0', bMode === 'hard' ? '⌫' : '='];
    keys.forEach(k => {
        const btn = document.createElement('button');
        btn.className = 'calc-btn' + (k === '=' ? ' enter' : k === '+/-' ? ' sign' : '');
        btn.textContent = k;
        btn.onclick = () => handleKey(k);
        kb.appendChild(btn);
    });
}

function openCalc(b1, b2) {
    if (boomTimer) clearInterval(boomTimer);
    actB1 = b1.val >= b2.val ? b1 : b2;
    actB2 = b1.val < b2.val ? b1 : b2;
    mathSign = '+'; userAns = '';
    updateCalcText();
    document.getElementById('calc-overlay').style.display = 'flex';
    const bar = document.getElementById('calc-timer-bar');
    if (bMode === 'hard') {
        let start = Date.now(); bar.style.width = '100%';
        calcBarInt = setInterval(() => {
            bar.style.width = `${Math.max(0, 100 - ((Date.now() - start) / 3500) * 100)}%`;
        }, 30);
        calcTimer = setTimeout(() => {
            clearInterval(calcBarInt);
            document.getElementById('calc-overlay').style.display = 'none';
            splitBall(actB1, true);
            if (bLives > 0) resetBoomTimer();
        }, 3500);
    } else { bar.style.width = '0%'; }
}

function updateCalcText() {
    rightAns = mathSign === '+' ? actB1.val + actB2.val : actB1.val - actB2.val;
    document.getElementById('calc-display').textContent = `${actB1.val} ${mathSign} ${actB2.val} = ${userAns || '?'}`;
}

function handleKey(k) {
    Sound.click();
    if (k === '+/-') { mathSign = mathSign === '+' ? '-' : '+'; userAns = ''; updateCalcText(); }
    else if (k === '⌫') { userAns = userAns.slice(0, -1); updateCalcText(); }
    else if (k === '=') { checkAns(); }
    else if (userAns.length < 4) {
        userAns += k; updateCalcText();
        if (bMode === 'hard' && userAns.length === rightAns.toString().length) checkAns();
    }
}

function checkAns() {
    if (parseInt(userAns) === rightAns) {
        clearTimeout(calcTimer); clearInterval(calcBarInt);
        Sound.win();
        document.getElementById('calc-overlay').style.display = 'none';

        const pairKey = `${actB1.val}${mathSign}${actB2.val}`;
        if (!solvedPairs.has(pairKey)) {
            solvedPairs.add(pairKey);
            bScore += Math.abs(rightAns);
            document.getElementById('b-score').textContent = bScore;
        }

        let mx = (actB1.x + actB2.x) / 2, my = (actB1.y + actB2.y) / 2, col = actB1.colorIdx;
        balls.splice(balls.indexOf(actB1), 1); actB1.el.remove();
        balls.splice(balls.indexOf(actB2), 1); actB2.el.remove();
        if (rightAns > 0) spawnBall(mx, my, rightAns, col);

        if (balls.length === 1 && balls[0].val >= bTarget) {
            finishBalls(true);
        } else if (bMode === 'hard') {
            resetBoomTimer();
        }
    } else {
        Sound.err(); userAns = ''; updateCalcText();
    }
}

function resetBoomTimer() {
    if (boomTimer) clearInterval(boomTimer);
    boomTimer = setInterval(() => {
        let cands = balls.filter(b => b.val >= 2 && !b.dragged);
        if (cands.length) splitBall(cands[Math.floor(Math.random() * cands.length)], true);
    }, 4000);
}

function updateLives() {
    document.getElementById('b-lives').textContent = '❤️'.repeat(Math.max(0, bLives)) + '🖤'.repeat(Math.max(0, 5 - bLives));
}

function finishBalls(win) {
    stopBallsGame();
    win ? Sound.win() : Sound.boom();
    document.getElementById('end-title').textContent = win ? 'УРА! ПОБЕДА! 🎉' : 'ИГРА ОКОНЧЕНА 💥';
    document.getElementById('end-stats').textContent = `Твой счёт: ${bScore}`;
    const cBtn = document.getElementById('btn-continue'); if(cBtn) cBtn.textContent = win ? 'Продолжить 💥' : 'Заново ↻'; document.getElementById('end-overlay').style.display = 'flex';
}

function continueBallsGame() {
    Sound.boom();
    document.getElementById('end-overlay').style.display = 'none';
    startBallsGame(bMode, true);
}

