/* 固定IDは保存済みの履歴と対応します。公開後は変更・再利用しないでください。 */
(function (root) {
  'use strict';
  const units = [
    { id: 'g1-words', grade: 1, category: 'vocabulary', name: '身のまわりのことば', description: '家族・学校・毎日の暮らし' },
    { id: 'g1-actions', grade: 1, category: 'vocabulary', name: '動きとようす', description: 'よく使う動詞と形容詞' },
    { id: 'g1-be', grade: 1, category: 'grammar', name: 'be動詞と疑問文', description: '主語に合うbe動詞を選ぼう' },
    { id: 'g1-verbs', grade: 1, category: 'grammar', name: '一般動詞と三単現', description: '動詞の形と疑問文のルール' },
    { id: 'g1-progressive', grade: 1, category: 'grammar', name: '現在進行形', description: '今していることを伝えよう' },
    { id: 'g2-words', grade: 2, category: 'vocabulary', name: '学校と社会', description: '世界を少し広げることば' },
    { id: 'g2-feelings', grade: 2, category: 'vocabulary', name: '気持ちと行動', description: '思いや行動を表すことば' },
    { id: 'g2-time', grade: 2, category: 'grammar', name: '過去形と未来表現', description: '昨日のこと・これからのこと' },
    { id: 'g2-infinitive', grade: 2, category: 'grammar', name: '不定詞と動名詞', description: '「〜すること」を表そう' },
    { id: 'g2-comparison', grade: 2, category: 'grammar', name: '比較', description: 'ふたつのものを比べよう' },
    { id: 'g3-words', grade: 3, category: 'vocabulary', name: '社会と未来', description: '考えを伝えるためのことば' },
    { id: 'g3-ideas', grade: 3, category: 'vocabulary', name: '思いと可能性', description: '少し抽象的なことばに挑戦' },
    { id: 'g3-perfect', grade: 3, category: 'grammar', name: '現在完了', description: '経験と継続を伝えよう' },
    { id: 'g3-passive', grade: 3, category: 'grammar', name: '受動態', description: '「〜される」を表そう' },
    { id: 'g3-relative', grade: 3, category: 'grammar', name: '関係代名詞と分詞', description: '名詞をくわしく説明しよう' }
  ];
  const rows = [
    ['eq1-v01',1,'vocabulary','g1-words','「図書館」を表す英単語は？',['library','station','kitchen','garden'],'library','library は「図書館」。学校の図書室にも使うことばです。'],
    ['eq1-v02',1,'vocabulary','g1-words','「姉・妹」を表す英単語は？',['brother','sister','father','uncle'],'sister','sister は「姉・妹」。英語では同じ単語で表します。'],
    ['eq1-v03',1,'vocabulary','g1-words','「朝食」を表す英単語は？',['dinner','lunch','breakfast','food'],'breakfast','breakfast は「朝食」、lunch は「昼食」、dinner は「夕食」です。'],
    ['eq1-v04',1,'vocabulary','g1-actions','「泳ぐ」を表す英単語は？',['read','walk','sing','swim'],'swim','swim は「泳ぐ」。I swim in summer. は「私は夏に泳ぎます」。'],
    ['eq1-v05',1,'vocabulary','g1-actions','「忙しい」を表す英単語は？',['busy','easy','happy','young'],'busy','busy は「忙しい」。I am busy. で「私は忙しいです」。'],
    ['eq1-g01',1,'grammar','g1-be','I ___ a student.',['is','are','am','be'],'am','主語が I のとき、be動詞は am を使います。'],
    ['eq1-g02',1,'grammar','g1-be','___ you from Japan?',['Is','Are','Am','Be'],'Are','主語が you の疑問文では Are を文の最初に置きます。'],
    ['eq1-g03',1,'grammar','g1-verbs','She ___ tennis every Sunday.',['play','playing','plays','to play'],'plays','主語が三人称単数の She で現在の習慣を表すので、play に s をつけます。'],
    ['eq1-g04',1,'grammar','g1-verbs','___ you like music?',['Does','Are','Is','Do'],'Do','一般動詞 like を使い、主語が you の疑問文は Do で始めます。'],
    ['eq1-g05',1,'grammar','g1-progressive','Look! Ken is ___ a book.',['read','reads','reading','to read'],'reading','現在進行形は「be動詞 + 動詞のing形」。今、本を読んでいるところです。'],
    ['eq2-v01',2,'vocabulary','g2-words','「博物館」を表す英単語は？',['hospital','museum','factory','airport'],'museum','museum は「博物館・美術館」。hospital は「病院」です。'],
    ['eq2-v02',2,'vocabulary','g2-words','「文化」を表す英単語は？',['weather','country','culture','subject'],'culture','culture は「文化」。食べ物や暮らしなどの文化について使えます。'],
    ['eq2-v03',2,'vocabulary','g2-words','「外国の」を表す英単語は？',['foreign','famous','friendly','free'],'foreign','foreign は「外国の」。a foreign language で「外国語」です。'],
    ['eq2-v04',2,'vocabulary','g2-feelings','「わくわくした」を表す英単語は？',['tired','hungry','angry','excited'],'excited','excited は「わくわくした・興奮した」。自分の気持ちを表します。'],
    ['eq2-v05',2,'vocabulary','g2-feelings','「〜を決める」を表す英単語は？',['forget','decide','borrow','arrive'],'decide','decide は「〜を決める」。decide to ... で「〜することに決める」です。'],
    ['eq2-g01',2,'grammar','g2-time','We ___ to the park yesterday.',['go','goes','went','going'],'went','yesterday は「昨日」。go の過去形 went を使います。'],
    ['eq2-g02',2,'grammar','g2-time','I am going ___ visit Kyoto tomorrow.',['to','for','at','with'],'to','「be going to + 動詞の原形」で、これからの予定を表します。'],
    ['eq2-g03',2,'grammar','g2-infinitive','I want ___ a doctor.',['become','becomes','becoming','to become'],'to become','want to + 動詞の原形で「〜したい」。want to become は「〜になりたい」です。'],
    ['eq2-g04',2,'grammar','g2-infinitive','She enjoys ___ pictures.',['take','taking','to take','takes'],'taking','enjoy の後に動詞を続けるときはing形（動名詞）を使います。'],
    ['eq2-g05',2,'grammar','g2-comparison','This bag is ___ than that one.',['big','biggest','bigger','as big'],'bigger','than を使ってふたつを比べるので比較級 bigger。big は g を重ねて er をつけます。'],
    ['eq3-v01',3,'vocabulary','g3-words','「環境」を表す英単語は？',['environment','experience','education','energy'],'environment','environment は「環境」。自然や身のまわりの環境について使います。'],
    ['eq3-v02',3,'vocabulary','g3-words','「〜を守る・保護する」を表す英単語は？',['produce','provide','protect','prepare'],'protect','protect は「〜を守る・保護する」。protect nature は「自然を守る」です。'],
    ['eq3-v03',3,'vocabulary','g3-words','「経験」を表す英単語は？',['example','exercise','exchange','experience'],'experience','experience は「経験」。an interesting experience は「おもしろい経験」です。'],
    ['eq3-v04',3,'vocabulary','g3-ideas','「可能な」を表す英単語は？',['popular','possible','personal','perfect'],'possible','possible は「可能な」。Its opposite（反対語）は impossible「不可能な」です。'],
    ['eq3-v05',3,'vocabulary','g3-ideas','「〜を信じる」を表す英単語は？',['believe','belong','bring','build'],'believe','believe は「〜を信じる」。believe in yourself で「自分を信じる」です。'],
    ['eq3-g01',3,'grammar','g3-perfect','I have ___ visited Canada.（一度も訪れたことがない）',['ever','already','just','never'],'never','「have never + 過去分詞」で「一度も〜したことがない」という経験を表します。'],
    ['eq3-g02',3,'grammar','g3-perfect','She has lived here ___ 2020.',['for','since','during','at'],'since','since は継続の始まった時点を示します。for は for three years のように期間に使います。'],
    ['eq3-g03',3,'grammar','g3-passive','This book was ___ by Soseki.',['write','wrote','written','writing'],'written','受動態は「be動詞 + 過去分詞」。write の過去分詞は written です。'],
    ['eq3-g04',3,'grammar','g3-relative','I know a girl ___ can speak French.',['who','which','what','when'],'who','人を説明し、後ろの節の主語になる関係代名詞は who。この選択肢では who だけが適切です。'],
    ['eq3-g05',3,'grammar','g3-relative','The boy ___ soccer over there is my brother.',['play','plays','played','playing'],'playing','「向こうでサッカーをしている少年」と説明するには、名詞の後ろに現在分詞 playing を置きます。']
  ];
  const extra = typeof module !== 'undefined' && module.exports ? require('./questions-step2.js') : root.QuestExtraQuestions;
  const questions = rows.map(([id,grade,category,unitId,prompt,options,answer,explanation]) => ({id,grade,category,unitId,prompt,options,answer,explanation})).concat(extra);
  const data = { units, questions };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.QuestData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
