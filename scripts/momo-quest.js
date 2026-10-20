/* 271語を一語ずつ正解にする問題と、関連する文法100問。問題IDは既存教材と分離。 */
(function(root){
  'use strict';
  const words=typeof module!=='undefined'&&module.exports?require('./momo-words.js'):root.QuestMomoWords;
  const grammar=typeof module!=='undefined'&&module.exports?require('./momo-grammar.js'):root.QuestMomoGrammar;
  const themes=[
    ['旅の準備と発見','風船・旅行案内・オーストラリア'],
    ['観光と案内','観光地・申込み・持ち物'],
    ['暮らしと食文化','おもてなし・思い出・食べ物'],
    ['料理と作品づくり','動物・料理・紙の作品'],
    ['贈り物と舞台','お土産・冒険・演技'],
    ['交流と物語','文化の違い・会話・喜び'],
    ['毎日の会話','身のまわりの物・助け合いの表現']
  ];
  const units=themes.map(([name,description],index)=>({id:'g2-momo-words-'+(index+1),grade:2,category:'vocabulary',name,description}));
  function meanings(entry){return entry.meaning.replace(/[〜～…]/g,'').split(/[・／/]/).filter(part=>part.length>1);}
  const nearSynonyms=[['abroad','overseas'],['precious','valuable'],['fantastic','excellent','impressive']];
  function overlaps(a,b){return meanings(a).some(part=>meanings(b).includes(part))||nearSynonyms.some(group=>group.includes(a.word)&&group.includes(b.word));}
  function family(entry){
    if(/過去形|過去分詞|現在分詞/.test(entry.partOfSpeech))return '動詞の活用形';
    if(/比較級|限定詞/.test(entry.partOfSpeech))return '形容詞';
    return entry.partOfSpeech.split('・')[0];
  }
  const questions=words.map((entry,index)=>{
    const group=family(entry);
    const peers=words.filter(other=>other.word!==entry.word&&!overlaps(entry,other));
    const preferred=peers.filter(other=>family(other)===group);
    const pool=preferred.length>=3?preferred:[...preferred,...peers.filter(other=>!preferred.includes(other))];
    const distractors=[];
    // 元リストの順序に偏りすぎないように、固定の間隔で選択肢を選ぶ。
    let cursor=(index*17+7)%pool.length;
    while(distractors.length<3){const candidate=pool[cursor];if(!distractors.includes(candidate.word))distractors.push(candidate.word);cursor=(cursor+1)%pool.length;}
    const options=[...distractors];options.splice(index%4,0,entry.word);
    return {id:'eq2-momo-v'+String(index+1).padStart(3,'0'),grade:2,category:'vocabulary',unitId:units[Math.floor(index/40)].id,prompt:'「'+entry.meaning+'」に合う英語は？',options,answer:entry.word,explanation:entry.word+' は「'+entry.meaning+'」を表します。'+entry.note,sourceWords:[entry.word],sourceIndex:entry.sourceIndex};
  });
  const data={units:units.concat(grammar.units),questions:questions.concat(grammar.questions),source:{file:'momo_choice_英単語一覧20261020.xlsx',wordCount:271,grammarCount:100}};
  if(typeof module!=='undefined'&&module.exports)module.exports=data;
  else root.QuestMomo=data;
})(typeof globalThis!=='undefined'?globalThis:this);
