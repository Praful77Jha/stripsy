// ─── DOM References ──────────────────────────────────────────────────────────
const uploadZone   = document.getElementById('uploadZone');
const fileInput    = document.getElementById('fileInput');
const startBtn     = document.getElementById('startBtn');
const resetBtn     = document.getElementById('resetBtn');
const gameWrapper  = document.getElementById('gameWrapper');
const codePanel    = document.getElementById('codePanel');
const canvas       = document.getElementById('gameCanvas');
const ctx          = canvas.getContext('2d');
const phaseLabel   = document.getElementById('phaseLabel');
const cmpCountEl   = document.getElementById('cmpCount');
const swpCountEl   = document.getElementById('swpCount');
const passCountEl  = document.getElementById('passCount');
const overlayText  = document.getElementById('overlayText');
const stripIndicesEl = document.getElementById('stripIndices');

// ─── State ───────────────────────────────────────────────────────────────────
let img       = null;
let strips    = [];
let order     = [];
let STRIPS    = 11;
let SPEED     = 300;
let sorting   = false;
let done      = false;
let animTimer = null;

// Bubble sort state machine
let bsI = 0, bsPass = 0, bsSwapped = false;
let comparisons = 0, swaps = 0;

// Animation state
let animating    = false;
let animStartTime = null;
let animFromPos  = [];   // x positions before swap
let animToPos    = [];   // x positions after swap
let animI        = -1;
let animJ        = -1;
const ANIM_DURATION = 180; // ms

// ─── Upload Handling ─────────────────────────────────────────────────────────
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag');
  if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
});

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    img = new Image();
    img.onload = () => {
      uploadZone.querySelector('p').innerHTML = `<strong>${file.name}</strong> loaded ✓`;
      startBtn.disabled = false;
      resetBtn.disabled = false;
      setupGame();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// ─── Game Setup ───────────────────────────────────────────────────────────────
function setupGame() {
  STRIPS = parseInt(document.getElementById('stripCount').value);
  SPEED  = parseInt(document.getElementById('speedSelect').value);

  const W = 700;
  const H = Math.round(W * img.height / img.width);
  canvas.width = W;
  canvas.height = H;

  const sw = Math.floor(W / STRIPS);
  strips = [];
  for (let i = 0; i < STRIPS; i++) {
    const off = document.createElement('canvas');
    off.width = sw; off.height = H;
    const c = off.getContext('2d');
    c.drawImage(img, i * sw, 0, sw, H, 0, 0, sw, H);
    strips.push(off);
  }

  // Shuffle
  order = Array.from({ length: STRIPS }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  // Reset sort state
  bsI = 0; bsPass = 0; bsSwapped = false;
  comparisons = 0; swaps = 0;
  sorting = false; done = false; animating = false;

  clearTimeout(animTimer);

  phaseLabel.textContent = 'READY';
  phaseLabel.className = 'phase';
  overlayText.classList.remove('visible');

  updateStats();
  drawStrips();
  renderStripIndices();
  renderCode();

  gameWrapper.style.display = 'block';
  codePanel.style.display = 'block';
}

// ─── Controls ────────────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => {
  if (!img || sorting || animating) return;
  SPEED = parseInt(document.getElementById('speedSelect').value);
  sorting = true;
  phaseLabel.textContent = 'SORTING';
  phaseLabel.className = 'phase sorting';
  nextStep();
});

resetBtn.addEventListener('click', () => {
  clearTimeout(animTimer);
  cancelAnimationFrame(animTimer);
  sorting = false; animating = false;
  if (img) setupGame();
});

// ─── Stats ───────────────────────────────────────────────────────────────────
function updateStats() {
  cmpCountEl.textContent  = String(comparisons).padStart(3, '0');
  swpCountEl.textContent  = String(swaps).padStart(3, '0');
  passCountEl.textContent = String(bsPass).padStart(2, '0');
}

// ─── Drawing ──────────────────────────────────────────────────────────────────
function drawStrips(highlightI = -1, highlightJ = -1, overridePositions = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sw = Math.floor(canvas.width / STRIPS);

  for (let k = 0; k < STRIPS; k++) {
    const x = overridePositions ? overridePositions[k] : k * sw;
    ctx.drawImage(strips[order[k]], x, 0, sw, canvas.height);

    if (k === highlightI || k === highlightJ) {
      ctx.fillStyle = k === highlightI
        ? 'rgba(255,69,69,0.22)'
        : 'rgba(232,255,71,0.18)';
      ctx.fillRect(x, 0, sw, canvas.height);

      ctx.strokeStyle = k === highlightI ? '#ff4545' : '#e8ff47';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, 0, sw - 2, canvas.height);
    }
  }
}

function renderStripIndices(i = -1, j = -1) {
  stripIndicesEl.innerHTML = '';
  for (let k = 0; k < STRIPS; k++) {
    const d = document.createElement('div');
    d.className = 'strip-idx';
    d.textContent = order[k] + 1;
    if (k === i || k === j) d.classList.add('comparing');
    stripIndicesEl.appendChild(d);
  }
}

// ─── Smooth Swap Animation ────────────────────────────────────────────────────
function animateSwap(i, j, onDone) {
  const sw = Math.floor(canvas.width / STRIPS);

  // Starting x positions
  const startX = Array.from({ length: STRIPS }, (_, k) => k * sw);
  const endX   = [...startX];
  // Swap the two target positions
  endX[i] = startX[j];
  endX[j] = startX[i];

  // Current drawn positions (start from natural positions)
  const curX = [...startX];

  const startTime = performance.now();

  function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / ANIM_DURATION, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // easeInOut

    for (let k = 0; k < STRIPS; k++) {
      curX[k] = startX[k] + (endX[k] - startX[k]) * ease;
    }

    drawStrips(i, j, curX);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      onDone();
    }
  }

  requestAnimationFrame(frame);
}

// ─── Bubble Sort Step Machine ─────────────────────────────────────────────────
function nextStep() {
  if (!sorting) return;

  // End of pass check
  if (bsI >= STRIPS - 1 - bsPass) {
    bsPass++;
    if (!bsSwapped) {
      finishSort();
      return;
    }
    bsI = 0;
    bsSwapped = false;
    updateStats();
    renderCode(4);
    animTimer = setTimeout(nextStep, SPEED);
    return;
  }

  // Compare
  comparisons++;
  updateStats();
  renderCode(6);
  drawStrips(bsI, bsI + 1);
  renderStripIndices(bsI, bsI + 1);
  playCompareSound();

  if (order[bsI] > order[bsI + 1]) {
    // Need to swap
    swaps++;
    updateStats();
    renderCode(7, 7);
    playSwapSound();

    const i = bsI, j = bsI + 1;
    animating = true;

    animateSwap(i, j, () => {
      [order[i], order[j]] = [order[j], order[i]];
      bsSwapped = true;
      bsI++;
      animating = false;
      drawStrips();
      renderStripIndices();
      animTimer = setTimeout(nextStep, SPEED * 0.4);
    });
  } else {
    bsI++;
    animTimer = setTimeout(nextStep, SPEED * 0.6);
  }
}

function finishSort() {
  sorting = false; done = true;
  drawStrips();
  renderStripIndices();
  renderCode(11);
  phaseLabel.textContent = 'SORTED';
  phaseLabel.className = 'phase done';
  overlayText.textContent = '✓ SORTED!';
  overlayText.classList.add('visible');
  playDoneSound();
  setTimeout(() => overlayText.classList.remove('visible'), 2500);
}

// Init
renderCode();
