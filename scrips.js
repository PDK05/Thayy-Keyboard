const ta = document.getElementById("input");

console.log("IME loaded");

// ===== DATA =====
const CONS = {
  "k": ["ข","ฃ","ค","ฅ","ฆ"],
  "s": ["ซ","ส","ศ","ษ"],
  "c": ["ฉ","ช","ฌ"],
  "t": ["ฐ","ฑ","ฒ","ถ","ท","ธ"],
  "p": ["ผ","พ","ภ"]
};

// ===== UTILS =====
function insertText(text){
  let s = ta.selectionStart;
  let v = ta.value;

  ta.value = v.slice(0,s) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s + text.length;
}

function replaceBack(count, text){
  let s = ta.selectionStart;
  let v = ta.value;

  ta.value = v.slice(0,s-count) + text + v.slice(s);
  ta.selectionStart = ta.selectionEnd = s - count + text.length;
}

// ===== MAIN =====
ta.addEventListener("keydown", (e)=>{
  let key = e.key.toLowerCase();

  // DEBUG
  console.log("KEY:", key);

  if(CONS[key]){
    e.preventDefault();

    // insert key để đếm
    insertText(key);

    // đếm số lần lặp
    let pos = ta.selectionStart;
    let text = ta.value;

    let i = pos - 1;
    let count = 0;

    while(i >= 0 && text[i] === key){
      count++;
      i--;
    }

    let group = CONS[key];
    let char = group[(count - 1) % group.length];

    replaceBack(count, char);
  }
});
