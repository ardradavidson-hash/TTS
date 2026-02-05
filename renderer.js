import * as pdfjsLib from './pdfjs/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdfjs/pdf.worker.mjs';

const fileInput = document.getElementById('fileInput');
const textInput = document.getElementById('textInput');
const loadTextBtn = document.getElementById('loadTextBtn');
const sentenceBox = document.getElementById('sentences');
const pdfViewer = document.getElementById('pdfViewer');
const speedSlider = document.getElementById('speed');
const pauseBtn = document.getElementById('pauseBtn');
const themeBtn = document.getElementById('themeBtn');

let sentences = [];
let currentIndex = 0;
let paused = false;

// ---------- THEME ----------
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
};

// ---------- RESET ----------
function resetAll() {
  speechSynthesis.cancel();
  sentences = [];
  currentIndex = 0;
  sentenceBox.innerHTML = '';
  pdfViewer.innerHTML = '';
}

// ---------- PDF LOAD ----------
fileInput.onchange = async e => {
  resetAll();
  const file = e.target.files[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);

    const viewport = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    pdfViewer.appendChild(canvas);

    const text = (await page.getTextContent()).items.map(i => i.str).join(' ');
    parseText(text);
  }

  renderSentences();
};

// ---------- PASTED TEXT ----------
loadTextBtn.onclick = () => {
  resetAll();
  if (!textInput.value.trim()) return;
  parseText(textInput.value);
  renderSentences();
};

// ---------- PARSING ----------
function parseText(text) {
  const chunks = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/);

  chunks.forEach(s => {
    s = s.trim();
    if (!s) return;

    const isHeading =
      s.length <= 80 &&
      (
        s === s.toUpperCase() ||
        /^[A-Z][a-z]+(\s[A-Z][a-z]+){0,6}$/.test(s) ||
        /^\d+[\.\)]\s/.test(s)
      ) &&
      !/[.!?]$/.test(s);

    if (isHeading) {
      sentences.push({ text: s, type: 'heading' });
      sentences.push({ type: 'pause' });
    } else {
      sentences.push({ text: s, type: 'body' });
    }
  });
}

// ---------- UI ----------
function renderSentences() {
  sentenceBox.innerHTML = '';
  sentences.forEach((s, i) => {
    if (s.type === 'pause') return;
    const div = document.createElement('div');
    div.textContent = s.text;
    div.onclick = () => { currentIndex = i; speak(); };
    sentenceBox.appendChild(div);
  });
}

function highlight() {
  let visible = -1;
  sentenceBox.querySelectorAll('div').forEach((el, i) => {
    visible++;
    el.classList.toggle('active', visible === visibleIndex());
  });
}

function visibleIndex() {
  let count = -1;
  for (let i = 0; i <= currentIndex; i++) {
    if (sentences[i].type !== 'pause') count++;
  }
  return count;
}

// ---------- SPEECH ----------
function speak() {
  speechSynthesis.cancel();
  paused = false;

  const s = sentences[currentIndex];
  if (!s) return;

  // Highlight ONLY when audio starts
  highlight();

  // Handle hard pause nodes (heading pauses)
  if (s.type === 'pause') {
    // Do NOT advance highlight here
    setTimeout(() => {
      currentIndex++;
      speak();
    }, 900);
    return;
  }

  const parts = s.text.split(/[,;—]/).filter(Boolean);
  let partIndex = 0;

  function speakPart() {
    if (paused) return;

    if (partIndex >= parts.length) {
      // STOP here. Do NOT auto-advance index.
      // User decides when to move on.
      return;
    }

    const u = new SpeechSynthesisUtterance(parts[partIndex].trim());
    u.rate = speedSlider.value;
    u.pitch = s.type === 'heading' ? 0.9 : 1.0;

    u.onend = () => {
      partIndex++;
      setTimeout(speakPart, 200);
    };

    speechSynthesis.speak(u);
  }

  speakPart();
}


// ---------- CONTROLS ----------
pauseBtn.onclick = togglePause;

function togglePause() {
  if (!speechSynthesis.speaking) return;
  paused = !paused;
  paused ? speechSynthesis.pause() : speechSynthesis.resume();
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    speechSynthesis.cancel();
    currentIndex++;
    speak();
  }
  if (e.key === 'p') togglePause();
  if (e.key === 'ArrowLeft') {
    currentIndex = Math.max(0, currentIndex - 1);
    speak();
  }
  if (e.key === 'ArrowRight') {
    currentIndex = Math.min(sentences.length - 1, currentIndex + 1);
    speak();
  }
});
