/* momo_choice_英単語一覧20261020.xlsx の空行を除く271語。順序・表記を保持。 */
(function(root){
  'use strict';
  const rows=`
balloon|名詞|風船|a red balloon（赤い風船）。
cookie|名詞|クッキー|a chocolate cookie（チョコレートクッキー）。
cupcake|名詞|カップケーキ|小さなカップ状の型で焼くケーキです。
Uluru|固有名詞|ウルル|オーストラリアにある大きな一枚岩の名前です。
rock|名詞|岩・石|a large rock（大きな岩）。
organize|動詞|企画する・準備してまとめる|organize a party（パーティーを企画する）。
sound|名詞・動詞|音・〜に聞こえる|That sounds fun.（それは楽しそうですね）。
sign|名詞・動詞|標識・合図・署名する|a road sign（道路標識）。
sign up|熟語|申し込む・登録する|sign up for a tour（ツアーに申し込む）。
send|動詞|送る|send an email（メールを送る）。過去形は sent。
link|名詞|リンク・つながり|a link to a website（ウェブサイトへのリンク）。
website|名詞|ウェブサイト|check a website（ウェブサイトを確認する）。
check|動詞|確認する・調べる|check the time（時間を確認する）。
check out|熟語|見てみる・調べてみる|Check out this website.（このサイトを見てみて）。
guidebook|名詞|旅行案内書・ガイドブック|a guidebook about Sydney（シドニーの案内書）。
call|動詞|呼ぶ・電話する|call a friend（友達に電話する）。
aloha|間投詞|アロハ・こんにちは／さようなら|ハワイ語で、出会いや別れのあいさつなどに使われます。
state|名詞|州・状態|Hawaii is a state.（ハワイは州です）。
golden|形容詞|金色の・黄金の|golden light（金色の光）。
ticket|名詞|切符・入場券|a ticket for the expo（博覧会の入場券）。
sunrise|名詞|日の出|watch the sunrise（日の出を見る）。
sunset|名詞|日の入り・夕日|watch the sunset（夕日を見る）。
sacred|形容詞|神聖な|a sacred place（神聖な場所）。
native|形容詞・名詞|その土地に生まれた・先住の人|a native language（母語）。文脈によって意味が変わります。
ancestor|名詞|祖先|our ancestors（私たちの祖先）。
British|形容詞|イギリスの|a British explorer（イギリス人の探検家）。
explorer|名詞|探検家|an explorer（ひとりの探検家）。
hurt|動詞|傷つける・痛む|hurt my hand（手をけがする）。原形・過去形・過去分詞は hurt。
respect|動詞・名詞|尊重する・尊敬|respect other cultures（ほかの文化を尊重する）。
tradition|名詞|伝統|a local tradition（地元の伝統）。
studio|名詞|スタジオ・制作室|an art studio（美術の制作室）。
artwork|名詞|美術作品|beautiful artwork（美しい美術作品）。
paint|動詞・名詞|絵の具で描く・塗料|paint a picture（絵の具で絵を描く）。
hit|動詞|打つ・当たる|hit a ball（ボールを打つ）。過去形・過去分詞も hit。
home run|名詞|ホームラン|hit a home run（ホームランを打つ）。
spell|動詞|つづる・つづりを言う|How do you spell it?（どうつづりますか）。
code|名詞|暗号・コード|a secret code（秘密の暗号）。
fortune|名詞|運・運勢・財産|good fortune（幸運）、tell someone's fortune（人の運勢を占う）。
history|名詞|歴史|learn about history（歴史について学ぶ）。
taste|名詞・動詞|味・〜の味がする|It tastes good.（それはおいしいです）。
attractive|形容詞|魅力的な|an attractive place（魅力的な場所）。
relaxing|形容詞|くつろげる・気持ちを落ち着かせる|a relaxing trip（くつろげる旅行）。人の気持ちは relaxed。
symbol|名詞|象徴・シンボル|a symbol of peace（平和の象徴）。
fantastic|形容詞|すばらしい|a fantastic experience（すばらしい体験）。
market|名詞|市場|a local market（地元の市場）。
Sydney|固有名詞|シドニー|オーストラリアの都市の名前です。
spot|名詞|場所・地点|a sightseeing spot（観光スポット）。
gather|動詞|集まる・集める|People gather here.（人々がここに集まります）。
culture|名詞|文化|learn about culture（文化について学ぶ）。
theme|名詞|主題・テーマ|the theme of a story（物語のテーマ）。
theme park|名詞|テーマパーク|visit a theme park（テーマパークを訪れる）。
heritage|名詞|遺産|cultural heritage（文化遺産）。
site|名詞|場所・用地・遺跡|a historic site（史跡）。
World Heritage Site|名詞|世界遺産の登録地|a World Heritage Site（世界遺産の登録地）。
Could you ...?|会話表現|〜していただけますか|Could you help me? のように、丁寧に依頼するときの表現です。
line|名詞|列・線|stand in line（列に並ぶ）。
expo|名詞|博覧会|an international expo（国際博覧会）。
southeast|名詞・形容詞|南東・南東の|north（北）や west（西）と区別しましょう。
Asia|固有名詞|アジア|Japan is in Asia.（日本はアジアにあります）。
Southeast Asia|固有名詞|東南アジア|大文字で始まる地域名です。
prefecture|名詞|県・府などの都道府県|a prefecture in Japan（日本の都道府県）。
port|名詞|港|a busy port（にぎわう港）。
ship|名詞|船|travel by ship（船で旅行する）。
various|形容詞|さまざまな|various cultures（さまざまな文化）。
official|形容詞|公式の・公的な|an official website（公式ウェブサイト）。
such|限定詞|そのような|such a beautiful place（そのように美しい場所）。
same|形容詞|同じ|the same theme（同じテーマ）。通常 the を伴います。
court|名詞|コート・法廷|a tennis court（テニスコート）。
food court|名詞|フードコート|複数の飲食店と共用の飲食スペースがある場所です。
sightseeing|名詞|観光|go sightseeing（観光に行く）。
most|限定詞・副詞|大部分の・最も|most people（大部分の人々）、the most attractive（最も魅力的な）。
list|名詞|一覧表・リスト|make a list（一覧表を作る）。
sandal|名詞|サンダル|一足を表すときは a pair of sandals と言えます。
sunscreen|名詞|日焼け止め|put on sunscreen（日焼け止めを塗る）。
swimsuit|名詞|水着|wear a swimsuit（水着を着る）。
without|前置詞|〜なしで|without sugar（砂糖なしで）。後ろには名詞や -ing形が続きます。
cultural|形容詞|文化の・文化的な|a cultural event（文化行事）。culture は名詞です。
would like to ...|会話表現|〜したいのですが|I'd like to visit Sydney. のように、希望を丁寧に伝えます。
party|名詞|パーティー・集まり|organize a party（パーティーを企画する）。
answer|名詞・動詞|答え・答える|answer a question（質問に答える）。
us|代名詞|私たちを・私たちに|we の目的格です。Please help us.（私たちを手伝ってください）。
else|副詞|ほかに・ほかの|anything else（ほかに何か）。疑問詞や不定代名詞などの後ろに置きます。
something else|熟語|何かほかのもの・こと|Do you want something else?（何かほかに欲しいですか）。
origami|名詞|折り紙|make origami（折り紙をする）。日本語から英語に入った語です。
seafood|名詞|魚介類・海産物|fresh seafood（新鮮な魚介類）。
better|比較級|よりよい・より上手に|good / well の比較級です。原級の形に注意しましょう。
stationery|名詞|文房具|buy stationery（文房具を買う）。通常、まとめて扱う名詞です。
crane|名詞|鶴・クレーン|an origami crane（折り鶴）。
candy|名詞|キャンディー・あめ|a piece of candy（ひとつのあめ）。
toilet|名詞|トイレ・便器|Where is the toilet?（トイレはどこですか）。
toilet paper|名詞|トイレットペーパー|a roll of toilet paper（トイレットペーパー1巻）。
arrive|動詞|到着する|arrive at the port（港に到着する）。
thank you for ...|会話表現|〜をありがとう|Thank you for coming. のように、for の後は名詞や -ing形にします。
have a great time|熟語|楽しい時を過ごす|Have a great time!（楽しんできてね）。
especially|副詞|特に・とりわけ|I especially like seafood.（私は特に魚介類が好きです）。
experience|名詞|経験・体験|an unforgettable experience（忘れられない体験）。
memory|名詞|思い出・記憶|a happy memory（楽しい思い出）。
surprising|形容詞|驚くような・意外な|a surprising discovery（驚くような発見）。人の気持ちは surprised。
guest|名詞|客・招待客|welcome a guest（客を迎える）。
enter|動詞|入る・入場する|enter the room（部屋に入る）。場所の前に to は不要です。
closet|名詞|クローゼット・収納戸棚|put clothes in a closet（服をクローゼットに入れる）。
put ... away|熟語|〜を片づける|put the toys away / put them away（おもちゃを／それらを片づける）。
purpose|名詞|目的|the purpose of a visit（訪問の目的）。
discovery|名詞|発見|make a discovery（発見をする）。discover は動詞です。
seasonal|形容詞|季節の・季節限定の|seasonal food（旬の食べ物）。
heard|過去形・過去分詞|hearの過去形・過去分詞／聞いた|hear - heard - heard の変化です。
hear|動詞|聞こえる・聞く|hear a sound（音が聞こえる）。listen は意識して耳を傾けることです。
bought|過去形・過去分詞|buyの過去形・過去分詞／買った|buy - bought - bought の変化です。
chestnut|名詞|栗|roast chestnuts（焼き栗）。
instead|副詞|代わりに|instead of ...（〜の代わりに）という形でもよく使います。
opportunity|名詞|機会・好機|an opportunity to learn（学ぶ機会）。
tempura|名詞|天ぷら|eat tempura（天ぷらを食べる）。
chip|名詞|小片・揚げたジャガイモなどの一片|a potato chipはポテトチップ1枚。イギリスなどではchipsがフライドポテトも表します。
rice cake|名詞|餅・米で作った菓子|このリストの食文化の場面では「餅」を表します。
ingredient|名詞|材料・原料|the ingredients for a meal（食事の材料）。
modern|形容詞|現代の・現代的な|modern art（現代美術）。
through|前置詞|〜を通って|walk through the market（市場を通り抜けて歩く）。
wild|形容詞|野生の|wild animals（野生動物）。
search|動詞・名詞|捜す・捜索|search for a clue（手がかりを捜す）。
giraffe|名詞|キリン|a tall giraffe（背の高いキリン）。
buffalo|名詞|水牛・バッファロー|a wild buffalo（野生の水牛など）。種類は地域や文脈によります。
rhino|名詞|サイ|rhinoceros の短い形です。
drive|動詞|運転する|drive a car（車を運転する）。過去形 drove、過去分詞 driven。
angle|名詞|角度|from a different angle（別の角度から）。
car|名詞|自動車|travel by car（車で移動する）。
lucky|形容詞|運のよい・幸運な|I am lucky.（私は運がよいです）。
excellent|形容詞|非常にすぐれた・優秀な|an excellent performer（非常にすぐれた演者）。
explain|動詞|説明する|explain the recipe to us（私たちにレシピを説明する）。人の前は to。
certainly|副詞|もちろん・確かに|依頼への返事 Certainly. は「もちろんです」。
worth|形容詞|〜の価値がある|worth visiting（訪れる価値がある）。後ろに -ing形を置けます。
introduce|動詞|紹介する・導入する|introduce a guest（客を紹介する）。
introduce ... to ～|熟語|…を～に紹介する|introduce my friend to you（友達をあなたに紹介する）。
cuisine|名詞|料理・料理法|Japanese cuisine（日本料理）。地域や国の料理を表します。
spring roll|名詞|春巻き|make spring rolls（春巻きを作る）。
recipe|名詞|調理法・レシピ|a recipe for tempura（天ぷらのレシピ）。
sauce|名詞|ソース・たれ|add sauce（ソースを加える）。
arrange|動詞|配置する・整える・手配する|arrange flowers（花を生ける）。
beautifully|副詞|美しく・見事に|arrange flowers beautifully（花を美しく生ける）。
chance|名詞|機会・チャンス|a chance to perform（演じる機会）。
skill|名詞|技能・技術|learn a new skill（新しい技能を身につける）。
unforgettable|形容詞|忘れられない|an unforgettable memory（忘れられない思い出）。
seen|過去分詞|seeの過去分詞／見た|see - saw - seen の変化です。have seen は「見たことがある」など。
decoration|名詞|飾り・装飾|a seasonal decoration（季節の飾り）。
Chinatown|固有名詞|チャイナタウン・中華街|visit Chinatown（中華街を訪れる）。
been|過去分詞|beの過去分詞|have been to ... で「〜へ行ったことがある」を表せます。
cutout|名詞|切り抜き・切り抜き細工|a paper cutout（紙の切り抜き細工）。
dragon|名詞|竜・ドラゴン|a dragon decoration（竜の飾り）。
express|動詞|表現する・伝える|express happiness（喜びを表す）。
happiness|名詞|幸福・喜び|a symbol of happiness（幸福の象徴）。happy は形容詞です。
fold|動詞|折る・折りたたむ|fold a piece of paper（1枚の紙を折る）。
door|名詞|ドア・扉|open the door（ドアを開ける）。
ever|副詞|今までに・かつて|Have you ever ...?（今までに〜したことがありますか）。
flowering|形容詞・分詞|花の咲く・開花している|a flowering plant（花の咲く植物）。
golf|名詞|ゴルフ|play golf（ゴルフをする）。競技名の前に the は不要です。
add|動詞|加える|add sugar to tea（紅茶に砂糖を加える）。
bloom|動詞・名詞|花が咲く・開花|The flowers bloom in spring.（その花は春に咲きます）。
glass|名詞|ガラス・コップ|a glass of water（コップ1杯の水）。
pot|名詞|鍋・植木鉢|a flower pot（植木鉢）。
smell|名詞・動詞|におい・〜のにおいがする|The food smells good.（その食べ物はよいにおいがします）。
folk|形容詞・名詞|民間の・人々|a folk tale（民話）。
told|過去形・過去分詞|tellの過去形・過去分詞／話した|tell - told - told の変化です。
coach|名詞|指導者・コーチ|a golf coach（ゴルフのコーチ）。
captain|名詞|主将・船長|the captain of a team（チームの主将）。
proud|形容詞|誇りに思っている|be proud of ...（〜を誇りに思う）。
frightened|形容詞|怖がっている・おびえた|a frightened kid（おびえた子ども）。
visitor|名詞|訪問者・見物客|a visitor from abroad（外国からの訪問者）。
overseas|副詞・形容詞|海外へ・海外の|travel overseas（海外を旅行する）。
fan|名詞|ファン・うちわ・扇風機|a golf fan（ゴルフのファン）、a paper fan（紙のうちわ）。
lantern|名詞|ランタン・ちょうちん|a red lantern（赤いちょうちん）。
stamp|名詞|切手・スタンプ|put a stamp on a letter（手紙に切手を貼る）。
expensive|形容詞|高価な・値段が高い|an expensive vase（高価な花瓶）。
cheap|形容詞|安い・安価な|a cheap ticket（安い切符）。
chopstick|名詞|箸の1本|一膳は a pair of chopsticks。通常は複数形 chopsticks で使います。
cloth|名詞|布|a piece of cloth（1枚の布）。clothes（衣服）と区別しましょう。
pretty|形容詞・副詞|かわいい・かなり|a pretty vase（かわいい花瓶）、pretty good（かなりよい）。
wrap|動詞|包む|wrap a present（プレゼントを包む）。
anyone|代名詞|誰か・誰でも|疑問文では「誰か」、肯定文では「誰でも」の意味などになります。
toy|名詞|おもちゃ|put toys away（おもちゃを片づける）。
tiny|形容詞|とても小さい|a tiny cutout（とても小さな切り抜き）。
valuable|形容詞|価値のある・貴重な|a valuable experience（貴重な経験）。
vase|名詞|花瓶|put flowers in a vase（花を花瓶に入れる）。
huge|形容詞|とても大きい・巨大な|a huge rock（巨大な岩）。
present|名詞|贈り物・プレゼント|a birthday present（誕生日の贈り物）。
glad|形容詞|うれしい|I'm glad to see you.（あなたに会えてうれしいです）。
sail|動詞|航海する・帆走する|sail across the sea（海を渡って航海する）。
solo|副詞・形容詞|ひとりで・単独の|sail solo（単独で航海する）。
realize|動詞|気づく・実現する|realize a mistake（間違いに気づく）。
sleeping|現在分詞・形容詞|眠っている・睡眠用の|a sleeping kid（眠っている子ども）、a sleeping bag（寝袋）。
desert|名詞|砂漠|a huge desert（広大な砂漠）。dessert（デザート）と区別しましょう。
doubt|名詞・動詞|疑い・疑う|without doubt（疑いなく）。
knife|名詞|ナイフ・包丁|複数形は knives です。
yet|副詞|まだ・もう|否定文の not ... yet は「まだ〜ない」。疑問文では「もう」。
owner|名詞|所有者・持ち主|the owner of a shop（店の持ち主）。
performer|名詞|演者・出演者|a street performer（大道芸の演者）。
stage|名詞|舞台・段階|on the stage（舞台の上で）。
act|動詞・名詞|演じる・行動する・行為|act on the stage（舞台で演じる）。
conversation|名詞|会話|have a conversation（会話をする）。
facial|形容詞|顔の|a facial expression（表情）。
expression|名詞|表現・表情|a happy expression（うれしそうな表情）。
since|前置詞・接続詞|〜以来・〜してから|since last year（昨年から）。期間の長さを表す for と区別します。
tool|名詞|道具|a useful tool（役に立つ道具）。
represent|動詞|表す・代表する|represent happiness（幸福を表す）。
for example|熟語|例えば|具体例を挙げる前などに使います。For example, ...（例えば、〜）。
begin|動詞|始める・始まる|begin a conversation（会話を始める）。過去形は began。
question|名詞|質問・問題|ask a question（質問する）。
for a long time|熟語|長い間|期間の長さを表す表現です。
perform|動詞|演じる・上演する|perform on the stage（舞台で演じる）。
United States|固有名詞|アメリカ合衆国|国名として文中では通常 the United States と言います。
joke|名詞・動詞|冗談・冗談を言う|tell a joke（冗談を言う）。
sense|名詞|感覚・判断力|a sense of humor（ユーモアのセンス）。
humor|名詞|ユーモア・おかしみ|a story full of humor（ユーモアに富んだ話）。
all over the world|熟語|世界中で・世界中に|People laugh all over the world.（世界中で人々が笑います）。
abroad|副詞|外国へ・外国で|go abroad（外国へ行く）。通常 to abroad にはしません。
nearly|副詞|ほとんど・もう少しで|nearly finished（ほとんど終わった）。
difficulty|名詞|困難・難しさ|have difficulty doing ...（〜するのに苦労する）。
difference|名詞|違い・相違|the difference between A and B（AとBの違い）。
manners|名詞|行儀・作法|good manners（よい作法）。この意味では通常複数形です。
custom|名詞|習慣・風習|a local custom（地元の風習）。
opinion|名詞|意見|in my opinion（私の意見では）。
laughter|名詞|笑い・笑い声|a room full of laughter（笑い声でいっぱいの部屋）。
laugh|動詞|笑う|laugh at a joke（冗談を聞いて笑う）。laughter は名詞です。
continue|動詞|続ける・続く|continue to learn（学び続ける）。-ing形を続けることもできます。
lead|動詞|導く・案内する|lead visitors to a site（訪問者をある場所へ案内する）。過去形は led。
peaceful|形容詞|平和な・穏やかな|a peaceful place（穏やかな場所）。
pleasure|名詞|喜び・楽しみ|It's a pleasure.（光栄です／うれしいです）。
My pleasure.|会話表現|どういたしまして・喜んで|お礼を言われたときの返事です。
roast|動詞|焼く・あぶる|roast chestnuts（栗を焼く）。
item|名詞|品物・項目|an item on a list（リストにある項目）。
photo|名詞|写真|take a photo（写真を撮る）。
far|副詞・形容詞|遠くに・遠い|far from here（ここから遠くに）。
so far|熟語|今までのところ|主に現在までの範囲を表します。
strongly|副詞|強く|strongly believe（強く信じる）。
thousands of ...|熟語|何千もの〜|thousands of visitors（何千人もの訪問者）。
impressive|形容詞|印象的な・感動を与える|an impressive performance（印象的な演技）。
New Year's Day|固有名詞|元日|日付としては on New Year's Day（元日に）と言います。
meal|名詞|食事|have a meal（食事をする）。
price|名詞|価格・値段|the price of a ticket（切符の値段）。
invite|動詞|招待する|invite a friend to a party（友達をパーティーに招待する）。
be back|熟語|戻っている・戻る|I'll be back soon.（すぐ戻ります）。
master|名詞・動詞|名人・師匠・習得する|a master of origami（折り紙の名人）。
shelf|名詞|棚|複数形は shelves です。
poison|名詞|毒|a bottle of poison（毒の入った瓶）。
worry|動詞|心配する・心配させる|worry about ...（〜を心配する）。
Don't worry.|会話表現|心配しないで|Don't + 動詞の原形で「〜しないで」と伝えます。
pass|動詞|渡す・通り過ぎる・合格する|pass me a plate（私に皿を渡す）。
shall|助動詞|〜しましょうか（提案など）|Shall we ...? の形で誘いや提案を表せます。
Shall we ...?|会話表現|一緒に〜しませんか・〜しましょうか|Shall we begin?（始めましょうか）。後ろは動詞の原形です。
Yes, let's.|会話表現|はい、そうしましょう|Shall we ...? や提案に同意するときの返事です。
wipe|動詞|拭く|wipe the table（テーブルを拭く）。
shut|動詞|閉める・閉じる|shut the door（ドアを閉める）。過去形・過去分詞も shut。
take off ...|熟語|〜を脱ぐ・外す|take off your shoes（靴を脱ぐ）。
lid|名詞|ふた|the lid of a pot（鍋のふた）。
stuff|名詞|物・もの類|my stuff（私の持ち物）。くだけた表現で、通常 stuffs にはしません。
sugar|名詞|砂糖|a little sugar（少量の砂糖）。通常、数えずに扱います。
eaten|過去分詞|eatの過去分詞／食べた|eat - ate - eaten の変化です。
be in trouble|熟語|困っている・困った状況にある|I'm in trouble.（私は困っています）。
Wait a minute.|会話表現|ちょっと待って|相手に少し待つように頼む表現です。
plate|名詞|皿|a plate of tempura（皿に盛られた天ぷら）。
kid|名詞|子ども|child のくだけた言い方です。kid には「冗談を言う」という動詞の用法もあります。
You must be kidding.|会話表現|冗談でしょう・まさか|相手の話に驚いたり信じられなかったりするときに使います。
ground|名詞|地面|on the ground（地面の上に）。
believe|動詞|信じる・〜だと思う|believe a story（話を信じる）。
trust|動詞|信頼する|trust a friend（友達を信頼する）。
What's going on?|会話表現|何が起きているの・どうしたの|その場で起きていることを尋ねる表現です。
awful|形容詞|ひどい・恐ろしい|an awful smell（ひどいにおい）。
precious|形容詞|大切な・かけがえのない|a precious memory（大切な思い出）。
punish|動詞|罰する|punish someone（人を罰する）。
ourselves|代名詞|私たち自身を・私たち自身で|we の再帰代名詞です。by ourselves（私たちだけで）。
ring|名詞・動詞|指輪・輪・鳴る|a precious ring（大切な指輪）。動詞の過去形は rang。
ah|間投詞|ああ・なるほど|気づきや理解、感情などを表す声です。
ear|名詞|耳|my right ear（私の右耳）。
`;
  const entries=rows.trim().split('\n').map((line,index)=>{
    const [word,partOfSpeech,meaning,note]=line.split('|');
    return Object.freeze({word,partOfSpeech,meaning,note,sourceIndex:index+1});
  });
  const data=Object.freeze(entries);
  if(typeof module!=='undefined'&&module.exports)module.exports=data;
  else root.QuestMomoWords=data;
})(typeof globalThis!=='undefined'?globalThis:this);
