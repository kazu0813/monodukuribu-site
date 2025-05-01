//ログイン
const grade = localStorage.getItem("grade") || "";
const className = localStorage.getItem("className") || "";
const Name = localStorage.getItem("Name") || "";
document.querySelector(".grade").textContent = grade;
document.querySelector(".class").textContent = className;
document.querySelector(".name").textContent = Name;

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

//メニュー
const account = document.querySelector('.account');
const menu = document.querySelector('.ac-menu');

let menuVisible = false;

account.addEventListener('mouseenter', () => {
    account.classList.add('hovered');
  });

  account.addEventListener('mouseleave', () => {
    if (!menuVisible) {
      account.classList.remove('hovered');
    }
  });

  account.addEventListener('click', (e) => {
    menuVisible = !menuVisible;
    if (menuVisible) {
      menu.style.display = 'block';
      account.classList.add('hovered');
    } else {
      menu.style.display = 'none';
      account.classList.remove('hovered');
    }
    e.stopPropagation();
  });

  document.addEventListener('click', (e) => {
    if (!account.contains(e.target) && !menu.contains(e.target)) {
      hideMenu();
    }
  });

 function hideMenu() {
    menu.style.display = 'none';
    account.classList.remove('hovered');
    menuVisible = false;
}

//ログアウト
function logout() {
  localStorage.removeItem('Name');
  localStorage.removeItem('grade');
  localStorage.removeItem('className');

  location.href='../login';
}