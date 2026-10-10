"use strict";

// Answered dates and full-clear dates are facts; all counters are derived from them.
const LearningStreak = (() => {
  const milestones = {
    3: "3日も続いたね！冒険はまだまだこれから！",
    7: "1週間達成！コツコツ続ける力が育ってるよ！",
    14: "2週間達成！すっかり冒険の達人だね！",
    30: "30日達成！毎日の努力が大きな力になっているよ！",
    50: "50日達成！すごい冒険の記録だね！",
    100: "100日達成！伝説の漢字マスターに近づいたね！"
  };
  function today(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(now);
    const value = type => parts.find(part => part.type === type).value;
    return `${value("year")}-${value("month")}-${value("day")}`;
  }
  function dayNumber(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
    const number = Date.parse(`${value}T00:00:00Z`);
    if (!Number.isFinite(number) || new Date(number).toISOString().slice(0, 10) !== value) return NaN;
    return number / 86400000;
  }
  function normalize(value) {
    const d = [...new Set((Array.isArray(value?.d) ? value.d : []).filter(date => Number.isFinite(dayNumber(date))))].sort();
    const f = [...new Set((Array.isArray(value?.f) ? value.f : []).filter(date => d.includes(date)))].sort();
    return { d, f };
  }
  function stats(value, date = today()) {
    const dates = normalize(value).d.filter(day => day <= date);
    let run = 0, best = 0, previous = "";
    for (const day of dates) {
      run = previous && dayNumber(day) - dayNumber(previous) <= 2 ? run + 1 : 1;
      best = Math.max(best, run);
      previous = day;
    }
    const gap = previous ? dayNumber(date) - dayNumber(previous) : Infinity;
    return { current: gap <= 2 ? run : 0, best, total: dates.length, last: previous, gap };
  }
  function complete(value, date = today()) {
    const state = normalize(value);
    const before = stats(state, date);
    // A stored future completion is also a watermark against clock rollback.
    if (state.d.some(day => day >= date) || !Number.isFinite(dayNumber(date))) {
      return { state, added: false, stats: before, message: "", milestone: false };
    }
    state.d.push(date);
    const after = stats(state, date);
    const milestone = Boolean(milestones[after.current]);
    const normal = ["今日もよくがんばったね！", "コツコツ進んだ分が力になるよ！", "今日の冒険も、よくやりきったね！"];
    const message = milestones[after.current]
      || (before.gap === 2 ? "おかえり！また冒険を始められたね！" : "")
      || (before.total && before.current === 0 ? "今日から新しい冒険！これまでの努力も宝物だよ！" : "")
      || (before.best > 0 && after.current > before.best ? "新記録達成！昨日までの自分を超えたね！" : "")
      || normal[(after.total - 1) % normal.length];
    return { state, added: true, stats: after, message, milestone };
  }
  function finish(value, date = today()) {
    const state = normalize(value);
    if (!state.d.includes(date) || state.f.includes(date) || state.d.some(day => day > date)) {
      return { state, added: false, stats: stats(state, date), message: "", milestone: false };
    }
    // Reuse encouragement from the day's first answer; promotion never adds a day.
    const encouragement = complete({ d: state.d.filter(day => day !== date), f: state.f }, date);
    state.f.push(date);
    state.f.sort();
    return { ...encouragement, state, added: true, stats: stats(state, date) };
  }
  function calendarStatus(value, date, currentDate = today()) {
    const state = normalize(value);
    if (date > currentDate) return "empty";
    if (state.f.includes(date)) return "full";
    if (state.d.includes(date)) return "answered";
    const number = dayNumber(date);
    if (date === currentDate && stats(state, currentDate).gap === 2) return "revival";
    const past = state.d.filter(day => day <= currentDate);
    const before = past.some(day => dayNumber(day) === number - 1);
    const after = past.some(day => dayNumber(day) === number + 1);
    return before && after ? "revival" : "empty";
  }
  function validate(value, requireFull = false) {
    if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.d)
      || value.d.some(date => !Number.isFinite(dayNumber(date)))
      || (requireFull && !Array.isArray(value.f))
      || (value.f !== undefined && (!Array.isArray(value.f) || value.f.some(date => !Number.isFinite(dayNumber(date)) || !value.d.includes(date))))) {
      throw new Error("Invalid streak data");
    }
    return normalize(value);
  }
  function merge(a, b) {
    const left = normalize(a), right = normalize(b);
    return normalize({ d: [...left.d, ...right.d], f: [...left.f, ...right.f] });
  }
  return { today, dayNumber, normalize, stats, complete, finish, calendarStatus, validate, merge };
})();
if (typeof module !== "undefined") module.exports = LearningStreak;
