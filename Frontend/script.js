// Normalize text by selected mode
function normalizeText(text, mode) {
  if (mode === 'lower_punct') {
    return text
      .toLowerCase()
      .normalize('NFKC')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ') // strip punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }
  if (mode === 'lower_only') {
    return text.toLowerCase().normalize('NFKC');
  }
  return text;
}

// Create k-length character shingles as a Set
function createShingles(text, k) {
  const set = new Set();
  if (!text || k <= 0 || text.length < k) return set;
  for (let i = 0; i <= text.length - k; i++) {
    set.add(text.slice(i, i + k));
  }
  return set;
}

// Compute Jaccard similarity = |A ∩ B| / |A ∪ B|
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set();
  const [small, large] = setA.size < setB.size ? [setA, setB] : [setB, setA];
  for (const x of small) if (large.has(x)) intersection.add(x);
  const unionSize = setA.size + setB.size - intersection.size;
  return {
    score: unionSize === 0 ? 0 : intersection.size / unionSize,
    intersection,
    unionSize
  };
}

// Pretty print a set with capping for readability
function printSet(set, cap = 150) {
  const arr = Array.from(set);
  const head = arr.slice(0, cap);
  const rest = arr.length > cap ? `\n… and ${arr.length - cap} more` : '';
  return head.join('\n') + rest;
}

function updateUI(result, shA, shB) {
  const pct = (result.score * 100).toFixed(2) + '%';
  const scale = '(' + result.score.toFixed(4) + ')';

  document.getElementById('scoreValue').textContent = pct;
  document.getElementById('scoreScale').textContent = scale;
  document.getElementById('barFill').style.width = (result.score * 100).toFixed(1) + '%';

  document.getElementById('shinglesA').textContent = printSet(shA);
  document.getElementById('shinglesB').textContent = printSet(shB);
  document.getElementById('intersectSet').textContent = printSet(result.intersection);
  document.getElementById('unionSet').textContent = `Union size = ${result.unionSize}`;

  document.getElementById('iSize').textContent = result.intersection.size;
  document.getElementById('uSize').textContent = result.unionSize;
}

function compute() {
  const textA = document.getElementById('textA').value;
  const textB = document.getElementById('textB').value;
  const k = parseInt(document.getElementById('k').value, 10);
  const mode = document.getElementById('normalize').value;

  const aNorm = normalizeText(textA, mode);
  const bNorm = normalizeText(textB, mode);

  const shinglesA = createShingles(aNorm, k);
  const shinglesB = createShingles(bNorm, k);

  const result = jaccardSimilarity(shinglesA, shinglesB);
  updateUI(result, shinglesA, shinglesB);
}

function swapAB() {
  const a = document.getElementById('textA');
  const b = document.getElementById('textB');
  const tmp = a.value;
  a.value = b.value;
  b.value = tmp;
}

function clearAll() {
  document.getElementById('textA').value = '';
  document.getElementById('textB').value = '';
  compute();
}

document.getElementById('checkBtn').addEventListener('click', compute);
document.getElementById('swapBtn').addEventListener('click', swapAB);
document.getElementById('clearBtn').addEventListener('click', clearAll);

// Initial compute
compute();
