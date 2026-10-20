/* 選択肢の単語帳。正解・誤答の両方を、回答後に確認できます。 */
(function(root){
  'use strict';
  const groups={
    '名詞':`
library|図書館・図書室
station|駅
kitchen|台所
garden|庭
brother|兄・弟
sister|姉・妹
father|父・お父さん
uncle|おじ
dinner|夕食・一日の主な食事
lunch|昼食
breakfast|朝食
food|食べ物
hospital|病院
museum|博物館・美術館
factory|工場
airport|空港
weather|天気
country|国・田舎
culture|文化
subject|教科・話題
environment|環境
experience|経験・体験
education|教育
energy|エネルギー・活力
example|例・手本
exercise|運動・練習問題
exchange|交換・交流
son|息子
mother|母・お母さん
daughter|娘
aunt|おば
student|生徒・学生
doctor|医者
player|選手・演奏者
teacher|先生・教師
singer|歌手
farmer|農家の人・農業をする人
classroom|教室
bedroom|寝室
desk|勉強机・仕事机
chair|いす
door|ドア・扉
window|窓
clock|時計
wall|壁
floor|床・建物の階
roof|屋根
school|学校
park|公園
shop|店
office|事務所・職場
juice|ジュース
tea|茶・紅茶
water|水
milk|牛乳
rice|米・ご飯
bread|パン
meat|肉
fish|魚
snack|軽食・おやつ
Friday|金曜日
Saturday|土曜日
Sunday|日曜日
Monday|月曜日
Tuesday|火曜日
Thursday|木曜日
spring|春
summer|夏
autumn|秋
winter|冬
temple|寺・寺院
librarian|図書館員・司書
musician|音楽家
scientist|科学者
pilot|操縦士・パイロット
artist|芸術家・画家
driver|運転手
nurse|看護師
uniform|制服
object|物・物体
project|計画・企画・研究課題
history|歴史
geography|地理
science|科学・理科
math|数学・算数
music|音楽
art|美術・芸術
language|言語・ことば
sport|スポーツ・運動競技
instrument|楽器・器具
umbrella|傘
ticket|切符・入場券
letter|手紙・文字
wallet|財布
map|地図
cap|帽子・ふた
cup|カップ・取っ手のある茶わん
card|カード・はがき
mountain|山
forest|森林・森
bridge|橋
beach|浜辺・海岸
lake|湖
island|島
river|川
hill|丘
desert|砂漠
field|野原・畑・分野
valley|谷
village|村
capital|首都
city|都市・市
program|番組・計画・プログラム
population|人口
pollution|汚染・公害
position|位置・立場
festival|祭り
season|季節
vacation|休暇
lesson|授業・レッスン
hobby|趣味
holiday|休日・祝日
health|健康
habit|習慣・癖
homework|宿題
hometown|故郷・出身地
weekday|平日
meaning|意味
message|伝言・メッセージ
scenery|景色・風景
schedule|予定・日程
society|社会
information|情報
invitation|招待・招待状
instruction|指示・説明
imagination|想像力
invention|発明・発明品
biology|生物学
technology|科学技術
effort|努力
event|出来事・行事
enemy|敵
solution|解決策・答え
earth|地球・大地
moon|月
star|星
cloud|雲
nation|国家・国民
future|未来・将来
nature|自然・性質
power|力・電力
price|値段・価格
peace|平和
war|戦争
work|仕事・作業
wealth|富・財産
right|権利・右・正しいこと
rule|規則・ルール
risk|危険・危険性
role|役割
reason|理由
result|結果
continent|大陸
community|地域社会・共同体
company|会社
passenger|乗客
volunteer|ボランティア・自発的に活動する人
visitor|訪問者・来客
customer|客・顧客
opportunity|機会・好機
opinion|意見
operation|操作・手術
opposition|反対・対立
option|選択肢
occasion|機会・特定の時
research|研究・調査
record|記録
report|報告・報告書
request|依頼・要求
purpose|目的
problem|問題・困ったこと
process|過程・工程
effect|効果・影響
error|誤り・間違い
progress|進歩・上達
success|成功
failure|失敗
feature|特徴・特色
knowledge|知識
courage|勇気
danger|危険
damage|損害・被害
ability|能力
activity|活動
responsibility|責任
possibility|可能性
quality|質・品質
identity|自分らしさ・身元
freedom|自由
friendship|友情
kindness|親切・思いやり
fairness|公平さ
`,
    '動詞':`
read|読む
walk|歩く
sing|歌う
swim|泳ぐ
forget|忘れる
decide|決める
borrow|借りる
arrive|到着する
produce|生産する・生み出す
provide|提供する
protect|守る・保護する
prepare|準備する
believe|信じる
belong|属する・所属する
bring|持ってくる・連れてくる
build|建てる・築く
run|走る
sleep|眠る
cook|料理する
speak|話す
listen|耳を傾ける・聞く
write|書く
drink|飲む
watch|注意して見る・観察する
dance|踊る
study|勉強する・研究する
make|作る・〜にする
buy|買う
sell|売る
eat|食べる
draw|描く・引く
wash|洗う
open|開ける・開く
play|遊ぶ・スポーツをする・楽器を演奏する
live|住む・生きる
leave|去る・出発する・残す
like|好む・好きである
look|見る・〜に見える
close|閉める・閉じる
clean|掃除する・きれいにする
carry|運ぶ・持ち歩く
call|呼ぶ・電話する
come|来る
lend|貸す
return|戻る・返す
keep|保つ・持ち続ける
lose|失う・負ける
learn|学ぶ・身につける
teach|教える
remember|覚えている・思い出す
remove|取り除く
repeat|繰り返す
invite|招待する
visit|訪れる
introduce|紹介する
join|参加する・加わる
move|動く・引っ越す
check|確認する・調べる
chase|追いかける
choose|選ぶ
change|変える・変わる
wish|願う
need|必要とする
want|欲しい・〜したいと思う
hope|望む・期待する
enjoy|楽しむ
finish|終える・終わる
begin|始める・始まる
stop|止まる・やめる
perform|演じる・実行する
promise|約束する
practice|練習する
expect|予期する・期待する
explore|探検する・詳しく調べる
explain|説明する
express|表現する
reuse|再利用する
reduce|減らす
refuse|断る・拒否する
repair|修理する
increase|増やす・増える
divide|分ける
discover|発見する
develop|発達する・開発する
destroy|破壊する
describe|描写する・特徴を説明する
invent|発明する
design|設計する・デザインする
include|含む
suppose|〜だと思う・仮定する
surprise|驚かせる
separate|分ける・引き離す
support|支える・支持する
imagine|想像する
impress|感銘を与える・印象づける
improve|改善する・上達する
import|輸入する
share|共有する・分け合う
show|見せる・示す
save|救う・節約する・保存する
underline|下線を引く
undo|元に戻す・取り消す
understand|理解する
undertake|引き受ける
access|利用する・アクセスする
accept|受け入れる
compare|比べる
complete|完成させる・終える
complain|不平を言う
continue|続ける・続く
contain|含む・中に入っている
consider|よく考える・〜だとみなす
control|制御する・管理する
`,
    '形容詞':`
busy|忙しい
easy|簡単な・やさしい
happy|うれしい・幸せな
young|若い・幼い
foreign|外国の
famous|有名な
friendly|親しみやすい・友好的な
free|自由な・無料の
tired|疲れた
hungry|空腹の
angry|怒っている
excited|わくわくした・興奮した
popular|人気のある
possible|可能な
personal|個人の・私的な
perfect|完璧な
big|大きい
small|小さい
short|短い・背が低い
large|大きい・広い
long|長い
tall|背が高い・高さがある
old|年をとった・古い
cold|寒い・冷たい
new|新しい
hot|暑い・熱い
fast|速い
warm|暖かい・温かい
cool|涼しい・冷たい
dry|乾いた
sad|悲しい
kind|親切な
funny|おもしろい・おかしな
thirsty|のどが渇いた
sleepy|眠い
late|遅い・遅れた
slow|遅い・ゆっくりした
heavy|重い
early|早い・早めの
light|軽い・明るい
surprised|驚いた
worried|心配している
bored|退屈している
glad|うれしい
proud|誇りに思っている
interested|興味を持っている
interesting|興味を引く・おもしろい
boring|退屈な・退屈させる
difficult|難しい
afraid|恐れている・怖がっている
brave|勇敢な
nervous|緊張した・不安な
lonely|寂しい・孤独な
useful|役に立つ
simple|簡単な・単純な
useless|役に立たない
careless|不注意な
hopeless|望みのない
expensive|高価な・値段が高い
different|異なる
important|大切な・重要な
similar|似ている
usual|いつもの・普通の
same|同じ
comfortable|快適な・心地よい
responsible|責任がある
available|利用できる・手に入る
valuable|価値のある・貴重な
normal|通常の・正常な
necessary|必要な
natural|自然の・自然な
national|国の・全国の
traditional|伝統的な
international|国際的な
original|元の・独創的な
local|地元の・その地域の
sustainable|持続可能な
suitable|適した・ふさわしい
`,
    '前置詞':`except|〜を除いて`
  };
  const notes={
    library:'学校の図書室にも使えます。librarian（図書館員）と区別しましょう。',
    brother:'英語では兄も弟も同じ単語です。elder / younger を添えると区別できます。',
    sister:'英語では姉も妹も同じ単語です。elder / younger を添えると区別できます。',
    dinner:'夕食を指すことが多いですが、一日の主な食事が昼なら昼の食事を指すこともあります。',
    lunch:'昼の食事です。朝食はbreakfast、夕食はdinnerがよく使われます。',
    breakfast:'朝の食事です。have breakfast で「朝食を食べる」と言えます。',
    borrow:'一時的に借りる側の動作です。borrow a book from a friend（友達から本を借りる）。',
    lend:'一時的に貸す側の動作です。lend a book to a friend（友達に本を貸す）。',
    bring:'話し手など、基準となる場所へ持ってくることを表します。',
    carry:'荷物などを持って運ぶことです。carry a bag（かばんを運ぶ）。',
    arrive:'arrive at the station（駅に到着する）、arrive in Japan（日本に到着する）。',
    listen:'聞く対象を続けるときは listen to music のように to を使います。',
    look:'視線を向けることです。look at the sky（空を見る）。',
    watch:'動きや変化に注意を向けて見ることです。watch TV（テレビを見る）。',
    speak:'speak English（英語を話す）のように、言語とよく使います。',
    play:'play soccer（サッカーをする）、play the piano（ピアノを弾く）。',
    belong:'belong to the club（そのクラブに所属している）のように to と使います。',
    excited:'人が感じる気持ちを表します。I am excited.（私はわくわくしています）。',
    interested:'興味を持っている人の気持ちです。be interested in music（音楽に興味がある）。',
    interesting:'人に興味を起こさせる物事の性質です。an interesting book（おもしろい本）。',
    bored:'退屈している人の気持ちを表します。I am bored.（私は退屈しています）。',
    boring:'人を退屈させる物事の性質です。a boring story（退屈な話）。',
    surprised:'驚いた人の気持ちを表します。surprise は「驚かせる」という動詞にもなります。',
    afraid:'be afraid of dogs（犬を怖がる）のように使います。',
    proud:'be proud of you（あなたを誇りに思う）のように of と使います。',
    tall:'人や木などの高さを表します。物の長さは long を使います。',
    short:'長さが短い場合と、背が低い場合の両方に使えます。',
    late:'予定の時刻より遅いことです。slow は動きや速度が遅いことです。',
    slow:'速度が遅いことです。a slow train（速度の遅い列車）。',
    light:'ここでは主に heavy（重い）の反対。「光」を表す名詞にもなります。',
    right:'「権利」という名詞のほか、「右」「正しい」という意味もあります。',
    free:'free time（自由な時間）、free tickets（無料のチケット）。',
    country:'Japan is a country. の country は「国」。in the country は「田舎で」。',
    information:'数えるときは a piece of information（ひとつの情報）。通常 informations にはしません。',
    homework:'do homework（宿題をする）。通常 homeworks にはしません。',
    knowledge:'知っている内容や理解をまとめて表します。通常 knowledges にはしません。',
    scenery:'景色をまとめて表す語です。beautiful scenery（美しい景色）。',
    progress:'make progress（進歩する）のように使います。通常 progresses にはしません。',
    research:'do research（研究する）。「研究する」という動詞にもなります。',
    practice:'practice speaking English（英語を話す練習をする）。動詞の後は -ing形を使えます。',
    enjoy:'enjoy playing tennis（テニスをして楽しむ）。動詞を続けるときは -ing形にします。',
    finish:'finish doing homework（宿題をし終える）のように -ing形を続けられます。',
    decide:'decide to study（勉強することに決める）のように to + 動詞を続けられます。',
    hope:'hope to see you（あなたに会いたいと願う）のように使います。',
    want:'want to learn（学びたい）のように to + 動詞を続けられます。',
    need:'need water（水を必要とする）、need to study（勉強する必要がある）。',
    provide:'provide food for people（人々に食べ物を提供する）のように使います。',
    protect:'protect nature（自然を守る）。危険などから守ることを表します。',
    prepare:'prepare for a test（テストの準備をする）のように使います。',
    explain:'explain the rule to me（私にルールを説明する）。人の前には to を使います。',
    describe:'見た目や特徴をことばで説明することです。describe a picture（絵の様子を説明する）。',
    invent:'それまでなかった物を生み出すことです。discover（発見する）と区別しましょう。',
    discover:'すでにあるが知られていなかった物事を見つけることです。',
    reduce:'量や数を減らすことです。reduce waste（ごみを減らす）。',
    reuse:'捨てずにもう一度使うことです。reuse a bag（袋を再利用する）。',
    improve:'よくする・よくなることです。improve your English（英語力を伸ばす）。',
    import:'外国から物を取り入れることです。import food（食料を輸入する）。',
    accept:'申し出や考えなどを受け入れる動詞です。except（〜を除いて）と区別しましょう。',
    except:'動詞ではなく、除く対象の前に置きます。everyone except me（私以外のみんな）。',
    compare:'compare A with B（AとBを比べる）のように使います。',
    consider:'consider studying abroad（留学することを検討する）のように -ing形を続けられます。',
    similar:'similar to mine（私のものに似ている）のように to と使います。',
    different:'different from mine（私のものとは異なる）のように from と使います。',
    responsible:'be responsible for the work（その仕事に責任がある）のように使います。',
    available:'利用したり、手に入れたりできる状態です。available online（オンラインで利用できる）。',
    sustainable:'環境や資源などに無理をかけず、長く続けられることです。',
    suitable:'ある目的や相手に合っていることです。suitable for children（子どもに適した）。',
    traditional:'長く受け継がれてきた習慣などを表します。traditional food（伝統的な食べ物）。',
    international:'複数の国に関わることです。international exchange（国際交流）。'
  };
  const entries={};
  for(const [partOfSpeech,rows] of Object.entries(groups))for(const row of rows.trim().split('\n')){
    const [word,meaning]=row.trim().split('|');
    if(!word||!meaning||entries[word])throw Error('Invalid vocabulary entry: '+word);
    entries[word]=Object.freeze({meaning,partOfSpeech,note:notes[word]||''});
  }
  const momo=typeof module!=='undefined'&&module.exports?require('./momo-words.js'):root.QuestMomoWords;
  for(const {word,meaning,partOfSpeech,note} of momo)entries[word]=Object.freeze({meaning,partOfSpeech,note});
  const vocabulary=Object.freeze(entries);
  if(typeof module!=='undefined'&&module.exports)module.exports=vocabulary;
  else root.QuestVocabulary=vocabulary;
})(typeof globalThis!=='undefined'?globalThis:this);
