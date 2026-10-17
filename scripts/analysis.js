(function (root) {
  'use strict';
  const P = typeof module !== 'undefined' && module.exports ? require('./progress.js') : root.QuestProgress;
  function summarize(progress, questions, units, now = new Date()) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    const days = Array.from({length:7},(_,i)=>{
      const date = new Date(today);
      date.setDate(date.getDate() - (6-i));
      return {date:P.dayKey(date), answered:0, correct:0};
    });
    const byDay = new Map(days.map(day=>[day.date,day]));
    for (const question of questions) {
      for (const item of progress.questionStats[question.id]?.history || []) {
        const at = new Date(item.at);
        if (Number.isNaN(at.getTime()) || at > now) continue;
        const day = byDay.get(P.dayKey(at));
        if (day) { day.answered++; if(item.correct) day.correct++; }
      }
    }
    const review = new Set(progress.reviewIds);
    const unitStats = units.map(unit=>{
      const list = questions.filter(q=>q.unitId===unit.id);
      const total = list.length;
      let attempted=0, correctOnce=0, attempts=0, correct=0, reviewCount=0;
      for (const question of list) {
        const stat = progress.questionStats[question.id];
        if(stat?.attempts) attempted++;
        if(stat?.correct) correctOnce++;
        attempts += stat?.attempts || 0;
        correct += stat?.correct || 0;
        if(review.has(question.id)) reviewCount++;
      }
      return {...unit,total,attempted,correctOnce,attempts,correct,reviewCount,accuracy:attempts ? correct/attempts : null};
    });
    const grades = [1,2,3].map(grade=>{
      const list = unitStats.filter(unit=>unit.grade===grade);
      return {grade,total:list.reduce((n,u)=>n+u.total,0),attempted:list.reduce((n,u)=>n+u.attempted,0),correctOnce:list.reduce((n,u)=>n+u.correctOnce,0)};
    });
    const week = days.reduce((sum,day)=>({answered:sum.answered+day.answered,correct:sum.correct+day.correct}),{answered:0,correct:0});
    // 解消済みの古い誤答を勧めず、現在の復習対象を優先。
    const recommendations = unitStats.filter(u=>u.reviewCount>0).sort((a,b)=>b.reviewCount-a.reviewCount || a.accuracy-b.accuracy || a.id.localeCompare(b.id));
    return {days,week,grades,unitStats,recommendations};
  }
  const api = {summarize};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QuestAnalysis = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
