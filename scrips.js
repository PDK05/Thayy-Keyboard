const textarea = document.getElementById("input");

const CONSONANT_GROUPS = {
  "K": ["ข", "ฃ", "ค", "ฅ", "ฆ"],
  "s": ["ซ", "ส", "ศ", "ษ"],
  "C": ["ฉ", "ช", "ฌ"],
  "T": ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
  "P": ["ผ", "พ", "ภ"]
};

const TONES = ["", "่", "้", "๊", "๋"];

// ===== utils =====
function insertText(text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const value = textarea.value;

  textarea.value =
    value.substring(0, start) +
    text +
    value.substring(end);

  textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

function replaceBack(count, newText) {
  const start = textarea.selectionStart;
  const value = textarea.value;

  textarea.value =
    value.substring(0, start - count) +
    newText +
    value.substring(start);

  textarea.selectionStart = textarea.selectionEnd =
    start - count + newText.length;
}

// ===== logic =====

// cycle consonant
function handleCycle(key) {
  let pos = textarea.selectionStart;
  let text = textarea.value;

  let count = 0;
  let i = pos - 1;

  while (i >= 0 && text[i] === key) {
    count++;
    i--;
  }

  let group = CONSONANT_GROUPS[key];
  let char = group[count % group.length];

  replaceBack(count, char);
}

// tone
function handleTone() {
  let pos = textarea.selectionStart;
  let text = textarea.value;

  let count = 0;
  let i = pos - 1;

  while (i >= 0 && text[i] === "'") {
    count++;
    i--;
  }

  let tone = TONES[count] || "";

  replaceBack(count, tone);
}

// final -n
function handleFinalN() {
  let pos = textarea.selectionStart;
  let text = textarea.value;

  if (text[pos - 1] === "n" && text[pos - 2] === "-") {
    replaceBack(2, "น");
  }
}

// ===== main =====
textarea.addEventListener("keydown", (e) => {
  const key = e.key;

  // ===== consonant cycle =====
  if (CONSONANT_GROUPS[key]) {
    e.preventDefault();
    insertText(key);
    handleCycle(key);
    return;
  }

  // ===== tone =====
  if (key === "'") {
    e.preventDefault();
    insertText("'");
    handleTone();
    return;
  }

  // ===== final =====
  if (key === "n") {
    e.preventDefault();
    insertText("n");
    handleFinalN();
    return;
  }
});
