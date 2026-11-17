const WORDS_POOL = [
    { w: 'КОТ', img: '🐱' }, { w: 'ДОМ', img: '🏠' }, { w: 'СЫР', img: '🧀' },
    { w: 'МЯЧ', img: '⚽' }, { w: 'ЛЕС', img: '🌲' }, { w: 'ЖУК', img: '🪲' },
    { w: 'ШАР', img: '🎈' }, { w: 'НОС', img: '👃' }, { w: 'РОТ', img: '👄' },
    { w: 'ЗУБ', img: '🦷' }, { w: 'КИТ', img: '🐳' }, { w: 'РАК', img: '🦀' },
    { w: 'ЛУНА', img: '🌙' }, { w: 'РЫБА', img: '🐟' }, { w: 'СЛОН', img: '🐘' },
    { w: 'РОЗА', img: '🌹' }, { w: 'КОЗА', img: '🐐' }, { w: 'ЛИСА', img: '🦊' },
    { w: 'ЖАБА', img: '🐸' }, { w: 'СОВА', img: '🦉' }
];
const ITEMS_POOL = ['🍎','🚗','⭐','🐸','⚽','🍓','🚀','🐶'];
const SHAPES_POOL = [
    { id: 'circle', svg: '<circle cx="50" cy="50" r="35" fill="FILL" stroke="STROKE" stroke-width="15" stroke-dasharray="DASH"/>' },
    { id: 'square', svg: '<rect x="17" y="17" width="66" height="66" rx="10" fill="FILL" stroke="STROKE" stroke-width="15" stroke-dasharray="DASH"/>' },
    { id: 'triangle', svg: '<polygon points="50,15 85,81 15,81" fill="FILL" stroke="STROKE" stroke-width="15" stroke-linejoin="round" stroke-dasharray="DASH"/>' },
    { id: 'star', svg: '<polygon points="50,11 62,36 90,40 69,60 74,88 50,74 26,88 31,60 10,40 38,36" fill="FILL" stroke="STROKE" stroke-width="15" stroke-linejoin="round" stroke-dasharray="DASH"/>' }
];
const RAINBOW = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#38bdf8', '#2563eb', '#9333ea'];
const CYCLE_ORDER = ['words', 'numbers', 'shapes'];

let kidsTab = 'words', isMixMode = false, mixStep = 0;
let targetWord = '', filledCount = 0, hintTimer = null;

function clearHint() {
    if (hintTimer) clearTimeout(hintTimer);
    document.querySelectorAll('.hint-active').forEach(el => el.classList.remove('hint-active'));
}

function startHintTimer() {
    clearHint();
    if (kidsTab === 'numbers') return;
    hintTimer = setTimeout(() => {
        const map = {
            words: ['.letter-slot:not(.filled)', '.choice-tile', 'char'],
            shapes: ['.shape-slot:not(.filled)', '.shape-drag', 'key'],
            pyramid: ['.pyr-slot:not(.filled)', '.pyr-ring', 'idx']
        };
        const [slotSel, tileSel, attr] = map[kidsTab];
        const nextSlot = document.querySelector(slotSel);
        if (!nextSlot) return;
        const needed = nextSlot.dataset[attr];
        const tile = Array.from(document.querySelectorAll(tileSel)).find(t => t.style.visibility !== 'hidden' && (attr === 'char' ? t.textContent === needed : t.dataset[attr] === needed));
        nextSlot.classList.add('hint-active');
        if (tile) tile.classList.add('hint-active');
    }, 2000);
}

function setKidsTab(tab, btn) {
    Sound.click(); clearHint();
    if (tab === 'mix') {
        if (isMixMode) {
            isMixMode = false; btn.classList.remove('active');
            document.querySelector('.tabs .tab-btn').classList.add('active');
            initKidsGame('words');
        } else {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            isMixMode = true; mixStep = 0;
            initKidsGame(CYCLE_ORDER);
        }
        return;
    }
    isMixMode = false;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    initKidsGame(tab);
}

function nextKidsRound() {
    if (isMixMode) {
        mixStep = (mixStep + 1) % CYCLE_ORDER.length;
        initKidsGame(CYCLE_ORDER[mixStep]);
    } else initKidsGame(kidsTab);
}

function initKidsGame(tab) {
    kidsTab = tab; clearHint();
    const board = document.getElementById('kids-board');
    board.innerHTML = '';
    if (tab === 'words') renderWords(board);
    else if (tab === 'numbers') renderNumbers(board);
    else if (tab === 'shapes') renderShapes(board);
    else renderPyramid(board);
}

function renderWords(board) {
    const item = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)];
    targetWord = item.w; filledCount = 0;
    board.innerHTML = `<div style="font-size:15vmin; line-height:1;">${item.img}</div><div class="slots-row" id="w-slots"></div><div class="choices-row" id="w-choices"></div>`;
    const slotsEl = document.getElementById('w-slots');
    for (let i = 0; i < targetWord.length; i++) slotsEl.innerHTML += `<div class="letter-slot" data-char="${targetWord[i]}">${targetWord[i]}</div>`;
    const choicesEl = document.getElementById('w-choices');
    targetWord.split('').sort(() => Math.random() - 0.5).forEach(char => {
        const tile = document.createElement('div');
        tile.className = 'choice-tile'; tile.textContent = char;
        setupDragElement(tile, '.letter-slot', 'char', char, targetWord.length, nextKidsRound, s => s.classList.add('filled'));
        choicesEl.appendChild(tile);
    });
    startHintTimer();
}
function renderShapes(board) {
    filledCount = 0;
    const mode = Math.floor(Math.random() * 4);
    const cols = ['#ef4444', '#2563eb', '#16a34a', '#eab308'];
    const strokes = ['#ef4444', '#2563eb', '#16a34a', '#9333ea'];
    const shOrder = [...SHAPES_POOL].sort(() => Math.random() - 0.5);
    const colOrder = [...cols].sort(() => Math.random() - 0.5);
    const strOrder = [...strokes].sort(() => Math.random() - 0.5);
    const baseSh = shOrder[0], baseCol = colOrder[0];

    const items = [0, 1, 2, 3].map(i => {
        if (mode === 0) return { svg: shOrder[i].svg, fill: colOrder[i], stroke: '#0f172a', key: `k_${i}` };
        if (mode === 1) return { svg: baseSh.svg, fill: colOrder[i], stroke: '#0f172a', key: `k_${i}` };
        if (mode === 2) return { svg: baseSh.svg, fill: '#fde047', stroke: strOrder[i], key: `k_${i}` };
        return { svg: shOrder[i].svg, fill: baseCol, stroke: '#0f172a', key: `k_${i}` };
    });

    board.innerHTML = `<div class="slots-row" id="s-slots"></div><div class="choices-row" id="s-choices"></div>`;
    const slotsEl = document.getElementById('s-slots'), choicesEl = document.getElementById('s-choices');

    [...items].sort(() => Math.random() - 0.5).forEach(it => {
        const slot = document.createElement('div');
        slot.className = 'shape-card shape-slot'; slot.dataset.key = it.key;
        slot.style.cssText = 'background:rgba(255,255,255,0.08);border-color:#64748b;';
        const outlineCol = mode === 2 ? it.stroke : it.fill;
        slot.innerHTML = `<svg viewBox="0 0 100 100" style="width:15vmin;height:15vmin;">${it.svg.replace('FILL', 'none').replace('STROKE', outlineCol).replace('DASH', '12,6')}</svg>`;
        slotsEl.appendChild(slot);
    });

    [...items].sort(() => Math.random() - 0.5).forEach(it => {
        const tile = document.createElement('div');
        tile.className = 'shape-card shape-drag'; tile.dataset.key = it.key;
        tile.style.cssText = 'touch-action:none;cursor:grab;';
        tile.innerHTML = `<svg viewBox="0 0 100 100" style="width:15vmin;height:15vmin;">${it.svg.replace('FILL', it.fill).replace('STROKE', it.stroke).replace('DASH', 'none')}</svg>`;
        setupDragElement(tile, '.shape-slot', 'key', it.key, 4, nextKidsRound, slot => {
            slot.classList.add('filled'); slot.style.cssText = 'background:#ffffff;border-color:#10b981;'; slot.innerHTML = tile.innerHTML;
        });
        choicesEl.appendChild(tile);
    });
    startHintTimer();
}

function renderPyramid(board) {
    filledCount = 0;
    const natHtml = (typeof NATURE_ITEMS !== 'undefined') ? NATURE_ITEMS.map((n, i) => `<div class="nature-item" id="nat-${i}" style="${n.style}">${n.icon}</div>`).join('') : '';
    board.innerHTML = `<div id="screen-vignette"></div><div id="nature-scene">${natHtml}</div><div id="warm-sun"><svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible;"><g class="sun-rays" stroke="#facc15" stroke-width="6" stroke-linecap="round"><line x1="50" y1="6" x2="50" y2="18"/><line x1="50" y1="82" x2="50" y2="94"/><line x1="6" y1="50" x2="18" y2="50"/><line x1="82" y1="50" x2="94" y2="50"/><line x1="19" y1="19" x2="28" y2="28"/><line x1="72" y1="72" x2="81" y2="81"/><line x1="81" y1="19" x2="72" y2="28"/><line x1="28" y1="72" x2="19" y2="81"/></g><circle cx="50" cy="50" r="24" fill="#facc15" stroke="#f59e0b" stroke-width="5"/></svg></div><div class="pyramid-wrap" id="pyr-slots"><div class="pyramid-rod"></div></div><div class="pyr-pool" id="pyr-choices"></div>`;
    const slotsEl = document.getElementById('pyr-slots'), choicesEl = document.getElementById('pyr-choices');
    const pyrColors = [...RAINBOW].sort(() => Math.random() - 0.5);

    pyrColors.forEach((col, i) => {
        const w = 16 + i * 4.5;
        const slot = document.createElement('div');
        slot.className = 'pyr-slot'; slot.dataset.idx = String(i);
        slot.style.width = `${w}vmin`; slot.style.borderColor = col;
        slotsEl.appendChild(slot);
    });

    pyrColors.map((col, i) => ({ col, i })).sort(() => Math.random() - 0.5).forEach(item => {
        const w = 16 + item.i * 4.5;
        const ring = document.createElement('div');
        ring.className = 'pyr-ring'; ring.dataset.idx = String(item.i);
        ring.style.cssText = `width:${w}vmin;background:${item.col};`;
        setupDragElement(ring, '.pyr-slot', 'idx', String(item.i), 7, nextKidsRound, slot => {
            slot.classList.add('filled'); slot.style.background = item.col;
            if (typeof revealNatureStep === 'function') revealNatureStep(filledCount);
        });
        choicesEl.appendChild(ring);
    });
    startHintTimer();
}

function setupDragElement(tile, slotSelector, dataAttr, matchVal, totalNeeded, onComplete, onFill) {
    let isDrag = false;
    tile.onpointerdown = e => {
        if (tile.style.visibility === 'hidden') return;
        clearHint(); isDrag = true; tile.setPointerCapture(e.pointerId);
        tile.classList.add('dragging'); tile.style.left = `${e.clientX}px`; tile.style.top = `${e.clientY}px`;
    };
    tile.onpointermove = e => {
        if (!isDrag) return;
        tile.style.left = `${e.clientX}px`; tile.style.top = `${e.clientY}px`;
        if (kidsTab === 'pyramid' && typeof updateWarmSun === 'function') {
            const target = document.querySelector(`.pyr-slot[data-idx="${matchVal}"]`);
            updateWarmSun(e.clientX, e.clientY, target, filledCount);
        }
    };
    tile.onpointerup = e => {
        if (!isDrag) return;
        isDrag = false;
        if (kidsTab === 'pyramid' && typeof resetWarmSun === 'function') resetWarmSun(filledCount);
        tile.releasePointerCapture(e.pointerId); tile.classList.remove('dragging');
        tile.style.left = ''; tile.style.top = '';
        const slots = Array.from(document.querySelectorAll(`${slotSelector}:not(.filled)`));
        const hovered = slots.find(s => {
            const r = s.getBoundingClientRect();
            return e.clientX >= r.left - 12 && e.clientX <= r.right + 12 && e.clientY >= r.top - 12 && e.clientY <= r.bottom + 12;
        });
        if (hovered) {
            if (hovered.dataset[dataAttr] === matchVal) {
                Sound.click(); onFill(hovered); tile.style.visibility = 'hidden'; filledCount++;
                if (filledCount === totalNeeded) {
                    clearHint(); if(typeof registerTaskWin==="function") registerTaskWin(); setTimeout(onComplete, 1300);
                    try { if (typeof celebrate === 'function') celebrate(); else Sound.win(); } catch (err) {}
                } else startHintTimer();
            } else {
                Sound.err();
                if (kidsTab === 'pyramid' && typeof triggerRainEffect === 'function') triggerRainEffect();
                startHintTimer();
            }
        } else startHintTimer();
    };
}

function renderNumbers(board) {
    const isPlus = Math.random() > 0.35;
    const emoji = ITEMS_POOL[Math.floor(Math.random() * ITEMS_POOL.length)];
    let a, b, ans, visualHtml;
    if (isPlus) {
        a = Math.floor(Math.random() * 5) + 1; b = Math.floor(Math.random() * (9 - a)) + 1; ans = a + b;
        visualHtml = `<span>${emoji.repeat(a)}</span><span style="color:#38bdf8;margin:0 2vmin;">+</span><span>${emoji.repeat(b)}</span>`;
    } else {
        a = Math.floor(Math.random() * 7) + 3; b = Math.floor(Math.random() * (a - 1)) + 1; ans = a - b;
        visualHtml = `<span>${emoji.repeat(ans)}</span><span style="opacity:0.28;filter:grayscale(1);">${emoji.repeat(b)}</span>`;
    }
    board.innerHTML = `<div class="kids-prompt" style="font-size:8vmin;">${a} ${isPlus ? '+' : '−'} ${b} = ?</div><div class="slots-row" style="font-size:7.5vmin;max-width:90vw;align-items:center;">${visualHtml}</div><div class="choices-row" id="n-choices"></div>`;
    let opts = new Set([ans]);
    while (opts.size < 4) opts.add(Math.floor(Math.random() * 9) + 1);
    const choices = document.getElementById('n-choices');
    Array.from(opts).sort(() => Math.random() - 0.5).forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'choice-tile'; btn.textContent = num;
        btn.onclick = () => {
            if (num === ans) {
                if(typeof registerTaskWin==="function") registerTaskWin(); setTimeout(nextKidsRound, 1300);
                try { if (typeof celebrate === 'function') celebrate(); else Sound.win(); } catch (err) {}
            } else Sound.err();
        };
        choices.appendChild(btn);
    });
}

