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
  a: { variants: ["ะ", "า", "ั"] },
  i: { variants: ["ิ", "ี", "ึ", "ื"] },
  u: { variants: ["ุ", "ู"] },
  e: { variants: ["เ", "แ"] },
  o: { variants: ["โ", "ใ", "ไ"] }
};

const TONES = ["่", "้", "๊", "๋"];

// ===== STATE =====
let lastGroup = null;
let lastKey = null;

// ===== UTILS =====
function insert(text) {
  const s = ta.selectionStart;
  const v = ta.value;
  ta.value = v.slice(0, s) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceLast(text) {
  const s = ta.selectionStart;
  if (s === 0) return;
  const v = ta.value;
  // Thay thế 1 ký tự ngay trước con trỏ
  ta.value = v.slice(0, s - 1) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

function cycle(dir) {
  if (!lastGroup) return;

  const pos = ta.selectionStart;
  const currentChar = ta.value[pos - 1];

  // Tìm vị trí hiện tại của ký tự trong mảng group
  let idx = lastGroup.indexOf(currentChar);
  
  // Nếu không tìm thấy (do con trỏ đã di chuyển hoặc xóa), không làm gì cả
  if (idx === -1) return;

  const newIndex = (idx + dir + lastGroup.length) % lastGroup.length;
  replaceLast(lastGroup[newIndex]);
}

// ===== EVENT LISTENER =====
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // 1. Phím điều khiển hệ thống (Cho phép mặc định)
  if (e.ctrlKey || e.metaKey || ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)) {
    // Nếu xóa hoặc di chuyển, reset trạng thái để tránh cycle nhầm
    if (key !== "ArrowLeft" && key !== "ArrowRight") {
        lastGroup = null;
        lastKey = null;
    }
    return;
  }

  // 2. Xử lý Cycle (+ / = / -)
  if (key === "=" || key === "+") {
    e.preventDefault();
    cycle(1);
    return;
  }
  if (key === "-") {
    e.preventDefault();
    cycle(-1);
    return;
  }

  // 3. Xử lý Consonants (Phụ âm)
  if (CONS[kLow]) {
    e.preventDefault();
    insert(CONS[kLow][0]);
    lastGroup = CONS[kLow];
    lastKey = kLow;
    return;
  }

  // 4. Xử lý Vowels (Nguyên âm)
  if (VOWELS[kLow]) {
    e.preventDefault();
    const group = VOWELS[kLow].variants;
    
    // Nếu nhấn cùng 1 phím nguyên âm liên tiếp -> Đổi giữa 2 biến thể đầu (Ngắn <-> Dài)
    if (lastKey === kLow) {
      const pos = ta.selectionStart;
      const charBefore = ta.value[pos - 1];
      let idx = group.indexOf(charBefore);
      let nextIdx = (idx === 0) ? 1 : 0; // Toggle 0 và 1
      replaceLast(group[nextIdx]);
    } else {
      insert(group[0]);
    }

    lastGroup = group;
    lastKey = kLow;
    return;
  }

  // 5. Xử lý Tones (Dấu) - Dùng phím nháy đơn '
  if (key === "'") {
    e.preventDefault();
    insert(TONES[0]);
    lastGroup = TONES;
    lastKey = key;
    return;
  }

  // 6. Reset nếu gõ phím khác (Space, Enter, số...)
  lastGroup = null;
  lastKey = null;
});
