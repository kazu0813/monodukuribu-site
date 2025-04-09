const fileListEl = document.getElementById('fileList');
const fileManager = document.getElementById('fileManager');
const editor = document.getElementById('editor');
const textArea = document.getElementById('textArea');
let currentFile = null;

function getFiles() {
    return JSON.parse(localStorage.getItem('textFiles') || '{}');
}

function saveFiles(files) {
    localStorage.setItem('textFiles', JSON.stringify(files));
}

function updateFileList() {
    const files = getFiles();
    fileListEl.innerHTML = '';
    Object.keys(files).forEach(name => {
    const li = document.createElement('li');
    li.className = 'file-list';

    // クリックでエディタを開く
    li.onclick = () => openEditor(name);

    // ファイル名（左）
    const span = document.createElement('span');
    span.textContent = name;
    span.style.cursor = 'pointer'; // 文字部分にはカーソルをポインターに

    // ボタン群（右）
    const actions = document.createElement('div');
    actions.className = 'file-actions';

    const renameBtn = document.createElement('button');
    renameBtn.textContent = '名称変更';
    renameBtn.className = 'name-change';
    renameBtn.onclick = (e) => {
        e.stopPropagation(); // イベントバブリングを停止
        renameFile(name);
    };

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'コピー';
    copyBtn.className = 'copy';
    copyBtn.onclick = (e) => {
    e.stopPropagation(); // イベントバブリングを停止
    copyFile(name);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.className = 'delete';
    deleteBtn.onclick = (e) => {
    e.stopPropagation(); // イベントバブリングを停止
    deleteFile(name);
    };

    actions.appendChild(renameBtn);
    actions.appendChild(copyBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(actions);
    fileListEl.appendChild(li);
    });
}

function uniqueName(base) {
    const files = getFiles();
    if (!(base in files)) return base;
    let i = 1;
    while (`${base}(${i})` in files) i++;
    return `${base}(${i})`;
}

function createFile() {
    const name = prompt('ファイル名を入力してください');
    if (!name) return;
    const unique = uniqueName(name);
    const files = getFiles();
    files[unique] = '';
    saveFiles(files);
    updateFileList();
}

function renameFile(oldName) {
    const newName = prompt('新しい名前を入力してください', oldName);
    if (!newName) return;
    const unique = uniqueName(newName);
    const files = getFiles();
    files[unique] = files[oldName];
    delete files[oldName];
    saveFiles(files);
    updateFileList();
}

function deleteFile(name) {
    const files = getFiles();
    delete files[name];
    saveFiles(files);
    updateFileList();
}

function copyFile(name) {
    const files = getFiles();
    const newName = uniqueName(name);
    files[newName] = files[name];
    saveFiles(files);
    updateFileList();
}

function openEditor(name) {
    currentFile = name;
    const files = getFiles();
    textArea.innerHTML = files[name];
    fileManager.classList.add('hidden');
    editor.classList.remove('hidden');
}

function goHome() {
    const files = getFiles();
    if (currentFile) {
        files[currentFile] = textArea.innerHTML;
        saveFiles(files);
    }
    currentFile = null;
    editor.classList.add('hidden');
    fileManager.classList.remove('hidden');
    updateFileList();
}

function formatText(command) {
    document.execCommand(command, false, null);
}

function setColor(color) {
    document.execCommand('foreColor', false, color);
}

// 初期表示
updateFileList();

function deleteFile(name) {
    if (!confirm(`"${name}" を削除してもよろしいですか？`)) return;
    const files = getFiles();
    delete files[name];
    saveFiles(files);
    updateFileList();
}

function openEditor(name) {
    currentFile = name;
    const files = getFiles();
    textArea.innerHTML = files[name];

    // ウェブページのタイトルを更新
    document.title = `${name}`;

    fileManager.classList.add('hidden');
    editor.classList.remove('hidden');
}

function goHome() {
    const files = getFiles();
    if (currentFile) {
        files[currentFile] = textArea.innerHTML;
        saveFiles(files);
    }
    currentFile = null;
    editor.classList.add('hidden');
    fileManager.classList.remove('hidden');
    updateFileList();

    // ウェブページのタイトルを「テキストエディタ」に戻す
    document.title = 'ホーム';
}

//音声認識
let recognition;
let recognizing = false;

const languageSelector = document.getElementById('language');
const resultText = document.getElementById('resultText');
const toggleBtn = document.getElementById('toggleBtn');

toggleBtn.addEventListener('click', () => {
    if (!recognizing) {
        startRecognition();
    } else {
        stopRecognition();
    }
});

function startRecognition() {
    const lang = languageSelector.value;

    resultText.value = ''; // 入力欄リセット
    toggleBtn.textContent = '🎤音声認識を中止する';

    recognition = new webkitSpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false; // 単発に変更
    recognition.interimResults = false;

    recognition.onresult = (event) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
        }
    }
    resultText.value = finalTranscript;
    stopRecognition(); // 音声が認識されたら終了
};

recognition.onerror = (e) => {
    console.error("Recognition error:", e);
    stopRecognition();
};

recognition.start();
recognizing = true;
}

function stopRecognition() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    toggleBtn.textContent = '🎤音声認識を開始する';
    recognizing = false;
}



let savedRange = null;

// ボタンを押す前に、現在の選択状態を保存（mousedownの時点では消えない）
pasteBtn.addEventListener('mousedown', () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        savedRange = sel.getRangeAt(0);
    }
});

// クリック時に貼り付け処理を実行
pasteBtn.addEventListener('click', () => {
    const text = resultText.value;
    textArea.focus();

    const sel = window.getSelection();
    sel.removeAllRanges();

    if (savedRange && textArea.contains(savedRange.commonAncestorContainer)) {
        // 保存していた選択範囲が使える場合（選択していた）
        const range = savedRange;
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // 挿入されたテキストを選択
        const newRange = document.createRange();
        newRange.setStartBefore(textNode);
        newRange.setEndAfter(textNode);
        sel.addRange(newRange);
    } else {
        // 選択していなかった場合 → 最後に貼り付け
        const range = document.createRange();
        range.selectNodeContents(textArea);
        range.collapse(false); // 最後にカーソル移動
        sel.addRange(range);

        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // 挿入されたテキストを選択
        const newRange = document.createRange();
        newRange.setStartBefore(textNode);
        newRange.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(newRange);
    }

    // 一度使った範囲はクリア
    savedRange = null;
});