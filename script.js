const ta = document.getElementById("input");

// ==========================================
// 1. CONFIG
// ==========================================
const CONFIG = {
  consonants: {
    k: ["ก", "ค", ["ข", "ฆ", "ฅ", "ฃ"]], // Nhấn Shift+k ra ค, nhấn + tiếp ra ฆ
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
    "$": ["฿", "$", ["฿", "$", "€", "¥"]]
  }
};

let lastKey = null;
let currentGroup = null;

// --- Hàm chèn văn bản ---
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

// --- Hàm xoay vòng ---
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

  // Chặn phím hệ thống
  if (e.ctrlKey || e.metaKey || ["Backspace", "Enter", "Tab"].includes(key)) return;

  // --- LOGIC XOAY VÒNG (TIẾN) ---
  // Gộp cả phím '+' và '=' vào làm một lệnh Tiến
  if (key === "+" || key === "=") { 
    e.preventDefault();
    handleCycle(1);
    return;
  }

  // --- LOGIC XOAY VÒNG (LÙI) ---
  if (key === "-") {
    e.preventDefault();
    handleCycle(-1);
    return;
  }

  // --- XỬ LÝ PHỤ ÂM ---
  if (CONFIG.consonants[kLow]) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];
    
    // Nếu nhấn Shift thì lấy ký tự Shift, không thì lấy mặc định
    const charToInsert = (e.shiftKey) ? shiftDef : def;
    
    updateText(charToInsert);
    currentGroup = cycleGroup; // Lưu nhóm để nhấn + còn biết đường mà xoay
    lastKey = kLow;
    return;
  }

  // --- XỬ LÝ NGUYÊN ÂM ---
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

  // --- XỬ LÝ DẤU ---
  if (key === "'") {
    e.preventDefault();
    updateText(CONFIG.tones[0]);
    currentGroup = CONFIG.tones;
    lastKey = "tone";
    return;
  }

  // --- XỬ LÝ SỐ ---
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

  // Reset khi nhấn phím lạ
  if (!["Shift", "Control", "Alt"].includes(key)) {
    // Không reset currentGroup ở đây nếu phím đó là phím chức năng
  }
});
