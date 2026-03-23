const CONSONANT_GROUPS = {
  "K": ["ข", "ฃ", "ค", "ฅ", "ฆ"],
  "s": ["ซ", "ส", "ศ", "ษ"],
  "C": ["ฉ", "ช", "ฌ"],
  "T": ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
  "P": ["ผ", "พ", "ภ"]
};

const SPECIAL_MAP = {
  "d=": "ḍ",
  "t=": "ṭ",
  "l=": "ḷ",
  "h=": "ḥ"
};

const VOWELS = {
  "aa": "า",
  "ii": "ี",
  "uu": "ู",
  "ee": "แ",
  "a": "ะ",
  "i": "ิ",
  "u": "ุ",
  "e": "เ",
  "o": "โ"
};

const TONES = {
  1: "่",
  2: "้",
  3: "๊",
  4: "๋"
};

// cycle consonant
function resolveConsonant(char, count) {
  let group = CONSONANT_GROUPS[char];
  if (!group) return char;
  return group[(count - 1) % group.length];
}

// parse text
function process(input) {
  let output = "";

  // xử lý phụ âm lặp (K, s, ...)
  input = input.replace(/(K+|s+|C+|T+|P+)/g, (match) => {
    let key = match[0];
    return resolveConsonant(key, match.length);
  });

  // special
  for (let key in SPECIAL_MAP) {
    input = input.replaceAll(key, SPECIAL_MAP[key]);
  }

  // vowel
  for (let key in VOWELS) {
    input = input.replaceAll(key, VOWELS[key]);
  }

  // tone
  input = input.replace(/'+/g, (match) => {
    let tone = TONES[match.length];
    return tone ? tone : "";
  });

  // final nasal
  input = input.replace(/-n/g, "น");

  return input;
}

// realtime update
document.getElementById("input").addEventListener("input", (e) => {
  let text = e.target.value;
  document.getElementById("output").innerText = process(text);
});
