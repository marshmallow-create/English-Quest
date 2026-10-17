(function (root) {
  'use strict';
  const KEY = 'english-quest-v2';
  const LEGACY_KEY = 'english-quest-v1';
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const count = v => Number.isSafeInteger(v) && v >= 0 ? v : 0;
  function dayKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function validDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00`);
    return !Number.isNaN(date.getTime()) && dayKey(date) === value;
  }
  function previousDay(value) {
    const date = new Date(`${value}T12:00:00`);
    date.setDate(date.getDate()-1);
    return dayKey(date);
  }
  function empty() {
    return { schemaVersion: 2, xp: 0, answered: 0, correct: 0, sessions: 0, lastStudyDate: null, streakDays: 0, studyDates: [], reviewIds: [], questionStats: {}, migrationNote: '' };
  }
  function normalize(raw, questions) {
    if (!object(raw)) throw new Error('Invalid progress');
    const result = empty();
    for (const name of ['xp','answered','correct','sessions']) result[name] = count(raw[name]);
    result.correct = Math.min(result.correct, result.answered);
    result.studyDates = [...new Set((Array.isArray(raw.studyDates) ? raw.studyDates : []).filter(validDay))].sort();
    result.lastStudyDate = result.studyDates.at(-1) || null;
    if (result.lastStudyDate) {
      let cursor = result.lastStudyDate;
      const dates = new Set(result.studyDates);
      while (dates.has(cursor)) { result.streakDays++; cursor = previousDay(cursor); }
    }
    const known = new Set(questions.map(q => q.id));
    result.reviewIds = [...new Set((Array.isArray(raw.reviewIds) ? raw.reviewIds : []).filter(id => known.has(id)))];
    if (object(raw.questionStats)) {
      for (const question of questions) {
        const stat = Object.hasOwn(raw.questionStats,question.id) ? raw.questionStats[question.id] : null;
        if (!object(stat)) continue;
        const attempts = count(stat.attempts);
        result.questionStats[question.id] = {
          attempts, correct: Math.min(count(stat.correct), attempts),
          lastAnsweredAt: typeof stat.lastAnsweredAt === 'string' && Number.isFinite(Date.parse(stat.lastAnsweredAt)) ? stat.lastAnsweredAt : null,
          history: (Array.isArray(stat.history) ? stat.history : []).filter(h => object(h) && typeof h.correct === 'boolean' && question.options.includes(h.selected) && typeof h.at === 'string' && Number.isFinite(Date.parse(h.at))).map(h => ({at:h.at, selected:h.selected, correct:h.correct}))
        };
      }
    }
    result.migrationNote = typeof raw.migrationNote === 'string' ? raw.migrationNote : '';
    return result;
  }
  function save(storage, progress) {
    try { storage.setItem(KEY, JSON.stringify(progress)); return true; }
    catch { return false; }
  }
  function load(storage, questions) {
    let raw;
    try { raw = storage.getItem(KEY); }
    catch { return {progress:empty(), notice:'ブラウザの保存機能が利用できません。今回の記録は画面を閉じると失われます。'}; }
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (!object(parsed) || parsed.schemaVersion !== 2) throw new Error('Unknown schema');
        return {progress:normalize(parsed, questions), notice:''};
      } catch {
        let backedUp = false;
        try { storage.setItem(`${KEY}-recovery`, raw); backedUp = true; } catch { /* 保存不可でも学習を続けられる */ }
        return { progress:empty(), notice: backedUp ? '保存データを読み取れなかったため初期状態で開始しました。元データは復旧用キー english-quest-v2-recovery に保管しました。' : '保存データを読み取れなかったため初期状態で開始しました。元データの退避もできませんでした。' };
      }
    }
    try {
      const oldRaw = storage.getItem(LEGACY_KEY);
      if (oldRaw === null) return {progress:empty(),notice:''};
      const old = JSON.parse(oldRaw);
      if (!object(old)) throw new Error('Invalid legacy data');
      // 旧版ソースがないため、名前と型を確認できる集計値のみ移行する。
      const firstCount = (...values) => values.find(v => Number.isSafeInteger(v) && v >= 0) ?? 0;
      const progress = normalize({
        answered: firstCount(old.answered,old.totalAnswered),
        correct: firstCount(old.correct,old.totalCorrect),
        sessions: firstCount(old.sessions,old.studyCount),
        xp: firstCount(old.xp),
        reviewIds: old.reviewIds
      },questions);
      progress.migrationNote = '旧版から読み取れる回答数・正答数・学習回数・XPを移行しました（存在する項目のみ）。旧問題IDの対応と学習日は確認できないため、対応不明の復習・問題別履歴・連続日数は引き継いでいません。旧データは english-quest-v1 に残しています。';
      const saved = save(storage,progress);
      return {progress, notice: progress.migrationNote + (saved ? '' : ' 新しいデータを保存できません。今回の記録は画面を閉じると失われる可能性があります。')};
    } catch {
      return {progress:empty(),notice:'旧データを読み取れませんでした。旧データはそのまま残し、新しい学習記録を開始します。'};
    }
  }
  function streak(progress, today = dayKey()) {
    return progress.lastStudyDate === today || progress.lastStudyDate === previousDay(today) ? progress.streakDays : 0;
  }
  function complete(progress, today) {
    progress.sessions++;
    if (!progress.studyDates.includes(today)) progress.studyDates.push(today);
    progress.studyDates.sort();
    progress.lastStudyDate = progress.studyDates.at(-1);
    let cursor = progress.lastStudyDate;
    const dates = new Set(progress.studyDates);
    progress.streakDays = 0;
    while (dates.has(cursor)) { progress.streakDays++; cursor = previousDay(cursor); }
  }
  function createQuest(questions, random = Math.random) {
    const queue = [...questions];
    for (let i = queue.length-1; i > 0; i--) {
      const j = Math.floor(random() * (i+1));
      [queue[i],queue[j]] = [queue[j],queue[i]];
    }
    return { questions: queue.slice(0,10), index:0, answers:[], combo:0, bonusCount:0, xp:0, completed:false };
  }
  function answer(progress, quest, selected, now = new Date()) {
    const question = quest.questions[quest.index];
    if (!question || quest.completed || quest.answers.length !== quest.index || !question.options.includes(selected)) return null;
    const correct = selected === question.answer;
    const beforeLevel = Math.floor(progress.xp/100)+1;
    quest.combo = correct ? quest.combo+1 : 0;
    const bonus = correct && quest.combo % 5 === 0 && quest.bonusCount < 2 ? 20 : 0;
    if (bonus) quest.bonusCount++;
    const xp = correct ? (question.category === 'vocabulary' ? 10 : 15) + bonus : 0;
    const result = {id:question.id, selected, correct, xp, bonus};
    quest.answers.push(result);
    quest.xp += xp;
    progress.xp += xp;
    progress.answered++;
    if (correct) {
      progress.correct++;
      progress.reviewIds = progress.reviewIds.filter(id => id !== question.id);
    } else if (!progress.reviewIds.includes(question.id)) progress.reviewIds.push(question.id);
    const at = now.toISOString();
    const stat = progress.questionStats[question.id] || {attempts:0,correct:0,lastAnsweredAt:null,history:[]};
    stat.attempts++;
    if (correct) stat.correct++;
    stat.lastAnsweredAt = at;
    stat.history.push({at,selected,correct});
    progress.questionStats[question.id] = stat;
    if (quest.answers.length === quest.questions.length) {
      quest.completed = true;
      complete(progress,dayKey(now));
    }
    return {...result, levelUp:Math.floor(progress.xp/100)+1 > beforeLevel};
  }
  function next(quest) {
    if (quest.answers.length !== quest.index+1 || quest.completed) return false;
    quest.index++;
    return true;
  }
  const api = {KEY,LEGACY_KEY,empty,normalize,load,save,dayKey,streak,createQuest,answer,next};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QuestProgress = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
