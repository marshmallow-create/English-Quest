/* STEP 2追加問題。番号は永続IDの一部です。並べ替えても番号を変更しないこと。 */
(function (root) {
  'use strict';
  const questions = [];
  function add(unitId, category, rows) {
    const grade = Number(unitId[1]);
    for (const [number, text, answer, distractors, note] of rows) {
      const options = [answer, ...distractors.split('|')];
      // 正解位置を固定しない。番号から決めるので再読込時にも安定する。
      const offset = number % 4;
      questions.push({
        id: `eq${grade}-${category === 'vocabulary' ? 'v' : 'g'}${String(number).padStart(2,'0')}`,
        grade, category, unitId,
        prompt: category === 'vocabulary' ? `「${text}」を表す英単語は？` : text,
        options: options.slice(offset).concat(options.slice(0,offset)), answer,
        explanation: category === 'vocabulary' ? `${answer} は「${text}」という意味です。${note}` : note
      });
    }
  }
  const vocab = (unit, rows) => add(unit, 'vocabulary', rows);
  const grammar = (unit, rows) => add(unit, 'grammar', rows);
  vocab('g1-words', [
    [6,'母','mother','father|brother|son','my mother で「私の母」です。'],
    [7,'父','father','mother|sister|daughter','my father で「私の父」です。'],
    [8,'兄・弟','brother','sister|mother|aunt','年上か年下かを区別せず使えます。'],
    [9,'先生','teacher','student|doctor|player','teach「教える」に関連することばです。'],
    [10,'生徒','student','teacher|singer|farmer','a student で「一人の生徒」です。'],
    [11,'教室','classroom','kitchen|bedroom|station','学校の授業を受ける部屋を指します。'],
    [12,'机','desk','chair|door|window','a desk で「一つの机」です。'],
    [13,'いす','chair','desk|clock|wall','sit on a chair で「いすに座る」です。'],
    [14,'窓','window','door|floor|roof','open the window で「窓を開ける」です。'],
    [15,'病院','hospital','library|park|school','病気やけがの治療を受ける場所です。'],
    [16,'駅','station','garden|kitchen|classroom','a train station で「鉄道の駅」です。'],
    [17,'公園','park','shop|hospital|office','in the park で「公園で」です。'],
    [18,'水','water','milk|juice|tea','drink water で「水を飲む」です。'],
    [19,'牛乳','milk','water|bread|rice','a glass of milk で「コップ1杯の牛乳」です。'],
    [20,'パン','bread','rice|meat|fish','食べ物のパンは bread といいます。'],
    [21,'昼食','lunch','breakfast|dinner|snack','have lunch で「昼食を食べる」です。'],
    [22,'日曜日','Sunday','Monday|Friday|Saturday','曜日の名前は大文字で始めます。'],
    [23,'月曜日','Monday','Tuesday|Thursday|Sunday','曜日を表すときは on Monday のように使います。'],
    [24,'春','spring','summer|autumn|winter','日本では桜が咲く季節です。'],
    [25,'夏','summer','spring|autumn|winter','in summer で「夏に」です。'],
    [26,'秋','autumn','spring|summer|winter','アメリカ英語では fall ともいいます。'],
    [27,'冬','winter','spring|summer|autumn','in winter で「冬に」です。']
  ]);
  vocab('g1-actions', [
    [28,'走る','run','walk|read|sleep','run fast で「速く走る」です。'],
    [29,'歩く','walk','swim|sing|cook','walk to school で「歩いて学校に行く」です。'],
    [30,'読む','read','write|speak|listen','read a book で「本を読む」です。'],
    [31,'書く','write','read|watch|drink','write a letter で「手紙を書く」です。'],
    [32,'歌う','sing','dance|study|make','sing a song で「歌を歌う」です。'],
    [33,'食べる','eat','drink|buy|sell','eat breakfast で「朝食を食べる」です。'],
    [34,'飲む','drink','eat|draw|wash','drink tea で「お茶を飲む」です。'],
    [35,'勉強する','study','play|sleep|open','study English で「英語を勉強する」です。'],
    [36,'住む','live','leave|like|look','live in Tokyo で「東京に住む」です。'],
    [37,'開ける','open','close|clean|carry','open the door で「ドアを開ける」です。'],
    [38,'閉める','close','open|call|come','close the window で「窓を閉める」です。'],
    [39,'大きい','big','small|short|young','big の反対を表す基本語は small です。'],
    [40,'小さい','small','large|long|tall','a small bag で「小さいかばん」です。'],
    [41,'新しい','new','old|young|cold','a new book で「新しい本」です。'],
    [42,'古い','old','new|hot|fast','ものが古いことや、人の年齢を表せます。'],
    [43,'暑い・熱い','hot','cold|cool|warm','It is hot. で「暑いです」です。'],
    [44,'寒い・冷たい','cold','hot|warm|dry','cold water で「冷たい水」です。'],
    [45,'うれしい・幸せな','happy','sad|angry|tired','I am happy. で「私はうれしいです」です。'],
    [46,'悲しい','sad','happy|kind|funny','I feel sad. で「私は悲しい気持ちです」です。'],
    [47,'空腹の','hungry','thirsty|sleepy|busy','I am hungry. で「おなかがすいています」です。'],
    [48,'のどが渇いた','thirsty','hungry|happy|young','I am thirsty. で「のどが渇いています」です。'],
    [49,'早い・早く','early','late|slow|heavy','get up early で「早く起きる」です。'],
    [50,'遅れた・遅く','late','early|fast|light','be late for school で「学校に遅刻する」です。']
  ]);
  vocab('g2-words', [
    [6,'空港','airport','station|library|factory','air「空の」に関連し、飛行機を利用する場所です。'],
    [7,'工場','factory','museum|hospital|temple','ものを製造する場所を表します。'],
    [8,'図書館員','librarian','musician|scientist|pilot','library「図書館」で働く人です。'],
    [9,'科学者','scientist','artist|farmer|driver','science「科学」を研究する人です。'],
    [10,'音楽家','musician','scientist|pilot|nurse','music「音楽」に関連する仕事です。'],
    [11,'科目','subject','object|project|uniform','school subject で「学校の科目」です。'],
    [12,'歴史','history','geography|science|math','過去のできごとを学ぶ教科でもあります。'],
    [13,'地理','geography','history|music|art','地形や地域などを学ぶ教科です。'],
    [14,'科学・理科','science','history|language|sport','a science class で「理科の授業」です。'],
    [15,'制服','uniform','umbrella|ticket|instrument','a school uniform で「学校の制服」です。'],
    [16,'切符','ticket','letter|wallet|map','a train ticket で「電車の切符」です。'],
    [17,'地図','map','cap|cup|card','look at a map で「地図を見る」です。'],
    [18,'橋','bridge','beach|mountain|forest','川などを渡るための建造物です。'],
    [19,'島','island','river|hill|lake','周囲を水で囲まれた陸地です。'],
    [20,'森','forest','desert|beach|field','多くの木が生えている場所です。'],
    [21,'海岸・浜辺','beach','bridge|valley|village','at the beach で「浜辺で」です。'],
    [22,'村','village','city|capital|country','都市よりも規模の小さな集落を表します。'],
    [23,'人口','population','pollution|position|program','地域に住む人の数を表します。'],
    [24,'祭り','festival','season|vacation|lesson','a summer festival で「夏祭り」です。'],
    [25,'習慣','habit','hobby|holiday|health','a good habit で「よい習慣」です。'],
    [26,'休日','holiday','weekday|homework|hometown','on holiday で「休暇中で」という使い方があります。'],
    [27,'言語','language','letter|message|meaning','a foreign language で「外国語」です。']
  ]);
  vocab('g2-feelings', [
    [28,'驚いた','surprised','worried|bored|tired','be surprised at ... で「〜に驚く」です。'],
    [29,'心配している','worried','excited|glad|proud','be worried about ... で「〜を心配している」です。'],
    [30,'疲れた','tired','excited|angry|happy','I am tired. で「私は疲れています」です。'],
    [31,'退屈している','bored','busy|interested|surprised','人の気持ちには bored、退屈させるものには boring を使います。'],
    [32,'興味を持っている','interested','interesting|boring|difficult','be interested in ... で「〜に興味がある」です。'],
    [33,'誇りに思っている','proud','afraid|sad|sleepy','be proud of ... で「〜を誇りに思う」です。'],
    [34,'恐れている','afraid','brave|glad|kind','be afraid of ... で「〜を恐れる」です。'],
    [35,'うれしい','glad','angry|lonely|nervous','I am glad to see you. は「会えてうれしい」です。'],
    [36,'〜を借りる','borrow','lend|return|buy','borrow a book で「本を借りる」です。'],
    [37,'〜を貸す','lend','borrow|keep|lose','lend A to B で「AをBに貸す」です。'],
    [38,'〜を忘れる','forget','remember|learn|teach','forget の反対は remember「覚えている」です。'],
    [39,'〜を覚えている','remember','forget|repeat|remove','remember a name で「名前を覚えている」です。'],
    [40,'〜を招待する','invite','visit|introduce|join','invite a friend で「友達を招待する」です。'],
    [41,'到着する','arrive','leave|return|move','arrive at the station で「駅に到着する」です。'],
    [42,'〜を選ぶ','choose','change|check|chase','choose a color で「色を選ぶ」です。'],
    [43,'〜を必要とする','need','want|hope|wish','need help で「助けを必要とする」です。'],
    [44,'〜を楽しむ','enjoy','finish|begin|stop','enjoy the game で「試合を楽しむ」です。'],
    [45,'〜を練習する','practice','perform|promise|prepare','practice tennis で「テニスを練習する」です。'],
    [46,'〜を説明する','explain','express|expect|explore','explain the rules で「ルールを説明する」です。'],
    [47,'難しい','difficult','easy|simple|useful','a difficult question で「難しい問題」です。'],
    [48,'役に立つ','useful','useless|careless|hopeless','a useful tool で「役に立つ道具」です。'],
    [49,'重要な','important','expensive|different|popular','an important day で「大切な日」です。'],
    [50,'異なった','different','same|similar|usual','be different from ... で「〜と異なる」です。']
  ]);
  vocab('g3-words', [
    [6,'社会','society','science|scenery|schedule','人々がともに暮らす集まりや仕組みです。'],
    [7,'教育','education','information|invitation|vacation','学びを支える活動や仕組みを指します。'],
    [8,'情報','information','instruction|imagination|invention','information は通常、数えられない名詞として使います。'],
    [9,'技術','technology','geography|biology|history','science and technology で「科学技術」です。'],
    [10,'エネルギー','energy','enemy|effort|event','solar energy で「太陽エネルギー」です。'],
    [11,'汚染','pollution','population|solution|position','air pollution で「大気汚染」です。'],
    [12,'地球・大地','earth','moon|star|cloud','地球を指すとき the earth と表せます。'],
    [13,'自然','nature','nation|culture|future','protect nature で「自然を守る」です。'],
    [14,'平和','peace','war|power|price','world peace で「世界平和」です。'],
    [15,'戦争','war','peace|wealth|work','争いや戦争について使うことばです。'],
    [16,'権利','right','rule|risk|role','human rights で「人権」です。'],
    [17,'規則','rule','right|reason|result','follow the rules で「規則に従う」です。'],
    [18,'地域社会','community','company|country|continent','a local community で「地域社会」です。'],
    [19,'ボランティア','volunteer','visitor|customer|passenger','自ら進んで活動に参加する人を表します。'],
    [20,'〜を再利用する','reuse','reduce|refuse|repair','re- は「再び」という意味を持ちます。'],
    [21,'〜を減らす','reduce','reuse|increase|repeat','reduce waste で「ごみを減らす」です。'],
    [22,'〜を開発する','develop','destroy|divide|discover','develop a new product で「新製品を開発する」です。'],
    [23,'〜を発見する','discover','invent|design|describe','すでにあるが知られていないものを見つけることです。'],
    [24,'〜を発明する','invent','discover|invite|include','新しい道具や方法を作り出すことです。'],
    [25,'〜を支援する','support','suppose|surprise|separate','support a team で「チームを応援する」です。'],
    [26,'〜を改善する','improve','import|imagine|impress','improve your English で「英語力を伸ばす」です。'],
    [27,'〜を共有する','share','show|save|sell','share an idea で「考えを共有する」です。']
  ]);
  vocab('g3-ideas', [
    [28,'機会','opportunity','opinion|operation|opposition','an opportunity to learn で「学ぶ機会」です。'],
    [29,'意見','opinion','option|opportunity|occasion','in my opinion で「私の意見では」です。'],
    [30,'理由','reason','result|research|record','the reason why ... で「〜する理由」です。'],
    [31,'結果','result','reason|request|report','as a result で「その結果」です。'],
    [32,'目的','purpose','promise|problem|process','the purpose of ... で「〜の目的」です。'],
    [33,'努力','effort','effect|event|error','make an effort で「努力する」です。'],
    [34,'成功','success','failure|progress|practice','succeed「成功する」の名詞形です。'],
    [35,'失敗','failure','success|future|feature','fail「失敗する」の名詞形です。'],
    [36,'知識','knowledge','language|message|courage','学んだり経験したりして得た知識を表します。'],
    [37,'勇気','courage','knowledge|danger|damage','have courage で「勇気を持つ」です。'],
    [38,'責任','responsibility','possibility|ability|activity','take responsibility で「責任を持つ」です。'],
    [39,'能力','ability','activity|identity|quality','the ability to ... で「〜する能力」です。'],
    [40,'自由','freedom','friendship|kindness|fairness','free「自由な」の名詞形です。'],
    [41,'〜を想像する','imagine','improve|include|introduce','imagine the future で「未来を想像する」です。'],
    [42,'〜を理解する','understand','undertake|underline|undo','understand the meaning で「意味を理解する」です。'],
    [43,'〜を受け入れる','accept','except|expect|access','accept an offer で「申し出を受け入れる」です。'],
    [44,'〜を比較する','compare','complete|complain|continue','compare A with B で「AとBを比較する」です。'],
    [45,'〜を続ける','continue','contain|consider|control','continue studying で「勉強を続ける」です。'],
    [46,'利用できる','available','valuable|comfortable|responsible','This seat is available. は「この席は使えます」です。'],
    [47,'必要な','necessary','natural|national|normal','It is necessary to ... で「〜することが必要だ」です。'],
    [48,'伝統的な','traditional','international|personal|original','traditional food で「伝統的な食べ物」です。'],
    [49,'国際的な','international','national|local|personal','international cooperation で「国際協力」です。'],
    [50,'持続可能な','sustainable','suitable|comfortable|valuable','sustainable development で「持続可能な開発」です。']
  ]);

  grammar('g1-be', [
    [6,'You ___ my friend.（現在のこと）','are','am|is|be','主語が you の現在形では are を使います。'],
    [7,'He ___ a teacher.（現在のこと）','is','am|are|be','he は三人称単数なので、be動詞は is です。'],
    [8,'They ___ in the classroom now.','are','am|is|be','they は複数を表すため、be動詞は are です。'],
    [9,'My name ___ Yuki.（現在の名前）','is','am|are|be','My name は単数の主語なので is を使います。'],
    [10,'We ___ classmates.（現在のこと）','are','is|am|be','主語が we の現在形では are を使います。'],
    [11,'This ___ my pen.（現在のこと）','is','are|am|be','this は単数のものを指すため、is を使います。'],
    [12,'These books ___ new.（現在のこと）','are','is|am|be','these books は複数なので are を使います。'],
    [13,'___ she your sister?（現在のこと）','Is','Are|Am|Be','主語が she のbe動詞の疑問文は Is で始めます。'],
    [14,'___ they busy now?','Are','Is|Am|Be','主語が they のbe動詞の疑問文は Are で始めます。'],
    [15,'Are you a student? — Yes, I ___.','am','is|are|be','you への質問に I で答えるので Yes, I am. となります。'],
    [16,'Is Tom from Canada? — No, he ___.','is not','are not|am not|not is','he に対応する否定の答えは No, he is not. です。'],
    [17,'I ___ not tired now.','am','is|are|be','I am の否定文は、am の後ろに not を置きます。'],
    [18,'___ is your birthday? — It is in May.','When','Where|Who|How','誕生日という時を尋ねるので、When「いつ」を使います。'],
    [19,'___ is your bag? — It is on the desk.','Where','When|Who|Why','場所を尋ねるので、Where「どこ」を使います。']
  ]);
  grammar('g1-verbs', [
    [20,'I ___ English every day.','study','studies|studying|to study','主語が I の現在の習慣では、動詞の原形 study を使います。'],
    [21,'He ___ soccer after school every day.','plays','play|playing|to play','he が主語の現在形なので、play に s をつけます。'],
    [22,'My mother ___ TV every evening.','watches','watch|watching|to watch','主語が三人称単数で、watch は ch で終わるため es をつけます。'],
    [23,'Yuki ___ to school by bus every day.','goes','go|going|to go','go の三人称単数現在形は goes です。'],
    [24,'My brother ___ a new bike.（現在、持っている）','has','have|having|to have','have の三人称単数現在形は、不規則な形の has です。'],
    [25,'They ___ lunch at twelve every day.','eat','eats|eating|to eat','they が主語の現在形では、動詞に s をつけません。'],
    [26,'___ Ken speak English?（普段のこと）','Does','Do|Is|Are','三人称単数の Ken が主語の一般動詞の疑問文では Does を使います。'],
    [27,'Does she ___ cats?','like','likes|liking|to like','Does の後ろでは、動詞を原形に戻します。'],
    [28,'I ___ not play baseball.（現在の習慣）','do','does|am|is','I が主語の一般動詞の否定文は do not + 動詞の原形です。'],
    [29,'He ___ not like fish.（現在の好み）','does','do|is|are','he が主語の一般動詞の否定文では does not を使います。'],
    [30,'She does not ___ coffee.','drink','drinks|drinking|to drink','does not の後ろの動詞は原形 drink になります。'],
    [31,'What ___ you eat for breakfast every day?','do','does|is|are','主語が you の一般動詞の疑問文なので do を使います。'],
    [32,'Where does he ___?','live','lives|living|to live','疑問詞があっても、does の後ろの動詞は原形です。'],
    [33,'Do they play tennis? — Yes, they ___.','do','does|are|is','Do で始まる一般動詞の質問には、主語 they と do で答えます。'],
    [34,'Does Emi like music? — No, she ___.','does not','do not|is not|are not','Does で始まる質問を否定すると No, she does not. になります。'],
    [35,'My sister ___ English every night.','studies','study|studying|to study','子音字 + y で終わる study は、y を i に変えて es をつけます。']
  ]);
  grammar('g1-progressive', [
    [36,'I am ___ lunch now.','eating','eat|eats|to eat','今していることは「be動詞 + 動詞のing形」で表します。'],
    [37,'They are ___ in the park now.','running','run|runs|ran','run のing形は、最後の n を重ねた running です。'],
    [38,'She is ___ a letter now.','writing','write|writes|wrote','write は最後の e を取って ing をつけます。'],
    [39,'We ___ playing soccer now.','are','is|am|be','進行形でも、主語 we に合うbe動詞は are です。'],
    [40,'He ___ sleeping now.','is','are|am|be','進行形でも、主語 he に合うbe動詞は is です。'],
    [41,'___ you listening to music now?','Are','Do|Does|Is','進行形の疑問文はbe動詞を前に置きます。主語 you には Are を使います。'],
    [42,'___ Ken studying now?','Is','Are|Do|Does','単数の Ken が主語の進行形の疑問文は Is で始めます。'],
    [43,'Look! The baby is ___.','crying','cry|cries|cried','cry のing形では y を変えず、crying とします。'],
    [44,'My father is ___ dinner now.','making','make|makes|made','make は最後の e を取って ing をつけます。'],
    [45,'The children are ___ in the pool now.','swimming','swim|swims|swam','swim のing形では、最後の m を重ねます。'],
    [46,'She is not ___ TV now.','watching','watch|watches|watched','進行形の否定文は「be動詞 + not + ing形」です。'],
    [47,'What are you ___ now?','doing','do|does|did','「何をしていますか」は What are you doing? と尋ねます。'],
    [48,'Is he reading? — Yes, he ___.','is','does|do|are','進行形の疑問文への短い答えでは、主語に合うbe動詞を使います。'],
    [49,'Are they playing? — No, they ___.','are not','do not|is not|does not','主語 they に対応するbe動詞の否定は are not です。'],
    [50,'Listen! A bird is ___ in the tree.','singing','sing|sings|sang','Listen!「聞いて」に続く今の動作を、is singing で表します。']
  ]);
  grammar('g2-time', [
    [6,'I ___ tennis yesterday.','played','play|plays|playing','yesterday「昨日」の動作なので、play に ed をつけた過去形を使います。'],
    [7,'She ___ English last night.','studied','study|studies|studying','study の過去形は、y を i に変えて ed をつけた studied です。'],
    [8,'He ___ a movie last Sunday.','watched','watch|watches|watching','過去を表す last Sunday があるため、過去形 watched を使います。'],
    [9,'They ___ happy yesterday.','were','are|is|was','they に対応するbe動詞の過去形は were です。'],
    [10,'I ___ tired last night.','was','am|are|were','I に対応するbe動詞の過去形は was です。'],
    [11,'___ you visit Kyoto last year?','Did','Do|Does|Are','一般動詞の過去の疑問文は Did で始めます。'],
    [12,'Did he ___ breakfast yesterday?','eat','ate|eats|eating','Did の後ろでは、動詞を原形 eat に戻します。'],
    [13,'We did not ___ to school yesterday.','go','went|goes|going','did not の後ろでは動詞の原形を使います。'],
    [14,'My father ___ a car last month.','bought','buy|buys|buying','buy の過去形は不規則に変化して bought になります。'],
    [15,'I ___ a letter to my friend yesterday.','wrote','write|writes|writing','write の過去形は wrote です。'],
    [16,'She ___ a beautiful bird yesterday.','saw','see|sees|seeing','see の過去形は saw です。「見た」と過去のできごとを表します。'],
    [17,'We ___ dinner at seven yesterday.','had','have|has|having','have の過去形は、主語に関係なく had です。'],
    [18,'I will ___ you tomorrow.','help','helps|helped|helping','助動詞 will の後ろには動詞の原形を置きます。'],
    [19,'She ___ going to study tonight.','is','are|am|be','be going to のbe動詞は、主語 she に合わせて is にします。'],
    [20,'They ___ going to visit Osaka next week.','are','is|am|be','主語 they には are going to を使います。'],
    [21,'___ you going to play soccer tomorrow?','Are','Do|Did|Is','be going to の疑問文ではbe動詞を前に置きます。you には Are です。'],
    [22,'Will it rain tomorrow? — Yes, it ___.','will','does|is|did','Will で始まる質問の短い答えでは will を使います。'],
    [23,'I will not ___ late tomorrow.','be','am|is|are','will not の後ろは原形なので、be動詞も be になります。']
  ]);
  grammar('g2-infinitive', [
    [24,'He wants ___ English abroad.','to study','study|studies|studying','want の後ろで「〜したい」を表すには to + 動詞の原形を使います。'],
    [25,'We hope ___ you again.','to see','see|saw|seeing','hope to + 動詞の原形で「〜することを望む」です。'],
    [26,'I decided ___ the club.','to join','join|joined|joining','decide to + 動詞の原形で「〜することに決める」です。'],
    [27,'She went to the library ___ books.（本を読むために）','to read','read|reads|reading','目的の「〜するために」は不定詞 to read で表します。'],
    [28,'I have a lot of homework ___ today.（するべき宿題）','to do','do|does|did','名詞の後ろの to do は「するべき」という説明を加えます。'],
    [29,'I want something ___.（何か飲むもの）','to drink','drink|drinks|drank','something to drink で「何か飲むもの」です。'],
    [30,'It is fun ___ soccer.（サッカーをするのは楽しい）','to play','play|plays|played','It is ... to + 動詞の原形で「〜するのは…だ」と表せます。'],
    [31,'I am happy ___ you.（あなたに会えてうれしい）','to meet','meet|meets|met','感情の理由を表す不定詞を使い、happy to meet とします。'],
    [32,'___ English is interesting.（英語を勉強すること）','Studying','Study|Studies|Studied','「〜すること」を主語にするには、動名詞 Studying が使えます。'],
    [33,'He finished ___ his room.','cleaning','clean|cleans|to clean','finish の後ろに動詞を続けるときは動名詞を使います。'],
    [34,'We enjoyed ___ in the river.','swimming','swim|swam|to swim','enjoy の後ろでは動名詞を使います。swim は m を重ねて swimming です。'],
    [35,'She is good at ___ .','dancing','dance|dances|to dance','前置詞 at の後ろには動名詞を置きます。dance は e を取って dancing です。'],
    [36,'Thank you for ___ me.','helping','help|helps|to help','前置詞 for の後ろで「助けること」を表すので helping を使います。'],
    [37,'He left without ___ goodbye.','saying','say|said|to say','前置詞 without の後ろには動名詞 saying を置きます。'],
    [38,'I am interested in ___ pictures.','taking','take|takes|to take','前置詞 in の後ろでは、take を動名詞 taking にします。'],
    [39,'We stopped ___ because we were tired.（走るのをやめた）','running','run|ran|to run','stop + 動名詞で「〜するのをやめる」。stop to ... は「〜するために立ち止まる」です。'],
    [40,'My hobby is ___ stamps.（切手を集めること）','collecting','collect|collects|collected','動名詞 collecting が「集めること」を表し、趣味の内容を説明します。'],
    [41,'She practiced ___ the piano yesterday.','playing','play|played|to play','practice の後ろに動詞を続けるときは動名詞を使います。']
  ]);
  grammar('g2-comparison', [
    [42,'Ken is ___ than Tom.（背が高い）','taller','tall|tallest|as tall','than で比べるので、tall の比較級 taller を使います。'],
    [43,'This book is ___ than that one.（おもしろい）','more interesting','interesting|most interesting|as interesting','長い形容詞 interesting の比較級は more interesting です。'],
    [44,'Mt. Fuji is the ___ mountain in Japan.','highest','high|higher|as high','日本の中で「最も高い」ので、the + 最上級 highest を使います。'],
    [45,'This is the ___ book of the three.（おもしろい）','most interesting','more interesting|interesting|as interesting','3冊の中で最もおもしろいので、最上級 most interesting を使います。'],
    [46,'My bag is as ___ as yours.（大きい）','big','bigger|biggest|more big','as ... as の間には形容詞の原級を置きます。'],
    [47,'This question is ___ than that one.（簡単だ）','easier','easy|easiest|as easy','easy の比較級は、y を i に変えて er をつけた easier です。'],
    [48,'I like apples ___ than oranges.（より好き）','better','good|best|well','like A better than B で「BよりAが好き」です。'],
    [49,'She is the ___ singer in our class.（上手な）','best','good|better|well','good の最上級は、不規則な形の best です。'],
    [50,'This train is ___ than that bus.（速い）','faster','fast|fastest|as fast','fast の比較級は er をつけた faster です。']
  ]);
  grammar('g3-perfect', [
    [6,'I ___ lived here for three years.','have','has|am|was','現在までの継続は「have + 過去分詞」。I には have を使います。'],
    [7,'He ___ been to Kyoto twice.','has','have|is|was','he が主語の現在完了では has を使います。'],
    [8,'Have you ever ___ sushi?','eaten','eat|ate|eating','現在完了は have + 過去分詞。eat の過去分詞は eaten です。'],
    [9,'She has just ___ her homework.','finished','finish|finishes|finishing','has just + 過去分詞で「ちょうど〜したところだ」です。'],
    [10,'I have already ___ this book.','read','reads|reading|to read','read の過去分詞は原形と同じつづり read です。発音は「レッド」です。'],
    [11,'They have not arrived ___.（まだ到着していない）','yet','already|ever|just','現在完了の否定文で「まだ」は文末の yet で表します。'],
    [12,'Have you finished your homework ___?（もう終えましたか）','yet','never|since|for','現在完了の疑問文では、yet が「もう」を表します。'],
    [13,'I have known him ___ ten years.','for','since|at|from','継続した期間 ten years の前には for を使います。'],
    [14,'We have been friends ___ we were children.','since','for|during|until','継続の始まりを表す節の前には since を使います。'],
    [15,'How ___ have you lived here? — For five years.','long','many|often|much','期間の長さを尋ねるときは How long を使います。'],
    [16,'How many ___ have you visited Nara? — Three times.','times','years|days|hours','経験の回数は How many times「何回」で尋ねます。'],
    [17,'Have you ever seen snow? — Yes, I ___.','have','did|do|am','Have で始まる現在完了の質問には have を使って答えます。'],
    [18,'Has she finished lunch? — No, she ___.','has not','have not|does not|is not','Has で始まる現在完了の質問の否定の答えは has not です。'],
    [19,'I have ___ to Okinawa once.（一度行ったことがある）','been','be|was|being','have been to ... で「〜へ行ったことがある」という経験です。'],
    [20,'She has ___ her key, so she cannot open the door.','lost','lose|loses|losing','lose の過去分詞は lost。なくした結果が現在も続いています。'],
    [21,'We have ___ this movie before.','seen','see|saw|seeing','see の過去分詞 seen を使い、以前見た経験を表します。'],
    [22,'He has ___ three letters today.','written','write|wrote|writing','write の過去分詞は written です。has written で現在までの完了を表します。'],
    [23,'My sister has never ___ abroad.','traveled','travel|travels|traveling','has never + 過去分詞で「一度も〜したことがない」です。']
  ]);
  grammar('g3-passive', [
    [24,'English ___ spoken in many countries.（現在の一般的な事実）','is','are|be|am','English は単数扱い。受動態は is + 過去分詞 spoken です。'],
    [25,'These cars ___ made in Japan.（現在の一般的な事実）','are','is|am|be','these cars は複数なので、現在の受動態は are made です。'],
    [26,'This bridge was ___ in 1990.','built','build|builds|building','build の過去分詞 built を使い、「建てられた」と表します。'],
    [27,'The window was ___ by the boy.','broken','break|broke|breaking','break の過去分詞は broken。受動態では過去形 broke を使いません。'],
    [28,'This song is ___ by many people.','loved','love|loves|loving','「愛されている」は be動詞 + 過去分詞 loved です。'],
    [29,'The room is cleaned ___ Ken every day.','by','to|from|of','受動態で動作をする人は by の後ろに置きます。'],
    [30,'___ this picture painted by your mother?（過去のこと）','Was','Did|Does|Has','過去の受動態の疑問文は、単数の主語の前に Was を置きます。'],
    [31,'This letter was not ___ by Tom.','written','write|wrote|writing','受動態の否定文でも be動詞 + not + 過去分詞を使います。'],
    [32,'The classroom must ___ cleaned today.','be','is|are|was','助動詞 must の後ろは原形。must be + 過去分詞になります。'],
    [33,'This book can be ___ at the library.','borrowed','borrow|borrows|borrowing','can be + 過去分詞で「〜されることができる」です。'],
    [34,'The game will ___ played tomorrow.','be','is|are|was','未来の受動態は will be + 過去分詞で表します。'],
    [35,'I was ___ to her birthday party.','invited','invite|invites|inviting','「招待された」は was invited。invite の過去分詞は invited です。'],
    [36,'This animal is ___ a koala.（この動物はコアラと呼ばれています）','called','call|calls|calling','be called ... で「〜と呼ばれている」と表します。'],
    [37,'___ these pictures taken yesterday?','Were','Was|Did|Do','these pictures は複数。過去の受動態の疑問文は Were で始めます。']
  ]);
  grammar('g3-relative', [
    [38,'The man ___ lives next door is a doctor.','who','which|what|where','先行詞 the man は人で、後ろの節の主語なので who が適切です。'],
    [39,'This is a book ___ has many pictures.','which','who|what|where','ものを表す a book を主語として説明する関係代名詞は which です。'],
    [40,'The girl ___ is singing is my friend.','who','which|what|when','人を表す the girl を主語として説明するので who を使います。'],
    [41,'I have a dog ___ runs very fast.','that','when|what|where','動物を表す a dog には関係代名詞 that が使えます。'],
    [42,'This is the camera ___ my father bought yesterday.','which','who|what|when','ものを表す the camera を説明する目的格の関係代名詞は which です。'],
    [43,'The woman ___ I met yesterday is a teacher.','that','which|what|where','人を説明する目的格の関係代名詞として that が使えます。'],
    [44,'The language ___ they speak is English.','that','who|what|where','ものを表す the language を説明する目的格の関係代名詞は that です。'],
    [45,'Look at the girl ___ under the tree.（木の下で本を読んでいる）','reading','read|reads|to read','名詞の後ろの現在分詞 reading で「読んでいる少女」と説明します。'],
    [46,'The man ___ a blue shirt is my uncle.（着ている）','wearing','wear|wears|wore','「青いシャツを着ている男性」は the man wearing a blue shirt です。'],
    [47,'This is a picture ___ by my sister.（描かれた）','painted','paint|paints|painting','「描かれた絵」は過去分詞 painted を名詞の後ろに置いて説明します。'],
    [48,'The language ___ in Australia is English.（話されている）','spoken','speak|speaks|speaking','「話されている」は過去分詞 spoken。名詞を受け身の意味で説明します。'],
    [49,'Do you know the boy ___ the guitar over there?（弾いている）','playing','play|plays|played','動作をしている人を説明するときは現在分詞 playing を使います。'],
    [50,'I like the cake ___ by my mother.（作られた）','made','make|makes|making','「母によって作られたケーキ」は cake made by my mother です。']
  ]);
  if (typeof module !== 'undefined' && module.exports) module.exports = questions;
  else root.QuestExtraQuestions = questions;
})(typeof globalThis !== 'undefined' ? globalThis : this);
