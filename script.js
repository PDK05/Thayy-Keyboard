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

// ===== UTILS =====
function insert(text){
  let s = ta.selectionStart;
  let v = ta.value;
  ta.value = v.slice(0,s) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceLast(newChar){
  let s = ta.selectionStart;
  let v = ta.value;
  ta.value = v.slice(0,s-1) + newChar + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

// ===== MAIN =====
ta.addEventListener("keydown", (e)=>{

  // ⭐ cho phép phím tắt & control
  if (
    e.ctrlKey || e.metaKey ||
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown"
  ) {
    return;
  }

  let key = e.key.toLowerCase();
  let pos = ta.selectionStart;
  let prevChar = ta.value[pos - 1];

  // ===== 1. CONSONANT =====
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

  // ===== 2. VOWEL =====
  if (VOWELS[key]) {
    e.preventDefault();

    let group = VOWELS[key];
    let idx = group.indexOf(prevChar);

    // cycle nếu đang là nguyên âm
    if (idx !== -1) {
      replaceLast(group[(idx + 1) % group.length]);
      return;
    }

    // ===== ghép với phụ âm trước =====
    let cons = ta.value[pos - 1];
    if (!cons) return;

    let vowel = group[0];

    // e/o đứng trước
    if (key === "e" || key === "o") {
      replaceLast(vowel + cons);
    } else {
      replaceLast(cons + vowel);
    }

    return;
  }

  // ===== 3. TONE =====
  if (key === "'") {
    e.preventDefault();

    let idx = TONES.indexOf(prevChar);

    if (idx !== -1) {
      if (idx === TONES.length - 1) {
        replaceLast(""); // xóa nếu quá vòng
      } else {
        replaceLast(TONES[idx + 1]);
      }
    } else {
      insert(TONES[0]);
    }
    return;
  }
});
