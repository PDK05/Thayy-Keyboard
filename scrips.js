const textarea = document.getElementById("input");

const CONSONANT_GROUPS = {
  "K": ["ข", "ฃ", "ค", "ฅ", "ฆ"],
  "s": ["ซ", "ส", "ศ", "ษ"],
  "C": ["ฉ", "ช", "ฌ"],
  "T": ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
  "P": ["ผ", "พ", "ภ"]
};

const TONES = {
  1: "่",
  2: "้",
  3: "๊",
  4: "๋"
};

// lấy vị trí con trỏ
function getCursor() {
  return textarea.selectionStart;
}

// set lại con trỏ
function setCursor(pos) {
  textarea.setSelectionRange(pos, pos);
}

// thay text tại cursor
function replaceText(start, end, newText) {
  let value = textarea.value;
  textarea.value = value.slice(0, start) + newText + value.slice(end);
  setCursor(start + newText.length);
}

// xử lý phụ âm lặp
function handleConsonant(char) {
  let pos = getCursor();
  let text = textarea.value;

  // lấy chuỗi phía trước
  let i = pos - 1;
  let count = 0;

  while (i >= 0 && text[i] === char) {
    count++;
    i--;
  }

  let group = CONSONANT_GROUPS[char];
  if (!group) return;

  let newChar = group[count % group.length];

  // thay toàn bộ chuỗi lặp bằng 1 ký tự
  replaceText(i + 1, pos, newChar);
}

// xử lý tone '
function handleTone() {
  let pos = getCursor();
  let text = textarea.value;

  let i = pos - 1;
  let count = 0;

  while (i >= 0 && text[i] === "'") {
    count++;
    i--;
  }

  let tone = TONES[count];
  if (!tone) return;

  replaceText(i + 1, pos, tone);
}

// xử lý -n
function handleFinalN() {
  let pos = getCursor();
  let text = textarea.value;

  if (text[pos - 2] === "-" && text[pos - 1] === "n") {
    replaceText(pos - 2, pos, "น");
  }
}

// keydown chính
textarea.addEventListener("input", (e) => {
  let pos = getCursor();
  let text = textarea.value;

  let char = text[pos - 1];

  // phụ âm cycle
  if (CONSONANT_GROUPS[char]) {
    handleConsonant(char);
    return;
  }

  // tone
  if (char === "'") {
    handleTone();
    return;
  }

  // final
  if (char === "n") {
    handleFinalN();
    return;
  }
});
