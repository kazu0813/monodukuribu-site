// 初期 localStorage 空追加
for (let i = 1; i <= 10; i++) {
  const key = `data${i}`;
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, '');
  }
}

function checkOverallStatus() {
  const allComplete = Array.from({ length: 10 }, (_, i) => {
    return document.getElementById(`btn${i + 1}`).textContent === 'ダウンロード完了';
  }).every(Boolean);

  // .t-info に info-alert クラスの付け外し
  document.querySelectorAll('.t-info').forEach(tInfo => {
    if (!allComplete) {
      tInfo.classList.add('info-alert');
    } else {
      tInfo.classList.remove('info-alert');
    }
  });
}



// 各ファイルに対するダウンロードUI構築
function setupDownload(id, file, storageKey) {
  const container = document.getElementById('container');

  const block = document.createElement('div');
  block.className = 'block';
  block.innerHTML = `
    <button class="downloadBtn" id="btn${id}">チェック中...</button>
    <div class="progress-container">
      <progress id="bar${id}" value="0" max="100"></progress>
      <div class="percent-label" id="label${id}">0%</div>
    </div>
  `;
  container.appendChild(block);

  const button = block.querySelector(`#btn${id}`);
  const progressBar = block.querySelector(`#bar${id}`);
  const percentLabel = block.querySelector(`#label${id}`);

  const localData = localStorage.getItem(storageKey);

  fetch(file)
    .then(res => {
      if (!res.ok) throw new Error('Fetch failed');
      return res.text();
    })
    .then(serverData => {
      if (localData === serverData) {
        button.textContent = 'ダウンロード完了';
        button.disabled = true;
        button.classList.remove('ready');
        progressBar.value = 100;
        percentLabel.textContent = '100%';
      } else {
        button.textContent = 'ダウンロード';
        button.disabled = false;
        button.classList.add('ready');
        progressBar.value = 0;
        percentLabel.textContent = '0%';
      }

      checkOverallStatus();

      button.addEventListener('click', () => {
        if (button.disabled) return;

        button.textContent = 'ダウンロード中';
        button.classList.remove('ready');
        button.disabled = true;

        let progress = 0;
        let fetched = false;

        const interval = setInterval(() => {
          progress++;
          progressBar.value = progress;
          percentLabel.textContent = `${progress}%`;

          if (progress === 95 && !fetched) {
            fetched = true;
            fetch(file)
              .then(r => {
                if (!r.ok) throw new Error('Download failed');
                return r.text();
              })
              .then(data => {
                localStorage.setItem(storageKey, data);
              })
              .catch(err => console.error(`Error downloading ${file}:`, err));
          }

          if (progress >= 100) {
            clearInterval(interval);
            button.textContent = 'ダウンロード完了';
            checkOverallStatus();
          }
        }, 100);
      });
    })
    .catch(err => {
      console.error(`初期取得失敗 (${file}):`, err);
      button.textContent = 'ダウンロード不可';
      button.disabled = true;
      checkOverallStatus();
    });
}

// すべての data1~data10 をセットアップ
for (let i = 1; i <= 10; i++) {
  setupDownload(i, `../data/data${i}.txt`, `data${i}`);
}
