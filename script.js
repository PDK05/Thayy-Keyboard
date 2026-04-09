const ta = document.getElementById("input");

// CONFIG giữ nguyên như cũ của bạn
const CONFIG = {
  consonants: {
    t: ["ต", "ฏ", ["ต", "ท", "ถ", "ธ", "ฑ", "ฒ", "ฐ", "ฏ"]],
    k: ["ก", "ค", ["ก", "ข", "ค", "ฆ", "ฃ", "ฅ"]],
    d: ["ด", "ฎ", ["ด", "ฎ"]],
    p: ["ป", "พ", ["ป", "ผ", "พ", "ภ", "ฝ", "ฟ"]],
    s: ["ซ", "ส", ["ซ", "ส", "ศ", "ษ"]],
    g: ["ง", "ง", ["ง"]],
    c: ["จ", "ฉ", ["จ", "ฉ", "ช", "ฌ"]],
    n: ["น", "ณ", ["น", "ณ"]],
    m: ["ม", "ม", ["ม"]],
    y: ["ย", "ญ", ["ย", "ญ"]],
    r: ["ร", "ร", ["ร"]],
    l: ["ล", "ฬ", ["ล", "ฬ"]],
    w: ["ว", "ว", ["ว"]],
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

ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();
  const code = e.code; // Dùng code để bắt phím vật lý

  if (e.ctrlKey || e.metaKey || ["Backspace", "Enter", "Tab"].includes(key)) return;

  // --- 1. XỬ LÝ XOAY VÒNG (CYCLE) ƯU TIÊN CAO NHẤT ---
  // Phím '=' hoặc 'Shift + =' (là dấu +)
  if (code === "Equal") { 
    e.preventDefault();
    handleCycle(1);
    return;
  }
  // Phím '-' (Minus)
  if (code === "Minus") {
    e.preventDefault();
    handleCycle(-1);
    return;
  }

  // --- 2. XỬ LÝ PHỤ ÂM ---
  if (CONFIG.consonants[kLow]) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];
    // Kiểm tra Shift thật kỹ
    const charToInsert = (e.shiftKey && key !== kLow) ? shiftDef : def;
    updateText(charToInsert);
    currentGroup = cycleGroup;
    lastKey = kLow;
    return;
  }

  // --- 3. XỬ LÝ NGUYÊN ÂM ---
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

  // --- 4. DẤU THANH ---
  if (key === "'") {
    e.preventDefault();
    updateText(CONFIG.tones[0]);
    currentGroup = CONFIG.tones;
    lastKey = "tone";
    return;
  }

  // --- 5. SỐ & KÝ HIỆU ---
  const symbolEntry = CONFIG.symbols[key] || CONFIG.symbols[kLow];
  if (symbolEntry) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = symbolEntry;
    const charToInsert = e.shiftKey ? shiftDef : def;
    updateText(charToInsert);
    currentGroup = cycleGroup;
    lastKey = key;
    return;
  }

  if (key !== "Shift") { lastKey = null; currentGroup = null; }
});
