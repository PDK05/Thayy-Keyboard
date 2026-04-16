const ta = document.getElementById("input");

const CONFIG = {
  consonants: {
    k: ["ก", "ค", ["ค", "ข", "ฆ", "ฅ", "ฃ"]],
    c: ["จ", "ช", ["ช", "ฉ", "ฌ"]],
    s: ["ซ", "ส", ["ส", "ศ", "ษ"]],
    d: ["ด", "ฎ", ["ด", "ฎ"]],
    t: ["ต", "ฏ", ["ท", "ถ", "ธ", "ฑ", "ฒ", "ฐ"]],
    n: ["น", "ณ", ["น", "ณ"]],
    b: ["บ"],
    p: ["ป", "พ", ["พ", "ผ", "ภ"]],
    m: ["ม"],
    y: ["ย", "ญ", ["ญ"]],
    r: ["ร", ["น", "ณ"]],
    l: ["ล", "ฬ", ["ฬ"]],
    w: ["ว"],
    x: ["อ", "ฮ", ["ฮ"]]
  },
  vowels: {
    a: { default: "ะ", alt: "า", variants: ["ะ", "ั"] },
    i: { default: "ิ", alt: "ี", variants: ["ิ", "ี"] },
    u: { default: "ุ", alt: "ู", variants: ["ุ", "ู"] },
    e: { default: "เ", alt: "แ", variants: ["เ", "แ"] },
    o: { default: "โ", alt: null, variants: ["โ", "ไ"] }
  },
  tones: ["่", "้", "๊", "๋", "็"],
  symbols: {
    "1": ["1", "๑", ["1", "๑"]],
    "2": ["2", "๒", ["2", "๒"]],
    "5": ["5", "๕", ["5", "๕"]]
    
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
  const pos = ta.selectionStart;
  if (!currentGroup || currentGroup.length === 0 || pos === 0) return;

  const charBefore = ta.value[pos - 1];
  const idx = currentGroup.indexOf(charBefore);

  let nextIdx;
  if (idx === -1) {
    // Nếu chữ hiện tại không nằm trong nhóm xoay vòng (chữ gốc)
    // dir = 1 (ấn =): lấy phần tử đầu tiên [0]
    // dir = -1 (ấn -): lấy phần tử cuối cùng [length - 1]
    nextIdx = dir === 1 ? 0 : currentGroup.length - 1;
  } else {
    // Nếu đã ở trong nhóm, xoay vòng bình thường
    nextIdx = (idx + dir + currentGroup.length) % currentGroup.length;
  }

  updateText(currentGroup[nextIdx], true);
}

ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // ===== XOAY VÒNG =====
  if (e.code === "Equal") {
    e.preventDefault();
    handleCycle(1);
    return;
  }

  if (e.code === "Minus") {
    e.preventDefault();
    handleCycle(-1);
    return;
  }

  // ===== PHÍM HỆ THỐNG =====
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (["Backspace", "Enter", "Tab", "Escape"].includes(key)) {
    currentGroup = null;
    lastKey = null;
    return;
  }

  // ===== PHỤ ÂM =====
  if (CONFIG.consonants[kLow]) {
    e.preventDefault();

    const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];
    const charToInsert = (e.shiftKey && key !== kLow) ? shiftDef : def;

    updateText(charToInsert);

    currentGroup = cycleGroup;
    lastKey = kLow;
    return;
  }

  // ===== NGUYÊN ÂM =====
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

  // ===== DẤU =====
  if (key === "'") {
    e.preventDefault();

    updateText(CONFIG.tones[0]);
    currentGroup = CONFIG.tones;
    lastKey = "tone";
    return;
  }

  // ===== SỐ =====
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

  // ===== RESET =====
  currentGroup = null;
  lastKey = null;
});
