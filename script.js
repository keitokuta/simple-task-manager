// タスク管理アプリのメインスクリプト

// グローバル変数
let tasks = [];
let editingTaskIndex = -1;

// DOM要素の取得
const taskList = document.getElementById("taskList");
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const editDialog = document.getElementById("editDialog");
const editTaskInput = document.getElementById("editTaskInput");
const saveTaskButton = document.getElementById("saveTaskButton");
const cancelTaskButton = document.getElementById("cancelTaskButton");

// ページ読み込み時の初期化
document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    updateTaskList();
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    // タスク追加ボタンのクリックイベント
    addTaskButton.addEventListener("click", addTask);

    // 入力フィールドでEnterキーを押した時のイベント
    taskInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            addTask();
        }
    });

    // 編集ダイアログの保存ボタン
    saveTaskButton.addEventListener("click", saveEditedTask);

    // 編集ダイアログのキャンセルボタン
    cancelTaskButton.addEventListener("click", cancelEdit);

    // 編集ダイアログの入力フィールドでEnterキーを押した時
    editTaskInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            saveEditedTask();
        }
    });

    // 編集ダイアログの背景をクリックした時に閉じる
    editDialog.addEventListener("click", function (e) {
        if (e.target === editDialog) {
            cancelEdit();
        }
    });
}

// ローカルストレージからタスクを読み込む
function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (e) {
            console.error("タスクデータの読み込みに失敗しました:", e);
            tasks = [];
        }
    } else {
        tasks = [];
    }
}

// ローカルストレージにタスクを保存する
function saveTasks() {
    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (e) {
        console.error("タスクデータの保存に失敗しました:", e);
        alert("タスクの保存に失敗しました。ブラウザの容量を確認してください。");
    }
}

// タスクを追加する
function addTask() {
    const taskName = taskInput.value.trim();

    // 入力値の検証
    if (taskName === "") {
        alert("タスク名を入力してください。");
        taskInput.focus();
        return;
    }

    if (taskName.length > 100) {
        alert("タスク名は100文字以内で入力してください。");
        taskInput.focus();
        return;
    }

    // 重複チェック
    if (tasks.includes(taskName)) {
        alert("同じ名前のタスクが既に存在します。");
        taskInput.focus();
        return;
    }

    // タスクを配列に追加
    tasks.push(taskName);

    // ローカルストレージに保存
    saveTasks();

    // 入力フィールドをクリア
    taskInput.value = "";

    // タスク一覧を更新
    updateTaskList();

    // 入力フィールドにフォーカスを戻す
    taskInput.focus();

    console.log("タスクが追加されました:", taskName);
}

// タスク一覧を更新する
function updateTaskList() {
    // タスクリストをクリア
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        // タスクが空の場合のメッセージを表示
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "タスクがありません。新しいタスクを追加してください。";
        taskList.appendChild(emptyMessage);
        return;
    }

    // 各タスクを表示
    tasks.forEach((task, index) => {
        const listItem = document.createElement("li");
        listItem.className = "task-item";

        // タスク名の表示
        const taskNameSpan = document.createElement("span");
        taskNameSpan.className = "task-name";
        taskNameSpan.textContent = task;
        taskNameSpan.addEventListener("click", () => editTask(index));

        // ボタンコンテナ
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "task-buttons";

        // 編集ボタン
        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "編集";
        editButton.addEventListener("click", () => editTask(index));

        // 削除ボタン
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "削除";
        deleteButton.addEventListener("click", () => deleteTask(index));

        // 要素を組み立て
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        listItem.appendChild(taskNameSpan);
        listItem.appendChild(buttonContainer);
        taskList.appendChild(listItem);
    });

    console.log("タスク一覧が更新されました。現在のタスク数:", tasks.length);
}

// タスクを編集する
function editTask(index) {
    if (index < 0 || index >= tasks.length) {
        console.error("無効なタスクインデックス:", index);
        return;
    }

    editingTaskIndex = index;
    editTaskInput.value = tasks[index];
    editDialog.style.display = "flex";
    editTaskInput.focus();
    editTaskInput.select();

    console.log("タスクの編集を開始:", tasks[index]);
}

// 編集されたタスクを保存する
function saveEditedTask() {
    const newTaskName = editTaskInput.value.trim();

    // 入力値の検証
    if (newTaskName === "") {
        alert("タスク名を入力してください。");
        editTaskInput.focus();
        return;
    }

    if (newTaskName.length > 100) {
        alert("タスク名は100文字以内で入力してください。");
        editTaskInput.focus();
        return;
    }

    // 重複チェック（編集中のタスク以外）
    const isDuplicate = tasks.some((task, index) => index !== editingTaskIndex && task === newTaskName);

    if (isDuplicate) {
        alert("同じ名前のタスクが既に存在します。");
        editTaskInput.focus();
        return;
    }

    // 変更がない場合
    if (tasks[editingTaskIndex] === newTaskName) {
        cancelEdit();
        return;
    }

    // タスクを更新
    const oldTaskName = tasks[editingTaskIndex];
    tasks[editingTaskIndex] = newTaskName;

    // ローカルストレージに保存
    saveTasks();

    // ダイアログを閉じる
    editDialog.style.display = "none";
    editingTaskIndex = -1;

    // タスク一覧を更新
    updateTaskList();

    console.log("タスクが更新されました:", oldTaskName, "->", newTaskName);
}

// タスクの編集をキャンセルする
function cancelEdit() {
    editDialog.style.display = "none";
    editingTaskIndex = -1;
    editTaskInput.value = "";

    console.log("タスクの編集がキャンセルされました");
}

// タスクを削除する
function deleteTask(index) {
    if (index < 0 || index >= tasks.length) {
        console.error("無効なタスクインデックス:", index);
        return;
    }

    const taskName = tasks[index];

    // 削除確認
    if (confirm(`「${taskName}」を削除しますか？`)) {
        // タスクを配列から削除
        tasks.splice(index, 1);

        // ローカルストレージに保存
        saveTasks();

        // タスク一覧を更新
        updateTaskList();

        console.log("タスクが削除されました:", taskName);
    }
}

// デバッグ用：すべてのタスクを表示
function showAllTasks() {
    console.log("現在のタスク一覧:", tasks);
    return tasks;
}

// デバッグ用：すべてのタスクを削除
function clearAllTasks() {
    if (confirm("すべてのタスクを削除しますか？この操作は取り消せません。")) {
        tasks = [];
        saveTasks();
        updateTaskList();
        console.log("すべてのタスクが削除されました");
    }
}

// エラーハンドリング
window.addEventListener("error", function (e) {
    console.error("JavaScriptエラーが発生しました:", e.error);
});

// ローカルストレージの容量チェック（デバッグ用）
function checkStorageUsage() {
    const tasksData = localStorage.getItem("tasks");
    const dataSize = tasksData ? tasksData.length : 0;
    console.log("ローカルストレージ使用量:", dataSize, "バイト");
    console.log("タスクデータ:", tasksData);
}
