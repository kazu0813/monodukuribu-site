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