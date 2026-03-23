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

// ⭐ FIX: biến hình a
const VOWELS = {
  a: ["ะ","ั","า"],
  i: ["ิ","ี","ึ","ื"],
  u: ["ุ","ู"],
  e: ["เ","แ"],
  o: ["โ","ใ","ไ"]
};

const TONES = ["่","้","๊","๋"];

// ===== STATE =====
let lastGroup = null;
let lastIndex = -1;

// ===== UTILS =====
function insert(text){
  let s = ta.selectionStart;
  let v = ta.value;
  ta.value = v.slice(0,s) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

// ⭐ FIX: xử lý dấu trên/dưới
function replaceLast(text){
  let s = ta.selectionStart;
  if (s === 0) return;

  let v = ta.value;

  // dấu phải "gắn thêm"
  if (["ั","ิ","ี","ึ","ื","ุ","ู"].includes(text)) {
    ta.value = v.slice(0,s) + text + v.slice(s);
    ta.selectionStart = ta.selectionEnd = s + 1;
    return;
  }

  ta.value = v.slice(0,s-1) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

// ===== CYCLE =====
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

// ===== KEYDOWN =====
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

    let group = CONS[key];
    insert(group[0]);

    lastGroup = group;
    lastIndex = 0;
    return;
  }

  // ===== VOWEL =====
  if (VOWELS[key]) {
    e.preventDefault();

    let group = VOWELS[key];
    insert(group[0]);

    lastGroup = group;
    lastIndex = 0;
    return;
  }

  // ===== TONE =====
  if (key === "'") {
    e.preventDefault();

    insert(TONES[0]);

    lastGroup = TONES;
    lastIndex = 0;
    return;
  }

  lastGroup = null;
});

// ===== BEFOREINPUT (CHẶN "=") =====
ta.addEventListener("beforeinput", (e) => {

  if (e.data === "=" || e.data === "+") {
    e.preventDefault();
    cycle(+1);
  }

  if (e.data === "-") {
    e.preventDefault();
    cycle(-1);
  }
});
