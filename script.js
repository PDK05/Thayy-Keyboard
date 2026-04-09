const ta = document.getElementById("input");

// ==========================================
// 1. CONFIG: Thêm phần symbols và số
// ==========================================
const CONFIG = {
  consonants: {
    t: ["ต", "ฏ", ["ท", "ถ", "ธ", "ฑ", "ฒ", "ฐ", "ฏ", "ต"]],
    d: ["ด", "ฎ", ["ฎ", "ด"]],
    k: ["ก", "ข", ["ค", "ข", "ฆ", "ฃ", "ฅ", "ก"]],
    p: ["ป", "ผ", ["พ", "ผ", "ภ", "ฝ", "ฟ", "ป"]],
    s: ["ซ", "ส", ["ส", "ศ", "ษ", "ซ"]],
  },

  vowels: {
    a: { default: "ะ", alt: "า", variants: ["ะ", "ั", "า"] },
    i: { default: "ิ", alt: "ี", variants: ["ิ", "ี", "ึ", "ื"] },
    u: { default: "ุ", alt: "ู", variants: ["ุ", "ู"] },
    e: { default: "เ", alt: "แ", variants: ["เ", "แ"] },
    o: { default: "โ", alt: null, variants: ["โ", "ไ", "ใ"] }
  },

  tones: ["่", "้", "๊", "๋", "็"],

  // MỚI: Định nghĩa cho số và ký hiệu
  // Cấu trúc: key: [mặc định, khi shift, mảng xoay vòng]
  symbols: {
    "1": ["1", "๑", ["1", "๑"]],
    "2": ["2", "๒", ["2", "๒"]],
    "3": ["3", "๓", ["3", "๓"]],
    "4": ["4", "๔", ["4", "๔"]],
    "5": ["5", "๕", ["5", "๕"]],
    "$": ["฿", "$", ["฿", "$", "€", "¥"]], // Ví dụ phím $ ra đơn vị tiền tệ
    "@": ["๏", "@", ["๏", "๚", "๛"]]      // Các ký hiệu cổ trong tiếng Thái
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
    updateText(dir > 0 ? currentGroup[0] : currentGroup[currentGroup.length - 1], true);
  } else {
    const nextIdx = (idx + dir + currentGroup.length) % currentGroup.length;
    updateText(currentGroup[nextIdx], true);
  }
}

// ==========================================
// 3. EVENT LISTENER (Cập nhật để nhận diện symbol)
// ==========================================
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  if (e.ctrlKey || e.metaKey || ["Backspace", "Enter", "Tab"].includes(key)) return;

  // A. Xoay vòng (+/-)
  if (key === "=" || key === "+") { e.preventDefault(); handleCycle(1); return; }
  if (key === "-") { e.preventDefault(); handleCycle(-1); return; }

  // B. Xử lý PHỤ ÂM
  if (CONFIG.consonants[kLow]) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];
    const charToInsert = (key !== kLow) ? shiftDef : def;
    updateText(charToInsert);
    currentGroup = cycleGroup;
    lastKey = kLow;
    return;
  }

  // C. Xử lý NGUYÊN ÂM
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

  // E. MỚI: Xử lý SỐ & KÝ HIỆU
  // Kiểm tra xem phím nhấn (key) hoặc phím thường (kLow) có trong symbols không
  const symbolEntry = CONFIG.symbols[key] || CONFIG.symbols[kLow];
  if (symbolEntry) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = symbolEntry;
    // Nếu đang giữ Shift thì ưu tiên ký tự shiftDef
    const charToInsert = (e.shiftKey) ? shiftDef : def;
    updateText(charToInsert);
    currentGroup = cycleGroup;
    lastKey = key;
    return;
  }

  if (key !== "Shift") { lastKey = null; currentGroup = null; }
});
