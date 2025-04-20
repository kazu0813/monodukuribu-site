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

    location.reload();
}

//club note
const combined1 = grade + className + Name;

const totalLength1 = combined1.length;

const displayElement1 = document.querySelector(".storage-size1");
if (displayElement1) {
  displayElement1.textContent = `${totalLength1} B`;
}

//メモ帳
const textFiles = localStorage.getItem("textFiles") || "";

const combined2 = textFiles;

const totalLength2 = combined2.length;

const displayElement2 = document.querySelector(".storage-size2");
if (displayElement2) {
  displayElement2.textContent = `${totalLength2} B`;
}