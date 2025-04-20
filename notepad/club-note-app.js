//ログイン
const grade = localStorage.getItem("grade") || "";
const className = localStorage.getItem("className") || "";
const Name = localStorage.getItem("Name") || "";
document.querySelector(".grade").textContent = grade;
document.querySelector(".class").textContent = className;
document.querySelector(".name").textContent = Name;

let qrcoderead;
let currentFacingMode = 'environment'; // 初期カメラ（背面）
let stream = null;
let timer = null;
let cameraActive = false;

if (!grade || !className || !Name) {
    qrcoderead = 1;
} else {
    qrcoderead = 0;
}

if (qrcoderead === 1) {
  location.href='https://kazu0813.github.io/monodukuribu-site/not-found';
}