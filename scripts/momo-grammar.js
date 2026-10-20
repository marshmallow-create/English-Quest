/* Excelの語彙・場面を使った中2の文法100問。現在完了は発展単元。 */
(function(root){
  'use strict';
  const definitions=[
    ['past','過去形と旅の思い出','買い物・体験を過去形で伝える'],
    ['future','未来・進行形','予定や今していることを伝える'],
    ['infinitive','不定詞','希望・目的・気持ちを表す'],
    ['gerund','動名詞と動詞の形','楽しむこと・感謝・価値を表す'],
    ['comparison','比較','品物や場所の特徴を比べる'],
    ['modal','助動詞と会話','依頼・誘い・ルールを伝える'],
    ['noun','名詞・数量・代名詞','物の数や人を正しく表す'],
    ['perfect-experience','現在完了：経験・完了（発展）','seen・been・eatenなどを文で使う'],
    ['perfect-continuation','現在完了：継続（発展）','since・for・yetを使い分ける'],
    ['connection','前置詞・接続詞と表現','会話や文化紹介を文でつなぐ']
  ];
  // 問題文 | 正解 | 誤答3つ | 日本語解説 | 元の単語・語句
  const rows=`
I ___ some cookies at the market yesterday.（買いました）|bought|buy;buys;buying|yesterdayで過去の出来事を表すので、buyの過去形boughtを使います。「昨日、市場でクッキーを買いました」。|bought,cookie,market
We ___ a surprising sound last night.（聞きました）|heard|hear;hears;hearing|last nightは過去の時を表します。hearの過去形はheardです。「昨夜、意外な音を聞きました」。|heard,surprising,sound
The coach ___ us a joke yesterday.（話しました）|told|tell;tells;telling|tellの過去形はtoldです。tell 人 a jokeで「人に冗談を言う」。「昨日、コーチは私たちに冗談を言いました」。|coach,told,us,joke
___ you visit Uluru last year?|Did|Do;Does;Are|last yearについて尋ねる一般動詞の過去の疑問文はDid + 主語 + 動詞の原形です。「昨年ウルルを訪れましたか」。|Uluru
We didn't ___ the theme park yesterday.|enter|entered;enters;entering|didn'tの後ろは動詞の原形です。過去の意味はdidn'tが表します。「昨日、私たちはテーマパークに入りませんでした」。|enter,theme park
The explorer ___ his arm yesterday.（けがをしました）|hurt|hurts;hurting;to hurt|hurtは原形・過去形・過去分詞が同じ形です。yesterdayがあるので、ここでは過去形。「探検家は昨日、腕をけがしました」。|explorer,hurt
The captain ___ a home run last Sunday.|hit|hits;hitting;to hit|hitの過去形は原形と同じhitです。「主将は先週の日曜日にホームランを打ちました」。|captain,hit,home run
We ___ in Sydney two days ago.（いました）|were|was;are;is|過去を表すtwo days agoがあり、主語がWeなのでbe動詞はwereです。「2日前、私たちはシドニーにいました」。|Sydney
The cultural event ___ fantastic yesterday.（すばらしかった）|was|were;is;are|主語The cultural eventは単数で、yesterdayは過去です。be動詞の過去形wasを使います。「昨日の文化行事はすばらしかったです」。|cultural,fantastic
The guide ___ the visitors to the port yesterday.|led|lead;leads;leading|leadの過去形はledです。lead 人 to 場所で「人を場所へ案内する」。「ガイドは昨日、訪問者を港へ案内しました」。|lead,visitor,port
We are going to ___ an expo next week.|visit|visited;visits;visiting|be going toの後ろは動詞の原形です。「来週、私たちは博覧会を訪れる予定です」。|expo
She will ___ a link to the official website tomorrow.|send|sent;sends;sending|助動詞willの後ろは動詞の原形です。「明日、彼女は公式サイトへのリンクを送ります」。|send,link,official,website
Look! The kid is ___ a paper crane now.|folding|fold;folds;folded|今している動作はbe動詞 + -ing形です。foldの-ing形はfolding。「見て。子どもが今、折り鶴を折っています」。|kid,fold,crane
They ___ arranging flowers beautifully now.|are|is;am;be|現在進行形ではbe動詞を主語に合わせます。Theyにはare。「彼らは今、花を美しく生けています」。|arrange,beautifully
What ___ you doing at the studio now?|are|is;am;be|主語youに合う現在進行形のbe動詞はareです。「今、スタジオで何をしていますか」。|studio
The performer was ___ on the stage at seven last night.|acting|act;acts;to act|過去のある時点でしていたことはwas/were + -ing形です。「昨夜7時、演者は舞台で演じていました」。|performer,act,stage
At noon yesterday, we ___ looking for sunscreen.|were|was;are;is|過去進行形で主語がweなのでwereを使います。「昨日の正午、私たちは日焼け止めを探していました」。|sunscreen
I ___ be back before sunset.（戻るつもりです）|will|was;did;am|未来の予定や意思をwill + 動詞の原形で表します。「日没前には戻るつもりです」。be backは「戻る」です。|be back,sunset
It is ___ to rain, so let's go by car.（雨が降りそうです）|going|go;goes;went|be going to + 動詞の原形で、今の様子から予想する未来も表せます。「雨が降りそうなので、車で行きましょう」。|car
Next month, we ___ going to organize a party.|are|is;am;was|Weに合うbe動詞はareです。are going to organizeで「企画する予定です」。「来月、パーティーを企画する予定です」。|organize,party
I want ___ the sunrise at Uluru.|to see|see;seeing;saw|wantの後ろに動詞を続けるときはto + 動詞の原形です。「ウルルで日の出を見たいです」。|sunrise,Uluru
We went to the market ___ fresh seafood.（買うために）|to buy|buy;buying;bought|目的を表す不定詞to buyは「買うために」です。「新鮮な魚介類を買うために市場へ行きました」。|market,seafood
She would like ___ a guidebook.|to buy|buy;buying;bought|would like to + 動詞の原形は丁寧な希望です。「彼女はガイドブックを買いたいと思っています」。|would like to ...,guidebook
We have many places ___ in Southeast Asia.（訪れるべき）|to visit|visit;visited;visits|名詞の後ろのto + 動詞は、その名詞を説明できます。places to visitは「訪れるべき場所」です。|Southeast Asia
I'm glad ___ you at the food court.|to see|see;seeing;sees|glad to + 動詞の原形で、うれしい理由を示します。「フードコートであなたに会えてうれしいです」。|glad,food court
It is important ___ local customs.|to respect|respect;respects;respected|It is + 形容詞 + to ...で「〜することは…です」。「地元の風習を尊重することは大切です」。|respect,custom
He decided ___ a solo voyage.（始めることに決めた）|to begin|begin;beginning;began|decideの後ろはto + 動詞の原形を使います。「彼は単独の航海を始めることに決めました」。|begin,solo
I hope ___ a chance to perform.|to get|get;getting;got|hope to + 動詞の原形で「〜することを望む」。「演じる機会が得られることを願っています」。|chance,perform
Please tell us how ___ this code.（この暗号を読む方法）|to read|read;reading;reads|how to + 動詞の原形で「〜する方法」です。「この暗号を読み取る方法を教えてください」。|us,code
We need a knife ___ the rice cake.（切るための）|to cut|cutting;cuts;cutted|a knife to cut ...で「〜を切るためのナイフ」と目的を表します。cutの過去形もcutで、cuttedにはしません。|knife,rice cake
I enjoy ___ origami cranes.|making|make;to make;made|enjoyの後ろに動詞を続けるときは-ing形（動名詞）にします。「折り鶴を作ることを楽しんでいます」。|origami,crane
Thank you for ___ me to the party.|inviting|invite;to invite;invited|前置詞forの後ろに動詞を置くときは-ing形です。「パーティーに招待してくれてありがとう」。|thank you for ...,invite,party
This heritage site is worth ___.|visiting|visit;to visit;visited|worth + -ing形で「〜する価値がある」。「この遺産の場所は訪れる価値があります」。|heritage,site,worth
She is good at ___ photos of wild animals.|taking|take;to take;took|前置詞atの後ろに動詞を置くときは-ing形にします。「彼女は野生動物の写真を撮るのが得意です」。|wild,photo
We finished ___ the studio before the guest arrived.|cleaning|clean;to clean;cleans|finishの後ろは-ing形です。「客が到着する前に、スタジオの掃除を終えました」。|studio,guest,arrive
The kid left without ___ the door.|shutting|shut;to shut;shuts|withoutは前置詞なので、後ろの動詞は-ing形です。shutはtを重ねてshutting。「子どもはドアを閉めずに出ていきました」。|kid,without,shut,door
___ golf is relaxing for my grandfather.|Playing|Play;Played;Plays|文の主語として「〜すること」を表すときは動名詞を使えます。「ゴルフをすることは祖父にとってくつろぎになります」。|golf,relaxing
Please stop ___ during the performance.（話すのをやめて）|talking|talk;to talk;talked|stop -ingは「〜するのをやめる」。stop to talkは「話すために立ち止まる」なので意味が違います。「演技中は話すのをやめてください」。|perform
My hobby is ___ stamps from abroad.|collecting|collect;collects;collected|「私の趣味は〜することです」の補語に動名詞を使えます。「私の趣味は海外の切手を集めることです」。|stamp,abroad
He had difficulty ___ the heavy lid.|opening|open;to open;opened|have difficulty -ingは「〜するのに苦労する」です。「彼は重いふたを開けるのに苦労しました」。|difficulty,lid
This vase is ___ than that toy.（より高価です）|more expensive|expensive;most expensive;as expensive|thanで2つを比べるので比較級です。expensiveの比較級はmore expensive。「この花瓶はあのおもちゃより高価です」。|vase,toy,expensive
This ticket is ___ than that one.（より安い）|cheaper|cheap;cheapest;most cheap|cheapの比較級は-erを付けたcheaperです。「この切符はあの切符より安いです」。|ticket,cheap
This seafood tastes ___ than I expected.（よりよい味がする）|better|good;best;wellest|goodの比較級はbetterです。「この魚介料理は予想よりおいしいです」。tasteの後ろで味の状態を表します。|seafood,taste,better
This is the ___ rock in the park.（最も大きい）|biggest|bigger;big;more big|theがあり、範囲の中で一番なので最上級です。bigはgを重ねてbiggest。「これは公園で最も大きい岩です」。|rock
The dragon decoration is the ___ impressive artwork here.|most|more;much;many|長い形容詞impressiveの最上級はthe most impressiveです。「その竜の飾りはここで最も印象的な作品です」。|dragon,decoration,impressive,artwork
This tiny pot is as ___ as that glass.（同じくらいかわいい）|pretty|prettier;prettiest;more pretty|as + 形容詞の原級 + asで同程度を表します。「この小さな鉢はあのコップと同じくらいかわいいです」。|tiny,pot,glass,pretty
A giraffe is ___ than a rhino.（より背が高い）|taller|tall;tallest;most tall|thanがあるので比較級tallerです。「キリンはサイより背が高いです」。|giraffe,rhino
This memory is more precious ___ that ring to me.|than|as;of;from|比較級more preciousの後ろではthanで比較対象を示します。「私にとって、この思い出はあの指輪より大切です」。|memory,precious,ring
The new swimsuit is not as cheap ___ the old one.|as|than;to;from|not as + 原級 + asで「〜ほど…ではない」。「新しい水着は古いものほど安くありません」。|swimsuit,cheap
Of these three spots, this one is the ___ attractive.|most|more;much;many|3つの範囲で一番なので最上級the most attractiveです。「この3つの場所の中では、ここが最も魅力的です」。|spot,attractive
Could you ___ me the recipe, please?|show|showed;shows;showing|Could you + 動詞の原形で丁寧な依頼です。「レシピを見せていただけますか」。|Could you ...?,recipe
Shall we ___ sightseeing after lunch?|go|went;going;goes|Shall we + 動詞の原形で誘い・提案をします。「昼食後に観光に行きませんか」。|Shall we ...?,sightseeing
You must ___ your manners at the party.（作法を守らなければ）|mind|minds;minded;minding|助動詞mustの後ろは動詞の原形です。「パーティーでは行儀に気をつけなければなりません」。|manners,party
You must not ___ the sacred rock.|touch|touches;touched;touching|must not + 動詞の原形は強い禁止です。「その神聖な岩に触れてはいけません」。|sacred,rock
You don't have to ___ a swimsuit.（買う必要はありません）|buy|buys;bought;buying|don't have toは「〜する必要はない」です。後ろは動詞の原形。「水着を買う必要はありません」。|swimsuit
May I ___ this plate?（使ってもよいですか）|use|used;uses;using|May I + 動詞の原形で許可を求めます。「この皿を使ってもよいですか」。|plate
I can ___ my opinion in English.|express|expresses;expressed;expressing|助動詞canの後ろは動詞の原形です。「私は英語で意見を表現できます」。|express,opinion
You should ___ the lid before moving the pot.|shut|shuts;shutting;to shut|should + 動詞の原形で助言します。「鍋を動かす前にふたを閉めたほうがよいです」。|shut,lid,pot
You ___ be kidding!（冗談でしょう！）|must|are;did;have|You must be kidding.は驚きや信じられない気持ちを表す会話表現です。mustの後ろにはbeの原形を置きます。|You must be kidding.
“Shall we begin?” “Yes, ___.”|let's|let;lets;letting|Shall we ...?という提案に同意するときはYes, let's.と答えられます。「始めましょうか」「はい、そうしましょう」。|Shall we ...?,begin
I need two ___ for the new room.|shelves|shelf;shelfs;shelfes|shelfの複数形はfをvesに変えたshelvesです。「新しい部屋用に棚が2つ必要です」。|shelf
There are three ___ on the table.|knives|knife;knifes;knifees|knifeの複数形はknivesです。「テーブルの上にナイフが3本あります」。|knife
Please pass ___ the sauce.（私たちに）|us|we;our;ours|passの後ろで「私たちに」を表すので、weの目的格usを使います。「私たちにソースを渡してください」。|pass,us,sauce
We made the cutouts by ___.（私たち自身で）|ourselves|us;our;we|by ourselvesで「私たち自身で・私たちだけで」です。「私たちは自分たちだけで切り抜き細工を作りました」。|cutout,ourselves
I put ___ sugar in my tea.（少量の砂糖）|a little|a few;many;an|sugarは通常数えない名詞です。少量にはa littleを使います。「紅茶に少量の砂糖を入れました」。|sugar
We took ___ photos at the expo.（数枚の写真）|a few|a little;much;an|photoは数えられる名詞です。少数にはa few + 複数形を使います。「博覧会で数枚の写真を撮りました」。|photo,expo
This is ___ unforgettable experience.|an|a;many;these|unforgettableは母音の音で始まるのでanを使います。「これは忘れられない体験です」。|unforgettable,experience
I bought a pair of ___.（箸を一膳）|chopsticks|chopstick;chopstickes;chopsticking|箸は通常chopsticksと複数形にし、一膳はa pair of chopsticksです。元のリストは単数形chopstickです。|bought,chopstick
Is there ___ else on the list?（何かほかに）|anything|somewhere;anywhere;someone|疑問文で「何かほかのもの」はanything elseです。elseは不定代名詞の後ろに置きます。「リストにほかに何かありますか」。|else,list
___ of visitors come to this site every year.（何千人もの）|Thousands|Thousand;A thousand;One thousand|thousands of + 複数名詞で「何千もの」です。「毎年、何千人もの訪問者がこの場所に来ます」。|thousands of ...,visitor,site
Have you ever ___ a buffalo?（見たことがありますか）|seen|see;saw;seeing|現在完了の経験はhave + 過去分詞です。seeの過去分詞はseen。「今までにバッファローを見たことがありますか」。|ever,seen,buffalo
I have never ___ to Chinatown.|been|be;was;being|have been to ...で訪問経験を表します。neverを加えて「一度も中華街に行ったことがありません」。|been,Chinatown
She has already ___ tempura.（食べました）|eaten|eat;ate;eating|現在完了はhas + 過去分詞。eatの過去分詞はeatenです。「彼女はもう天ぷらを食べました」。|eaten,tempura
We have just ___ at the port.|arrived|arrive;arrives;arriving|have just + 過去分詞で「ちょうど〜したところ」です。「私たちはちょうど港に到着したところです」。|arrive,port
___ your guest ever visited a theme park?|Has|Have;Did;Does|現在完了の疑問文で、主語your guestは単数なのでHasを使います。「お客さんはテーマパークを訪れたことがありますか」。|guest,ever,theme park
He has ___ the door already.（閉めました）|shut|shuts;shutting;to shut|現在完了はhas + 過去分詞。shutの過去分詞は原形と同じshutです。「彼はもうドアを閉めました」。|shut,door
We have ___ this custom before.（聞いたことがあります）|heard about|hear about;hearing about;hears about|have + 過去分詞で経験を表します。hearの過去分詞はheard。「この風習について以前聞いたことがあります」。|heard,custom
I have ___ a precious present for my mother.|bought|buy;buying;buys|buyの過去分詞はboughtです。have boughtで現在につながる購入を表します。「母に大切な贈り物を買いました」。|bought,precious,present
The performer has ___ us a funny story.|told|tell;telling;tells|tellの過去分詞はtoldです。「演者は私たちにおもしろい話をしてくれました」。hasの後ろは過去分詞にします。|performer,told,us
How many photos have you taken ___?（今までのところ）|so far|yesterday;last year;tomorrow|so farは現在までの範囲を示すので、この現在完了の文に合います。「今までに何枚写真を撮りましたか」。|photo,so far
I have lived in this prefecture ___ 2022.|since|for;during;by|sinceは継続が始まった時点を示します。「私は2022年からこの県に住んでいます」。年という時点なのでforにはしません。|prefecture,since
We have known the owner ___ five years.|for|since;at;from|forは期間の長さを示します。「私たちはその持ち主を5年間知っています」。five yearsは期間です。|owner
She has studied British history ___ a long time.|for|since;at;on|for a long timeは「長い間」です。「彼女は長い間イギリスの歴史を学んでいます」。|British,history,for a long time
I haven't checked the website ___.（まだ確認していません）|yet|ever;ago;yesterday|否定の現在完了でyetは「まだ」です。「私はまだウェブサイトを確認していません」。|check,website,yet
Have you put your toys away ___?（もう片づけましたか）|yet|ago;yesterday;last night|現在完了の疑問文でyetは「もう」です。「もうおもちゃを片づけましたか」。|put ... away,toy,yet
___ long have you been a golf fan?|How|What;Who;Which|継続期間を尋ねるのはHow long ...?です。「どのくらいの間ゴルフのファンなのですか」。|golf,fan,been
It has ___ peaceful here since the festival ended.|been|be;was;being|現在完了ではbeの過去分詞beenを使います。「祭りが終わって以来、ここは穏やかです」。|been,peaceful,since
He ___ been a captain for three years.|has|have;is;was|主語Heに合う現在完了の助動詞はhasです。「彼は3年間主将を務めています」。|captain,been
I have trusted her ___ we met.|since|for;during;until|sinceの後ろには始まった時点を表す節も置けます。「出会って以来、私は彼女を信頼しています」。|trust,since
We have been friends ___ a long time and still trust each other.|for|since;at;by|a long timeは期間なのでforを使います。「私たちは長い間友達で、今も互いを信頼しています」。|for a long time,trust,been
I am proud ___ our traditional artwork.|of|at;from;with|be proud of ...で「〜を誇りに思う」です。「私は私たちの伝統的な作品を誇りに思います」。|proud,artwork,tradition
Please introduce your guest ___ us.|to|at;for;from|introduce A to Bで「AをBに紹介する」です。「お客さんを私たちに紹介してください」。|introduce ... to ～,guest,us
We are waiting ___ line for tickets.|in|on;to;from|in lineで「列に並んで」です。「私たちは切符を買うために列に並んで待っています」。|line,ticket
People laugh ___ over the world.|all|every;each;whole|all over the worldは「世界中で」です。「人々は世界中で笑います」。each/everyはこの位置には使いません。|all over the world,laugh
I stayed home ___ I had an awful headache.|because|but;or;so|理由を続ける接続詞はbecauseです。「ひどい頭痛がしたので家にいました」。|awful
___ you are in trouble, call us.（困ったら）|If|But;Or;So|If + 文で条件「もし〜なら」を表します。「困ったら私たちに電話してください」。|be in trouble,call,us
I will take off my shoes ___ I enter the studio.（入る前に）|before|because;but;or|before + 文で「〜する前に」です。「スタジオに入る前に靴を脱ぎます」。|take off ...,enter,studio
We eat rice cakes ___ New Year's Day.|on|in;at;for|特定の日には前置詞onを使います。月・年にはin、時刻にはatを使うのが基本です。「元日に私たちは餅を食べます」。|rice cake,New Year's Day
Don't worry ___ the price.（値段を心配しないで）|about|to;at;from|worry about ...で「〜を心配する」です。Don't + 原形で否定の命令になります。|Don't worry.,worry,price
“Thank you for the meal.” “My ___.”|pleasure|pleasant;please;pleased|My pleasure.はお礼への返事「どういたしまして」です。名詞pleasureを使います。|thank you for ...,meal,My pleasure.,pleasure
`;
  const units=definitions.map(([key,name,description])=>({id:'g2-momo-'+key,grade:2,category:'grammar',name,description}));
  const questions=rows.trim().split('\n').map((line,index)=>{
    const [prompt,answer,decoys,explanation,source]=line.split('|');
    const options=decoys.split(';');options.splice(index%4,0,answer);
    return {id:'eq2-momo-g'+String(index+1).padStart(3,'0'),grade:2,category:'grammar',unitId:units[Math.floor(index/10)].id,prompt,options,answer,explanation,sourceWords:source.split(',')};
  });
  if(questions.length!==100)throw Error('Expected 100 Momo grammar questions');
  const data={units,questions};
  if(typeof module!=='undefined'&&module.exports)module.exports=data;
  else root.QuestMomoGrammar=data;
})(typeof globalThis!=='undefined'?globalThis:this);
