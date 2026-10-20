'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../scripts/progress.js');
const A=require('../scripts/analysis.js');
const {questions,units}=require('../scripts/questions.js');
const original=require('./step1-questions.json');
const vocabulary=require('../scripts/vocabulary.js');
function respond(progress,q,correct,date){
  const quest=P.createQuest([q]);
  P.answer(progress,quest,correct?q.answer:q.options.find(o=>o!==q.answer),date);
}

test('すべての英単語の選択肢に意味・品詞があり、全200問の英文法に解説がある',()=>{
  const words=new Set(questions.filter(q=>q.category==='vocabulary').flatMap(q=>q.options));
  assert.ok(words.size>=271);
  for(const word of words){const entry=vocabulary[word];assert.ok(entry,word);assert.match(entry.meaning,/[ぁ-んァ-ヶ一-龥]/);assert.ok(entry.partOfSpeech.length>0,word);}
  for(const q of questions.filter(q=>q.category==='grammar'))assert.ok(q.explanation.trim().length>=20,q.id);
  assert.match(vocabulary.borrow.note,/借りる/);assert.match(vocabulary.lend.note,/貸す/);
  assert.notEqual(vocabulary.interested.meaning,vocabulary.interesting.meaning);
});
test('中1・中3の既存20問を維持し、中2の旧教材IDは再利用しない',()=>{
  for(const old of original){if(old.grade!==2)assert.deepEqual(questions.find(q=>q.id===old.id),old);else assert.equal(questions.find(q=>q.id===old.id),undefined);}
});
test('中2は単語271問・文法100問、中1・中3は従来の各100問、全単元10問以上',()=>{
  for(const grade of [1,2,3]){
    assert.equal(questions.filter(q=>q.grade===grade).length,grade===2?371:100);
    for(const category of ['vocabulary','grammar']){
      const list=questions.filter(q=>q.grade===grade&&q.category===category);
      const expected=grade===2?(category==='vocabulary'?271:100):50;assert.equal(list.length,expected);
      if(category==='vocabulary') assert.equal(new Set(list.map(q=>q.answer)).size,expected,'同じ単語で水増ししない');
      const positions=new Set(list.map(q=>q.options.indexOf(q.answer)));
      assert.equal(positions.size,4,'正解の位置が偏らない');
    }
  }
  for(const unit of units) assert.ok(questions.filter(q=>q.unitId===unit.id).length>=10);
  for(const q of questions){
    assert.match(q.id,/^eq(?:[13]-[vg]\d{2}|2-momo-[vg]\d{3})$/);
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
  assert.ok(analysis.grades.every(g=>g.total===(g.grade===2?371:100)&&g.attempted===0&&g.correctOnce===0));
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
test('全571問の正解・誤答が履歴に残り、追加問題でも復習登録と解除が動く',()=>{
  const progress=P.empty(),now=new Date(2026,9,17,12);
  for(const q of questions) respond(progress,q,false,now);
  assert.equal(progress.reviewIds.length,571);
  for(const q of questions) respond(progress,q,true,now);
  assert.equal(progress.reviewIds.length,0);
  const analysis=A.summarize(progress,questions,units,now);
  assert.deepEqual(analysis.week,{answered:1142,correct:571});
  assert.ok(analysis.grades.every(g=>g.attempted===g.total&&g.correctOnce===g.total));
  assert.equal(progress.xp,6710);
});
