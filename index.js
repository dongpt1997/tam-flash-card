const pinyin = window.pinyinPro ? window.pinyinPro.pinyin : null;
const fileInput = document.getElementById('file');
const card = document.getElementById('card');
const front = document.getElementById('front');
const pinyinDiv = document.getElementById('pinyin');
const meaningDiv = document.getElementById('meaning');
const stats = document.getElementById('stats');
const nextBtn = document.getElementById('next');

let cards = [];
let current = null;
let remainingCards = []; // Mảng lưu trữ các thẻ chưa học

function genPinyin(text) {
  if (!text || !text.trim() || !pinyin) return "Không có pinyin";
  return `/${pinyin(text, { toneType: "symbol" }).replace(/\s+/g, "")}/`;
}

function showFront(item) {
  front.textContent = item ? item.hanzi : '?';
  pinyinDiv.textContent = '';
  meaningDiv.textContent = '';
}

function showBack(item) {
  pinyinDiv.textContent = item ? (item.pinyin || 'Không có pinyin') : '';
  meaningDiv.textContent = item ? (item.meaning || '') : '';
}

function updateRemainingCards() {
  remainingCards = cards.filter(c => !c.flipped);
}

function nextRandom() {
  if (remainingCards.length === 0) {
    stats.textContent = "Bạn đã học hết các thẻ!";
    current = null;
    showFront(null);
    return;
  }

  const i = Math.floor(Math.random() * remainingCards.length);
  current = remainingCards[i];

  card.classList.remove('flipped');
  showFront(current);
  stats.textContent = `Đã học: ${cards.length - remainingCards.length}/${cards.length} | Còn lại: ${remainingCards.length}`;
}

card.addEventListener('click', () => {
  if (!current) return;

  card.classList.toggle('flipped');

  if (card.classList.contains('flipped')) {
    showBack(current);
    if (!current.flipped) {
      current.flipped = true;
      updateRemainingCards(); // Cập nhật danh sách thẻ còn lại
    }
  } else {
    showFront(current);
  }
});

fileInput.addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const data = await f.arrayBuffer();
  const wb = XLSX.read(data);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const startRow = rows[0] && rows[0][0].toLowerCase() === "hanzi" ? 1 : 0;

  cards = rows.slice(startRow).map(r => {
    const hanzi = (r[0] || '').toString().trim();
    const meaning = (r[1] || '').toString().trim();
    return {
      hanzi,
      meaning,
      pinyin: genPinyin(hanzi),
      flipped: false
    };
  }).filter(r => r.hanzi);

  if (cards.length === 0) {
    stats.textContent = 'Không tìm thấy dữ liệu hợp lệ trong file.';
    return;
  }

  updateRemainingCards(); // Khởi tạo danh sách thẻ còn lại
  nextRandom();
});

nextBtn.addEventListener('click', nextRandom);