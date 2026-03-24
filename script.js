const ta = document.getElementById("input");

// ===== DATA =====
const CONS = {
  k: ["ข", "ฃ", "ค", "ฅ", "ฆ"],
  s: ["ซ", "ส", "ศ", "ษ"],
  c: ["ฉ", "ช", "ฌ"],
  t: ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
  p: ["ผ", "พ", "ภ"],
  n: ["น", "ณ"]
};

const VOWELS = {
  a: { short: "ะ", long: "า", variants: ["ั"] },
  i: { short: "ิ", long: "ี", variants: ["ิ", "ี", "ึ", "ื"] },
  u: { short: "ุ", long: "ู", variants: ["ุ", "ู"] },
  e: { short: "เ", long: "แ", variants: ["เ", "แ"] },
  o: { short: "โ", long: "โ", variants: ["โ", "ใ", "ไ"] }
};

const TONES = ["่", "้", "๊", "๋"];

// ===== STATE =====
let lastGroup = null;
let lastKey = null;
let isVowelToggle = false;

// ===== UTILS =====
function insert(text) {
  const s = ta.selectionStart;
  const v = ta.value;
  ta.value = v.slice(0, s) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceLast(text) {
  const s = ta.selectionStart;
  if (s === 0) return;
  const v = ta.value;
  ta.value = v.slice(0, s - 1) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

function cycle(dir) {
  if (!lastGroup) return;
  const pos = ta.selectionStart;
  const charBefore = ta.value[pos - 1];
  let idx = lastGroup.indexOf(charBefore);
  if (idx === -1) return;
  
  const newIndex = (idx + dir + lastGroup.length) % lastGroup.length;
  replaceLast(lastGroup[newIndex]);
  
  // Quan trọng: Khi nhấn cycle, reset toggle để phím nguyên âm tiếp theo là insert mới
  isVowelToggle = false; 
}

// ===== EVENT LISTENER =====
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // 1. Phím hệ thống
  if (e.ctrlKey || e.metaKey || ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
    if (!key.startsWith("Arrow")) { 
        lastGroup = null; 
        lastKey = null; 
        isVowelToggle = false;
    }
    return;
  }

  // 2. CYCLE (= / -)
  if (key === "=" || key === "+") { 
    e.preventDefault(); 
    cycle(1); 
    return; 
  }
  if (key === "-") { 
    e.preventDefault(); 
    cycle(-1); 
    return; 
  }

  // 3. CONSONANTS
  if (CONS[kLow]) {
    e.preventDefault();
    insert(CONS[kLow][0]);
    lastGroup = CONS[kLow];
    lastKey = kLow;
    isVowelToggle = false;
    return;
  }

  // 4. VOWELS (aa -> า | a= -> ั)
  if (VOWELS[kLow]) {
    e.preventDefault();
    const vData = VOWELS[kLow];

    if (lastKey === kLow && !isVowelToggle) {
      // Lần 2: Thay short bằng long (ะ -> า)
      replaceLast(vData.long);
      isVowelToggle = true; 
    } else {
      // Lần 1 hoặc lần 3: Insert short (ะ)
      insert(vData.short);
      isVowelToggle = false;
    }

    lastGroup = vData.variants; 
    lastKey = kLow;
    return;
  }

  // 5. TONES
  if (key === "'") {
    e.preventDefault();
    insert(TONES[0]);
    lastGroup = TONES;
    lastKey = key;
    isVowelToggle = false;
    return;
  }

  // Reset cho các phím khác
  if (key !== "Shift") {
    lastGroup = null;
    lastKey = null;
    isVowelToggle = false;
  }
});
