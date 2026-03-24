const ta = document.getElementById("input");

// ===== 1. DATA (Dữ liệu) =====
const CONS = {
  k: ["ข", "ฃ", "ค", "ฅ", "ฆ"],
  s: ["ซ", "ส", "ศ", "ษ"],
  c: ["ฉ", "ช", "ฌ"],
  t: ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
  p: ["ผ", "พ", "ภ"],
  n: ["น", "ณ"]
};

const VOWELS = {
  // default: Ký tự hiện ra đầu tiên
  // alt: Ký tự thay thế khi nhấn đúp (nếu không có thì để null)
  // variants: Danh sách xoay vòng bằng =/- (nếu không có thì để null)
  a: { default: "ะ", alt: "า", variants: ["ะ", "ั"] },
  i: { default: "ิ", alt: "ี", variants: null },
  u: { default: "ุ", alt: "ู", variants: null },
  e: { default: "เ", alt: "แ", variants: null },
  o: { default: "โ", alt: null, variants: ["โ", "ไ", "ใ"] } 
};

const TONES = ["่", "้", "๊", "๋"];

// ===== 2. STATE (Trạng thái) =====
let lastGroup = null;
let lastKey = null;
let isAltered = false; 

// ===== 3. UTILS (Hàm hỗ trợ) =====
function insert(text) {
  if (!text) return; // Chặn chữ "null" hiện lên màn hình
  const s = ta.selectionStart;
  const e = ta.selectionEnd;
  const v = ta.value;
  ta.value = v.slice(0, s) + text + v.slice(e);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceLast(text) {
  if (!text) return; // Chặn chữ "null" hiện lên màn hình
  const s = ta.selectionStart;
  if (s === 0) return;
  const v = ta.value;
  ta.value = v.slice(0, s - 1) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

function cycle(dir) {
  // Nếu lastGroup là null hoặc không có phần tử, thoát ngay để tránh lỗi
  if (!lastGroup || lastGroup.length === 0) return;
  
  const pos = ta.selectionStart;
  const charBefore = ta.value[pos - 1];
  let idx = lastGroup.indexOf(charBefore);
  if (idx === -1) return;
  
  const newIndex = (idx + dir + lastGroup.length) % lastGroup.length;
  replaceLast(lastGroup[newIndex]);
}

ta.addEventListener("mousedown", () => {
  lastGroup = null; lastKey = null; isAltered = false;
});

// ===== 4. MAIN EVENT (Xử lý gõ phím) =====
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // A. Phím hệ thống
  if (e.ctrlKey || e.metaKey || ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
    if (!key.startsWith("Arrow")) { 
        lastGroup = null; lastKey = null; isAltered = false;
    }
    return;
  }

  // B. Phím Cycle (= / -)
  if (key === "=" || key === "+") { e.preventDefault(); cycle(1); return; }
  if (key === "-") { e.preventDefault(); cycle(-1); return; }

  // C. Phụ âm
  if (CONS[kLow]) {
    e.preventDefault();
    insert(CONS[kLow][0]);
    lastGroup = CONS[kLow];
    lastKey = kLow;
    isAltered = false;
    return;
  }

  // D. Nguyên âm (Vowels) - Đã xử lý triệt để variants: null
  if (VOWELS[kLow]) {
    e.preventDefault();
    const vData = VOWELS[kLow];

    // Nhấn đúp: Đổi sang alt (nếu alt khác null)
    if (lastKey === kLow && !isAltered && vData.alt !== null) {
      replaceLast(vData.alt);
      isAltered = true; 
      lastGroup = null; 
    } 
    // Nhấn lần đầu HOẶC phím không hỗ trợ alt (như phím o)
    else {
      insert(vData.default);
      isAltered = false;
      // Nếu variants là null, gán mảng rỗng [] để hàm cycle không bị lỗi
      lastGroup = vData.variants || []; 
    }

    lastKey = kLow;
    return;
  }

  // E. Dấu thanh
  if (key === "'") {
    e.preventDefault();
    insert(TONES[0]);
    lastGroup = TONES;
    lastKey = key;
    isAltered = false;
    return;
  }

  if (key !== "Shift") {
    lastGroup = null; lastKey = null; isAltered = false;
  }
});
