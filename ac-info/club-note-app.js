//ログイン
const grade = localStorage.getItem("grade") || "";
const className = localStorage.getItem("className") || "";
const Name = localStorage.getItem("Name") || "";
document.querySelector(".grade").textContent = grade;
document.querySelector(".class").textContent = className;
document.querySelector(".name").textContent = Name;
document.querySelector(".ac-info-grade").textContent = grade;
document.querySelector(".ac-info-class").textContent = className;
document.querySelector(".ac-info-name").textContent = Name;

//アカウント区別
const teacherElements = document.querySelectorAll(".app-ac-teacher");
const studentElements = document.querySelectorAll(".app-ac-student");

if (grade === "null" && className === "null") {
  // 教師を表示、学生を非表示
  teacherElements.forEach(el => el.style.display = "block");
  studentElements.forEach(el => el.style.display = "none");
} else {
  // 学生を表示、教師を非表示
  teacherElements.forEach(el => el.style.display = "none");
  studentElements.forEach(el => el.style.display = "block");
}
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

//club noteホームにもどる
function club_note_reload() {
  if (grade === "null" && className === "null") {
    location.href='https://kazu0813.github.io/monodukuribu-site/club-note/monodukuri/teacher/index.html';
    } else {
    location.href='https://kazu0813.github.io/monodukuribu-site/club-note/monodukuri/student/index.html';
  }
}