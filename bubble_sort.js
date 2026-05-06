// ─── Code snippet lines for the visual panel ───────────────────────────────
const CODE_LINES = [
  { id: 1,  html: `<span class="kw">function</span> <span class="fn">bubbleSort</span>(<span class="va">arr</span>) {` },
  { id: 2,  html: `&nbsp;&nbsp;<span class="kw">let</span> <span class="va">swapped</span>;` },
  { id: 3,  html: `&nbsp;&nbsp;<span class="kw">do</span> {` },
  { id: 4,  html: `&nbsp;&nbsp;&nbsp;&nbsp;<span class="va">swapped</span> <span class="op">=</span> <span class="kw">false</span>;` },
  { id: 5,  html: `&nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">for</span> (<span class="kw">let</span> <span class="va">i</span> <span class="op">=</span> <span class="nu">0</span>; <span class="va">i</span> <span class="op">&lt;</span> <span class="va">n</span> <span class="op">-</span> <span class="va">pass</span>; <span class="va">i</span>++) {` },
  { id: 6,  html: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">if</span> (<span class="va">arr</span>[<span class="va">i</span>] <span class="op">&gt;</span> <span class="va">arr</span>[<span class="va">i</span> <span class="op">+</span> <span class="nu">1</span>]) {` },
  { id: 7,  html: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[<span class="va">arr</span>[<span class="va">i</span>], <span class="va">arr</span>[<span class="va">i</span><span class="op">+</span><span class="nu">1</span>]] <span class="op">=</span> [<span class="va">arr</span>[<span class="va">i</span><span class="op">+</span><span class="nu">1</span>], <span class="va">arr</span>[<span class="va">i</span>]]; <span class="cm">// swap</span>` },
  { id: 8,  html: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="va">swapped</span> <span class="op">=</span> <span class="kw">true</span>;` },
  { id: 9,  html: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}` },
  { id: 10, html: `&nbsp;&nbsp;&nbsp;&nbsp;}` },
  { id: 11, html: `&nbsp;&nbsp;} <span class="kw">while</span> (<span class="va">swapped</span>);` },
  { id: 12, html: `}` },
];

function renderCode(activeLine = -1, highlightLine = -1) {
  const body = document.getElementById('codeBody');
  if (!body) return;
  body.innerHTML = CODE_LINES.map(l => {
    let cls = 'code-line';
    if (l.id === highlightLine) cls += ' highlight';
    else if (l.id === activeLine) cls += ' active';
    return `<div class="${cls}" id="cl-${l.id}"><span class="ln">${l.id}</span><span>${l.html}</span></div>`;
  }).join('');
}

// ─── Sound synthesis using Web Audio API ────────────────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playCompareSound() {
  try {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(440, ctx.currentTime);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o.start(); o.stop(ctx.currentTime + 0.1);
  } catch(e) {}
}

function playSwapSound() {
  try {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'triangle';
    o.frequency.setValueAtTime(300, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.start(); o.stop(ctx.currentTime + 0.15);
  } catch(e) {}
}

function playDoneSound() {
  try {
    const ctx = getAudioCtx();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      g.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
      o.start(ctx.currentTime + i * 0.12);
      o.stop(ctx.currentTime + i * 0.12 + 0.25);
    });
  } catch(e) {}
}
