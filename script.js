const ta = document.getElementById("input");

// ===== DATA =====
const CONS = {
  "K": ["ข","ฃ","ค","ฅ","ฆ"],
  "s": ["ซ","ส","ศ","ษ"],
  "C": ["ฉ","ช","ฌ"],
  "T": ["ฐ","ฑ","ฒ","ถ","ท","ธ"],
  "P": ["ผ","พ","ภ"]
};

const VOWELS = {
  "a":  {pos:"after", char:"ะ"},
  "aa": {pos:"after", char:"า"},
  "i":  {pos:"above", char:"ิ"},
  "ii": {pos:"above", char:"ี"},
  "u":  {pos:"below", char:"ุ"},
  "uu": {pos:"below", char:"ู"},
  "e":  {pos:"before",char:"เ"},
  "ee": {pos:"before",char:"แ"},
  "o":  {pos:"before",char:"โ"}
};

const TONES = ["","่","้","๊","๋"];

// ===== STATE =====
let lastConsonantPos = -1;

// ===== UTILS =====
function insert(text){
  let s=ta.selectionStart,e=ta.selectionEnd,v=ta.value;
  ta.value = v.slice(0,s) + text + v.slice(e);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceAt(pos,len,text){
  let v=ta.value;
  ta.value = v.slice(0,pos) + text + v.slice(pos+len);
  ta.selectionStart = ta.selectionEnd = pos + text.length;
}

// ===== CONSONANT =====
function handleConsonant(key){
  let pos = ta.selectionStart;
  let v = ta.value;

  // đếm số lần lặp
  let i = pos-1, count = 0;
  while(i>=0 && v[i] === key){ count++; i--; }

  let group = CONS[key];
  let char = group[count % group.length];

  // thay Latin bằng Thai
  replaceAt(i+1, count, char);

  lastConsonantPos = i+1;
}

// ===== VOWEL =====
function handleVowel(key){
  if(lastConsonantPos < 0) return;

  let v = VOWELS[key];
  if(!v) return;

  let cons = ta.value[lastConsonantPos];

  let result;

  if(v.pos === "after") result = cons + v.char;
  if(v.pos === "before") result = v.char + cons;
  if(v.pos === "above") result = cons + v.char;
  if(v.pos === "below") result = cons + v.char;

  replaceAt(lastConsonantPos, 1, result);

  // reset để tránh đè tiếp
  lastConsonantPos = -1;
}

// ===== TONE =====
function handleTone(){
  let pos = ta.selectionStart;
  let v = ta.value;

  let i = pos-1, count=0;
  while(i>=0 && v[i]==="'"){ count++; i--; }

  let tone = TONES[count] || "";

  replaceAt(i+1, count, tone);
}

// ===== FINAL =====
function handleFinalN(){
  let pos = ta.selectionStart;
  let v = ta.value;

  if(v[pos-2] === "-" && v[pos-1] === "n"){
    replaceAt(pos-2, 2, "น");
  }
}

// ===== MAIN =====
ta.addEventListener("keydown", e=>{
  let k = e.key;

  // ===== consonant =====
  if(CONS[k]){
    e.preventDefault();
    insert(k);
    handleConsonant(k);
    return;
  }

  // ===== vowel =====
  if(["a","i","u","e","o"].includes(k)){
    e.preventDefault();
    handleVowel(k);
    return;
  }

  // ===== tone =====
  if(k === "'"){
    e.preventDefault();
    insert("'");
    handleTone();
    return;
  }

  // ===== final =====
  if(k === "n"){
    e.preventDefault();
    insert("n");
    handleFinalN();
    return;
  }
});
