const CONFIG = {
  consonants: {
    k: ["ก", "ค", ["ก", "ค", "ข", "ฆ", "ฅ", "ฃ"]],
    c: ["จ", "ช", ["จ", "ช", "ฉ", "ฌ"]],
    s: ["ซ", "ส", ["ซ", "ส", "ศ", "ษ"]],
    d: ["ด", "ฎ", ["ด", "ฎ"]],
    t: ["ต", "ฏ", ["ต", "ฏ", "ท", "ถ", "ธ", "ฑ", "ฒ", "ฐ"]],
    n: ["น", "ณ", ["น", "ณ"]],
    b: ["บ", "บ", ["บ"]],
    p: ["ป", "พ", ["ป", "พ", "ผ", "ภ"]],
    m: ["ม", "ม", ["ม"]],
    y: ["ย", "ญ", ["ย", "ญ"]],
    r: ["ร", "ร", ["ร", "น", "ณ"]],
    l: ["ล", "ฬ", ["ล", "ฬ"]],
    w: ["ว", "ว", ["ว"]],
    x: ["อ", "ฮ", ["อ", "ฮ"]]
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
    "1": ["1", null, ["1", "๑"]],
    "2": ["2", null, ["2", "๒"]],
    "5": ["5", null, ["5", "๕"]],
    b: [null, "฿", ["฿"]],
    m: [null, "ํ", ["ํ"]]
  }
};

const ta = document.getElementById("thaiInput");
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

  let nextIdx = idx === -1 ? (dir === 1 ? 0 : currentGroup.length - 1) : (idx + dir + currentGroup.length) % currentGroup.length;

  updateText(currentGroup[nextIdx], true);

  lastKey = null; // reset lastKey after cycling
}

ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  if (key === "Shift") return;

  // Cycle with = and -
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

  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // Reset state on system keys
  if (["Backspace", "Enter", "Tab", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
    currentGroup = null;
    lastKey = null;
    return;
  }

  // Symbols
  const symbolEntry = CONFIG.symbols[kLow];
  if (symbolEntry) {
    const [def, shiftDef, cycleGroup] = symbolEntry;
    let charToInsert = e.shiftKey && shiftDef ? shiftDef : def;
    if (charToInsert) {
      e.preventDefault();
      updateText(charToInsert);
      currentGroup = cycleGroup;
      lastKey = kLow;
      return;
    }
  }

  // Consonants
  if (CONFIG.consonants[kLow]) {
    e.preventDefault();
    const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];

    const isCapital = e.shiftKey || key === key.toUpperCase() || e.getModifierState("CapsLock");
    updateText(isCapital && shiftDef ? shiftDef : def);

    currentGroup = cycleGroup;
    lastKey = kLow;
    return;
  }

  // Vowels
  if (CONFIG.vowels[kLow]) {
    e.preventDefault();
    const v = CONFIG.vowels[kLow];

    if (lastKey === kLow && v.alt && !e.shiftKey) {
      updateText(v.alt, true);
      lastKey = null;
    } else {
      updateText(v.default);
      lastKey = kLow;
    }

    currentGroup = v.variants || null;
    return;
  }

  // Tone marks
  if (key === "'") {
    e.preventDefault();
    updateText(CONFIG.tones[0]);
    currentGroup = CONFIG.tones;
    lastKey = "tone";
    return;
  }

  // Default: reset state
  currentGroup = null;
  lastKey = null;
});
