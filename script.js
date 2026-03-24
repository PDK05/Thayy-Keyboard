const ta = document.getElementById("input");

// ===== 1. DATA (Dữ liệu tách biệt gốc và biến thể) =====
const CONS = {
  // Gốc (thường)
  k: ["ก"], 
  g: ["ง"],
  c: ["จ"],
  s: ["ส"],
  t: ["ต"],
  p: ["ป"],
  n: ["น"],
  // Biến thể (Hoa) - Sẽ dùng để xoay vòng khi nhấn =/-
  K: ["ฆ", "ค", "ฅ", "ข", "ฃ"],
  C: ["ฉ", "ช", "ฌ"],
  S: ["ซ", "ศ", "ษ"],
  T: ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
  P: ["ผ", "พ", "ภ"],
  N: ["ณ"]
};

const VOWELS = {
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
  if (!text) return;
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
  if (!lastGroup || !lastKey) return;

  const pos = ta.selectionStart;
  const charBefore = ta.value[pos - 1];
  
  // Tìm vị trí trong group hiện tại
  let idx = lastGroup.indexOf(charBefore);

  // LOGIC NHẢY TẦNG: Nếu gõ 'k' (ก) mà nhấn '=', tìm sang group 'K'
  if (idx === -1 || lastGroup.length === 1) {
    const upperKey = lastKey.toUpperCase();
    if (CONS[upperKey]) {
      lastGroup = CONS[upperKey]; 
      idx = lastGroup.indexOf(charBefore);
    }
  }

  // Nếu là chữ gốc (như ก) chưa nằm trong group biến thể, 
  // khi nhấn '=' sẽ lấy ngay chữ đầu tiên của group biến thể (ข)
  if (idx === -1) {
    if (dir > 0) replaceLast(lastGroup[0]);
    else replaceLast(lastGroup[lastGroup.length - 1]);
    return;
  }
  
  // Xoay vòng tròn trong group biến thể
  const newIndex = (idx + dir + lastGroup.length) % lastGroup.length;
  replaceLast(lastGroup[newIndex]);
}

// ===== 4. EVENT LISTENER =====
ta.addEventListener("keydown", (e) => {
  const key = e.key;
  const kLow = key.toLowerCase();

  // A. Hệ thống
  if (e.ctrlKey || e.metaKey || ["Backspace", "Delete", "Tab"].includes(key)) return;

  // B. Điều hướng (Không reset lastKey để còn cycle được)
  if (key.startsWith("Arrow")) return;

  // C. CYCLE (= / -)
  if (key === "=" || key === "+") { e.preventDefault(); cycle(1); return; }
  if (key === "-") { e.preventDefault(); cycle(-1); return; }

  // D. PHỤ ÂM (Phân biệt hoa thường)
  if (CONS[key]) {
    e.preventDefault();
    insert(CONS[key][0]);
    lastGroup = CONS[key];
    lastKey = key;
    isAltered = false;
    return;
  }

  // E. NGUYÊN ÂM
  if (VOWELS[kLow]) {
    e.preventDefault();
    const vData = VOWELS[kLow];
    if (lastKey === kLow && !isAltered && vData.alt) {
      replaceLast(vData.alt);
      isAltered = true;
      lastGroup = null;
    } else {
      insert(vData.default);
      isAltered = false;
      lastGroup = vData.variants || [];
    }
    lastKey = kLow;
    return;
  }

  // F. DẤU THANH
  if (key === "'") {
    e.preventDefault();
    insert(TONES[0]);
    lastGroup = TONES;
    lastKey = key;
    isAltered = false;
    return;
  }

  // Reset cho các phím rác khác
  if (key !== "Shift") { lastGroup = null; lastKey = null; }
});

ta.addEventListener("mousedown", () => { lastGroup = null; lastKey = null; });
