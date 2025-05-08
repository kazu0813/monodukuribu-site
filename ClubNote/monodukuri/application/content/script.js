const container = document.getElementById('content');

for (let i = 1; i <= 10; i++) {
  const key = `data${i}`;
  const rawData = localStorage.getItem(key);

  if (!rawData) continue;

  try {
    const data = JSON.parse(rawData);
    if (!Array.isArray(data) || data.length !== 3) continue;

    const [filePath, title, htmlContent] = data;

    const dlItem = document.createElement('div');
    dlItem.className = 'dl-content-list';

    // 画像
    const imgDiv = document.createElement('div');
    const img = document.createElement('img');
    img.src = filePath;
    img.style.width = '40px';
    imgDiv.appendChild(img);
    dlItem.appendChild(imgDiv);

    // タイトル
    const titleDiv = document.createElement('div');
    titleDiv.className = 'title'; // クラスを追加
    titleDiv.textContent = title;
    titleDiv.style.width = '1000px';
    dlItem.appendChild(titleDiv);

    // 開くボタン
    const openDiv = document.createElement('div');
    const openBtn = document.createElement('button');
    openBtn.textContent = '開く';
    openBtn.className = 'dl-button';
    openBtn.style.width = '100px';
    openBtn.style.height = '40px';
    openBtn.onclick = () => {
      const encoded = encodeURIComponent(JSON.stringify(data));
      window.location.href = `data.html?content=${key}`;
    };
    openDiv.appendChild(openBtn);
    dlItem.appendChild(openDiv);

    container.appendChild(dlItem);

  } catch (e) {
    console.warn(`${key} は正しく読み込めませんでした:`, e);
  }
}

window.addEventListener('load', function() {
  setTimeout(function() {
    document.getElementById('content').style.display = 'block';
    document.querySelectorAll('.load-msg').forEach(function(el) {
      el.style.display = 'none';
    });
  }, 1500);
});