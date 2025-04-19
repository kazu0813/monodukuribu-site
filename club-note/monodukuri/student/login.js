const grade = localStorage.getItem("grade") || "";
const className = localStorage.getItem("className") || "";
const Name = localStorage.getItem("Name") || "";

let qrcoderead;
let currentFacingMode = 'environment';
let stream = null;
let timer = null;
let cameraActive = false;

if (!grade || !className || !Name) {
  qrcoderead = 1;
} else {
  qrcoderead = 0;
  document.querySelector(".grade").textContent = grade;
  document.querySelector(".class").textContent = className;
  document.querySelector(".name").textContent = Name;
  document.querySelectorAll('.qr-read').forEach(el => el.style.display = 'none');
}

// 関数宣言に変更（これが重要！）
async function startCamera() {
  const constraints = {
    audio: false,
    video: {
      facingMode: currentFacingMode,
      width: 600,
      height: 300,
    }
  };

  try {
    const video = document.querySelector('video');

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.play();

    const canvas = new OffscreenCanvas(500, 500);
    const context = canvas.getContext('2d');

    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      context.drawImage(video, 0, 0, 500, 500);
      const imageData = context.getImageData(0, 0, 500, 500);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        document.querySelector('#result').textContent = code.data;
        drawRect(code.location.topLeftCorner, code.location.bottomRightCorner);

        let qrClubData = code.data;

        const pattern = /^\s*"?[^\/\s"]+\/[^\/\s"]+"?\s*,\s*"?[^\/\s"]+\/[^\/\s"]+"?\s*$/;
        if (!pattern.test(qrClubData)) {
          alert("QRコードの形式が不正です");
          return;
        }

        let [x, y] = qrClubData.split(',');
        x = x.replace(/"/g, '');
        y = y.replace(/"/g, '');

        let [grade, className] = x.split('/');
        let Name = y.replace(/\//g, ' ');

        localStorage.setItem('grade', grade);
        localStorage.setItem('className', className);
        localStorage.setItem('Name', Name);

        location.href='index.html';
        stopCamera();
      } else {
        document.querySelector('#result').textContent = '';
      }
    }, 300);

  } catch (error) {
    console.error('カメラ起動エラー:', error);
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function drawRect(topLeft, bottomRight) {
  const { x: x1, y: y1 } = topLeft;
  const { x: x2, y: y2 } = bottomRight;
  const overlay = document.querySelector('#overlay');
  overlay.style.left = `${x1}px`;
  overlay.style.top = `${y1}px`;
  overlay.style.width = `${x2 - x1}px`;
  overlay.style.height = `${y2 - y1}px`;
}

async function cameraChange() {
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  if (cameraActive) {
    await startCamera();
  }
}

function cameraONOFF() {
  const qrArea = document.querySelector('.qr-read');
  const result = document.querySelector('#result');
  const toggleButton = document.getElementById('camera-toggle');

  if (!cameraActive) {
    qrArea.style.display = 'block';
    result.textContent = '';
    startCamera();
    cameraActive = true;
    toggleButton.textContent = 'OFFにする';
  } else {
    qrArea.style.display = 'none';
    result.textContent = '';
    stopCamera();
    cameraActive = false;
    toggleButton.textContent = 'ONにする';
  }
}

if (qrcoderead === 1) {
  document.querySelectorAll('.club-note').forEach(el => el.style.display = 'none');
} else {
  console.log("QRコードリーダーは無効化されています。");
}