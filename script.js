const ta = document.getElementById("input");

// ===== DATA =====
const CONS = {
  "k": ["ข", "ฃ", "ค", "ฅ", "ฆ"],
  "s": ["ซ", "ส", "ศ", "ษ"],
  "c": ["ฉ", "ช", "ฌ"],
  "t": ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
  "p": ["ผ", "พ", "ภ"],
  "n": ["น", "ณ"]
};

const VOWELS = {
  "a": "ะ",
  "i": "ิ",
  "u": "ุ",
  "e": "เ",
  "o": "โ"
};

const TONES = ["่", "้", "๊", "๋"]; // Dấu thanh

// ===== UTILS =====
function replaceLast(newChar) {
  let s = ta.selectionStart;
  let v = ta.value;
  ta.value = v.slice(0, s - 1) + newChar + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s;
}

function insert(text) {
  let s = ta.selectionStart;
  let v = ta.value;
  ta.value = v.slice(0, s) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

// ===== MAIN EVENT =====
ta.addEventListener("keydown", (e) => {
  let key = e.key.toLowerCase();
  let pos = ta.selectionStart;
  let prevChar = ta.value[pos - 1];

  // 1. XỬ LÝ PHỤ ÂM (Consonants) - Gõ liên tiếp để xoay vòng
  if (CONS[key]) {
    e.preventDefault();
    let group = CONS[key];
    let idx = group.indexOf(prevChar);

    if (idx !== -1) {
      // Nếu đã có chữ trong nhóm, xoay vòng
      replaceLast(group[(idx + 1) % group.length]);
    } else {
      // Nếu chưa có, chèn chữ đầu tiên
      insert(group[0]);
    }
    return;
  }

  // 2. XỬ LÝ NGUYÊN ÂM (Vowels)
  if (VOWELS[key]) {
    e.preventDefault();
    let vChar = VOWELS[key];
    
    // Logic đặc biệt cho 'e' và 'o' (thường đứng trước phụ âm trong tiếng Thái)
    // Nhưng để đơn giản cho bộ gõ này, ta cứ chèn vào vị trí con trỏ
    insert(vChar);
    return;
  }

  // 3. XỬ LÝ DẤU THANH (Tones) - Dùng phím nháy đơn (') để xoay vòng dấu
  if (key === "'") {
    e.preventDefault();
    let idx = TONES.indexOf(prevChar);
    
    if (idx !== -1) {
      // Xoay vòng qua các dấu: ่ -> ้ -> ๊ -> ๋ -> mất dấu
      if (idx === TONES.length - 1) {
        replaceLast(""); // Hết vòng thì xóa dấu
      } else {
        replaceLast(TONES[idx + 1]);
      }
    } else {
      insert(TONES[0]); // Chèn dấu đầu tiên
    }
    return;
  }
});

console.log("Thai IME Script Ready!");
