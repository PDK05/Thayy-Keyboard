const ta = document.getElementById("input");

// ==========================================
// 1. CONFIG: Tùy chỉnh cực kỳ linh hoạt
// ==========================================
const CONFIG = {
  consonants: {
    // k: [mặc định, khi Shift, [mảng xoay vòng tiến/lùi]]
    // Logic: t gõ 'k' -> ก. Nhấn Shift+k -> ค. Nhấn ค rồi bấm '+' -> ข.
    k: ["ก", "ค", ["ก", "ข", "ค", "ฆ", "ฃ", "ฅ"]],
    t: ["ต", "ฏ", ["ต", "ท", "ถ", "ธ", "ฑ", "ฒ", "ฐ", "ฏ"]],
    d: ["ด", "ฎ", ["ด", "ฎ"]],
    p: ["ป", "พ", ["ป", "ผ", "พ", "ภ", "ฝ", "ฟ"]],
    s: ["ซ", "ส", ["ซ", "ส", "ศ", "ษ"]],
  },

  vowels: {
    a: { default: "ะ", alt: "า", variants: ["ะ", "ั", "า"] },
    i: { default: "ิ", alt: "ี", variants: ["ิ", "ี", "ึ", "ื"] },
    u: { default: "ุ", alt: "ู", variants: ["ุ", "ู"] },
    e: { default: "เ", alt: "แ", variants: ["เ", "แ"] },
    o: { default: "โ", alt: null, variants: ["โ", "ไ", "ใ"] }
  },

  tones: ["่", "้", "๊", "๋", "็"],

  symbols: {
    "1": ["1", "๑", ["1", "๑"]],
    "2": ["2", "๒", ["2", "๒"]],
    "5": ["5", "๕", ["5", "๕"]],
    "$": ["฿", "$", ["฿", "$", "€", "¥"]],
  }
};

// ==========================================
// 2. STATE & CORE LOGIC
// ==========================================
let lastKey = null;
let currentGroup = null;

function updateText(newChar, isReplace = false) {
  const pos = ta.selectionStart;
  const val = ta.value;
  if (isReplace && pos > 0) {
    ta.value = val.slice(0, pos - 1) + newChar + val.slice(pos);
    ta.selectionStart = ta.selectionEnd = pos;
  } else {
    ta.value = val.slice(0, pos) + newChar + val.slice(pos);
    ta.selectionStart = ta.selectionEnd = pos + newChar.length;
  }
}

function handleCycle(dir) {
  if (!currentGroup || currentGroup.length === 0) return;
  
  const charBefore = ta.value[ta.selectionStart - 1];
  let idx = currentGroup.indexOf(charBefore);
  
  if (idx === -1) {
    // Nếu chữ hiện tại không có trong group (trường hợp hiếm), lấy chữ đầu/cuối
    updateText(dir > 0 ? currentGroup[0] : currentGroup[currentGroup.length - 1], true);
  } else {
    // Tính toán index mới (đảm bảo không ra số âm với % trong JS)
    const nextIdx = (idx + dir + currentGroup.length) % currentGroup.length;
    updateText(currentGroup[nextIdx], true);
  }
}

// ==========================================
// 3. EVENT LISTENER
// ==========================================
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  if (e.ctrlKey || e.metaKey || ["Backspace", "Enter", "Tab"].includes(key)) return;

  // A. Xử lý Cycle (+ tiến, - lùi)
  if (key === "=" || key === "+") { e.preventDefault(); handleCycle(1); return; }
  if (key === "-") { e.preventDefault(); handleCycle(-1); return; }

  // B. Xử lý PHỤ ÂM
  if (CONFIG.consonants[kLow]) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];
    
    // Gõ k ra ก, Shift+k (K) ra ค
    const charToInsert = (e.shiftKey) ? shiftDef : def;
    
    updateText(charToInsert);
    currentGroup = cycleGroup; // Gán nhóm xoay vòng để dùng cho +/-
    lastKey = kLow;
    return;
  }

  // C. Xử lý NGUYÊN ÂM (Telex-style double tap)
  if (CONFIG.vowels[kLow]) {
    e.preventDefault();
    const v = CONFIG.vowels[kLow];
    if (lastKey === kLow && v.alt) {
      updateText(v.alt, true);
      lastKey = null;
    } else {
      updateText(v.default);
      lastKey = kLow;
    }
    currentGroup = v.variants;
    return;
  }

  // D. Xử lý DẤU THANH
  if (key === "'") {
    e.preventDefault();
    updateText(CONFIG.tones[0]);
    currentGroup = CONFIG.tones;
    lastKey = key;
    return;
  }

  // E. Xử lý SỐ & KÝ HIỆU
  const symbolEntry = CONFIG.symbols[key] || CONFIG.symbols[kLow];
  if (symbolEntry) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = symbolEntry;
    const charToInsert = (e.shiftKey) ? shiftDef : def;
    updateText(charToInsert);
    currentGroup = cycleGroup;
    lastKey = key;
    return;
  }

  if (key !== "Shift") { lastKey = null; currentGroup = null; }
});
