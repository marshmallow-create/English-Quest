'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../scripts/progress.js');
const A=require('../scripts/analysis.js');
const {questions,units}=require('../scripts/questions.js');
const original=require('./step1-questions.json');
function respond(progress,q,correct,date){
  const quest=P.createQuest([q]);
  P.answer(progress,quest,correct?q.answer:q.options.find(o=>o!==q.answer),date);
}
test('既存30問のID・単元・選択肢・解説をすべて維持',()=>{
  for(const old of original) assert.deepEqual(questions.find(q=>q.id===old.id),old);
});
test('各学年100問、各コース50問、全単元10問以上、すべての新規問題に解説',()=>{
  for(const grade of [1,2,3]){
    assert.equal(questions.filter(q=>q.grade===grade).length,100);
    for(const category of ['vocabulary','grammar']){
      const list=questions.filter(q=>q.grade===grade&&q.category===category);
      assert.equal(list.length,50);
      if(category==='vocabulary') assert.equal(new Set(list.map(q=>q.answer)).size,50,'同じ単語で水増ししない');
      const positions=new Set(list.map(q=>q.options.indexOf(q.answer)));
      assert.equal(positions.size,4,'正解の位置が偏らない');
    }
  }
  for(const unit of units) assert.ok(questions.filter(q=>q.unitId===unit.id).length>=10);
  for(const q of questions){
    assert.match(q.id,/^eq[123]-[vg]\d{2}$/);
    assert.ok(q.explanation.length>=20,q.id);
    assert.ok(q.options.every(o=>typeof o==='string'&&o===o.trim()&&o.length>0),q.id);
  }
});
test('STEP 1で保存されたv2の復習・問題別履歴・XPを変更せず読み込む',()=>{
  const old=P.empty();
  respond(old,original[0],false,new Date(2026,9,16,15));
  respond(old,original[1],true,new Date(2026,9,17,12));
  const raw=JSON.stringify(old);
  const loaded=P.load({getItem:key=>key===P.KEY?raw:null},questions).progress;
  assert.deepEqual(loaded,old);
  assert.equal(A.summarize(loaded,questions,units,new Date(2026,9,17,18)).grades[0].attempted,2);
});
test('空の分析は0件と未計測。未回答を不正解にせず、復習の推薦を捏造しない',()=>{
  const analysis=A.summarize(P.empty(),questions,units,new Date(2026,9,17,18));
  assert.equal(analysis.days.length,7);
  assert.deepEqual(analysis.week,{answered:0,correct:0});
  assert.ok(analysis.unitStats.every(u=>u.accuracy===null));
  assert.deepEqual(analysis.recommendations,[]);
  assert.ok(analysis.grades.every(g=>g.total===100&&g.attempted===0&&g.correctOnce===0));
});
test('直近7日はローカル日付で日別集計し、範囲外・未来の回答を含めない',()=>{
  const progress=P.empty(),q=questions[0],now=new Date(2026,9,17,18);
  respond(progress,q,true,new Date(2026,9,10,23,59));
  respond(progress,q,false,new Date(2026,9,11,0,0));
  respond(progress,q,true,new Date(2026,9,17,0,1));
  respond(progress,q,true,new Date(2026,9,17,17,59));
  respond(progress,q,true,new Date(2026,9,17,19));
  respond(progress,q,true,new Date(2026,9,18,0,1));
  const analysis=A.summarize(progress,questions,units,now);
  assert.deepEqual(analysis.week,{answered:3,correct:2});
  assert.deepEqual(analysis.days[0],{date:'2026-10-11',answered:1,correct:0});
  assert.deepEqual(analysis.days.at(-1),{date:'2026-10-17',answered:2,correct:2});
  assert.equal(analysis.grades[0].attempted,1,'繰り返し回答を別問題として数えない');
  assert.equal(analysis.grades[0].correctOnce,1);
});
test('週の範囲は年をまたいで計算、履歴のない旧集計値は週の数値に含めない',()=>{
  const progress=P.empty();progress.answered=999;progress.correct=900;
  const analysis=A.summarize(progress,questions,units,new Date(2027,0,3,10));
  assert.equal(analysis.days[0].date,'2026-12-28');
  assert.equal(analysis.days.at(-1).date,'2027-01-03');
  assert.deepEqual(analysis.week,{answered:0,correct:0});
});
test('推薦は現在の復習対象数と正答率で並び、正解で解除された問題は含めない',()=>{
  const progress=P.empty(),now=new Date(2026,9,17,12);
  const words=questions.filter(q=>q.unitId==='g1-words').slice(0,2);
  const verbs=questions.find(q=>q.unitId==='g1-verbs');
  const otherGrade=questions.find(q=>q.grade===2);
  for(const q of [...words,verbs,otherGrade]) respond(progress,q,false,now);
  let analysis=A.summarize(progress,questions,units,now);
  assert.equal(analysis.recommendations[0].id,'g1-words');
  assert.equal(analysis.recommendations[0].reviewCount,2);
  for(const q of words) respond(progress,q,true,now);
  analysis=A.summarize(progress,questions,units,now);
  assert.ok(!analysis.recommendations.some(u=>u.id==='g1-words'));
  assert.equal(analysis.recommendations.filter(u=>u.grade===1).length,1);
});
test('全300問の正解・誤答が履歴に残り、追加問題でも復習登録と解除が動く',()=>{
  const progress=P.empty(),now=new Date(2026,9,17,12);
  for(const q of questions) respond(progress,q,false,now);
  assert.equal(progress.reviewIds.length,300);
  for(const q of questions) respond(progress,q,true,now);
  assert.equal(progress.reviewIds.length,0);
  const analysis=A.summarize(progress,questions,units,now);
  assert.deepEqual(analysis.week,{answered:600,correct:300});
  assert.ok(analysis.grades.every(g=>g.attempted===100&&g.correctOnce===100));
  assert.equal(progress.xp,3750);
});
