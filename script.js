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
  a: { short: "ะ", long: "า", variants: ["ะ", "ั"] },
  i: { short: "ิ", long: "ี", variants: ["ิ", "ี"] },
  u: { short: "ุ", long: "ู", variants: ["ุ", "ู"] },
  e: { short: "เ", long: "แ", variants: ["เ", "แ"] },
  o: { short: "โ", long: null, variants: ["โ"] }
};

const TONES = ["่", "้", "๊", "๋"];

// ===== STATE =====
let lastGroup = null;
let lastKey = null;
let isLongVowel = false; // Trạng thái kiểm soát dạng dài/ngắn

// ===== UTILS =====
function insert(text) {
  const s = ta.selectionStart;
  const e = ta.selectionEnd;
  const v = ta.value;
  ta.value = v.slice(0, s) + text + v.slice(e);
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
}

// Reset trạng thái khi người dùng click chuột thay đổi vị trí con trỏ
ta.addEventListener("mousedown", () => {
  lastGroup = null;
  lastKey = null;
  isLongVowel = false;
});

// ===== EVENT LISTENER =====
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // 1. Phím hệ thống & Di chuyển
  if (e.ctrlKey || e.metaKey || ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
    if (!key.startsWith("Arrow")) { 
        lastGroup = null; 
        lastKey = null; 
        isLongVowel = false;
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
    isLongVowel = false;
    return;
  }

  // 4. VOWELS (Logic: Short -> Long -> Lock)
  if (VOWELS[kLow]) {
    e.preventDefault();
    const vData = VOWELS[kLow];

    // Nếu gõ lại phím đó và đang ở dạng ngắn (short)
    if (lastKey === kLow && !isLongVowel && vData.long) {
      replaceLast(vData.long);
      isLongVowel = true; // Đánh dấu đã sang dạng dài
      lastGroup = null;   // Dạng dài không có biến thể -> Xóa group để không cycle được
    } else {
      // Nhấn lần đầu hoặc nhấn sau khi đã gõ phím khác
      insert(vData.short);
      isLongVowel = false;
      lastGroup = vData.variants; // Cho phép cycle biến thể khi còn ở dạng ngắn
    }

    lastKey = kLow;
    return;
  }

  // 5. TONES (nhấn ' -> dấu thanh)
  if (key === "'") {
    e.preventDefault();
    insert(TONES[0]);
    lastGroup = TONES;
    lastKey = key;
    isLongVowel = false;
    return;
  }

  // Reset cho các phím gõ text thông thường khác (Space, số, ...)
  if (key !== "Shift") {
    lastGroup = null;
    lastKey = null;
    isLongVowel = false;
  }
});
