const ta = document.getElementById("input");

// ==========================================
// 1. CONFIG: Giữ nguyên các định nghĩa của bạn
// ==========================================
const CONFIG = {
  consonants: {
    t: ["ต", "ฏ", ["ต", "ท", "ถ", "ธ", "ฑ", "ฒ", "ฐ", "ฏ"]],
    k: ["ก", "ค", ["ก", "ข", "ค", "ฆ", "ฃ", "ฅ"]],
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
// 2. EVENT LISTENER: Xử lý ưu tiên tuyệt đối
// ==========================================
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // A. CHẶN PHÍM CỘNG VÀ TRỪ TRƯỚC TIÊN (Ưu tiên tuyệt đối)
  // Bất kể phím đó đến từ đâu (Numpad hay phím chính), miễn là dấu "+" hoặc "=" hoặc "-"
  if (key === "+" || key === "=") { 
    e.preventDefault();
    handleCycle(1);
    return; // Thoát ngay lập tức, không chạy xuống dưới
  }
  if (key === "-") {
    e.preventDefault();
    handleCycle(-1);
    return; // Thoát ngay lập tức
  }

  // Chặn phím hệ thống
  if (e.ctrlKey || e.metaKey || ["Backspace", "Enter", "Tab"].includes(key)) return;

  // B. XỬ LÝ PHỤ ÂM
  if (CONFIG.consonants[kLow]) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];
    
    // Gõ k thường ra ก, gõ K (Shift) ra ค
    // Dùng key !== kLow để bắt chính xác trạng thái Shift của chữ cái
    const charToInsert = (key !== kLow) ? shiftDef : def;
    
    updateText(charToInsert);
    currentGroup = cycleGroup; 
    lastKey = kLow;
    return;
  }

  // C. XỬ LÝ NGUYÊN ÂM
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

  // D. XỬ LÝ DẤU THANH
  if (key === "'") {
    e.preventDefault();
    updateText(CONFIG.tones[0]);
    currentGroup = CONFIG.tones;
    lastKey = "tone";
    return;
  }

  // E. XỬ LÝ SỐ & KÝ HIỆU (Chỉ chạy nếu không phải các phím trên)
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
});
