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

const VOWELS = {
  a: ["ะ","า"],
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

function replaceLast(text){
  let s = ta.selectionStart;
  if (s === 0) return; // tránh lỗi

  let v = ta.value;
  ta.value = v.slice(0,s-1) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

// ===== CYCLE =====
function cycle(dir){
  if(!lastGroup) return;

  lastIndex = (lastIndex + dir + lastGroup.length) % lastGroup.length;
  replaceLast(lastGroup[lastIndex]);
}

// ===== MAIN =====
ta.addEventListener("keydown", (e)=>{

  // ===== PHÍM HỆ THỐNG =====
  if (
    e.ctrlKey || e.metaKey ||
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key.startsWith("Arrow")
  ) {
    return;
  }

  // ===== ⭐ FIX MỌI LOẠI "=" =====
  if (
    e.key === "=" ||
    e.key === "+" ||
    e.code === "Equal" ||
    e.code === "NumpadAdd"
  ) {
    e.preventDefault();
    cycle(+1);
    return;
  }

  // ===== ⭐ FIX MỌI LOẠI "-" =====
  if (
    e.key === "-" ||
    e.code === "Minus" ||
    e.code === "NumpadSubtract"
  ) {
    e.preventDefault();
    cycle(-1);
    return;
  }

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

  // ===== RESET =====
  lastGroup = null;
});
