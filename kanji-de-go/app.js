"use strict";

const STORAGE_KEY = "kanji-de-go-learning-data";
const USER_NAME_KEY = "kanjiRushUserName";
const MAX_DAILY_QUESTIONS = 5;
const DEFAULT_TIME_LIMIT = 60;
const SAMPLE_DATA = [
  {
    id: "kanji_001",
    source_date: "2026-06-20",
    source_type: "塾ミニテスト",
    sentence: "母に かんしゃ の気持ちを伝える。",
    reading: "かんしゃ",
    answer: "感謝",
    acceptable_answers: ["感謝"],
    meaning: "ありがたいと思う気持ち",
    wrong_answer: "",
    time_limit_sec: 60,
    review_stage: 0,
    correct_streak: 0,
    miss_count: 1,
    next_review_date: "2026-06-20",
    status: "active"
  },
  {
    id: "kanji_002",
    source_date: "2026-06-20",
    source_type: "塾ミニテスト",
    sentence: "彼は きちょうめん な性格だ。",
    reading: "きちょうめん",
    answer: "几帳面",
    acceptable_answers: ["几帳面"],
    meaning: "細かいところまできちんとすること",
    wrong_answer: "",
    time_limit_sec: 60,
    review_stage: 0,
    correct_streak: 0,
    miss_count: 1,
    next_review_date: "2026-06-20",
    status: "active"
  },
  {
    id: "kanji_003",
    source_date: "2026-06-20",
    source_type: "塾ミニテスト",
    sentence: "自分の考えを てきかく に述べる。",
    reading: "てきかく",
    answer: "的確",
    acceptable_answers: ["的確"],
    meaning: "大事なところを外さず、ぴったり合っていること",
    wrong_answer: "",
    time_limit_sec: 60,
    review_stage: 0,
    correct_streak: 0,
    miss_count: 1,
    next_review_date: "2026-06-20",
    status: "active"
  },
  {
    id: "kanji_004",
    source_date: "2026-06-20",
    source_type: "塾ミニテスト",
    sentence: "祭りの山車は けんらん な飾りで輝いていた。",
    reading: "けんらん",
    answer: "絢爛",
    acceptable_answers: ["絢爛"],
    meaning: "華やかで美しく、きらびやかなこと",
    wrong_answer: "",
    time_limit_sec: 60,
    review_stage: 0,
    correct_streak: 0,
    miss_count: 1,
    next_review_date: "2026-06-20",
    status: "active"
  },
  {
    id: "kanji_005",
    source_date: "2026-06-20",
    source_type: "塾ミニテスト",
    sentence: "毎日の練習を おこたる と力が落ちてしまう。",
    reading: "おこたる",
    answer: "怠る",
    acceptable_answers: ["怠る"],
    meaning: "するべきことをしないでおくこと",
    wrong_answer: "",
    time_limit_sec: 60,
    review_stage: 0,
    correct_streak: 0,
    miss_count: 1,
    next_review_date: "2026-06-20",
    status: "active"
  }
];

const app = document.querySelector("#app");

let learningData = [];
let dailyQuestions = [];
let currentIndex = 0;
let score = 0;
let combo = 0;
let timerId = null;
let questionStartedAt = 0;
let currentTimeLimit = DEFAULT_TIME_LIMIT;
let currentUserName = "";

document.addEventListener("DOMContentLoaded", init);

async function init() {
  learningData = await loadLearningData();
  currentUserName = getStoredUserName();
  if (!currentUserName) {
    renderUserNameSetup();
    return;
  }
  renderHome();
}

function getStoredUserName() {
  return (localStorage.getItem(USER_NAME_KEY) || "").trim();
}

function saveUserName(name) {
  currentUserName = name.trim();
  localStorage.setItem(USER_NAME_KEY, currentUserName);
}

async function loadLearningData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return normalizeRecords(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  let initialData = SAMPLE_DATA;
  if (window.location.protocol !== "file:") {
    try {
      const response = await fetch("data/kanji_mistakes.json", { cache: "no-store" });
      if (response.ok) {
        initialData = await response.json();
      }
    } catch {
      initialData = SAMPLE_DATA;
    }
  }

  const normalized = normalizeRecords(initialData);
  saveLearningData(normalized);
  return normalized;
}

function normalizeRecords(records) {
  return records.map((record, index) => ({
    id: record.id || `kanji_${String(index + 1).padStart(3, "0")}`,
    source_date: record.source_date || todayString(),
    source_type: record.source_type || "塾ミニテスト",
    sentence: record.sentence || "",
    reading: record.reading || "",
    answer: record.answer || "",
    acceptable_answers: Array.isArray(record.acceptable_answers) ? record.acceptable_answers : [],
    meaning: record.meaning || "",
    wrong_answer: record.wrong_answer || "",
    time_limit_sec: Number(record.time_limit_sec) || DEFAULT_TIME_LIMIT,
    review_stage: Number(record.review_stage) || 0,
    correct_streak: Number(record.correct_streak) || 0,
    miss_count: Number(record.miss_count) || 0,
    next_review_date: record.next_review_date || todayString(),
    status: record.status || "active"
  }));
}

function saveLearningData(data = learningData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
}

function todayString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDays(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

function formatLocalDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function getDueQuestions() {
  const today = todayString();
  return learningData
    .filter((item) => item.status === "active" && item.next_review_date <= today)
    .sort((a, b) => {
      const dateCompare = a.next_review_date.localeCompare(b.next_review_date);
      if (dateCompare !== 0) return dateCompare;
      if (b.miss_count !== a.miss_count) return b.miss_count - a.miss_count;
      return a.review_stage - b.review_stage;
    })
    .slice(0, MAX_DAILY_QUESTIONS);
}

function getActiveCount() {
  return learningData.filter((item) => item.status === "active").length;
}

function renderUserNameSetup() {
  stopTimer();
  app.className = "app-shell setup-shell";
  app.innerHTML = `
    <section class="setup-view">
      <div class="title-block">
        <h1>漢字でGO！へようこそ！</h1>
        <p class="tagline">使う人の名前を入力してね。</p>
      </div>

      <form class="name-form" data-action="save-name">
        <label class="answer-label" for="user-name-input">名前</label>
        <input id="user-name-input" class="answer-input" type="text" autocomplete="name" maxlength="20">
        <p id="name-error" class="form-error" role="alert"></p>
        <button class="primary-button" type="submit">はじめる</button>
      </form>
    </section>
  `;

  const input = app.querySelector("#user-name-input");
  input.focus();
  app.querySelector('[data-action="save-name"]').addEventListener("submit", (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) {
      app.querySelector("#name-error").textContent = "名前を入力してね。";
      return;
    }
    saveUserName(name);
    renderHome();
  });
}

function renderHome() {
  stopTimer();
  const dueCount = getDueQuestions().length;
  const userName = escapeHtml(currentUserName);
  app.className = "app-shell home-shell";
  app.innerHTML = `
    <section class="home-view">
      <div class="title-block">
        <p class="eyebrow">${userName}の今日の練習</p>
        <h1>漢字でGO！</h1>
        <p class="tagline">${userName}、今日も漢字を倒そう！</p>
      </div>

      <div class="home-stats" aria-label="今日の状況">
        <div>
          <span class="stat-number">${dueCount}</span>
          <span class="stat-label">今日の対象問題数</span>
        </div>
        <div>
          <span class="stat-number">${getActiveCount()}</span>
          <span class="stat-label">未卒業問題数</span>
        </div>
      </div>

      <div class="home-actions">
        <button class="primary-button" data-action="start">今日の練習を始める</button>
        <button class="secondary-button" data-action="paper">紙テストモード</button>
        <button class="secondary-button" data-action="data">データ管理</button>
      </div>
    </section>
  `;

  app.querySelector('[data-action="start"]').addEventListener("click", startPractice);
  app.querySelector('[data-action="paper"]').addEventListener("click", renderPaperMode);
  app.querySelector('[data-action="data"]').addEventListener("click", renderDataMode);
}

function startPractice() {
  dailyQuestions = getDueQuestions();
  currentIndex = 0;
  score = 0;
  combo = 0;

  if (dailyQuestions.length === 0) {
    renderEmptyPractice();
    return;
  }

  renderQuestion();
}

function renderEmptyPractice() {
  app.className = "app-shell";
  app.innerHTML = `
    <section class="message-view">
      <h1>今日の問題はクリア！</h1>
      <p>次の復習日になったら、また問題が出てくるよ。</p>
      <button class="primary-button" data-action="home">ホームへ戻る</button>
    </section>
  `;
  app.querySelector('[data-action="home"]').addEventListener("click", renderHome);
}

function renderQuestion() {
  stopTimer();
  const question = dailyQuestions[currentIndex];
  currentTimeLimit = question.time_limit_sec || DEFAULT_TIME_LIMIT;
  questionStartedAt = Date.now();
  app.className = "app-shell game-shell";
  app.innerHTML = `
    <section class="game-view">
      <header class="game-hud">
        <div class="timer-box">
          <span>残り時間</span>
          <strong id="timer">${formatTime(currentTimeLimit)}</strong>
        </div>
        <div class="score-box">
          <span>スコア</span>
          <strong>${score}</strong>
        </div>
        <div class="combo-box">
          <span>コンボ</span>
          <strong>${combo}</strong>
        </div>
      </header>

      <p class="question-count">第${currentIndex + 1}問 / 今日の${dailyQuestions.length}問</p>
      <div class="road-scene">
        <div class="lane lane-left"></div>
        <div class="lane lane-right"></div>
        <div class="incoming-reading" style="animation-duration: ${currentTimeLimit}s">${escapeHtml(question.reading)}</div>
      </div>

      <p class="sentence">${highlightReading(question.sentence, question.reading)}</p>

      <label class="answer-label" for="answer-input">答え：</label>
      <input id="answer-input" class="answer-input" type="text" inputmode="text" autocomplete="off" autocapitalize="off">

      <div class="game-actions">
        <button class="primary-button" data-action="judge">判定する</button>
        <button class="ghost-button" data-action="skip">スキップ</button>
      </div>

      <p class="practice-note">ゲームは反復練習用です。週末は紙チャレンジで本当に書けるか確認しよう。</p>
    </section>
  `;

  const input = app.querySelector("#answer-input");
  input.focus();
  app.querySelector('[data-action="judge"]').addEventListener("click", () => judgeAnswer(false));
  app.querySelector('[data-action="skip"]').addEventListener("click", () => judgeAnswer(false, true));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") judgeAnswer(false);
  });

  startTimer();
}

function startTimer() {
  const timerElement = app.querySelector("#timer");
  timerId = window.setInterval(() => {
    const elapsed = Math.floor((Date.now() - questionStartedAt) / 1000);
    const remaining = Math.max(currentTimeLimit - elapsed, 0);
    if (timerElement) timerElement.textContent = formatTime(remaining);
    if (remaining <= 10 && timerElement) timerElement.classList.add("timer-danger");
    if (remaining <= 0) {
      judgeAnswer(true);
    }
  }, 250);
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function judgeAnswer(timedOut, skipped = false) {
  stopTimer();
  const question = dailyQuestions[currentIndex];
  const input = app.querySelector("#answer-input");
  const userAnswer = normalizeAnswer(input ? input.value : "");
  const validAnswers = [question.answer, ...(question.acceptable_answers || [])].map(normalizeAnswer);
  const isCorrect = !timedOut && !skipped && validAnswers.includes(userAnswer);

  updateReview(question.id, isCorrect);
  if (isCorrect) {
    combo += 1;
    score += 100 + combo * 20;
  } else {
    combo = 0;
  }

  renderResult(question, isCorrect, timedOut, skipped);
}

function normalizeAnswer(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function updateReview(id, isCorrect) {
  const today = todayString();
  learningData = learningData.map((item) => {
    if (item.id !== id) return item;

    if (!isCorrect) {
      return {
        ...item,
        review_stage: 0,
        miss_count: item.miss_count + 1,
        correct_streak: 0,
        next_review_date: addDays(today, 1),
        status: "active"
      };
    }

    const nextStage = item.review_stage + 1;
    const intervals = [1, 3, 7, 14, 30];
    if (item.review_stage >= 5 || nextStage >= 6) {
      return {
        ...item,
        review_stage: nextStage,
        correct_streak: item.correct_streak + 1,
        status: "graduated"
      };
    }

    return {
      ...item,
      review_stage: nextStage,
      correct_streak: item.correct_streak + 1,
      next_review_date: addDays(today, intervals[item.review_stage] || 30),
      status: "active"
    };
  });
  saveLearningData();
}

function renderResult(question, isCorrect, timedOut, skipped) {
  const title = isCorrect ? "正解！" : timedOut ? "時間切れ！" : skipped ? "スキップ！" : "ざんねん！";
  const resultClass = isCorrect ? "result-view success" : "result-view retry";
  app.className = `app-shell result-shell ${isCorrect ? "shake-success" : ""}`;
  app.innerHTML = `
    <section class="${resultClass}">
      ${isCorrect ? renderCelebration() : ""}
      <p class="result-kicker">${isCorrect ? "やったね" : "もう一回出るよ"}</p>
      <h1>${title}</h1>
      <div class="answer-card">
        ${isCorrect ? `<p class="big-kanji">${escapeHtml(question.answer)}</p>` : `<p class="correct-answer">正解：<strong>${escapeHtml(question.answer)}</strong></p>`}
        <p class="meaning"><span>意味：</span>${escapeHtml(question.meaning)}</p>
      </div>
      <div class="result-actions">
        <button class="primary-button" data-action="next">次の問題へ</button>
        <button class="secondary-button" data-action="home">ホームへ戻る</button>
      </div>
    </section>
  `;

  app.querySelector('[data-action="next"]').addEventListener("click", nextQuestion);
  app.querySelector('[data-action="home"]').addEventListener("click", renderHome);
}

function renderCelebration() {
  const stars = Array.from({ length: 14 }, (_, index) => `<span class="confetti star-${index + 1}">★</span>`).join("");
  return `<div class="boom" aria-hidden="true"></div><div class="confetti-field" aria-hidden="true">${stars}</div>`;
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= dailyQuestions.length) {
    renderSessionComplete();
    return;
  }
  renderQuestion();
}

function renderSessionComplete() {
  app.className = "app-shell";
  app.innerHTML = `
    <section class="message-view">
      <h1>今日の練習、おしまい！</h1>
      <p>スコアは <strong>${score}</strong> 点。復習データも保存したよ。</p>
      <button class="primary-button" data-action="home">ホームへ戻る</button>
    </section>
  `;
  app.querySelector('[data-action="home"]').addEventListener("click", renderHome);
}

function renderPaperMode() {
  stopTimer();
  const questions = getDueQuestions();
  app.className = "app-shell paper-shell";
  app.innerHTML = `
    <section class="paper-view">
      <nav class="screen-nav">
        <button class="ghost-button" data-action="home">ホームへ戻る</button>
      </nav>
      <h1>今日の紙チャレンジ</h1>
      <ol class="paper-list">
        ${questions.map((question) => `<li>${highlightReading(question.sentence, question.reading)}</li>`).join("") || "<li>今日の対象問題はありません。</li>"}
      </ol>
      <div class="paper-actions">
        <button class="primary-button" data-action="answers">答えを表示する</button>
        <button class="secondary-button" data-action="print">印刷する</button>
      </div>
      <section id="paper-answers" class="answer-list" hidden>
        <h2>答え</h2>
        <ol>
          ${questions.map((question) => `<li>${escapeHtml(question.answer)}</li>`).join("")}
        </ol>
      </section>
    </section>
  `;
  app.querySelector('[data-action="home"]').addEventListener("click", renderHome);
  app.querySelector('[data-action="answers"]').addEventListener("click", () => {
    app.querySelector("#paper-answers").hidden = false;
  });
  app.querySelector('[data-action="print"]').addEventListener("click", () => window.print());
}

function renderDataMode() {
  stopTimer();
  const userName = escapeHtml(currentUserName);
  app.className = "app-shell data-shell";
  app.innerHTML = `
    <section class="data-view">
      <nav class="screen-nav">
        <button class="ghost-button" data-action="home">ホームへ戻る</button>
      </nav>
      <h1>データ管理</h1>
      <p>今の学習データを保存したり、サンプル状態に戻したりできます。</p>

      <form class="name-edit" data-action="change-name">
        <label class="answer-label" for="data-user-name">ユーザー名</label>
        <input id="data-user-name" class="name-input" type="text" value="${userName}" autocomplete="name" maxlength="20">
        <button class="secondary-button" type="submit">変更する</button>
      </form>

      <div class="data-actions">
        <button class="primary-button" data-action="export">JSONをエクスポート</button>
        <label class="file-import">
          JSONをインポート
          <input type="file" accept="application/json,.json" data-action="import">
        </label>
        <button class="danger-button" data-action="reset">学習データをサンプルに戻す</button>
        <button class="danger-button" data-action="reset-all">全データを初期化</button>
      </div>
      <textarea id="export-box" class="export-box" readonly aria-label="エクスポートJSON"></textarea>
      <p id="data-message" class="data-message"></p>
    </section>
  `;

  app.querySelector('[data-action="home"]').addEventListener("click", renderHome);
  app.querySelector('[data-action="change-name"]').addEventListener("submit", changeUserName);
  app.querySelector('[data-action="export"]').addEventListener("click", exportData);
  app.querySelector('[data-action="reset"]').addEventListener("click", resetData);
  app.querySelector('[data-action="reset-all"]').addEventListener("click", resetAllData);
  app.querySelector('[data-action="import"]').addEventListener("change", importData);
}

function changeUserName(event) {
  event.preventDefault();
  const input = app.querySelector("#data-user-name");
  const name = input.value.trim();
  if (!name) {
    setDataMessage("ユーザー名を入力してください。");
    return;
  }
  saveUserName(name);
  setDataMessage("ユーザー名を変更しました。");
}

function exportData() {
  const box = app.querySelector("#export-box");
  box.value = JSON.stringify(learningData, null, 2);
  box.focus();
  box.select();

  const blob = new Blob([box.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kanji-de-go-${todayString()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setDataMessage("JSONを書き出しました。");
}

function resetData() {
  learningData = normalizeRecords(SAMPLE_DATA);
  saveLearningData();
  setDataMessage("学習データをサンプルデータに戻しました。ユーザー名はそのままです。");
}

function resetAllData() {
  if (!window.confirm("学習データとユーザー名をすべて初期化しますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  learningData = normalizeRecords(SAMPLE_DATA);
  saveLearningData();
  currentUserName = "";
  renderUserNameSetup();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = normalizeRecords(JSON.parse(reader.result));
      learningData = imported;
      saveLearningData();
      setDataMessage("JSONを読み込みました。");
    } catch {
      setDataMessage("JSONを読み込めませんでした。形式を確認してください。");
    }
  });
  reader.readAsText(file);
}

function setDataMessage(message) {
  const element = app.querySelector("#data-message");
  if (element) element.textContent = message;
}

function highlightReading(sentence, reading) {
  const safeSentence = escapeHtml(sentence);
  const safeReading = escapeHtml(reading);
  return safeSentence.replaceAll(safeReading, `<strong class="reading-mark">${safeReading}</strong>`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
