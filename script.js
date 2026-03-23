const ta = document.getElementById("input");

// ===== DATA =====
const CONS = {
  "k": ["ข", "ฃ", "ค", "ฅ", "ฆ"],
  "s": ["ซ", "ส", "ศ", "ษ"],
  "c": ["ฉ", "ช", "ฌ"],
  "t": ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
  "p": ["ผ", "พ", "ภ"],
  "n": ["น", "ณ"]
};

const VOWELS = {
  "a": ["ะ", "า"],
  "i": ["ิ", "ี", "ึ", "ื"],
  "u": ["ุ", "ู"],
  "e": ["เ", "แ"],
  "o": ["โ", "ใ", "ไ"]
};

const TONES = ["่", "้", "๊", "๋"];

// ===== UTILS =====
function insert(text) {
  let s = ta.selectionStart;
  let v = ta.value;
  ta.value = v.slice(0, s) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceLast(newChar) {
  let s = ta.selectionStart;
  let v = ta.value;
  ta.value = v.slice(0, s - 1) + newChar + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

// ===== MAIN =====
ta.addEventListener("keydown", (e) => {
  let key = e.key.toLowerCase();
  let pos = ta.selectionStart;
  let prevChar = ta.value[pos - 1];

  // 1. Xử lý Phụ âm (Consonants) - Gõ 'k' liên tiếp để đổi chữ
  if (CONS[key]) {
    e.preventDefault();
    let group = CONS[key];
    let idx = group.indexOf(prevChar);
    if (idx !== -1) {
      replaceLast(group[(idx + 1) % group.length]);
    } else {
      insert(group[0]);
    }
    return;
  }

  // 2. Xử lý Nguyên âm (Vowels) - Gõ 'a' liên tiếp để đổi nguyên âm ngắn/dài
  if (VOWELS[key]) {
    e.preventDefault();
    let group = VOWELS[key];
    let idx = group.indexOf(prevChar);
    if (idx !== -1) {
      replaceLast(group[(idx + 1) % group.length]);
    } else {
      insert(group[0]);
    }
    return;
  }

  // 3. Xử lý Dấu thanh (Tones) - Gõ phím (') liên tiếp
  if (key === "'") {
    e.preventDefault();
    let idx = TONES.indexOf(prevChar);
    if (idx !== -1) {
      if (idx === TONES.length - 1) replaceLast(""); 
      else replaceLast(TONES[idx + 1]);
    } else {
      insert(TONES[0]);
    }
    return;
  }
});

console.log("Thai IME: Ready to type!");
