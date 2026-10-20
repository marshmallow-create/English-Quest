'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const source=require('./momo-source.json');
const words=require('../scripts/momo-words.js');
const momo=require('../scripts/momo-quest.js');
const {questions,units}=require('../scripts/questions.js');
const P=require('../scripts/progress.js');
const C=require('../scripts/cloud.js');
const original=require('./step1-questions.json');

test('Excelの271語と表記・順序が一致し、全語が正解として1回ずつ出題される',()=>{
  const file=path.join(__dirname,'..',source.file);
  if(fs.existsSync(file))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),source.sha256,'元Excelの取り違えを検出');
  assert.equal(words.length,271);assert.equal(new Set(source.words).size,271);
  assert.deepEqual(words.map(entry=>entry.word),source.words);
  const vocab=momo.questions.filter(q=>q.category==='vocabulary');
  assert.deepEqual(vocab.map(q=>q.answer),source.words);
  for(const [index,q] of vocab.entries()){
    assert.equal(q.sourceIndex,index+1);assert.equal(q.grade,2);
    assert.deepEqual(q.sourceWords,[q.answer]);
    assert.ok(q.options.every(word=>source.words.includes(word)));
    assert.equal(q.options.filter(word=>word===q.answer).length,1);
    assert.equal(new Set(q.options).size,4);
    assert.ok(q.explanation.includes(words[index].meaning));
    assert.ok(words[index].partOfSpeech&&words[index].note);
  }
  const byAnswer=new Map(vocab.map(q=>[q.answer,q]));
  assert.ok(!byAnswer.get('abroad').options.includes('overseas'));
  assert.ok(!byAnswer.get('precious').options.includes('valuable'));
  assert.ok(byAnswer.get('introduce ... to ～').options.every(word=>words.find(entry=>entry.word===word).partOfSpeech==='熟語'));
});

test('中2の英文法は100問・10単元、Excel語彙に関連し、正解位置が均等',()=>{
  const list=momo.questions.filter(q=>q.category==='grammar');
  assert.equal(list.length,100);assert.equal(new Set(list.map(q=>q.prompt)).size,100);
  assert.equal(new Set(list.map(q=>q.unitId)).size,10);
  for(const q of list){
    assert.ok(q.prompt.includes('___'));assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
    assert.ok(q.sourceWords.length>0);assert.ok(q.sourceWords.every(word=>source.words.includes(word)),q.id);
    assert.ok(q.explanation.length>=35,q.id);
  }
  for(const i of [0,1,2,3])assert.equal(list.filter(q=>q.options.indexOf(q.answer)===i).length,25);
  for(const unit of units.filter(u=>u.grade===2&&u.category==='grammar'))assert.equal(list.filter(q=>q.unitId===unit.id).length,10);
  assert.ok(units.filter(u=>u.id.startsWith('g2-momo-perfect')).every(u=>u.name.includes('発展')));
});

test('新教材371問すべてで誤答→復習正解、XP・履歴・解説を確認できる',()=>{
  const progress=P.empty();
  for(const q of momo.questions){
    const wrong=P.createQuest([q]);P.answer(progress,wrong,q.options.find(option=>option!==q.answer));
    assert.ok(progress.reviewIds.includes(q.id));assert.equal(wrong.answers[0].correct,false);
    const retry=P.createQuest([q]),before=progress.xp;P.answer(progress,retry,q.answer);
    assert.equal(progress.xp-before,q.category==='vocabulary'?10:15);
    assert.equal(progress.reviewIds.includes(q.id),false);
    assert.equal(progress.questionStats[q.id].attempts,2);assert.equal(progress.questionStats[q.id].correct,1);
    assert.match(q.explanation,/[ぁ-んァ-ヶ一-龥]/);
  }
  const normalized=C.parseBackup(JSON.stringify(progress),P,questions);
  assert.deepEqual(normalized,progress);assert.equal(progress.xp,4210);
});

test('廃止する中2の旧IDを新版へ割り当てず、累計XPと中1・中3の履歴は維持する',()=>{
  const progress=P.empty();
  for(const q of original){const quest=P.createQuest([q]);P.answer(progress,quest,q.grade===2?q.options.find(w=>w!==q.answer):q.answer);}
  const loaded=P.normalize(progress,questions);
  assert.equal(loaded.xp,progress.xp);assert.equal(loaded.answered,progress.answered);assert.equal(loaded.sessions,progress.sessions);
  assert.equal(loaded.reviewIds.length,0);
  assert.equal(Object.keys(loaded.questionStats).length,20);
  for(const q of momo.questions){assert.equal(loaded.questionStats[q.id],undefined);assert.ok(!original.some(old=>old.id===q.id));}
});
