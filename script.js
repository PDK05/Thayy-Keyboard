const ta = document.getElementById("input");

const CONFIG = {
 consonants: {
 k: ["ก", "ค", ["ค", "ข", "ฆ", "ฅ", "ฃ"]],
 g: ["ง"],
 c: ["จ", "ช", ["ช", "ฉ", "ฌ"]],
 s: ["ซ", "ศ", ["ส", "ศ", "ษ", "ซ"]],
 d: ["ด", "ฎ", ["ด", "ฎ"]],
 t: ["ต", "ฏ", ["ท", "ถ", "ธ", "ฑ", "ฒ", "ฐ"]],
 n: ["น", "ณ", ["น", "ณ"]],
 b: ["บ", "บ", ["บ"]],
 p: ["ป", "พ", ["พ", "ผ", "ภ"]],
 m: ["ม", "ม", ["ม"]],
 y: ["ย", "ญ", ["ญ", "ย"]],
 r: ["ร", "ร", ["ร", "น", "ณ"]],
 l: ["ล", "ฬ", ["ฬ", "ล"]],
 w: ["ว", "ว", ["ว"]],
 x: ["อ", "ฮ", ["ฮ", "อ"]]
 },
 vowels: {
 a: { default: "ะ", alt: "า", variants: ["ะ", "ั"] },
 i: { default: "ิ", alt: "ี", variants: ["ิ", "ี"] },
 u: { default: "ุ", alt: "ู"},
 e: { default: "เ", alt: "แ", variants: ["เ", "แ"] },
 o: { default: "โ", alt: null, variants: ["โ", "ไ"] }
 },
 tones: ["่", "้", "๊", "๋", "็"],
 symbols: {
 "1": ["1", null, ["1", "๑"]],
 "2": ["2", null, ["2", "๒"]],
 "5": ["5", null, ["5", "๕"]],
 "b": [null, "฿", ["฿"]],
 "m": [null, "ํ", ["ํ"]]
 }
};

let lastKey = null;
let currentGroup = null;

function updateText(newChar, isReplace = false) {
 const pos = ta.selectionStart;
 const val = ta.value;

 if (isReplace && pos > 0) {
 ta.value = val.slice(0, pos - 1) + newChar + val.slice(pos);
 ta.selectionStart = ta.selectionEnd = pos;
 } else {
 ta.value = val.slice(0, pos) + newChar + val.slice(pos);
 ta.selectionStart = ta.selectionEnd = pos + newChar.length;
 }
}

function handleCycle(dir) {
 const pos = ta.selectionStart;
 if (!currentGroup || currentGroup.length === 0 || pos === 0) return;

 const charBefore = ta.value[pos - 1];
 const idx = currentGroup.indexOf(charBefore);

 let nextIdx;
 if (idx === -1) {
 nextIdx = dir === 1 ? 0 : currentGroup.length - 1;
 } else {
 nextIdx = (idx + dir + currentGroup.length) % currentGroup.length;
 }

 updateText(currentGroup[nextIdx], true);
}

ta.addEventListener("keydown", (e) => {
 const key = e.key;
 const kLow = key.toLowerCase();
 const isCapsLock = e.getModifierState("CapsLock");

 // ===== = - _ + 放行条件 =====
 if (key === "=" || key === "-" || key === "_" || key === "+") {
 const pos = ta.selectionStart;
 const charBefore = pos > 0 ? ta.value[pos - 1] : "";
 const hasTone = CONFIG.tones.includes(charBefore);
 
 if (!currentGroup || currentGroup.length === 0 || hasTone) {
 // 放行
 } else {
 e.preventDefault();
 if (key === "=") handleCycle(1);
 if (key === "-") handleCycle(-1);
 }
 return;
 }

 if (e.code === "Equal") {
 e.preventDefault();
 if (currentGroup && currentGroup.length > 0) handleCycle(1);
 return;
 }

 if (e.code === "Minus") {
 e.preventDefault();
 if (currentGroup && currentGroup.length > 0) handleCycle(-1);
 return;
 }

 if (e.ctrlKey || e.metaKey || e.altKey) return;

 if (["Backspace", "Enter", "Tab", "Escape"].includes(key)) {
 currentGroup = null;
 lastKey = null;
 return;
 }

 const symbolEntry = CONFIG.symbols[kLow];
 if (symbolEntry) {
 const [def, shiftDef, cycleGroup] = symbolEntry;

 if (e.shiftKey && shiftDef) {
 e.preventDefault();
 updateText(shiftDef);
 currentGroup = cycleGroup;
 lastKey = kLow;
 return;
 } else if (!e.shiftKey && def && !CONFIG.consonants[kLow]) {
 e.preventDefault();
 updateText(def);
 currentGroup = cycleGroup;
 lastKey = kLow;
 return;
 }
 }

 if (CONFIG.consonants[kLow]) {
 e.preventDefault();

 const [def, shiftDef, cycleGroup] = CONFIG.consonants[kLow];
 
 if ((e.shiftKey || isCapsLock) && shiftDef) {
 updateText(shiftDef);
 } else {
 updateText(def);
 }

 currentGroup = cycleGroup;
 lastKey = kLow;
 return;
 }

 if (CONFIG.vowels[kLow]) {
 e.preventDefault();

 const v = CONFIG.vowels[kLow];

 if (lastKey === kLow && v.alt) {
 updateText(v.alt, true);
 lastKey = null;
 currentGroup = v.variants && v.variants.length > 0 ? v.variants : null;
 } else {
 updateText(v.default);
 lastKey = kLow;
 currentGroup = v.variants && v.variants.length > 0 ? v.variants : null;
 }
 return;
 }

 if (key === "'") {
 e.preventDefault();

 const tones = CONFIG.tones;
 const pos = ta.selectionStart;
 
 if (pos > 0 && tones.includes(ta.value[pos - 1])) {
 const currentIdx = tones.indexOf(ta.value[pos - 1]);
 const nextIdx = (currentIdx + 1) % tones.length;
 updateText(tones[nextIdx], true);
 } else {
 updateText(tones[0]);
 }
 return;
 }

 currentGroup = null;
 lastKey = null;
});
