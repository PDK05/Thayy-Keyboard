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

// ⭐ tách rõ short / long / variants
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

// ===== UTILS =====
function insert(text){
  let s = ta.selectionStart;
  let v = ta.value;
  ta.value = v.slice(0,s) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceLast(text){
  let s = ta.selectionStart;
  if (s === 0) return;

  let v = ta.value;

  if (["ั","ิ","ี","ึ","ื","ุ","ู"].includes(text)) {
    ta.value = v.slice(0,s) + text + v.slice(s);
    ta.selectionStart = ta.selectionEnd = s + 1;
    return;
  }

  ta.value = v.slice(0,s-1) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

// ===== CYCLE VARIANT =====
function cycle(dir){
  if(!lastGroup) return;

  let pos = ta.selectionStart;
  let currentChar = ta.value[pos - 1];

  let idx = lastGroup.indexOf(currentChar);
  if (idx === -1) idx = lastIndex;

  let newIndex = (idx + dir + lastGroup.length) % lastGroup.length;

  replaceLast(lastGroup[newIndex]);
  lastIndex = newIndex;
}

// ===== MAIN =====
ta.addEventListener("keydown", (e)=>{

  if (
    e.ctrlKey || e.metaKey ||
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key.startsWith("Arrow")
  ) return;

  let key = e.key.toLowerCase();

  // ===== CONSONANT =====
  if (CONS[key]) {
    e.preventDefault();

    insert(CONS[key][0]);

    lastGroup = CONS[key];
    lastIndex = 0;
    lastKey = key;
    return;
  }

  // ===== VOWEL =====
  if (VOWELS[key]) {
    e.preventDefault();

    let v = VOWELS[key];

    // ⭐ DOUBLE KEY → LONG
    if (lastKey === key && v.long) {
      replaceLast(v.long);

      lastGroup = v.variants;
      lastIndex = v.variants.indexOf(v.long);
      return;
    }

    // ⭐ FIRST PRESS → SHORT
    insert(v.short);

    lastGroup = v.variants;
    lastIndex = v.variants.indexOf(v.short);
    lastKey = key;
    return;
  }

  // ===== TONE =====
  if (key === "'") {
    e.preventDefault();

    insert(TONES[0]);

    lastGroup = TONES;
    lastIndex = 0;
    lastKey = key;
    return;
  }

  lastGroup = null;
  lastKey = null;
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
