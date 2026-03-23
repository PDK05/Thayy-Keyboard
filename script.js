const ta = document.getElementById("input");

// Bảng mã hóa: Phím gõ -> Danh sách ký tự xoay vòng
const CONS = {
    "k": ["ข", "ฃ", "ค", "ฅ", "ฆ"],
    "s": ["ซ", "ส", "ศ", "ษ"],
    "c": ["ฉ", "ช", "ฌ"],
    "t": ["ฐ", "ฑ", "ฒ", "ถ", "ท", "ธ"],
    "p": ["ผ", "พ", "ภ"]
};

/**
 * Chèn ký tự mới vào vị trí con trỏ hiện tại
 */
function insertText(text) {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const fullText = ta.value;

    ta.value = fullText.slice(0, start) + text + fullText.slice(end);
    
    // Đưa con trỏ ra sau ký tự vừa chèn
    ta.selectionStart = ta.selectionEnd = start + text.length;
}

/**
 * Thay thế 1 ký tự đứng ngay trước con trỏ
 */
function replaceLastChar(newChar) {
    const pos = ta.selectionStart;
    const fullText = ta.value;

    if (pos > 0) {
        ta.value = fullText.slice(0, pos - 1) + newChar + fullText.slice(pos);
        ta.selectionStart = ta.selectionEnd = pos;
    }
}

// Lắng nghe sự kiện gõ phím
ta.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    const group = CONS[key];

    // Nếu phím nhấn nằm trong bảng định nghĩa
    if (group) {
        e.preventDefault(); // Ngăn trình duyệt tự gõ ký tự tiếng Anh vào textarea

        const pos = ta.selectionStart;
        const charBefore = ta.value[pos - 1];

        // Kiểm tra xem ký tự trước đó có thuộc cùng nhóm phím này không
        const currentIndex = group.indexOf(charBefore);

        if (currentIndex !== -1) {
            // Đã có chữ Thái thuộc nhóm này -> Xoay vòng sang chữ tiếp theo
            const nextIndex = (currentIndex + 1) % group.length;
            replaceLastChar(group[nextIndex]);
        } else {
            // Chưa có hoặc là chữ khác -> Chèn chữ đầu tiên trong nhóm
            insertText(group[0]);
        }
    }
});
