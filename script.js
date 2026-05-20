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
    r: ["ร", ["ร", "น", "ณ"]],
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
    "b": [null, "฿", ["฿"]],
    "m": [null, "ํ", ["ํ"]]
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
    nextIdx = dir === 1 ? 0 : currentGroup.length - 1;
  } else {
    nextIdx = (idx + dir + currentGroup.length) % currentGroup.length;
  }

  updateText(currentGroup[nextIdx], true);
  
  // SỬA LỖI: Hủy phím ghi nhớ trước đó khi chuyển sang chế độ xoay vòng
  lastKey = null; 
}

ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // Bỏ qua nếu người dùng chỉ mới nhấn đè phím Shift
  if (key === "Shift") return;

  // ===== XOAY VÒNG KÝ TỰ =====
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

  // Reset bộ nhớ khi di chuyển con trỏ hoặc thao tác xóa/xuống dòng
  if (["Backspace", "Enter", "Tab", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
    currentGroup = null;
    lastKey = null;
    return;
  }

// ===== SỐ & SYMBOLS =====
  const symbolEntry = CONFIG.symbols[kLow];
  if (symbolEntry) {
    const [def, shiftDef, cycleGroup] = symbolEntry;

    // Dùng e.shiftKey kết hợp kiểm tra dữ liệu cấu hình
    if (e.shiftKey && shiftDef) {
      e.preventDefault();
      updateText(shiftDef);
      currentGroup = cycleGroup;
      lastKey = kLow;
      return;
    }
    else if (!e.shiftKey && def) {
      e.preventDefault();
      updateText(def);
      currentGroup = cycleGroup;
      lastKey = kLow;
      return;
    }
  }
    // Gõ số bình thường (Không đè Shift)
    else if (!e.shiftKey && def) {
      e.preventDefault();
      updateText(def);
      currentGroup = cycleGroup;
      lastKey = kLow;
      return;
    }
  }

// ===== PHỤ ÂM (CHỐNG NUỐT PHÍM SHIFT) =====
  if (CONFIG.consonants[kLow]) {
    e.preventDefault();

    const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];
    
    // Kiểm tra chính xác: Nếu phím Shift đang đè, hoặc CapsLock đang bật, hoặc key nhận được là chữ hoa
    const isCapital = e.shiftKey || key === key.toUpperCase() || e.getModifierState("CapsLock");

    if (isCapital && shiftDef) {
      updateText(shiftDef);
    } else {
      updateText(def);
    }

    currentGroup = cycleGroup;
    lastKey = kLow;
    return;
  }

// ===== NGUYÊN ÂM =====
  if (CONFIG.vowels[kLow]) {
    e.preventDefault();

    const v = CONFIG.vowels[kLow];

    // Ấn liên tiếp cùng 1 phím nguyên âm thường (không đè Shift) để ra ký tự phụ (alt)
    if (lastKey === kLow && v.alt && !e.shiftKey) {
      updateText(v.alt, true);
      lastKey = null; // Reset để lần gõ sau quay về mặc định
    } else {
      updateText(v.default);
      lastKey = kLow;
    }
    
    currentGroup = v.variants && v.variants.length > 0 ? v.variants : null;
    return;
  }

  // ===== DẤU THANH (TONES) =====
  if (key === "'") {
    e.preventDefault();

    updateText(CONFIG.tones[0]);
    currentGroup = CONFIG.tones;
    lastKey = "tone";
    return;
  }

  // ===== RESET MẶC ĐỊNH =====
  // Cho phép gõ dấu cách hoặc các ký tự Latinh khác không nằm trong bộ lọc tiếng Thái
  currentGroup = null;
  lastKey = null;
}); // Kết thúc sự kiện keydown
