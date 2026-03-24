const ta = document.getElementById("input");

// ===== DATA =====
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
  // alt: Ký tự thay thế khi nhấn đúp (nếu có)
  // variants: Nhóm ký tự để xoay vòng bằng = / -
  a: { default: "ะ", alt: "า", variants: ["ะ", "ั"] },
  i: { default: "ิ", alt: "ี", variants: null },
  u: { default: "ุ", alt: "ู", variants: null },
  e: { default: "เ", alt: "แ", variants: null },
  o: { default: "โ", alt: null, variants: ["โ", "ไ", "ใ"] } 
};

const TONES = ["่", "้", "๊", "๋"];

// ===== STATE =====
let lastGroup = null;
let lastKey = null;
let isAltered = false; // Thay cho isLongVowel: Đánh dấu đã chuyển sang ký tự phụ (alt)

// ===== UTILS =====
function insert(text) {
  const s = ta.selectionStart;
  const e = ta.selectionEnd;
  const v = ta.value;
  ta.value = v.slice(0, s) + text + v.slice(e);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceLast(text) {
  const s = ta.selectionStart;
  if (s === 0) return;
  const v = ta.value;
  ta.value = v.slice(0, s - 1) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

function cycle(dir) {
  if (!lastGroup) return;
  const pos = ta.selectionStart;
  const charBefore = ta.value[pos - 1];
  let idx = lastGroup.indexOf(charBefore);
  if (idx === -1) return;
  
  const newIndex = (idx + dir + lastGroup.length) % lastGroup.length;
  replaceLast(lastGroup[newIndex]);
}

ta.addEventListener("mousedown", () => {
  lastGroup = null;
  lastKey = null;
  isAltered = false;
});

// ===== EVENT LISTENER =====
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // 1. Phím hệ thống
  if (e.ctrlKey || e.metaKey || ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
    if (!key.startsWith("Arrow")) { 
        lastGroup = null; lastKey = null; isAltered = false;
    }
    return;
  }

  // 2. CYCLE (= / -)
  if (key === "=" || key === "+") { e.preventDefault(); cycle(1); return; }
  if (key === "-") { e.preventDefault(); cycle(-1); return; }

  // 3. CONSONANTS
  if (CONS[kLow]) {
    e.preventDefault();
    insert(CONS[kLow][0]);
    lastGroup = CONS[kLow];
    lastKey = kLow;
    isAltered = false;
    return;
  }

  // 4. VOWELS (Logic cập nhật theo tên gọi mới)
  if (VOWELS[kLow]) {
    e.preventDefault();
    const vData = VOWELS[kLow];

    // Kiểm tra nhấn đúp để biến hình sang ký tự phụ (alt)
    if (lastKey === kLow && !isAltered && vData.alt) {
      replaceLast(vData.alt);
      isAltered = true; 
      lastGroup = null; // Khóa cycle khi đã ở trạng thái biến hình
    } else {
      // Nhấn lần đầu: Ra ký tự mặc định (โ, ะ, ิ...)
      insert(vData.default);
      isAltered = false;
      lastGroup = vData.variants; // Cho phép xoay vòng các biến thể ngay lập tức
    }

    lastKey = kLow;
    return;
  }

  // 5. TONES
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
