//スケジュール
const weekdays = {
    1: '日曜日',
    2: '月曜日',
    3: '火曜日',
    4: '水曜日',
    5: '木曜日',
    6: '金曜日',
    7: '土曜日'
};
        
const weekdayColors = {
    1: 'red',   // 日曜日
    7: 'blue'   // 土曜日
};
        
const defaultID = "1KDVo_LLdV8O8sWo7zh0cLCqHcx1Rm8zdCvH4tU7XgT8";
const encodingType = "2D Array";
        
async function getSheetData(id, name) {
const defaultReturn = encodingType === "2D Array" ? "[]" : "{}";
try {
    id = id === "/d/..." ? defaultID : id;
    name = encodeURIComponent(name);
    const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=tsv&id=${id}&gid=${name}&cache=${Math.random()}`;
    const response = await fetch(url);
    if (!response.ok) return defaultReturn;
        const content = await response.text();
        return JSON.stringify(tsvParser(content));
    } catch (e) {
        console.warn(e);
        return defaultReturn;
    }
}
        
function tsvParser(tsv) {
    const fixName = (name) => {
    return name.endsWith("\r") ? name.substring(0, name.length - 1) : name;
    };
    const toItems = (rows, ind, objMode) => {
    const list = [];
    for (var i = 1; i < rows.length; i++) {
        const items = rows[i].split("\t");
        list.push(fixName(items[ind]))
    }
    if (objMode) return Object.assign({}, list);
        else return list;
    };
    const rows = tsv.split("\n");
    const columns = rows[0].split("\t");
    let obj = {};
    if (encodingType === "2D Array") {
        obj = [];
        columns.forEach((item, i) => { obj.push([fixName(item), toItems(rows, i, false)]) });
    } else {
        columns.forEach((item, i) => { obj[fixName(item)] = toItems(rows, i, encodingType === "Object") });
    }
    return obj;
}
        
function getTodayDate() {
    const today = new Date();
    const month = today.getMonth() + 1; // 月（0-11なので +1）
    const day = today.getDate(); // 日
    return { month, day };
}
        
function getTimeDifference(startTime, endTime) {
    const now = new Date();
    const [startHour, startMinute] = startTime.split(':').map(num => parseInt(num));
    const [endHour, endMinute] = endTime.split(':').map(num => parseInt(num));
        
    const startDate = new Date(now);
    startDate.setHours(startHour, startMinute, 0, 0);
        
    const endDate = new Date(now);
    endDate.setHours(endHour, endMinute, 0, 0);
        
    let timeMessage = "";
        
    if (now < startDate) {
        const diff = (startDate - now) / 60000; // ミリ秒を分に変換
        const hours = Math.floor(diff / 60);
        const minutes = Math.ceil(diff % 60);
        timeMessage = `部活開始まであと ${hours}時間 ${minutes}分`;
    } else if (now >= startDate && now < endDate) {
        const diff = (endDate - now) / 60000; 
        const hours = Math.floor(diff / 60);
        const minutes = Math.ceil(diff % 60); 
        timeMessage = `部活終了まであと ${hours}時間 ${minutes}分`;
    } else if (now >= endDate) {
        timeMessage = "部活はすでに終了しています。";
    }
    return timeMessage;
}
        
async function loadSchedule(isFirstLoad = false) {
    let dataSpreadsheet = await getSheetData(defaultID, "0");
    let scheduleText = dataSpreadsheet
    .replace(/"/g, "")
    .replace(/,/g, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "");
        
    scheduleText = scheduleText.replace(/\//g, '\n');
        
    const lines = scheduleText.split('\n').filter(line => line.trim() !== '');
        
    const clubListElement = document.querySelector('.club-list');
    const todayElement = document.querySelector('.club-today');
    const todayTimeElement = document.querySelector('.club-time');
    const today = getTodayDate();
    let todaySchedule = "";
    let yellowItem = null;
    let hasClubToday = false;
        
    clubListElement.innerHTML = '';
        
    lines.forEach(line => {
        const dateMatch = line.match(/(\d+月\d+日)\((\d+)\)(.*)/);
        if (dateMatch) {
            const date = dateMatch[1];
            const weekdayNumber = parseInt(dateMatch[2]);
            let schedule = dateMatch[3].trim();
        
            if (schedule.endsWith('/')) {
                schedule = schedule.slice(0, -1);
            }
        
            const weekday = weekdays[weekdayNumber];
        
            const scheduleItem = document.createElement('div');
            scheduleItem.classList.add('schedule-item');
            scheduleItem.innerHTML = `${date} (${weekday}) ${schedule ? schedule : '休み'}`;
        
            if (weekdayColors[weekdayNumber]) {
                scheduleItem.style.color = weekdayColors[weekdayNumber];
            }
        
            clubListElement.appendChild(scheduleItem);
        
            const [month, day] = date.split('月');
            const dayOfMonth = parseInt(day.split('日')[0]);
            if (today.month === parseInt(month) && today.day === dayOfMonth) {
                scheduleItem.style.backgroundColor = 'rgb(211, 245, 255)';
                todaySchedule = `${date} (${weekday}) ${schedule ? schedule : '休み'}`;
                yellowItem = scheduleItem;
                if (schedule && schedule !== 'なし') {
                    const times = schedule.split('~');
                    const startTime = times[0].trim();
                    const endTime = times[1].trim();
        
                    const timeMessage = getTimeDifference(startTime, endTime);
        
                    todayTimeElement.innerHTML = `${timeMessage}`;
                    hasClubToday = true;
                }
            }
        }
    });
        
    if (todaySchedule) {
        todayElement.innerHTML = `${todaySchedule}`;
        
        const todayWeekdayNumber = weekdays[Object.keys(weekdays).find(key => weekdays[key] === todaySchedule.split(' ')[1])];
        if (weekdayColors[todayWeekdayNumber]) {
            todayElement.style.color = weekdayColors[todayWeekdayNumber];
        }
        } else {
            todayElement.innerHTML = "<strong>今日はスケジュールがありません。</strong>";
        }
        
        if (!hasClubToday) {
            todayTimeElement.innerHTML = "部活なし";
        }
        
        if (isFirstLoad && yellowItem) {
        }
}
        
window.onload = () => {
    loadSchedule(true);
    setInterval(() => loadSchedule(false), 1000);
};


async function fetchSheetData() {
    const sheetID = "1Z81Bjkbr6Wx-3AWcLnP_Ng8kDWzBVNrNKxY2QYeqcr8";
    const gid = "0";
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/export?format=tsv&id=${sheetID}&gid=${gid}&cache=${Math.random()}`;
            
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("データの取得に失敗しました。");
                
        let data = await response.text();
        data = data.replace(/[\[\]"]+/g, "").replace(/,/g, "\n");
                
        document.querySelector(".teacher-msg").innerText = data;
        } catch (error) {
            console.error(error);
            document.querySelector(".teacher-msg").innerText = "データの取得に失敗しました。";
        }
}
        
fetchSheetData();


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
  window.location.href = 'login.html';
} else {

}

// 初期に club-note を隠す場合
if (qrcoderead === 1) {
  document.querySelectorAll('.club-note').forEach(el => el.style.display = 'none');
} else {
  console.log("QRコードリーダーは無効化されています。");
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

    location.reload();
}