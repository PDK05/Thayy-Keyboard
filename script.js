const ta = document.getElementById("input");

// ===== DATA =====
const CONS = {
  k: ["ข","ฃ","ค","ฅ","ฆ"],
  s: ["ซ","ส","ศ","ษ"],
  c: ["ฉ","ช","ฌ"],
  t: ["ฐ","ฑ","ฒ","ถ","ท","ธ"],
  p: ["ผ","พ","ภ"],
  n: ["น","ณ"]
};

// Nguyên âm + long + biến hình
const VOWELS = {
  a: { short: "ะ", long: "า", variants: ["ะ","ั","า"] },
  i: { short: "ิ", long: "ี", variants: ["ิ","ี","ึ","ื"] },
  u: { short: "ุ", long: "ู", variants: ["ุ","ู"] },
  e: { short: "เ", long: "แ", variants: ["เ","แ"] },
  o: { short: "โ", long: null, variants: ["โ","ใ","ไ"] }
};

const TONES = ["่","้","๊","๋"];

// ===== STATE =====
let lastGroup = null;
let lastIndex = -1;
let lastKey = null;
let lastVowelPressPos = -1;

// ===== UTILS =====
function insert(text){
  const s = ta.selectionStart;
  const v = ta.value;
  ta.value = v.slice(0,s) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceLast(text){
  const s = ta.selectionStart;
  if (s === 0) return;
  const v = ta.value;

  // nếu là dấu đi kèm nguyên âm
  if (["ั","ิ","ี","ึ","ื","ุ","ู"].includes(text)) {
    ta.value = v.slice(0,s) + text + v.slice(s);
    ta.selectionStart = ta.selectionEnd = s + 1;
    return;
  }

  ta.value = v.slice(0,s-1) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

// ===== CYCLE VARIANTS (= / -) =====
function cycle(dir){
  if(!lastGroup) return;

  const pos = ta.selectionStart;
  const currentChar = ta.value[pos - 1];

  let idx = lastGroup.indexOf(currentChar);
  if (idx === -1) idx = lastIndex;

  const newIndex = (idx + dir + lastGroup.length) % lastGroup.length;

  replaceLast(lastGroup[newIndex]);
  lastIndex = newIndex;
}

// ===== KEYDOWN =====
ta.addEventListener("keydown", (e)=>{

  // allow system keys
  if (
    e.ctrlKey || e.metaKey ||
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key.startsWith("Arrow")
  ) return;

  const key = e.key.toLowerCase();
  const pos = ta.selectionStart;

  // ===== CONSONANT =====
  if (CONS[key]) {
    e.preventDefault();

    insert(CONS[key][0]);

    lastGroup = CONS[key];
    lastIndex = 0;
    lastKey = key;
    lastVowelPressPos = -1; // reset
    return;
  }

  // ===== VOWEL =====
  if (VOWELS[key]) {
    e.preventDefault();

    const v = VOWELS[key];

    // double-key logic (long vowel)
    if (lastKey === key && lastVowelPressPos === pos-1 && v.long) {
      replaceLast(v.long);

      lastGroup = v.variants;
      lastIndex = v.variants.indexOf(v.long);
      lastVowelPressPos = pos; // update cursor
      return;
    }

    // first press → short
    insert(v.short);

    lastGroup = v.variants;
    lastIndex = v.variants.indexOf(v.short);
    lastKey = key;
    lastVowelPressPos = pos;
    return;
  }

  // ===== TONE =====
  if (key === "'") {
    e.preventDefault();

    insert(TONES[0]);

    lastGroup = TONES;
    lastIndex = 0;
    lastKey = key;
    lastVowelPressPos = -1;
    return;
  }

  // reset nếu ký tự khác
  lastGroup = null;
  lastKey = null;
  lastVowelPressPos = -1;
});

// ===== BEFOREINPUT =====
ta.addEventListener("beforeinput", (e)=>{

  if (e.data === "=" || e.data === "+") {
    e.preventDefault();
    cycle(+1);
  }

  if (e.data === "-") {
    e.preventDefault();
    cycle(-1);
  }
});
