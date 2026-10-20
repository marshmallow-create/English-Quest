'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const P = require('../scripts/progress.js');
const {questions,units} = require('../scripts/questions.js');
function storage(initial={}) {
  const values = new Map(Object.entries(initial));
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
}
function run(progress,list,correct=true,date=new Date(2026,9,17,12)) {
  const quest=P.createQuest(list,()=>.5);
  do {
    const q=quest.questions[quest.index];
    P.answer(progress,quest,correct?q.answer:q.options.find(o=>o!==q.answer),date);
  } while(P.next(quest));
  return quest;
}
test('全571問に固定ID・4つの異なる選択肢・一意の正解・対応単元がある',()=>{
  assert.equal(questions.length,571);
  assert.equal(new Set(questions.map(q=>q.id)).size,571);
  assert.equal(new Set(questions.map(q=>q.prompt.trim())).size,571,'同じ問題文で水増ししない');
  for(const q of questions){
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4);
    assert.equal(q.options.filter(o=>o===q.answer).length,1);
    assert.match(q.explanation,/[ぁ-んァ-ン一-龠]/);
    assert.ok(units.some(u=>u.id===q.unitId&&u.grade===q.grade&&u.category===q.category));
  }
});
test('3学年×2コースと全27単元が最後まで進み、コース別XP・ボーナスを付与',()=>{
  for(const grade of [1,2,3]) for(const category of ['vocabulary','grammar']) {
    const progress=P.empty();
    const quest=run(progress,questions.filter(q=>q.grade===grade&&q.category===category));
    assert.equal(quest.questions.length,10);
    assert.equal(quest.completed,true);
    assert.equal(progress.xp,category==='vocabulary'?140:190);
    assert.equal(quest.bonusCount,2);
    assert.equal(progress.correct,10);
    assert.equal(progress.sessions,1);
  }
  for(const u of units) {
    const progress=P.empty();
    const quest=run(progress,questions.filter(q=>q.unitId===u.id));
    assert.ok(quest.completed);
    assert.ok(quest.questions.length<=10);
  }
});
test('最大10問・5問ごとにボーナス2回・100XPごとのレベル',()=>{
  const progress=P.empty();
  const original=require('./step1-questions.json');
  const quest=run(progress,original.filter(q=>q.grade===1));
  assert.equal(quest.questions.length,10);
  assert.equal(quest.bonusCount,2);
  assert.equal(progress.xp,165);
  assert.equal(Math.floor(progress.xp/100)+1,2);
  assert.equal(P.createQuest(questions).questions.length,10);
  assert.equal(P.createQuest([]).questions.length,0);
});
test('二重回答・不正な選択肢・未回答の次へ・完了後の操作を拒否',()=>{
  const progress=P.empty();
  const quest=P.createQuest(questions.slice(0,2));
  assert.equal(P.next(quest),false);
  assert.equal(P.answer(progress,quest,'invalid'),null);
  const q=quest.questions[0];
  assert.ok(P.answer(progress,quest,q.answer));
  assert.equal(P.answer(progress,quest,q.answer),null);
  assert.equal(progress.answered,1);
  assert.equal(progress.xp,10);
  P.next(quest);
  P.answer(progress,quest,quest.questions[1].answer);
  assert.equal(P.next(quest),false);
  assert.equal(P.answer(progress,quest,quest.questions[1].answer),null);
  assert.equal(progress.sessions,1);
});
test('誤答は重複登録せず、通常・復習の正解で解除し、選択肢と日時の履歴を保存',()=>{
  const progress=P.empty();
  const list=questions.slice(0,1);
  run(progress,list,false);
  run(progress,list,false);
  assert.deepEqual(progress.reviewIds,[list[0].id]);
  assert.equal(progress.xp,0);
  run(progress,questions.filter(q=>progress.reviewIds.includes(q.id)),true);
  assert.deepEqual(progress.reviewIds,[]);
  const stat=progress.questionStats[list[0].id];
  assert.equal(stat.attempts,3);
  assert.equal(stat.correct,1);
  assert.deepEqual(stat.history.map(h=>h.correct),[false,false,true]);
  assert.ok(stat.history.every(h=>h.at&&h.selected));
  run(progress,list,false);run(progress,list,true);
  assert.deepEqual(progress.reviewIds,[]);
});
test('誤答で連続正解をリセット・途中の回答だけでは完了日にならない',()=>{
  const progress=P.empty();
  const quest=P.createQuest(questions.filter(q=>q.grade===1));
  for(let i=0;i<10;i++){
    const q=quest.questions[quest.index];
    const correct=i!==4;
    P.answer(progress,quest,correct?q.answer:q.options.find(o=>o!==q.answer));
    if(i<9) {assert.equal(progress.sessions,0);assert.deepEqual(progress.studyDates,[]);}
    P.next(quest);
  }
  assert.equal(quest.bonusCount,1);
  assert.equal(quest.combo,5);
  assert.equal(progress.sessions,1);
});
test('連続日数は同日増えず、翌日増加、間隔が空けばリセット（月・年をまたぐ）',()=>{
  const progress=P.empty();
  const list=questions.slice(0,1);
  run(progress,list,true,new Date(2026,11,31,23));
  run(progress,list,true,new Date(2026,11,31,23,59));
  assert.equal(progress.streakDays,1);
  run(progress,list,true,new Date(2027,0,1,0,1));
  assert.equal(progress.streakDays,2);
  assert.equal(progress.studyDates.length,2);
  assert.equal(P.streak(progress,'2027-01-02'),2);
  assert.equal(P.streak(progress,'2027-01-03'),0);
  run(progress,list,true,new Date(2027,0,3,12));
  assert.equal(progress.streakDays,1);
  assert.equal(progress.sessions,4);
});
test('localStorageの再読込で回答履歴・XP・復習・完了数を保持、二重計上しない',()=>{
  const store=storage();
  const progress=P.empty();
  run(progress,questions.slice(0,5));
  run(progress,questions.slice(0,1),false);
  assert.equal(P.save(store,progress),true);
  for(let i=0;i<3;i++) assert.deepEqual(P.load(store,questions).progress,progress);
});
test('v1は型の分かる集計のみ移行し元データを保持、v2作成後は再移行しない',()=>{
  const old=JSON.stringify({totalAnswered:12,totalCorrect:8,studyCount:3,reviewIds:['unknown',questions[0].id],xp:45});
  const store=storage({[P.LEGACY_KEY]:old});
  const {progress}=P.load(store,questions);
  assert.equal(progress.answered,12);assert.equal(progress.correct,8);assert.equal(progress.sessions,3);assert.equal(progress.xp,45);
  assert.deepEqual(progress.reviewIds,[questions[0].id]);
  assert.equal(progress.streakDays,0);
  assert.equal(store.getItem(P.LEGACY_KEY),old);
  store.setItem(P.LEGACY_KEY,JSON.stringify({answered:999}));
  assert.equal(P.load(store,questions).progress.answered,12);
  assert.match(progress.migrationNote,/旧データ/);
});
test('破損・異常値・未知のschema・保存禁止でクラッシュせず、破損原文を退避',()=>{
  for(const value of ['{broken','null','[]',JSON.stringify({schemaVersion:99})]){
    const store=storage({[P.KEY]:value});
    const loaded=P.load(store,questions);
    assert.equal(loaded.progress.answered,0);
    assert.ok(loaded.notice);
    assert.equal(store.getItem(P.KEY+'-recovery'),value);
  }
  const q=questions[0];
  const progress=P.normalize({answered:-1,correct:999,xp:'10',studyDates:['bad','2026-02-30','2026-10-17','2026-10-17'],reviewIds:[q.id,q.id,'unknown'],questionStats:{[q.id]:{attempts:2,correct:999,history:[null,{at:'bad',correct:true,selected:q.answer}]}}},questions);
  assert.equal(progress.answered,0);assert.equal(progress.correct,0);assert.equal(progress.xp,0);
  assert.deepEqual(progress.studyDates,['2026-10-17']);assert.equal(progress.streakDays,1);
  assert.deepEqual(progress.reviewIds,[q.id]);assert.equal(progress.questionStats[q.id].correct,2);
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('full');}};
  assert.ok(P.load(blocked,questions).notice);assert.equal(P.save(blocked,P.empty()),false);
  const oldStore=storage({[P.LEGACY_KEY]:'broken'});
  assert.ok(P.load(oldStore,questions).notice);assert.equal(oldStore.getItem(P.LEGACY_KEY),'broken');
});
