const TOY_POOL = ['🧸','🚀','🦖','🦄','🤖','🚒','🏰','🎸','🐶','🦊','🐼','🦁','🚂','🚁','🛸','👑','⚽','🍦','🍩','🐙'];
let savedStickers = JSON.parse(localStorage.getItem('kids_stickers_v1') || '[]');
let tasksDoneCount = parseInt(localStorage.getItem('kids_tasks_count') || '0', 10);
let pendingStickerEmoji = null;

function saveStickersState() {
    localStorage.setItem('kids_stickers_v1', JSON.stringify(savedStickers));
    localStorage.setItem('kids_tasks_count', String(tasksDoneCount));
}

function registerTaskWin() {
    tasksDoneCount++;
    saveStickersState();
    if (tasksDoneCount % 5 === 0) {
        setTimeout(openPrizeChoice, 1350);
    }
}

function openPrizeChoice() {
    const modal = document.getElementById('prize-modal');
    if (!modal) return;
    const owned = new Set(savedStickers.map(s => s.emoji));
    let avail = TOY_POOL.filter(e => !owned.has(e));
    if (avail.length < 3) avail = [...TOY_POOL];
    const choices = avail.sort(() => Math.random() - 0.5).slice(0, 3);

    const box = modal.querySelector('.prize-cards');
    box.innerHTML = '';
    choices.forEach(emoji => {
        const btn = document.createElement('div');
        btn.className = 'prize-card';
        btn.textContent = emoji;
        btn.onclick = () => {
            Sound.win();
            modal.style.display = 'none';
            if (savedStickers.length < 10) {
                savedStickers.push({ emoji, x: 15 + Math.random() * 70, y: 20 + Math.random() * 60 });
                saveStickersState();
                renderStickersLayer();
            } else {
                startStickerReplacement(emoji);
            }
        };
        box.appendChild(btn);
    });
    modal.style.display = 'flex';
}
function renderStickersLayer() {
    const layer = document.getElementById('sticker-layer');
    if (!layer) return;
    layer.innerHTML = '';
    savedStickers.forEach((st, idx) => {
        const el = document.createElement('div');
        el.className = 'world-sticker';
        el.dataset.idx = String(idx);
        el.textContent = st.emoji;
        el.style.left = `${st.x}%`;
        el.style.top = `${st.y}%`;
        el.style.transform = 'translate(-50%, -50%)';

        let drag = false;
        el.onpointerdown = e => {
            if (pendingStickerEmoji) return;
            drag = true; el.setPointerCapture(e.pointerId);
            el.style.transform = 'translate(-50%, -50%) scale(1.2)';
        };
        el.onpointermove = e => {
            if (!drag) return;
            st.x = Math.max(6, Math.min(94, (e.clientX / window.innerWidth) * 100));
            st.y = Math.max(14, Math.min(94, (e.clientY / window.innerHeight) * 100));
            el.style.left = `${st.x}%`; el.style.top = `${st.y}%`;
        };
        el.onpointerup = e => {
            if (!drag) return;
            drag = false; el.releasePointerCapture(e.pointerId);
            el.style.transform = 'translate(-50%, -50%) scale(1)';
            saveStickersState();
        };
        layer.appendChild(el);
    });
}

function startStickerReplacement(newEmoji) {
    pendingStickerEmoji = newEmoji;
    const layer = document.getElementById('sticker-layer');
    const replacer = document.createElement('div');
    replacer.className = 'world-sticker hint-active';
    replacer.textContent = newEmoji;
    replacer.style.cssText = 'left:50%;top:50%;transform:translate(-50%,-50%) scale(1.25);z-index:250;';
    layer.appendChild(replacer);

    let drag = false, targetIdx = -1;
    replacer.onpointerdown = e => { drag = true; replacer.setPointerCapture(e.pointerId); };
    replacer.onpointermove = e => {
        if (!drag) return;
        replacer.style.left = `${e.clientX}px`; replacer.style.top = `${e.clientY}px`;
        targetIdx = -1;
        document.querySelectorAll('.world-sticker[data-idx]').forEach(oldEl => {
            const r = oldEl.getBoundingClientRect();
            const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
            if (d < r.width * 0.85) {
                oldEl.classList.add('replace-target');
                targetIdx = parseInt(oldEl.dataset.idx, 10);
            } else oldEl.classList.remove('replace-target');
        });
    };
    replacer.onpointerup = e => {
        if (!drag) return;
        drag = false; replacer.releasePointerCapture(e.pointerId);
        if (targetIdx >= 0) {
            Sound.win();
            savedStickers[targetIdx].emoji = newEmoji;
            pendingStickerEmoji = null;
            saveStickersState();
            renderStickersLayer();
        } else {
            replacer.style.left = '50%'; replacer.style.top = '50%';
        }
    };
}

window.addEventListener('DOMContentLoaded', renderStickersLayer);
