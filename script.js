const ta = document.getElementById("input");

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

let lastGroup = null;
let lastIndex = -1;
let lastKey = null;

// Helper to insert at cursor
function insert(text) {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const val = ta.value;
  ta.value = val.slice(0, start) + text + val.slice(end);
  ta.selectionStart = ta.selectionEnd = start + text.length;
}

// Helper to replace the character immediately behind the cursor
function replaceLast(text) {
  const pos = ta.selectionStart;
  if (pos === 0) return;
  const val = ta.value;
  // Replace 1 char back and maintain cursor
  ta.value = val.slice(0, pos - 1) + text + val.slice(pos);
  ta.selectionStart = ta.selectionEnd = pos; 
}

function cycle(dir) {
  if (!lastGroup || lastGroup.length === 0) return;
  
  // Increment/Decrement index
  lastIndex = (lastIndex + dir + lastGroup.length) % lastGroup.length;
  replaceLast(lastGroup[lastIndex]);
}

ta.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || ["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    // Reset state on navigation/deletion
    if (!e.key.startsWith("Arrow")) { lastKey = null; lastGroup = null; }
    return;
  }

  const key = e.key.toLowerCase();

  // 1. CONSONANTS
  if (CONS[key]) {
    e.preventDefault();
    insert(CONS[key][0]);
    lastGroup = CONS[key];
    lastIndex = 0;
    lastKey = key;
    return;
  }

  // 2. VOWELS (with Double-Tap Logic)
  if (VOWELS[key]) {
    e.preventDefault();
    const group = VOWELS[key].variants;

    if (lastKey === key) {
      // Toggle between first and second variant (usually Short -> Long)
      lastIndex = (lastIndex === 0) ? 1 : 0;
      replaceLast(group[lastIndex]);
    } else {
      insert(group[0]);
      lastIndex = 0;
    }
    
    lastGroup = group;
    lastKey = key;
    return;
  }

  // 3. TONES (Triggered by single quote)
  if (key === "'") {
    e.preventDefault();
    insert(TONES[0]);
    lastGroup = TONES;
    lastIndex = 0;
    lastKey = key;
    return;
  }

  // Reset state if any other key is pressed
  lastKey = null;
  lastGroup = null;
});

ta.addEventListener("beforeinput", (e) => {
  if (e.data === "=" || e.data === "+") {
    e.preventDefault();
    cycle(1);
  } else if (e.data === "-") {
    e.preventDefault();
    cycle(-1);
  }
});
