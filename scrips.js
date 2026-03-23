const ta = document.getElementById("input");

// ===== DATA =====
const CONS = {
  "K": ["ข","ฃ","ค","ฅ","ฆ"],
  "s": ["ซ","ส","ศ","ษ"],
  "C": ["ฉ","ช","ฌ"],
  "T": ["ฐ","ฑ","ฒ","ถ","ท","ธ"],
  "P": ["ผ","พ","ภ"]
};

const TONES = ["","่","้","๊","๋"];

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

// ===== CORE UTILS =====
function insert(t){
  let s=ta.selectionStart,e=ta.selectionEnd,v=ta.value;
  ta.value=v.slice(0,s)+t+v.slice(e);
  ta.selectionStart=ta.selectionEnd=s+t.length;
}

function replaceBack(n,t){
  let s=ta.selectionStart,v=ta.value;
  ta.value=v.slice(0,s-n)+t+v.slice(s);
  ta.selectionStart=ta.selectionEnd=s-n+t.length;
}

// ===== CONSONANT CYCLE =====
function cycle(key){
  let pos=ta.selectionStart,t=ta.value;
  let i=pos-1,count=0;

  while(i>=0 && t[i]===key){count++;i--;}

  let g=CONS[key];
  let c=g[count % g.length];

  replaceBack(count,c);
}

// ===== TONE =====
function tone(){
  let pos=ta.selectionStart,t=ta.value;
  let i=pos-1,count=0;

  while(i>=0 && t[i]==="'"){count++;i--;}

  let mark=TONES[count]||"";
  replaceBack(count,mark);
}

// ===== FINAL =====
function finalN(){
  let p=ta.selectionStart,t=ta.value;
  if(t[p-2]==="-" && t[p-1]==="n"){
    replaceBack(2,"น");
  }
}

// ===== VOWEL =====
function vowel(key){
  let pos=ta.selectionStart,t=ta.value;

  // check double vowel
  let prev2 = t.slice(pos-2,pos);
  if(VOWELS[prev2]){
    replaceBack(2, applyVowel(prev2));
    return;
  }

  if(VOWELS[key]){
    replaceBack(1, applyVowel(key));
  }
}

function applyVowel(k){
  let pos=ta.selectionStart,t=ta.value;
  let cons=t[pos-2]; // phụ âm trước

  if(!cons) return k;

  let v=VOWELS[k];

  if(v.pos==="after") return cons+v.char;
  if(v.pos==="before") return v.char+cons;
  if(v.pos==="above") return cons+v.char;
  if(v.pos==="below") return cons+v.char;

  return k;
}

// ===== MAIN =====
ta.addEventListener("keydown", e=>{
  let k=e.key;

  // consonant
  if(CONS[k]){
    e.preventDefault();
    insert(k);
    cycle(k);
    return;
  }

  // tone
  if(k==="'"){
    e.preventDefault();
    insert("'");
    tone();
    return;
  }

  // final
  if(k==="n"){
    e.preventDefault();
    insert("n");
    finalN();
    return;
  }

  // vowel
  if("aeiou".includes(k)){
    e.preventDefault();
    insert(k);
    vowel(k);
    return;
  }
});
