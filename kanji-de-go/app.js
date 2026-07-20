"use strict";

const APP_VERSION = "2026.07.20.2";

const STORAGE_KEY = "kanji-de-go-learning-data";
const USER_NAME_KEY = "kanjiRushUserName";
const RETRY_STORAGE_KEY = "kanji-de-go-today-retry";
const DAILY_COMPLETED_KEY = "kanji-de-go-daily-completed-date";
const DAILY_ADVENTURE_KEY = "kanji-de-go-daily-adventure";
const DAILY_TREASURE_KEY = "kanji-de-go-daily-treasure";
const CSV_SOURCE_PATHS = ["kanji-mistakes.csv", "data/kanji-mistakes.csv"];
const MAX_DAILY_QUESTIONS = 5;
const DEFAULT_TIME_LIMIT = 60;
const MAX_ANSWER_ATTEMPTS = 3;
const TREASURE_CARDS = [
  { id: "kotowaza_001", title: "継続は力なり", reading: "けいぞくはちからなり", meaning: "こつこつ続けると、大きな力になるということ。", comment: "今日もクリア、えらい！" },
  { id: "kotowaza_002", title: "塵も積もれば山となる", reading: "ちりもつもればやまとなる", meaning: "小さなことでも、積み重なると大きなものになるということ。", comment: "毎日の5問が力になるよ！" },
  { id: "kotowaza_003", title: "急がば回れ", reading: "いそがばまわれ", meaning: "急ぐときほど、安全で確かな方法を選ぶ方がよいということ。", comment: "ていねいに思い出せたね！" },
  { id: "kotowaza_004", title: "七転び八起き", reading: "ななころびやおき", meaning: "何度失敗しても、くじけずに立ち上がること。", comment: "リトライする力も大切！" },
  { id: "kotowaza_005", title: "石の上にも三年", reading: "いしのうえにもさんねん", meaning: "つらくても続けていれば、やがて成果が出るということ。", comment: "続けた分だけ強くなるよ！" },
  { id: "kotowaza_006", title: "好きこそ物の上手なれ", reading: "すきこそもののじょうずなれ", meaning: "好きなことは熱心に取り組めるので、上達しやすいということ。", comment: "楽しみながら進もう！" },
  { id: "kotowaza_007", title: "失敗は成功のもと", reading: "しっぱいはせいこうのもと", meaning: "失敗から学ぶことで、次の成功につながるということ。", comment: "間違いも力に変えられたね！" },
  { id: "kotowaza_008", title: "千里の道も一歩から", reading: "せんりのみちもいっぽから", meaning: "大きな目標も、まず小さな一歩から始まるということ。", comment: "今日の5問も大事な一歩！" },
  { id: "kotowaza_009", title: "習うより慣れよ", reading: "ならうよりなれよ", meaning: "説明を聞くだけでなく、実際に何度もやることが大切だということ。", comment: "今日もしっかり練習できたね！" },
  { id: "kotowaza_010", title: "為せば成る", reading: "なせばなる", meaning: "強い気持ちで取り組めば、やりとげられるということ。", comment: "最後までやりきったね！" },
  { id: "kotowaza_011", title: "雨垂れ石を穿つ", reading: "あまだれいしをうがつ", meaning: "小さな努力でも、長く続ければ大きな成果になるということ。", comment: "少しずつでも確実に前進！" },
  { id: "kotowaza_012", title: "聞くは一時の恥、聞かぬは一生の恥", reading: "きくはいっときのはじ、きかぬはいっしょうのはじ", meaning: "分からないことは、そのままにせず尋ねる方がよいということ。", comment: "分からない字も一つずつ解決しよう！" }
];
const IS_TEST_MODE =
  window.location.pathname.endsWith("test.html") ||
  new URLSearchParams(window.location.search).get("mode") === "test";
const CSV_COLUMNS = [
  "id",
  "source_date",
  "source_type",
  "sentence",
  "reading",
  "answer",
  "acceptable_answers",
  "meaning",
  "wrong_answer",
  "mistake_type",
  "time_limit_sec"
];
const REQUIRED_CSV_COLUMNS = ["id", "source_date", "source_type", "sentence", "reading", "answer", "meaning"];
const MASTER_FIELDS = [
  "source_date",
  "source_type",
  "sentence",
  "reading",
  "answer",
  "acceptable_answers",
  "meaning",
  "wrong_answer",
  "mistake_type",
  "time_limit_sec"
];
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
let currentQuestionEntry = null;
let retryQueue = [];
let retryAttemptsById = {};
let retryQuestionCounter = 0;
let correctCount = 0;
let retrySuccessCount = 0;
let tomorrowReviewIds = new Set();
let score = 0;
let combo = 0;
let timerId = null;
let questionStartedAt = 0;
let currentTimeLimit = DEFAULT_TIME_LIMIT;
let currentUserName = "";
let startupCsvMessage = "";
let testRetryState = null;
let testDailyCompletedDate = "";
let testDailyAdventureState = null;
let testDailyTreasureState = null;
let isAnimating = false;
let currentAttemptCount = 0;
let currentQuestionHadRetry = false;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  if (IS_TEST_MODE) {
    document.body.classList.add("test-mode");
  }
  learningData = await loadLearningData();
  currentUserName = getStoredUserName();
  if (!currentUserName) {
    renderUserNameSetup();
    return;
  }
  renderHome();
}

function getStoredUserName() {
  if (IS_TEST_MODE) return "テスト";
  return (localStorage.getItem(USER_NAME_KEY) || "").trim();
}

function saveUserName(name) {
  currentUserName = name.trim();
  if (IS_TEST_MODE) return;
  localStorage.setItem(USER_NAME_KEY, currentUserName);
}

async function loadLearningData() {
  const savedData = loadSavedLearningData();
  const csvResult = await loadCsvMasterRecords({ forStartup: true });

  if (csvResult.ok) {
    const merged = mergeMasterRecords(savedData, csvResult.records);
    saveLearningData(merged.data);
    return merged.data;
  }

  startupCsvMessage = "CSVファイルは自動読込できませんでした。貼り付けインポートは利用できます。";

  if (savedData.length > 0) {
    return savedData;
  }

  const normalized = normalizeRecords(SAMPLE_DATA);
  saveLearningData(normalized);
  return normalized;
}

function loadSavedLearningData() {
  if (IS_TEST_MODE) return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return normalizeRecords(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return [];
}

async function loadCsvMasterRecords({ forStartup = false } = {}) {
  const failureMessage = forStartup
    ? "CSVファイルは自動読込できませんでした。貼り付けインポートは利用できます。"
    : "CSVファイルを読み込めませんでした。";
  if (window.location.protocol === "file:") {
    return { ok: false, records: [], errors: [failureMessage] };
  }

  for (const path of CSV_SOURCE_PATHS) {
    try {
      const response = await fetch(`${path}?v=${encodeURIComponent(APP_VERSION)}`, { cache: "no-store" });
      if (!response.ok) continue;
      const text = await response.text();
      const result = csvTextToRecords(text);
      if (result.ok) return result;
      return result;
    } catch {
      // Try the next CSV source.
    }
  }

  return { ok: false, records: [], errors: [failureMessage] };
}

function mergeMasterRecords(existingRecords, masterRecords) {
  const existingById = new Map(normalizeRecords(existingRecords).map((record) => [record.id, record]));
  const mergedIds = new Set();
  let newCount = 0;
  let updateCount = 0;
  const mergedMasters = normalizeMasterRecords(masterRecords).map((masterRecord) => {
    const existing = existingById.get(masterRecord.id);
    mergedIds.add(masterRecord.id);
    if (!existing) {
      newCount += 1;
      return masterRecord;
    }

    const merged = { ...existing };
    MASTER_FIELDS.forEach((field) => {
      merged[field] = masterRecord[field];
    });
    updateCount += 1;
    return normalizeRecords([merged])[0];
  });

  const localOnly = normalizeRecords(existingRecords).filter((record) => !mergedIds.has(record.id));
  return {
    data: [...mergedMasters, ...localOnly],
    newCount,
    updateCount,
    skipCount: localOnly.length
  };
}

function normalizeMasterRecords(records) {
  return normalizeRecords(records).map((record) => ({
    ...record,
    review_stage: 0,
    correct_streak: 0,
    miss_count: 1,
    next_review_date: record.source_date || todayString(),
    status: "active"
  }));
}

function csvTextToRecords(csvText) {
  const trimmedText = String(csvText || "").trim();
  if (!trimmedText) {
    return { ok: false, records: [], errors: ["CSVが空です。ヘッダー行とデータ行を貼り付けてください。"], skipped: 0 };
  }

  const rows = parseCsv(trimmedText);
  if (rows.length < 2) {
    return { ok: false, records: [], errors: ["CSVが空です。ヘッダー行とデータ行を貼り付けてください。"], skipped: 0 };
  }

  const headers = rows[0].map((header) => normalizeCsvCell(header));
  if (!isOfficialCsvHeader(headers)) {
    return {
      ok: false,
      records: [],
      errors: ["CSVヘッダーを確認してください。必要な列：id, source_date, source_type, sentence, reading, answer, meaning"],
      skipped: 0
    };
  }

  const records = [];
  const seenIds = new Set();
  let skipped = 0;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (!row.some((cell) => String(cell).trim() !== "")) {
      skipped += 1;
      continue;
    }

    const lineNumber = rowIndex + 1;
    const record = {};
    CSV_COLUMNS.forEach((column, index) => {
      record[column] = normalizeCsvCell(row[index] ?? "");
    });

    const error = validateCsvRecord(record, lineNumber, seenIds);
    if (error) {
      return { ok: false, records: [], errors: [error], skipped };
    }

    seenIds.add(record.id);
    records.push(normalizeMasterRecord(record));
  }

  if (records.length === 0) {
    return { ok: false, records: [], errors: ["CSVが空です。ヘッダー行とデータ行を貼り付けてください。"], skipped };
  }

  return { ok: true, records, errors: [], skipped };
}

function isOfficialCsvHeader(headers) {
  return CSV_COLUMNS.length === headers.length && CSV_COLUMNS.every((column, index) => column === headers[index]);
}

function normalizeCsvCell(value) {
  return String(value || "").replace(/^\uFEFF/, "").trim();
}

function validateCsvRecord(record, lineNumber, seenIds) {
  for (const column of REQUIRED_CSV_COLUMNS) {
    if (!record[column]) {
      return `${lineNumber}行目：${column} が空欄です。`;
    }
  }

  if (seenIds.has(record.id)) {
    return `${lineNumber}行目：id が重複しています。${record.id}`;
  }

  const normalizedDate = normalizeCsvDate(record.source_date);
  if (!normalizedDate) {
    return `${lineNumber}行目：source_date の形式を確認してください。`;
  }

  return "";
}

function normalizeMasterRecord(record) {
  return {
    ...record,
    source_date: normalizeCsvDate(record.source_date) || todayString(),
    acceptable_answers: normalizeAcceptableAnswers(record.acceptable_answers, record.answer),
    time_limit_sec: Number(record.time_limit_sec) || DEFAULT_TIME_LIMIT
  };
}

function normalizeCsvDate(value) {
  const text = String(value || "").trim();
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) {
    match = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  }
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return "";
  }
  return formatLocalDate(date);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function recordsToCsv(records) {
  const lines = [CSV_COLUMNS.join(",")];
  normalizeRecords(records).forEach((record) => {
    lines.push(CSV_COLUMNS.map((column) => csvEscape(formatCsvValue(record[column]))).join(","));
  });
  return lines.join("\r\n");
}

function formatCsvValue(value) {
  if (Array.isArray(value)) return value.join("、");
  return value ?? "";
}

function csvEscape(value) {
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function normalizeRecords(records) {
  return records.map((record, index) => ({
    id: record.id || `kanji_${String(index + 1).padStart(3, "0")}`,
    source_date: record.source_date || todayString(),
    source_type: record.source_type || "塾ミニテスト",
    sentence: record.sentence || "",
    reading: record.reading || "",
    answer: record.answer || "",
    acceptable_answers: normalizeAcceptableAnswers(record.acceptable_answers, record.answer),
    meaning: record.meaning || "",
    wrong_answer: record.wrong_answer || "",
    mistake_type: record.mistake_type || "",
    time_limit_sec: Number(record.time_limit_sec) || DEFAULT_TIME_LIMIT,
    review_stage: Number(record.review_stage) || 0,
    correct_streak: Number(record.correct_streak) || 0,
    miss_count: Number(record.miss_count) || 0,
    next_review_date: record.next_review_date || todayString(),
    status: record.status || "active",
    last_had_retry: isTruthyValue(record.last_had_retry),
    retry_miss_count: Number(record.retry_miss_count) || 0
  }));
}

function normalizeAcceptableAnswers(value, answer) {
  if (Array.isArray(value)) {
    const answers = value.map((item) => String(item).trim()).filter(Boolean);
    return answers.length > 0 ? answers : [answer].filter(Boolean);
  }

  const answers = String(value || "")
    .split(/[,|;、]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return answers.length > 0 ? answers : [answer].filter(Boolean);
}

function buildCompactSaveData() {
  const progress = {};
  const currentRecords = loadSavedLearningData();
  normalizeRecords(currentRecords.length > 0 ? currentRecords : learningData).forEach((record) => {
    if (!hasNonInitialProgress(record)) return;
    progress[record.id] = [
      record.review_stage,
      record.correct_streak,
      record.miss_count,
      record.next_review_date,
      statusToCode(record.status)
    ];
  });

  return {
    v: 1,
    u: currentUserName || getStoredUserName(),
    p: progress
  };
}

function hasNonInitialProgress(record) {
  return !(
    record.review_stage === 0 &&
    record.correct_streak === 0 &&
    record.miss_count === 1 &&
    record.next_review_date === record.source_date &&
    record.status === "active"
  );
}

function statusToCode(status) {
  return status === "graduated" ? 1 : 0;
}

function codeToStatus(code) {
  return Number(code) === 1 ? "graduated" : "active";
}

function applyCompactSaveData(saveData) {
  if (IS_TEST_MODE) {
    throw new Error("Import is disabled in test mode");
  }

  if (!saveData || saveData.v !== 1 || typeof saveData.p !== "object" || saveData.p === null) {
    throw new Error("Unsupported save data");
  }

  if (typeof saveData.u === "string" && saveData.u.trim()) {
    saveUserName(saveData.u.trim());
  }

  const progressById = saveData.p;
  const currentRecords = loadSavedLearningData();
  learningData = normalizeRecords(currentRecords.length > 0 ? currentRecords : learningData).map((record) => {
    const progress = progressById[record.id];
    if (!Array.isArray(progress)) return record;

    return {
      ...record,
      review_stage: Number(progress[0]) || 0,
      correct_streak: Number(progress[1]) || 0,
      miss_count: Number(progress[2]) || 0,
      next_review_date: String(progress[3] || record.next_review_date || record.source_date || todayString()),
      status: codeToStatus(progress[4])
    };
  });
  saveLearningData();
}

function importLegacyFullData(records) {
  if (IS_TEST_MODE) return;
  learningData = normalizeRecords(records);
  saveLearningData();
}

function saveLearningData(data = learningData) {
  if (IS_TEST_MODE) {
    learningData = normalizeRecords(data);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
}

function todayString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getDailyCompletedDate() {
  if (IS_TEST_MODE) return testDailyCompletedDate;
  return localStorage.getItem(DAILY_COMPLETED_KEY) || "";
}

function getEmptyDailyAdventureState() {
  return {
    date: todayString(),
    completedCount: 0,
    normalSetFinished: false
  };
}

function loadDailyAdventureState() {
  if (IS_TEST_MODE) {
    if (!testDailyAdventureState || testDailyAdventureState.date !== todayString()) {
      testDailyAdventureState = getEmptyDailyAdventureState();
    }
    return { ...testDailyAdventureState };
  }

  const saved = localStorage.getItem(DAILY_ADVENTURE_KEY);
  if (!saved) return getEmptyDailyAdventureState();
  try {
    const state = JSON.parse(saved);
    if (state.date !== todayString()) return getEmptyDailyAdventureState();
    return {
      date: state.date,
      completedCount: Math.min(Math.max(Number(state.completedCount) || 0, 0), MAX_DAILY_QUESTIONS),
      normalSetFinished: Boolean(state.normalSetFinished)
    };
  } catch {
    localStorage.removeItem(DAILY_ADVENTURE_KEY);
    return getEmptyDailyAdventureState();
  }
}

function saveDailyAdventureState(state) {
  const cleanState = {
    date: todayString(),
    completedCount: Math.min(Math.max(Number(state.completedCount) || 0, 0), MAX_DAILY_QUESTIONS),
    normalSetFinished: Boolean(state.normalSetFinished)
  };
  if (IS_TEST_MODE) {
    testDailyAdventureState = cleanState;
    return;
  }
  localStorage.setItem(DAILY_ADVENTURE_KEY, JSON.stringify(cleanState));
}

function getEmptyDailyTreasureState() {
  return {
    date: todayString(),
    cardId: "",
    shownDate: ""
  };
}

function loadDailyTreasureState() {
  if (IS_TEST_MODE) {
    if (!testDailyTreasureState || testDailyTreasureState.date !== todayString()) {
      testDailyTreasureState = getEmptyDailyTreasureState();
    }
    return { ...testDailyTreasureState };
  }

  const saved = localStorage.getItem(DAILY_TREASURE_KEY);
  if (!saved) return getEmptyDailyTreasureState();
  try {
    const state = JSON.parse(saved);
    if (state.date !== todayString()) return getEmptyDailyTreasureState();
    return {
      date: state.date,
      cardId: String(state.cardId || ""),
      shownDate: String(state.shownDate || "")
    };
  } catch {
    localStorage.removeItem(DAILY_TREASURE_KEY);
    return getEmptyDailyTreasureState();
  }
}

function saveDailyTreasureState(state) {
  const cleanState = {
    date: todayString(),
    cardId: String(state.cardId || ""),
    shownDate: String(state.shownDate || "")
  };
  if (IS_TEST_MODE) {
    testDailyTreasureState = cleanState;
    return;
  }
  localStorage.setItem(DAILY_TREASURE_KEY, JSON.stringify(cleanState));
}

function getOrCreateDailyTreasure() {
  const state = loadDailyTreasureState();
  let card = TREASURE_CARDS.find((item) => item.id === state.cardId);
  if (!card) {
    card = TREASURE_CARDS[Math.floor(Math.random() * TREASURE_CARDS.length)];
    state.cardId = card.id;
    saveDailyTreasureState(state);
  }
  return { state, card };
}

function resetDailyTreasureShown({ chooseNewCard = false } = {}) {
  const state = loadDailyTreasureState();
  state.shownDate = "";
  if (chooseNewCard) state.cardId = "";
  saveDailyTreasureState(state);
}

function clearDailyTreasureState() {
  if (IS_TEST_MODE) {
    testDailyTreasureState = null;
    return;
  }
  localStorage.removeItem(DAILY_TREASURE_KEY);
}

function recordDailyNormalQuestionCompleted(normalSetFinished) {
  const state = loadDailyAdventureState();
  state.completedCount = Math.min(state.completedCount + 1, MAX_DAILY_QUESTIONS);
  state.normalSetFinished = state.normalSetFinished || normalSetFinished || state.completedCount >= MAX_DAILY_QUESTIONS;
  saveDailyAdventureState(state);
}

function isDailyPracticeCompleted() {
  return getDailyCompletedDate() === todayString();
}

function markDailyPracticeCompleted() {
  const today = todayString();
  saveDailyAdventureState({
    date: today,
    completedCount: MAX_DAILY_QUESTIONS,
    normalSetFinished: true
  });
  if (IS_TEST_MODE) {
    testDailyCompletedDate = today;
    return;
  }
  localStorage.setItem(DAILY_COMPLETED_KEY, today);
}

function clearDailyPracticeCompleted() {
  if (IS_TEST_MODE) {
    testDailyCompletedDate = "";
    testDailyAdventureState = null;
    testDailyTreasureState = null;
    return;
  }
  localStorage.removeItem(DAILY_COMPLETED_KEY);
  localStorage.removeItem(DAILY_ADVENTURE_KEY);
  localStorage.removeItem(DAILY_TREASURE_KEY);
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
  if (IS_TEST_MODE) {
    return learningData.filter((item) => item.status === "active").slice(0, MAX_DAILY_QUESTIONS);
  }

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

function isTruthyValue(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function getKanjiCardDisplayStatus(record) {
  if (record.status === "graduated") {
    return "graduated";
  }

  const nextReviewDate = String(record.next_review_date || record.source_date || "");
  const isReviewDue = nextReviewDate ? nextReviewDate <= todayString() : true;
  const hadRetry = isTruthyValue(record.last_had_retry);
  const retryMissCount = Number(record.retry_miss_count || 0);
  const missCount = Number(record.miss_count || 0);

  if (hadRetry || retryMissCount > 0 || missCount >= 2 || isReviewDue) {
    return "weak";
  }

  return "learning";
}

function getKanjiCardStatusMeta(status) {
  const meta = {
    weak: { label: "あやしい", className: "is-weak" },
    learning: { label: "練習中", className: "is-learning" },
    graduated: { label: "卒業", className: "is-graduated" }
  };
  return meta[status] || meta.learning;
}

function getKanjiCardStatusLabel(status) {
  return getKanjiCardStatusMeta(status).label;
}

function getKanjiCardCounts(records = learningData) {
  return records.reduce((counts, record) => {
    const status = getKanjiCardDisplayStatus(record);
    counts[status] = (counts[status] || 0) + 1;
    counts.all += 1;
    return counts;
  }, { weak: 0, learning: 0, graduated: 0, all: 0 });
}

function getDefaultKanjiCardFilter() {
  const counts = getKanjiCardCounts();
  if (counts.weak > 0) return "weak";
  if (counts.learning > 0) return "learning";
  return "all";
}

function filterKanjiCards(records, filter) {
  return records
    .map((record) => ({ record, displayStatus: getKanjiCardDisplayStatus(record) }))
    .filter((item) => filter === "all" || item.displayStatus === filter);
}

function sortKanjiCards(items, filter) {
  const statusOrder = { weak: 0, learning: 1, graduated: 2 };
  const byDate = (a, b) => String(a.record.next_review_date || "").localeCompare(String(b.record.next_review_date || ""));
  const byAnswer = (a, b) => String(a.record.answer || a.record.id).localeCompare(String(b.record.answer || b.record.id), "ja");
  const byId = (a, b) => String(a.record.id || "").localeCompare(String(b.record.id || ""));
  const weakSort = (a, b) =>
    byDate(a, b) ||
    Number(b.record.retry_miss_count || 0) - Number(a.record.retry_miss_count || 0) ||
    Number(b.record.miss_count || 0) - Number(a.record.miss_count || 0) ||
    Number(a.record.review_stage || 0) - Number(b.record.review_stage || 0) ||
    byId(a, b);
  const learningSort = (a, b) =>
    byDate(a, b) ||
    Number(a.record.review_stage || 0) - Number(b.record.review_stage || 0) ||
    byId(a, b);
  const graduatedSort = (a, b) => byAnswer(a, b) || byId(a, b);

  return [...items].sort((a, b) => {
    if (filter === "weak") return weakSort(a, b);
    if (filter === "learning") return learningSort(a, b);
    if (filter === "graduated") return graduatedSort(a, b);
    if (a.displayStatus !== b.displayStatus) {
      return statusOrder[a.displayStatus] - statusOrder[b.displayStatus];
    }
    if (a.displayStatus === "weak") return weakSort(a, b);
    if (a.displayStatus === "learning") return learningSort(a, b);
    return graduatedSort(a, b);
  });
}

function getKanjiCardEmptyMessage(filter) {
  const messages = {
    weak: "あやしい漢字はありません。今日もいい調子！",
    learning: "練習中の漢字はありません。新しい問題を追加したら、ここに出てくるよ。",
    graduated: "卒業した漢字はまだありません。こつこつ続けよう！",
    all: "漢字カードはまだありません。CSVから問題を読み込んでください。"
  };
  return messages[filter] || messages.all;
}

function getQuestionById(id) {
  return learningData.find((item) => item.id === id);
}

function getEmptyRetryState() {
  return {
    date: todayString(),
    pendingIds: [],
    attemptsById: {},
    tomorrowIds: []
  };
}

function loadRetryState() {
  if (IS_TEST_MODE) {
    return testRetryState ? cloneRetryState(testRetryState) : getEmptyRetryState();
  }

  const saved = localStorage.getItem(RETRY_STORAGE_KEY);
  if (!saved) return getEmptyRetryState();

  try {
    const parsed = JSON.parse(saved);
    if (parsed.date !== todayString()) {
      localStorage.removeItem(RETRY_STORAGE_KEY);
      return getEmptyRetryState();
    }

    return {
      date: parsed.date,
      pendingIds: Array.isArray(parsed.pendingIds) ? parsed.pendingIds : [],
      attemptsById: parsed.attemptsById && typeof parsed.attemptsById === "object" ? parsed.attemptsById : {},
      tomorrowIds: Array.isArray(parsed.tomorrowIds) ? parsed.tomorrowIds : []
    };
  } catch {
    localStorage.removeItem(RETRY_STORAGE_KEY);
    return getEmptyRetryState();
  }
}

function saveRetryState(state) {
  const cleanState = {
    date: todayString(),
    pendingIds: Array.from(new Set(state.pendingIds || [])),
    attemptsById: state.attemptsById || {},
    tomorrowIds: Array.from(new Set(state.tomorrowIds || []))
  };

  if (IS_TEST_MODE) {
    testRetryState = cleanState.pendingIds.length === 0 && cleanState.tomorrowIds.length === 0 ? null : cleanState;
    return;
  }

  if (cleanState.pendingIds.length === 0 && cleanState.tomorrowIds.length === 0) {
    localStorage.removeItem(RETRY_STORAGE_KEY);
    return;
  }

  localStorage.setItem(RETRY_STORAGE_KEY, JSON.stringify(cleanState));
}

function clearRetryState() {
  if (IS_TEST_MODE) {
    testRetryState = null;
    return;
  }
  localStorage.removeItem(RETRY_STORAGE_KEY);
}

function cloneRetryState(state) {
  return {
    date: state.date,
    pendingIds: [...(state.pendingIds || [])],
    attemptsById: { ...(state.attemptsById || {}) },
    tomorrowIds: [...(state.tomorrowIds || [])]
  };
}

function buildRetryQueueFromState(state) {
  const usableIds = Array.from(new Set(state.pendingIds || [])).filter((id) => Boolean(getQuestionById(id)));
  if (usableIds.length !== (state.pendingIds || []).length) {
    saveRetryState({ ...state, pendingIds: usableIds });
  }

  return usableIds.map((id) => ({
    question: getQuestionById(id),
    retryAttempt: Number(state.attemptsById[id]) || 1
  }));
}

function addPersistentRetry(id, attempts) {
  const state = loadRetryState();
  if (!state.pendingIds.includes(id)) state.pendingIds.push(id);
  if (!state.tomorrowIds.includes(id)) state.tomorrowIds.push(id);
  state.attemptsById[id] = attempts;
  saveRetryState(state);
}

function removePersistentRetry(id) {
  const state = loadRetryState();
  state.pendingIds = state.pendingIds.filter((pendingId) => pendingId !== id);
  saveRetryState(state);
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

function renderLegacyDailyAdventurePanel(adventureState, dailyCompleted, retryCount) {
  const progress = dailyCompleted ? MAX_DAILY_QUESTIONS : Math.min(adventureState.completedCount, MAX_DAILY_QUESTIONS);
  const normalSetFinished = adventureState.normalSetFinished || progress >= MAX_DAILY_QUESTIONS;
  const waitingForRetry = !dailyCompleted && normalSetFinished && retryCount > 0;
  const characterPosition = dailyCompleted ? 89 : progress >= MAX_DAILY_QUESTIONS ? 83 : 7 + progress * 15.2;
  const status = dailyCompleted
    ? "全部クリア！"
    : waitingForRetry
      ? `5問クリア！ リベンジあと${retryCount}問`
      : progress === 0
        ? "スタート地点から出発しよう"
        : `いい調子！ あと${MAX_DAILY_QUESTIONS - progress}問`;
  const checkpoints = Array.from({ length: MAX_DAILY_QUESTIONS }, (_, index) => {
    const questionNumber = index + 1;
    return `
      <li class="adventure-checkpoint ${questionNumber <= progress ? "passed" : ""}">
        <span aria-hidden="true">${questionNumber <= progress ? "✓" : questionNumber}</span>
        <small>${questionNumber}問目</small>
      </li>
    `;
  }).join("");
  const celebration = dailyCompleted
    ? `<div class="adventure-confetti" aria-hidden="true">${Array.from({ length: 12 }, () => "<span></span>").join("")}</div>`
    : "";

  return `
    <section class="daily-adventure ${dailyCompleted ? "clear" : ""} ${waitingForRetry ? "waiting-retry" : ""}" style="--character-position:${characterPosition}%" aria-label="今日の冒険 ${progress}問完了">
      <header class="adventure-heading">
        <h2>今日の冒険</h2>
        <strong>${progress} / ${MAX_DAILY_QUESTIONS}</strong>
      </header>
      <p class="adventure-status">${status}</p>
      <div class="adventure-world">
        <span class="adventure-cloud cloud-one" aria-hidden="true"></span>
        <span class="adventure-cloud cloud-two" aria-hidden="true"></span>
        <div class="adventure-mountains" aria-hidden="true"></div>
        <span class="adventure-start">スタート</span>
        <ol class="adventure-checkpoints">${checkpoints}</ol>
        <div class="adventure-goal" aria-label="ゴール">
          <span class="goal-flag" aria-hidden="true"></span>
          <strong>ゴール！</strong>
        </div>
        <div class="adventure-character" aria-label="冒険中のキャラクター">
          <span aria-hidden="true">🏃</span>
          ${dailyCompleted ? "<strong>やったー！</strong>" : ""}
        </div>
        ${celebration}
      </div>
    </section>
  `;
}

function renderDailyAdventurePanel(adventureState, dailyCompleted, retryCount, userName, treasureOpened = false) {
  const progress = dailyCompleted ? MAX_DAILY_QUESTIONS : Math.min(adventureState.completedCount, MAX_DAILY_QUESTIONS);
  const normalSetFinished = adventureState.normalSetFinished || progress >= MAX_DAILY_QUESTIONS;
  const waitingForRetry = !dailyCompleted && normalSetFinished && retryCount > 0;
  const status = dailyCompleted
    ? "クリア！"
    : waitingForRetry
      ? `今日の5問クリア！ リベンジあと${retryCount}問`
      : progress === 0
        ? "スタート地点から出発しよう！"
        : `いい調子！ あと${MAX_DAILY_QUESTIONS - progress}問`;
  const stageBackground = dailyCompleted
    ? treasureOpened ? "assets/background_goal_open.png" : "assets/background_goal.png"
    : "assets/background.png";
  const stageCharacter = dailyCompleted ? "assets/glad_transparent.png" : "assets/walk_transparent.png";
  const stageState = dailyCompleted ? "is-clear" : "is-walking";
  const trimmedUserName = String(userName || "").trim();
  const adventureTitle = trimmedUserName ? `今日の${escapeHtml(trimmedUserName)}の冒険` : "今日の冒険";

  return `
    <section class="daily-adventure ${dailyCompleted ? "clear" : ""} ${waitingForRetry ? "waiting-retry" : ""}" aria-label="${adventureTitle} ${progress}問完了">
      <header class="adventure-heading">
        <h2>${adventureTitle}</h2>
        <strong>${progress} / ${MAX_DAILY_QUESTIONS}</strong>
      </header>
      <p class="adventure-status">${status}</p>
      <div class="stage-area ${stageState} ${treasureOpened ? "treasure-opened" : ""}">
        <img class="stage-bg ${dailyCompleted ? "is-goal" : "is-normal"}" src="${stageBackground}?v=${encodeURIComponent(APP_VERSION)}" alt="" width="1584" height="672" decoding="async" onerror="this.hidden=true">
        <div class="stage-character-wrap ${stageState}">
          <img class="stage-character ${stageState}" src="${stageCharacter}?v=${encodeURIComponent(APP_VERSION)}" alt="${dailyCompleted ? "クリアを喜ぶキャラクター" : "道を歩くキャラクター"}" width="896" height="1195" decoding="async" onerror="this.hidden=true">
        </div>
      </div>
    </section>
  `;
}

function renderHome() {
  stopTimer();
  clearKeyboardMode();
  closeTreasureReward();
  const savedData = loadSavedLearningData();
  if (savedData.length > 0) {
    learningData = savedData;
  }
  const retryCount = buildRetryQueueFromState(loadRetryState()).length;
  const dailyCompleted = isDailyPracticeCompleted();
  const adventureState = loadDailyAdventureState();
  const treasure = dailyCompleted ? getOrCreateDailyTreasure() : null;
  const treasureOpened = Boolean(treasure && treasure.state.shownDate === todayString());
  const waitingForRetry = !dailyCompleted && adventureState.normalSetFinished && retryCount > 0;
  app.className = "app-shell home-shell";
  app.innerHTML = `
    <section class="home-view">
      <div class="title-block">
        <h1 class="home-logo-wrap">
          <img
            class="home-logo-image"
            src="assets/Kanji-de-go_Logo.png?v=${encodeURIComponent(APP_VERSION)}"
            alt="漢字でGO！"
            width="2172"
            height="724"
            decoding="async"
          >
        </h1>
      </div>

      ${renderDailyAdventurePanel(adventureState, dailyCompleted, retryCount, currentUserName, treasureOpened)}

      <div class="home-actions">
        ${dailyCompleted ? `
          <div class="daily-complete-state" role="status">
            <strong>今日の練習は完了！</strong>
            <span>また明日やろう</span>
          </div>
        ` : `<button class="primary-button" data-action="start">${waitingForRetry ? "リベンジを始める" : "今日の練習を始める"}</button>`}
        <button class="secondary-button" data-action="paper">紙テストモード</button>
        <button class="secondary-button" data-action="kanji-cards">漢字カードを見る</button>
        <button class="secondary-button" data-action="data">データ管理</button>
      </div>
    </section>
  `;

  const startButton = app.querySelector('[data-action="start"]');
  if (startButton) startButton.addEventListener("click", startPractice);
  app.querySelector('[data-action="paper"]').addEventListener("click", renderPaperMode);
  app.querySelector('[data-action="kanji-cards"]').addEventListener("click", () => renderKanjiCardsMode());
  app.querySelector('[data-action="data"]').addEventListener("click", renderDataMode);
  if (treasure && treasure.state.shownDate !== todayString()) {
    playDailyTreasureReward(treasure.card);
  }
}

function playDailyTreasureReward(card) {
  const state = loadDailyTreasureState();
  state.cardId = card.id;
  state.shownDate = todayString();
  saveDailyTreasureState(state);

  const stage = app.querySelector(".stage-area.is-clear");
  if (!stage) return;
  stage.classList.add("treasure-opening");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const openDelay = reducedMotion ? 30 : 650;
  const cardDelay = reducedMotion ? 70 : 920;

  window.setTimeout(() => {
    if (!app.querySelector(".home-view")) return;
    const background = app.querySelector(".stage-bg.is-goal");
    if (background) background.src = `assets/background_goal_open.png?v=${encodeURIComponent(APP_VERSION)}`;
    stage.classList.remove("treasure-opening");
    stage.classList.add("treasure-opened");
  }, openDelay);

  window.setTimeout(() => {
    if (!app.querySelector(".home-view")) return;
    showTreasureCard(card);
  }, cardDelay);
}

function showTreasureCard(card) {
  closeTreasureReward();
  const layer = document.createElement("div");
  layer.className = "treasure-reward-layer";
  layer.innerHTML = `
    <div class="treasure-reward-backdrop" aria-hidden="true"></div>
    <section class="treasure-card" role="dialog" aria-modal="true" aria-labelledby="treasure-title">
      <div class="treasure-buddy" aria-hidden="true">
        <img
          class="treasure-buddy-image"
          src="assets/m-1.png?v=${encodeURIComponent(APP_VERSION)}"
          alt=""
          width="896"
          height="896"
          decoding="async"
        >
        <p class="treasure-buddy-message" aria-live="polite">今日のたからものだよ！</p>
      </div>
      <p class="treasure-kicker">今日のたからもの</p>
      <h2 id="treasure-title">${escapeHtml(card.title)}</h2>
      <p class="treasure-reading">${escapeHtml(card.reading)}</p>
      <p class="treasure-meaning">${escapeHtml(card.meaning)}</p>
      <p class="treasure-comment">${escapeHtml(card.comment)}</p>
      <div class="treasure-actions">
        <button class="primary-button" type="button" data-action="feed-buddy">相棒にあげる</button>
        <button class="ghost-button" type="button" data-action="close-treasure">とじる</button>
      </div>
    </section>
  `;
  document.body.append(layer);
  document.body.classList.add("treasure-modal-open");
  window.requestAnimationFrame(() => layer.classList.add("visible"));
  const feedButton = layer.querySelector('[data-action="feed-buddy"]');
  const buddyImage = layer.querySelector(".treasure-buddy-image");
  const buddyMessage = layer.querySelector(".treasure-buddy-message");
  const closeButton = layer.querySelector('[data-action="close-treasure"]');
  feedButton.addEventListener("click", () => {
    if (buddyImage) {
      buddyImage.src = `assets/m-3.png?v=${encodeURIComponent(APP_VERSION)}`;
      buddyImage.classList.remove("fed");
      void buddyImage.offsetWidth;
      buddyImage.classList.add("fed");
    }

    if (buddyMessage) {
      buddyMessage.textContent = "ありがとう！ もぐもぐ！";
      buddyMessage.classList.add("fed");
    }

    feedButton.textContent = "相棒にあげたよ";
    feedButton.disabled = true;
    closeButton.classList.remove("ghost-button");
    closeButton.classList.add("primary-button");
    closeButton.textContent = "おしまい";
    closeButton.focus();
  });
  closeButton.addEventListener("click", closeTreasureReward);
  closeButton.focus();
}

function closeTreasureReward() {
  document.querySelector(".treasure-reward-layer")?.remove();
  document.body.classList.remove("treasure-modal-open");
}

function startPractice() {
  if (isDailyPracticeCompleted()) {
    renderHome();
    return;
  }
  const savedData = loadSavedLearningData();
  if (savedData.length > 0) {
    learningData = savedData;
  }
  const adventureState = loadDailyAdventureState();
  const remainingNormalQuestions = adventureState.normalSetFinished
    ? 0
    : Math.max(MAX_DAILY_QUESTIONS - adventureState.completedCount, 0);
  dailyQuestions = getDueQuestions().slice(0, remainingNormalQuestions);
  const retryState = loadRetryState();
  currentIndex = 0;
  currentQuestionEntry = null;
  retryQueue = buildRetryQueueFromState(retryState);
  retryAttemptsById = { ...retryState.attemptsById };
  retryQuestionCounter = 0;
  correctCount = 0;
  retrySuccessCount = 0;
  tomorrowReviewIds = new Set(retryState.tomorrowIds || retryState.pendingIds || []);
  score = 0;
  combo = 0;

  if (dailyQuestions.length === 0 && retryQueue.length === 0) {
    renderEmptyPractice();
    return;
  }

  showNextQuestion();
}

function renderEmptyPractice() {
  clearKeyboardMode();
  markDailyPracticeCompleted();
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

function showNextQuestion() {
  stopTimer();
  blurActiveElement();
  clearKeyboardMode();

  if (currentIndex < dailyQuestions.length) {
    currentQuestionEntry = {
      question: dailyQuestions[currentIndex],
      isRetry: false,
      normalIndex: currentIndex + 1
    };
    currentIndex += 1;
  } else if (retryQueue.length > 0) {
    retryQuestionCounter += 1;
    currentQuestionEntry = {
      ...retryQueue.shift(),
      isRetry: true,
      retryNumber: retryQuestionCounter
    };
  } else {
    renderSessionComplete();
    return;
  }

  renderQuestion();
  settleQuestionViewport();
}

function renderQuestion() {
  stopTimer();
  const { question, isRetry, normalIndex, retryNumber } = currentQuestionEntry;
  currentTimeLimit = question.time_limit_sec || DEFAULT_TIME_LIMIT;
  questionStartedAt = Date.now();
  currentAttemptCount = 0;
  currentQuestionHadRetry = false;
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
        <div class="life-box">
          <span>ライフ</span>
          <strong id="attempt-lives" class="life-hearts" aria-label="残り3回">${renderLifeHearts(MAX_ANSWER_ATTEMPTS)}</strong>
        </div>
      </header>

      <p class="question-count">${isRetry ? `今日のリトライ ${retryNumber}問目` : `第${normalIndex}問 / 今日の${dailyQuestions.length}問`}</p>
      <div class="road-scene">
        <div class="lane lane-left"></div>
        <div class="lane lane-right"></div>
        <div class="incoming-reading" style="animation-duration: ${currentTimeLimit}s">${escapeHtml(question.reading)}</div>
      </div>

      <p class="sentence">${highlightReading(question.sentence, question.reading)}</p>

      <label class="answer-label" for="answer-input">答え：</label>
      <input id="answer-input" class="answer-input" type="text" inputmode="text" autocomplete="off" autocapitalize="off">
      <p id="attempt-feedback" class="attempt-feedback" aria-live="polite"></p>

      <div class="game-actions">
        <button class="primary-button" data-action="judge">判定する</button>
        <button class="ghost-button" data-action="skip">スキップ</button>
      </div>

      <p class="practice-note">ゲームは反復練習用です。週末は紙チャレンジで本当に書けるか確認しよう。</p>
    </section>
  `;

  const input = app.querySelector("#answer-input");
  input.addEventListener("focus", () => {
    if (!shouldUseKeyboardMode()) return;
    document.body.classList.add("keyboard-mode");
    if (input.dataset.programmaticFocus === "true") {
      input.dataset.programmaticFocus = "";
      return;
    }
    window.setTimeout(() => {
      input.scrollIntoView({ behavior: "auto", block: "center" });
    }, 100);
  });
  input.addEventListener("blur", clearKeyboardMode);
  scrollGameToPreferredPosition();
  focusAnswerInputKeepingScroll();
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

function clearKeyboardMode() {
  document.body.classList.remove("keyboard-mode");
}

function blurActiveElement() {
  if (document.activeElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur();
  }
}

function settleQuestionViewport() {
  window.setTimeout(() => {
    scrollGameToPreferredPosition();
    focusAnswerInputKeepingScroll();
  }, 50);
  window.setTimeout(scrollGameToPreferredPosition, 260);
  window.setTimeout(scrollGameToPreferredPosition, 520);
}

function scrollGameToPreferredPosition(delay = 0) {
  const scroll = () => {
    const target = app.querySelector(".game-hud") || app.querySelector(".game-view") || app;
    const rect = target.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    const offset = isTouchLikeDevice() ? 8 : 16;
    window.scrollTo({
      top: Math.max(absoluteTop - offset, 0),
      behavior: "auto"
    });
  };
  if (delay > 0) {
    window.setTimeout(scroll, delay);
  } else {
    scroll();
  }
}

function focusAnswerInputKeepingScroll() {
  const input = app.querySelector("#answer-input");
  if (!input) return;
  input.dataset.programmaticFocus = "true";
  try {
    input.focus({ preventScroll: true });
  } catch (error) {
    input.focus();
  }
}

function isTouchLikeDevice() {
  return window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 1;
}

function shouldUseKeyboardMode() {
  return window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(orientation: landscape) and (max-height: 820px)").matches;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderLifeHearts(remaining) {
  return Array.from({ length: MAX_ANSWER_ATTEMPTS }, (_, index) => {
    const active = index < remaining;
    return `<span class="life-heart ${active ? "active" : "lost"}" aria-hidden="true"></span>`;
  }).join("");
}

function updateAttemptDisplay() {
  const remaining = Math.max(MAX_ANSWER_ATTEMPTS - currentAttemptCount, 0);
  const lives = app.querySelector("#attempt-lives");
  if (lives) {
    lives.innerHTML = renderLifeHearts(remaining);
    lives.setAttribute("aria-label", `残り${remaining}回`);
  }
}

function showAttemptFeedback(remaining, submittedAnswer) {
  const feedback = app.querySelector("#attempt-feedback");
  if (!feedback) return;
  feedback.innerHTML = `
    <span class="submitted-answer-label">送信された答え</span>
    <strong class="submitted-answer-value">${escapeHtml(submittedAnswer || "（空欄）")}</strong>
    <span class="submitted-answer-guide">もう一回ためそう・あと${remaining}回</span>
  `;
  feedback.classList.remove("attempt-feedback-pop");
  void feedback.offsetWidth;
  feedback.classList.add("attempt-feedback-pop");
}

function prepareNextAttempt() {
  const input = app.querySelector("#answer-input");
  if (input) input.value = "";
  updateAttemptDisplay();
  setGameControlsDisabled(false);
  isAnimating = false;
  startTimer();
  focusAnswerInputKeepingScroll();
  settleQuestionViewport();
}

async function judgeAnswer(timedOut, skipped = false) {
  if (isAnimating) return;
  stopTimer();
  const { question, isRetry } = currentQuestionEntry;
  const input = app.querySelector("#answer-input");
  const submittedAnswer = String(input ? input.value : "").trim();
  const userAnswer = normalizeAnswer(submittedAnswer);
  if (!timedOut && !skipped) {
    currentAttemptCount += 1;
  }
  const validAnswers = [question.answer, ...(question.acceptable_answers || [])].map(normalizeAnswer);
  const isCorrect = !timedOut && !skipped && validAnswers.includes(userAnswer);
  const attemptsRemaining = Math.max(MAX_ANSWER_ATTEMPTS - currentAttemptCount, 0);
  const isFinalMiss = !isCorrect && (timedOut || skipped || attemptsRemaining <= 0);
  if (!isCorrect) {
    currentQuestionHadRetry = true;
  }
  const hadMistake = currentQuestionHadRetry || (isCorrect && currentAttemptCount > 1) || isFinalMiss;
  const retryRequired = hadMistake && !isRetry;
  let retryQueued = false;

  isAnimating = true;
  setGameControlsDisabled(true);
  try {
    await playAnswerAttackAnimation(getAttackText(submittedAnswer, timedOut, skipped), isCorrect);
  } catch (error) {
    console.warn("回答演出をスキップしました。", error);
  }

  if (!isCorrect && !isFinalMiss) {
    showAttemptFeedback(attemptsRemaining, submittedAnswer);
    prepareNextAttempt();
    return;
  }

  if (input) input.blur();
  clearKeyboardMode();

  if (isCorrect) {
    correctCount += 1;
    if (isRetry) {
      retrySuccessCount += 1;
      removePersistentRetry(question.id);
    } else {
      updateReview(question.id, true, hadMistake);
      if (retryRequired) {
        retryQueued = enqueueRetry(question);
        tomorrowReviewIds.add(question.id);
      }
    }
  } else {
    updateReview(question.id, false, hadMistake);
    retryQueued = enqueueRetry(question);
    tomorrowReviewIds.add(question.id);
  }

  if (!isRetry) {
    recordDailyNormalQuestionCompleted(currentIndex >= dailyQuestions.length);
  }

  if (isCorrect) {
    combo += 1;
    score += 100 + combo * 20;
  } else {
    combo = 0;
  }

  isAnimating = false;
  renderResult(question, isCorrect, timedOut, skipped, isRetry, retryQueued, hadMistake);
  renderHadRetryResultNote(isCorrect, hadMistake, retryQueued);
  renderSubmittedAnswerResultNote(isCorrect, submittedAnswer, timedOut, skipped);
}

function setGameControlsDisabled(disabled) {
  app.querySelectorAll('[data-action="judge"], [data-action="skip"]').forEach((button) => {
    button.disabled = disabled;
  });
}

function getAttackText(userAnswer, timedOut, skipped) {
  if (userAnswer) return userAnswer;
  if (skipped) return "スキップ";
  if (timedOut) return "時間切れ";
  return "？";
}

async function playAnswerAttackAnimation(answerText, isCorrect) {
  const input = app.querySelector("#answer-input");
  const target = app.querySelector(".incoming-reading");
  if (!input || !target) {
    await wait(80);
    return;
  }

  const inputRect = input.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const sourceX = inputRect.left + inputRect.width / 2;
  const sourceY = inputRect.top + Math.min(inputRect.height * 0.42, 52);
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const projectile = document.createElement("div");
  projectile.className = "answer-projectile";
  projectile.textContent = answerText;
  projectile.style.left = `${sourceX}px`;
  projectile.style.top = `${sourceY}px`;
  projectile.style.setProperty("--attack-x", `${targetX - sourceX}px`);
  projectile.style.setProperty("--attack-y", `${targetY - sourceY}px`);
  document.body.append(projectile);

  if (reducedMotion) {
    projectile.style.left = `${targetX}px`;
    projectile.style.top = `${targetY}px`;
    await wait(40);
  } else {
    projectile.classList.add("answer-projectile-launch");
    await waitForAnimation(projectile, 340);
    projectile.classList.remove("answer-projectile-launch");
    projectile.style.left = `${targetX}px`;
    projectile.style.top = `${targetY}px`;
    projectile.style.transform = "translate(-50%, -50%)";
  }

  if (isCorrect) {
    const targetStyle = window.getComputedStyle(target);
    target.style.animation = "none";
    target.style.transform = targetStyle.transform;
    target.classList.add("kana-explode");
    renderImpactBurst(targetX, targetY, true);
    projectile.classList.add("answer-hit-success");
    await wait(reducedMotion ? 40 : 420);
    target.classList.remove("kana-explode");
    projectile.remove();
  } else {
    renderImpactBurst(targetX, targetY, false);
    projectile.classList.add("answer-shatter");
    await wait(reducedMotion ? 40 : 420);
    projectile.remove();
  }
}

function renderImpactBurst(x, y, isCorrect) {
  const burst = document.createElement("div");
  burst.className = `impact-burst ${isCorrect ? "impact-success" : "impact-miss"}`;
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  burst.innerHTML = Array.from({ length: isCorrect ? 10 : 7 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / (isCorrect ? 10 : 7);
    const distance = isCorrect ? 72 : 46;
    const dx = Math.round(Math.cos(angle) * distance);
    const dy = Math.round(Math.sin(angle) * distance);
    return `<span style="--burst-x:${dx}px;--burst-y:${dy}px"></span>`;
  }).join("");
  document.body.append(burst);
  window.setTimeout(() => burst.remove(), 520);
}

function waitForAnimation(element, fallbackMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      element.removeEventListener("animationend", finish);
      resolve();
    };
    element.addEventListener("animationend", finish, { once: true });
    window.setTimeout(finish, fallbackMs);
  });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function enqueueRetry(question) {
  const attempts = retryAttemptsById[question.id] || 0;
  if (attempts >= 2) {
    removePersistentRetry(question.id);
    return false;
  }
  retryAttemptsById[question.id] = attempts + 1;
  if (!retryQueue.some((entry) => entry.question.id === question.id)) {
    retryQueue.push({
      question,
      retryAttempt: attempts + 1
    });
  }
  addPersistentRetry(question.id, attempts + 1);
  return true;
}

function normalizeAnswer(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function updateReview(id, isCorrect, hadRetry = false) {
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
        status: "active",
        last_had_retry: hadRetry,
        retry_miss_count: Number(item.retry_miss_count || 0) + (hadRetry ? 1 : 0)
      };
    }

    if (hadRetry) {
      return {
        ...item,
        correct_streak: item.correct_streak,
        review_stage: item.review_stage,
        next_review_date: addDays(today, 1),
        status: "active",
        last_had_retry: true,
        retry_count: Number(item.retry_count || 0) + 1,
        retry_miss_count: Number(item.retry_miss_count || 0) + 1
      };
    }

    const nextStage = item.review_stage + 1;
    const intervals = [1, 3, 7, 14, 30];
    if (item.review_stage >= 5 || nextStage >= 6) {
      return {
        ...item,
        review_stage: nextStage,
        correct_streak: item.correct_streak + 1,
        status: "graduated",
        last_had_retry: hadRetry,
        retry_count: Number(item.retry_count || 0) + (hadRetry ? 1 : 0),
        first_try_correct_count: Number(item.first_try_correct_count || 0) + (hadRetry ? 0 : 1)
      };
    }

    return {
      ...item,
      review_stage: nextStage,
      correct_streak: item.correct_streak + 1,
      next_review_date: addDays(today, intervals[item.review_stage] || 30),
      status: "active",
      last_had_retry: hadRetry,
      retry_count: Number(item.retry_count || 0) + (hadRetry ? 1 : 0),
      first_try_correct_count: Number(item.first_try_correct_count || 0) + (hadRetry ? 0 : 1)
    };
  });
  saveLearningData();
}

function renderResult(question, isCorrect, timedOut, skipped, isRetry, retryQueued, hadRetry = false) {
  const title = isCorrect ? (isRetry ? "リトライ成功！" : "正解！") : timedOut ? "時間切れ！" : skipped ? "スキップ！" : "ざんねん！";
  const resultClass = isCorrect ? "result-view success" : "result-view retry";
  const readingHtml = question.reading ? `<p class="result-ruby-like">${escapeHtml(question.reading)}</p>` : "";
  app.className = `app-shell result-shell ${isCorrect ? "shake-success" : ""}`;
  app.innerHTML = `
    <section class="${resultClass}">
      ${isCorrect ? renderCelebration() : ""}
      <p class="result-kicker">${isCorrect ? (isRetry ? "その場で取り返したね" : "やったね") : "もう一回出るよ"}</p>
      <h1>${title}</h1>
      <div class="answer-card">
        <div class="result-answer-block">
          ${!isCorrect ? `<p class="correct-answer-label">正解</p>` : ""}
          ${readingHtml}
          <p class="big-kanji">${escapeHtml(question.answer)}</p>
        </div>
        <p class="meaning"><span>意味：</span>${escapeHtml(question.meaning)}</p>
        ${!isCorrect && retryQueued ? `<p class="retry-note">あとで今日もう一回出るよ！</p>` : ""}
        ${isCorrect && isRetry ? `<p class="retry-note">明日ももう一度出るから、紙にも書いて確認しよう。</p>` : ""}
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

function renderHadRetryResultNote(isCorrect, hadRetry, retryQueued = false) {
  if (!isCorrect || !hadRetry) return;
  const title = app.querySelector(".result-view h1");
  if (title) title.textContent = "リトライ正解！";
  const card = app.querySelector(".answer-card");
  if (card) {
    const message = retryQueued
      ? "正解！あとでリベンジでもう一回出るよ。明日も復習しよう。"
      : "リトライありで正解！明日も紙で確認しよう。";
    card.insertAdjacentHTML("beforeend", `<p class="retry-note">${message}</p>`);
  }
}

function renderSubmittedAnswerResultNote(isCorrect, submittedAnswer, timedOut, skipped) {
  if (isCorrect || timedOut || skipped) return;
  const card = app.querySelector(".answer-card");
  if (!card) return;
  card.insertAdjacentHTML("afterbegin", `
    <div class="submitted-answer-result">
      <span>送信された答え</span>
      <strong>${escapeHtml(submittedAnswer || "（空欄）")}</strong>
    </div>
  `);
}

function renderCelebration() {
  const stars = Array.from({ length: 14 }, (_, index) => `<span class="confetti star-${index + 1}">★</span>`).join("");
  return `<div class="boom" aria-hidden="true"></div><div class="confetti-field" aria-hidden="true">${stars}</div>`;
}

function nextQuestion() {
  showNextQuestion();
}

function renderSessionComplete() {
  clearKeyboardMode();
  markDailyPracticeCompleted();
  app.className = "app-shell";
  app.innerHTML = `
    <section class="message-view session-complete-view">
      <div class="session-result-heading">
        <p class="session-kicker">今日の練習</p>
        <h1>クリア！</h1>
        <p class="session-message">今日もよくがんばったね！</p>
      </div>
      <p class="session-retry-note">間違えた問題もその場でリトライしたよ。</p>
      <div class="session-summary" aria-label="今日の成績">
        <article class="score-card score-card-correct">
          <p class="score-card-label"><span aria-hidden="true">✦</span> 正解</p>
          <p class="score-card-value"><strong>${correctCount}</strong><span>問</span></p>
        </article>
        <article class="score-card score-card-retry">
          <p class="score-card-label"><span aria-hidden="true">↺</span> リトライ成功</p>
          <p class="score-card-value"><strong>${retrySuccessCount}</strong><span>問</span></p>
        </article>
        <article class="score-card score-card-review">
          <p class="score-card-label"><span aria-hidden="true">☀</span> 明日の復習</p>
          <p class="score-card-value"><strong>${tomorrowReviewIds.size}</strong><span>問</span></p>
        </article>
        <article class="score-card score-card-score">
          <p class="score-card-label"><span aria-hidden="true">★</span> スコア</p>
          <p class="score-card-value"><strong>${score}</strong><span>点</span></p>
        </article>
      </div>
      <button class="primary-button session-home-button" data-action="home">ホームへ戻る</button>
    </section>
  `;
  app.querySelector('[data-action="home"]').addEventListener("click", renderHome);
}

function renderPaperMode() {
  stopTimer();
  clearKeyboardMode();
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

function renderKanjiCardsMode(filter = getDefaultKanjiCardFilter()) {
  stopTimer();
  clearKeyboardMode();
  const filters = [
    { key: "weak", label: "あやしい" },
    { key: "learning", label: "練習中" },
    { key: "graduated", label: "卒業" },
    { key: "all", label: "全部" }
  ];
  const counts = getKanjiCardCounts();
  const cards = sortKanjiCards(filterKanjiCards(learningData, filter), filter);

  app.className = "app-shell cards-shell";
  app.innerHTML = `
    <section class="kanji-cards-view">
      <nav class="screen-nav">
        <button class="ghost-button" data-action="home">ホームへ戻る</button>
      </nav>
      <h1>漢字カード</h1>
      <p class="cards-lead">今の覚え具合でカードを分けています。</p>
      <div class="card-filter-tabs" role="tablist" aria-label="漢字カードの表示切替">
        ${filters.map((item) => `
          <button
            class="${filter === item.key ? "active" : ""}"
            type="button"
            aria-pressed="${filter === item.key ? "true" : "false"}"
            data-filter="${item.key}"
          >${item.label}<span>${counts[item.key] || 0}</span></button>
        `).join("")}
      </div>
      <div class="kanji-card-grid">
        ${cards.map(({ record, displayStatus }) => renderKanjiStudyCard(record, displayStatus)).join("") || `<p class="empty-cards">${getKanjiCardEmptyMessage(filter)}</p>`}
      </div>
    </section>
  `;

  app.querySelector('[data-action="home"]').addEventListener("click", renderHome);
  app.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => renderKanjiCardsMode(button.dataset.filter));
  });
}

function renderKanjiStudyCard(record, displayStatus) {
  const meta = getKanjiCardStatusMeta(displayStatus);
  const nextReviewDate = record.status === "graduated"
    ? "完了"
    : escapeHtml(record.next_review_date || record.source_date || "未設定");
  return `
    <article class="kanji-study-card ${meta.className}">
      <div class="kanji-card-topline">
        <span class="kanji-card-status ${meta.className}">${meta.label}</span>
        <span class="kanji-card-source">${escapeHtml(record.source_type || "")}</span>
      </div>
      <div class="kanji-card-answer">
        <span>答え</span>
        <strong>${escapeHtml(record.answer)}</strong>
      </div>
      <p class="kanji-card-reading">${escapeHtml(record.reading)}</p>
      <p class="kanji-card-meaning">${escapeHtml(record.meaning || "")}</p>
      <p class="kanji-card-sentence">${highlightReading(record.sentence, record.reading)}</p>
      ${record.wrong_answer ? `<p class="kanji-card-wrong">前の答え：${escapeHtml(record.wrong_answer)}</p>` : ""}
      <dl class="kanji-card-progress">
        <div><dt>次の復習</dt><dd>${nextReviewDate}</dd></div>
        <div><dt>ステージ</dt><dd>${Number(record.review_stage || 0)}</dd></div>
        <div><dt>ミス</dt><dd>${Number(record.miss_count || 0)}</dd></div>
      </dl>
    </article>
  `;
}

function renderDataMode() {
  stopTimer();
  clearKeyboardMode();
  const userName = escapeHtml(currentUserName);
  app.className = "app-shell data-shell";
  app.innerHTML = `
    <section class="data-view">
      <nav class="screen-nav">
        <button class="ghost-button" data-action="home">ホームへ戻る</button>
      </nav>
      <h1>データ管理</h1>
      <p>今の学習データを保存したり、サンプル状態に戻したりできます。</p>
      <p class="app-version">アプリバージョン：<strong>${escapeHtml(APP_VERSION)}</strong></p>

      <div class="data-summary" aria-label="学習データ集計">
        <p><span>登録問題数</span><strong>${learningData.length}</strong></p>
        <p><span>未卒業問題数</span><strong>${getActiveCount()}</strong></p>
      </div>

      ${IS_TEST_MODE ? `
        <section class="test-operations">
          <h2>演出確認</h2>
          <p>テストモード内だけで状態を変更します。本番の学習データには影響しません。</p>
          <div>
            <button class="secondary-button" type="button" data-action="test-complete-today">テスト用：今日の練習完了にする</button>
            <button class="ghost-button" type="button" data-action="test-reset-treasure">テスト用：宝箱演出を未表示に戻す</button>
          </div>
        </section>
      ` : ""}

      <form class="name-edit" data-action="change-name">
        <label class="answer-label" for="data-user-name">ユーザー名</label>
        <input id="data-user-name" class="name-input" type="text" value="${userName}" autocomplete="name" maxlength="20">
        <button class="secondary-button" type="submit">変更する</button>
      </form>

      <section class="backup-panel">
        <h2>バックアップコード</h2>
        <p>このコードをコピーして保存しておくと、セーブデータが消えたときに復元できます。</p>
        <p>スマホのメモ、LINE、自分宛メールなどに保存してください。</p>
        <div class="data-actions">
          <button class="primary-button" data-action="export-text">バックアップコードを作る</button>
          <button class="secondary-button" data-action="import-text">貼り付けJSONを読み込む</button>
        </div>
        <textarea
          id="backup-json-box"
          class="export-box backup-code-box"
          aria-label="バックアップJSONコード"
          placeholder="ここにバックアップコードが表示されます。復元するときは、保存していたJSONをここに貼り付けてください。"
        ></textarea>
      </section>

      <section class="file-panel">
        <h2>ファイル操作</h2>
        <p>必要な場合は、JSONやCSVをファイルとして保存・読み込みできます。</p>
      <div class="data-actions">
        <button class="primary-button" data-action="export">JSONをエクスポート</button>
        <button class="primary-button" data-action="export-csv">CSVをエクスポート</button>
        <label class="file-import">
          JSONをインポート
          <input type="file" accept="application/json,.json" data-action="import">
        </label>
        <button class="secondary-button" data-action="repair-csv">CSVから修復</button>
        <label class="file-import">
          CSVファイルを選んで修復
          <input type="file" accept=".csv,text/csv" data-action="repair-csv-file">
        </label>
        <button class="danger-button" data-action="reset">学習データをサンプルに戻す</button>
        <button class="danger-button" data-action="reset-all">全データを初期化</button>
      </div>
      </section>
      <section class="csv-import-panel">
        <h2>CSV貼り付けインポート</h2>
        <p>CSVの問題マスタを貼り付けると、新規IDを追加し、既存IDは問題文・読み・答え・意味などだけ更新します。</p>
        <textarea id="csv-import-box" class="export-box" aria-label="CSV貼り付け欄" placeholder="id,source_date,source_type,sentence,reading,answer,acceptable_answers,meaning,wrong_answer,mistake_type,time_limit_sec"></textarea>
        <button class="secondary-button" data-action="import-csv">貼り付けCSVを取り込む</button>
      </section>
      <textarea id="export-box" class="export-box" readonly aria-label="エクスポートJSON"></textarea>
      <p id="data-message" class="data-message"></p>
    </section>
  `;

  app.querySelector('[data-action="home"]').addEventListener("click", renderHome);
  app.querySelector('[data-action="change-name"]').addEventListener("submit", changeUserName);
  app.querySelector('[data-action="export-text"]').addEventListener("click", exportBackupText);
  app.querySelector('[data-action="import-text"]').addEventListener("click", importBackupText);
  app.querySelector('[data-action="export"]').addEventListener("click", exportData);
  app.querySelector('[data-action="export-csv"]').addEventListener("click", exportCsvData);
  app.querySelector('[data-action="repair-csv"]').addEventListener("click", repairFromCsvSource);
  app.querySelector('[data-action="repair-csv-file"]').addEventListener("change", importRepairCsvFile);
  app.querySelector('[data-action="import-csv"]').addEventListener("click", importPastedCsv);
  app.querySelector('[data-action="reset"]').addEventListener("click", resetData);
  app.querySelector('[data-action="reset-all"]').addEventListener("click", resetAllData);
  app.querySelector('[data-action="import"]').addEventListener("change", importData);
  if (IS_TEST_MODE) {
    app.querySelector('[data-action="test-complete-today"]').addEventListener("click", testCompleteTodayForTreasure);
    app.querySelector('[data-action="test-reset-treasure"]').addEventListener("click", testResetTreasureShown);
    disableDataAction("change-name");
    disableDataAction("export-text");
    disableDataAction("import-text");
    disableDataAction("export");
    disableDataAction("export-csv");
    disableDataAction("import");
    disableDataAction("reset");
    disableDataAction("reset-all");
    disableNameEdit();
    setDataMessage("テストモード：本番データに触れる操作は無効です。CSVの読込確認だけ使えます。");
  }
  if (startupCsvMessage) {
    setDataMessage(startupCsvMessage);
  }
}

function testCompleteTodayForTreasure() {
  if (!IS_TEST_MODE) return;
  markDailyPracticeCompleted();
  resetDailyTreasureShown({ chooseNewCard: true });
  renderHome();
}

function testResetTreasureShown() {
  if (!IS_TEST_MODE) return;
  if (!isDailyPracticeCompleted()) {
    setDataMessage("先に「今日の練習完了にする」を押してください。");
    return;
  }
  resetDailyTreasureShown();
  renderHome();
}

function disableDataAction(action) {
  const element = app.querySelector(`[data-action="${action}"]`);
  if (!element) return;
  element.disabled = true;
  element.setAttribute("aria-disabled", "true");
  const label = element.closest(".file-import");
  if (label) label.classList.add("disabled");
}

function disableNameEdit() {
  app.querySelectorAll('[data-action="change-name"] input, [data-action="change-name"] button').forEach((element) => {
    element.disabled = true;
    element.setAttribute("aria-disabled", "true");
  });
}

function changeUserName(event) {
  event.preventDefault();
  if (IS_TEST_MODE) {
    setDataMessage("テストモードではユーザー名を保存しません。");
    return;
  }
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
  if (IS_TEST_MODE) {
    setDataMessage("テストモードでは本番バックアップを書き出しません。");
    return;
  }
  const compactData = buildCompactSaveData();
  const json = JSON.stringify(compactData);
  const box = app.querySelector("#export-box");
  box.value = json;
  box.focus();
  box.select();

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kanji-de-go-save-${todayString()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setDataMessage("短縮版JSONを書き出しました。");
}

async function exportBackupText() {
  if (IS_TEST_MODE) {
    setDataMessage("テストモードでは本番バックアップを書き出しません。");
    return;
  }

  const compactData = buildCompactSaveData();
  const json = JSON.stringify(compactData);
  const box = app.querySelector("#backup-json-box") || app.querySelector("#export-box");
  if (!box) return;

  box.value = json;
  box.focus();
  box.select();

  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      throw new Error("Clipboard is not available");
    }
    await navigator.clipboard.writeText(json);
    setDataMessage("バックアップコードをコピーしました。メモなどに保存してください。");
  } catch {
    setDataMessage("バックアップコードを作成しました。コピーして保存してください。");
  }
}

function importBackupText() {
  if (IS_TEST_MODE) {
    setDataMessage("テストモードではバックアップインポートを無効にしています。");
    return;
  }

  const box = app.querySelector("#backup-json-box") || app.querySelector("#export-box");
  const text = box ? box.value.trim() : "";
  if (!text) {
    setDataMessage("復元するバックアップコードを貼り付けてください。");
    return;
  }

  try {
    const imported = JSON.parse(text);
    if (Array.isArray(imported)) {
      importLegacyFullData(imported);
      renderDataMode();
      setDataMessage("従来形式JSONを読み込みました。");
      return;
    }

    applyCompactSaveData(imported);
    renderDataMode();
    setDataMessage("バックアップコードから復元しました。");
  } catch {
    setDataMessage("JSONを読み込めませんでした。コード全体をコピーできているか確認してください。");
  }
}

function exportCsvData() {
  if (IS_TEST_MODE) {
    setDataMessage("テストモードではCSVエクスポートを無効にしています。");
    return;
  }
  const currentRecords = loadSavedLearningData();
  const csv = recordsToCsv(currentRecords.length > 0 ? currentRecords : learningData);
  const box = app.querySelector("#export-box");
  box.value = csv;
  box.focus();
  box.select();

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kanji-de-go-${todayString()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setDataMessage("CSVを書き出しました。");
}

async function repairFromCsvSource() {
  if (window.location.protocol === "file:") {
    const fileInput = app.querySelector('[data-action="repair-csv-file"]');
    if (fileInput) fileInput.click();
    setDataMessage("HTMLを直接開いているため、CSVファイルを選択してください。貼り付けインポートも利用できます。");
    return;
  }

  const csvResult = await loadCsvMasterRecords();
  if (!csvResult.ok) {
    setDataMessage("CSVファイルを自動取得できませんでした。CSVファイルを選択するか、貼り付けインポートを使ってください。");
    return;
  }
  applyCsvImportResult(csvResult);
}

function importRepairCsvFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const csvResult = csvTextToRecords(reader.result);
    if (!csvResult.ok) {
      setDataMessage(csvResult.errors[0]);
      return;
    }
    applyCsvImportResult(csvResult);
    event.target.value = "";
  });
  reader.readAsText(file);
}

function applyCsvImportResult(csvResult) {
  const merged = mergeMasterRecords(loadSavedLearningData(), csvResult.records);
  learningData = merged.data;
  saveLearningData();
  setDataMessage(`CSVを読み込みました。新規${merged.newCount}件、更新${merged.updateCount}件、スキップ${merged.skipCount + csvResult.skipped}件。`);
}

function importPastedCsv() {
  const box = app.querySelector("#csv-import-box");
  const csvResult = csvTextToRecords(box.value);
  if (!csvResult.ok) {
    setDataMessage(csvResult.errors[0]);
    return;
  }
  applyCsvImportResult(csvResult);
}

function resetData() {
  if (IS_TEST_MODE) {
    setDataMessage("テストモードでは本番学習データを初期化できません。");
    return;
  }
  learningData = normalizeRecords(SAMPLE_DATA);
  saveLearningData();
  clearRetryState();
  clearDailyPracticeCompleted();
  setDataMessage("学習データをサンプルデータに戻しました。ユーザー名はそのままです。");
}

function resetAllData() {
  if (IS_TEST_MODE) {
    setDataMessage("テストモードでは本番データを初期化できません。");
    return;
  }
  if (!window.confirm("学習データとユーザー名をすべて初期化しますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  clearRetryState();
  clearDailyPracticeCompleted();
  learningData = normalizeRecords(SAMPLE_DATA);
  saveLearningData();
  currentUserName = "";
  renderUserNameSetup();
}

function importData(event) {
  if (IS_TEST_MODE) {
    event.target.value = "";
    setDataMessage("テストモードではバックアップインポートを無効にしています。");
    return;
  }
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = JSON.parse(reader.result);
      if (Array.isArray(imported)) {
        importLegacyFullData(imported);
        setDataMessage("従来形式JSONを読み込みました。");
        return;
      }

      applyCompactSaveData(imported);
      renderDataMode();
      setDataMessage("短縮版JSONから進捗を復元しました。");
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
