const ta = document.getElementById("input");

// ===== DATA =====
const CONS = {
  k: ["ก", "ข", "ฃ", "ค", "ฅ", "ฆ"],
  K: ["ฆ", "ค", "ฅ", "ข", "ฃ"],
  g: ["ง"],
  c: ["ฉ", "ช", "ฌ"],
  s: ["ซ", "ส", "ศ", "ษ"],
  t: ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
  p: ["ผ", "พ", "ภ"],
  n: ["น", "ณ"]
};

const VOWELS = {
  // default: Hiện ra khi gõ 1 lần
  // alt: Hiện ra khi gõ 2 lần (nếu không có thì để null)
  // variants: Các chữ cùng nhóm để xoay bằng phím =/-
  a: { default: "ะ", alt: "า", variants: ["ะ", "ั"] },
  i: { default: "ิ", alt: "ี", variants: null },
  u: { default: "ุ", alt: "ู", variants: null },
  e: { default: "เ", alt: "แ", variants: null },
  o: { default: "โ", alt: null, variants: ["โ", "ไ", "ใ"] } 
};

const TONES = ["่", "้", "๊", "๋"];

// ===== STATE (Trạng thái) =====
let lastGroup = null;
let lastKey = null;
let isAltered = false; 

// ===== UTILS (Hàm hỗ trợ) =====
function insert(text) {
  if (!text) return; // Chống chèn giá trị rỗng hoặc null
  const s = ta.selectionStart;
  const e = ta.selectionEnd;
  const v = ta.value;
  ta.value = v.slice(0, s) + text + v.slice(e);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceLast(text) {
  if (!text) return;
  const s = ta.selectionStart;
  if (s === 0) return;
  const v = ta.value;
  ta.value = v.slice(0, s - 1) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

function cycle(dir) {
  if (!lastGroup || lastGroup.length === 0) return;
  const pos = ta.selectionStart;
  const charBefore = ta.value[pos - 1];
  let idx = lastGroup.indexOf(charBefore);
  if (idx === -1) return;
  
  const newIndex = (idx + dir + lastGroup.length) % lastGroup.length;
  replaceLast(lastGroup[newIndex]);
}

// Reset khi click chuột
ta.addEventListener("mousedown", () => {
  lastGroup = null;
  lastKey = null;
  isAltered = false;
});

// ===== EVENT LISTENER (Xử lý gõ phím) =====
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // 1. Phím hệ thống & Di chuyển
  if (e.ctrlKey || e.metaKey || ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
    if (!key.startsWith("Arrow")) { 
        lastGroup = null; lastKey = null; isAltered = false;
    }
    return;
  }

  // 2. CYCLE (Phím = và -)
  if (key === "=" || key === "+") { e.preventDefault(); cycle(1); return; }
  if (key === "-") { e.preventDefault(); cycle(-1); return; }

  // 3. CONSONANTS (Phân biệt k và K)
  if (CONS[key]) { // Dùng 'key' thay vì 'kLow' để phân biệt hoa/thường
    e.preventDefault();
    
    insert(CONS[key][0]); // Chèn chữ đầu tiên của mảng tương ứng
    lastGroup = CONS[key]; // Gán nhóm (Nếu gõ 'k' thì group chỉ có ["ก"])
    lastKey = key;         // Lưu lại key chính xác (k hoặc K)
    isAltered = false;
    return;
  }

  // 4. VOWELS (Nguyên âm - Đã fix lỗi phím o)
  if (VOWELS[kLow]) {
    e.preventDefault();
    const vData = VOWELS[kLow];

    // Nhấn đúp để biến hình (Chỉ chạy nếu có alt và alt không phải null)
    if (lastKey === kLow && !isAltered && vData.alt !== null) {
      replaceLast(vData.alt);
      isAltered = true; 
      lastGroup = null; 
    } 
    // Nhấn lần đầu hoặc phím không có alt (như phím o)
    else {
      insert(vData.default);
      isAltered = false;
      lastGroup = vData.variants || []; 
    }

    lastKey = kLow;
    return;
  }

  // 5. TONES (Dấu thanh bằng phím ')
  if (key === "'") {
    e.preventDefault();
    insert(TONES[0]);
    lastGroup = TONES;
    lastKey = key;
    isAltered = false;
    return;
  }

  // Reset cho các phím khác
  if (key !== "Shift") {
    lastGroup = null; lastKey = null; isAltered = false;
  }
});
