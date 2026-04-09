const ta = document.getElementById("input");

// ==========================================
// 1. CONFIG: Dễ dàng thêm định nghĩa mới
// ==========================================
const CONFIG = {
  // [Mặc định, Khi Shift, [Mảng xoay vòng tiến/lùi]]
  consonants: {
    k: ["ก", "ค", ["ก", "ข", "ค", "ฆ", "ฃ", "ฅ"]],
    t: ["ต", "ฏ", ["ต", "ท", "ถ", "ธ", "ฑ", "ฒ", "ฐ", "ฏ"]],
    d: ["ด", "ฎ", ["ด", "ฎ"]],
    p: ["ป", "พ", ["ป", "ผ", "พ", "ภ", "ฝ", "ฟ"]],
    s: ["ซ", "ส", ["ซ", "ส", "ศ", "ษ"]],
    c: ["จ", "ฉ", ["จ", "ฉ", "ช", "ฌ"]],
    n: ["น", "ณ", ["น", "ณ"]],
    y: ["ย", "ญ", ["ย", "ญ"]],
    l: ["ล", "ฬ", ["ล", "ฬ"]],
    x: ["อ", "ฮ", ["อ", "ฮ"]]
  },

  // Định nghĩa nguyên âm (giữ nguyên quy tắc của bạn)
  vowels: {
    a: { default: "ะ", alt: "า", variants: ["ะ", "ั", "า"] },
    i: { default: "ิ", alt: "ี", variants: ["ิ", "ี", "ึ", "ื"] },
    u: { default: "ุ", alt: "ู", variants: ["ุ", "ู"] },
    e: { default: "เ", alt: "แ", variants: ["เ", "แ"] },
    o: { default: "โ", alt: null, variants: ["โ", "ไ", "ใ"] }
  },

  // Dấu thanh
  tones: ["่", "้", "๊", "๋", "็"],

  // Số và Ký hiệu
  symbols: {
    "1": ["1", "๑", ["1", "๑"]],
    "2": ["2", "๒", ["2", "๒"]],
    "3": ["3", "๓", ["3", "๓"]],
    "4": ["4", "๔", ["4", "๔"]],
    "5": ["5", "๕", ["5", "๕"]],
    "$": ["฿", "$", ["฿", "$", "€", "¥"]],
    "@": ["๏", "@", ["๏", "๚", "๛"]]
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
  if (!currentGroup || currentGroup.length <= 1) return;
  const charBefore = ta.value[ta.selectionStart - 1];
  let idx = currentGroup.indexOf(charBefore);
  
  if (idx !== -1) {
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

  // --- A. ƯU TIÊN PHÍM XOAY VÒNG (= và -) ---
  // Nhấn trực tiếp phím = (không cần Shift thành +) và - để xoay vòng
  if (key === "=" || key === "+") { 
    e.preventDefault();
    handleCycle(1);
    return; 
  }
  if (key === "-") {
    e.preventDefault();
    handleCycle(-1);
    return;
  }

  // Chặn các tổ hợp phím hệ thống khác
  if (e.ctrlKey || e.metaKey || ["Backspace", "Enter", "Tab", "Escape"].includes(key)) return;

  // --- B. XỬ LÝ PHỤ ÂM ---
  if (CONFIG.consonants[kLow]) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];
    
    // k -> ก | Shift+k -> ค
    const charToInsert = (key !== kLow) ? shiftDef : def;
    
    updateText(charToInsert);
    currentGroup = cycleGroup; 
    lastKey = kLow;
    return;
  }

  // --- C. XỬ LÝ NGUYÊN ÂM ---
  if (CONFIG.vowels[kLow]) {
    e.preventDefault();
    const v = CONFIG.vowels[kLow];
    // Double tap (nhấn 2 lần phím nguyên âm) để đổi sang ký tự thay thế (ví dụ a -> า)
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

  // --- D. XỬ LÝ DẤU THANH ---
  if (key === "'") {
    e.preventDefault();
    updateText(CONFIG.tones[0]);
    currentGroup = CONFIG.tones;
    lastKey = "tone";
    return;
  }

  // --- E. XỬ LÝ SỐ & KÝ HIỆU ---
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

  // Reset khi nhấn phím lạ (Space, vv.)
  if (key !== "Shift") {
    lastKey = null;
    currentGroup = null;
  }
});

// Tự động reset khi click chuột
ta.addEventListener("mousedown", () => {
  lastKey = null;
  currentGroup = null;
});
