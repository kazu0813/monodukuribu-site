const spreadsheetId = "1KDVo_LLdV8O8sWo7zh0cLCqHcx1Rm8zdCvH4tU7XgT8";
const gid = "0";
const secondSheetId = "1Z81Bjkbr6Wx-3AWcLnP_Ng8kDWzBVNrNKxY2QYeqcr8";
const secondSheetGid = "0";
let scListData = "";
let selectedTd = null;

async function loadSpreadsheet() {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=tsv&id=${spreadsheetId}&gid=${gid}&cache=${Math.random()}`;
  try {
    const res = await fetch(url);
    const tsv = await res.text();
    const rows = tsv.trim().split("\n");
    const data = rows.map(row => row.split("\t").join("").replace(/[\/\s　]/g, "")).join("\n");

    const splitIndex = data.indexOf("!");
    const before = data.substring(0, splitIndex);
    const after = data.substring(splitIndex + 1);

    document.querySelector(".sc-year").textContent = before;
    const [year, month] = before.trim().split("-").map(num => parseInt(num));
    const daysInMonth = new Date(year, month, 0).getDate();

    const cleanedData = after.split("\n").map(line => {
      const match = line.match(/(\d{1,2})月(\d{1,2})日/);
      if (match) {
        const day = parseInt(match[2], 10);
        if (day <= daysInMonth) return line;
      }
      return "";
    }).filter(Boolean).join("\n");

    scListData = cleanedData;
    document.querySelector(".sc-list").innerHTML = formatScListHTML(scListData);
    highlightTodayInList(before);
    displayCalendar(year, month);
  } catch (e) {
    console.error("読み込み失敗:", e);
  }
}

async function loadSecondSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${secondSheetId}/export?format=tsv&id=${secondSheetId}&gid=${secondSheetGid}&cache=${Math.random()}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    document.getElementById("schedule-message").innerHTML = text.trim().replace(/\n/g, "<br>");
  } catch (e) {
    console.error("メッセージ読み込み失敗:", e);
  }
}

function displayCalendar(year, month) {
  const container = document.getElementById("calendar-container");
  container.innerHTML = "";

  const date = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = date.getDay();

  const table = document.createElement("table");
  table.className = "calendar";
  const headerRow = document.createElement("tr");
  const days = ["日", "月", "火", "水", "木", "金", "土"];

  days.forEach((d, index) => {
    const th = document.createElement("th");
    th.textContent = d;

    // 土曜日は青色
    if (index === 6) {
      th.classList.add("sc-saturday");
    }
    // 日曜日は赤色
    if (index === 0) {
      th.classList.add("sc-sunday");
    }

    headerRow.appendChild(th);
  });
  
  table.appendChild(headerRow);

  let currentDay = 1;
  const today = new Date();
  selectedTd = null;

  for (let i = 0; i < 6; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      const td = document.createElement("td");
      if (i === 0 && j < firstDay) {
        td.textContent = "";
      } else if (currentDay <= daysInMonth) {
        td.textContent = currentDay;
        const dateStr = `${month}月${currentDay.toString().padStart(2, "0")}日`;

        // 土曜日は青色
        if (j === 6) {
          td.classList.add("sc-saturday");
        }
        // 日曜日は赤色
        if (j === 0) {
          td.classList.add("sc-sunday");
        }

        if (
          today.getDate() === currentDay &&
          today.getFullYear() === year &&
          today.getMonth() + 1 === month
        ) {
          td.classList.add("today");
          td.classList.add("selected");
          selectedTd = td;
          updateCaSelect(dateStr);
        }

        const regex = new RegExp(`${dateStr}(?!.*:~:).*\\d{1,2}:\\d{2}~\\d{1,2}:\\d{2}`);
        if (scListData.match(regex)) {
          const dot = document.createElement("div");
          dot.className = "green-circle";
          td.appendChild(dot);
        }

        td.addEventListener("click", () => {
          if (selectedTd) selectedTd.classList.remove("selected");
          td.classList.add("selected");
          selectedTd = td;
          updateCaSelect(dateStr);
        });

        currentDay++;
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  container.appendChild(table);
}

function updateCaSelect(dateStr) {
  const lines = scListData.split("\n");
  const matchLine = lines.find(line => line.startsWith(dateStr));
  document.querySelector(".ca-select").textContent = matchLine ? matchLine.replace(/(:~:|!)/g, "") : "";
}

function highlightTodayInList(scYear) {
  const now = new Date();
  const todayStr = `${now.getMonth() + 1}月${now.getDate().toString().padStart(2, "0")}日`;
  if (scYear === `${now.getFullYear()}-${now.getMonth() + 1}`) {
    const lines = scListData.split("\n");
    const todayLine = lines.find(line => line.startsWith(todayStr));
    if (todayLine) {
      document.querySelector(".sc-today").textContent = todayLine.replace(/(:~:|!)/g, "");
    }
  }
}

function formatScListHTML(data) {
  return data.split("\n").map(line => {
    // ":~:" と "!" を削除
    line = line.replace(/(:~:|!)/g, "");

    if (line.includes("日曜日")) {
      return `<span class="sc-sunday">${line}</span>`;
    } else if (line.includes("土曜日")) {
      return `<span class="sc-saturday">${line}</span>`;
    }
    return line;
  }).join("<br>");
}

function toggleView(showList) {
  const listEls = [document.querySelector(".sc-list"), document.querySelector(".sc-today")];
  const calEls = [document.getElementById("calendar-container"), document.querySelector(".ca-select")];

  listEls.forEach(el => el.classList.toggle("hidden", !showList));
  calEls.forEach(el => el.classList.toggle("hidden", showList));
  document.getElementById("toggle-btn").textContent = showList ? "カレンダー表示" : "リスト表示";

  localStorage.setItem("viewMode", showList ? "list" : "calendar");
}

document.getElementById("toggle-btn").addEventListener("click", () => {
  const currentMode = localStorage.getItem("viewMode") || "list";
  const showList = currentMode === "calendar";
  toggleView(showList);
});

window.addEventListener("DOMContentLoaded", () => {
  loadSpreadsheet();
  loadSecondSheet();

  const savedMode = localStorage.getItem("viewMode") || "list";
  toggleView(savedMode === "list");
});