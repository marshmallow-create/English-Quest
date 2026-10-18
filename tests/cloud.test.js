'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../scripts/cloud.js');
const P=require('../scripts/progress.js');
const {questions}=require('../scripts/questions.js');
const id='11111111-1111-4111-8111-111111111111';
const config={supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'sb_publishable_testing'};
function memory(){const data=new Map();return{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
const session={access_token:'access',refresh_token:'refresh',expires_in:3600,user:{id,user_metadata:{username:'hana_01'}}};
function response(data,status=200){return new Response(data===null?'':JSON.stringify(data),{status});}
test('未設定はゲスト利用、秘密キーやSupabase以外のURLを拒否',()=>{
  assert.equal(C.createClient({},{}),null);
  assert.throws(()=>C.config({...config,supabaseUrl:'http://example.supabase.co'}));
  assert.throws(()=>C.config({...config,supabaseUrl:'https://example.evil.test'}));
  assert.throws(()=>C.config({...config,supabasePublishableKey:'sb_secret_testing'}));
});
test('アカウント別保存はゲスト・別利用者・v1から独立し、復旧キーも分離',()=>{
  const store=memory();P.save(store,{...P.empty(),xp:90});
  store.setItem(P.LEGACY_KEY,JSON.stringify({answered:100}));
  const a=C.scopedStorage(store,id),b=C.scopedStorage(store,'22222222-2222-4222-8222-222222222222');
  assert.equal(P.load(a,questions).progress.xp,0);
  P.save(a,{...P.empty(),xp:20});
  assert.equal(P.load(store,questions).progress.xp,90);
  assert.equal(P.load(b,questions).progress.xp,0);
  a.setItem(P.KEY+'-before-import','backup');
  assert.equal(store.getItem(C.userKey(id)+'-before-import'),'backup');
  assert.throws(()=>C.userKey('../guest'));
});
test('バックアップの往復、旧v2の直接取り込み、破損・誤形式・過大入力を拒否',()=>{
  const data=P.empty();const quest=P.createQuest(questions.slice(0,1));P.answer(data,quest,quest.questions[0].answer);
  assert.deepEqual(C.parseBackup(JSON.stringify({application:'english-quest',formatVersion:1,data}),P,questions),data);
  assert.deepEqual(C.parseBackup(JSON.stringify(data),P,questions),data);
  for(const invalid of ['{broken','null','[]','{}',JSON.stringify({...data,xp:-1}),JSON.stringify({...data,schemaVersion:99})])assert.throws(()=>C.parseBackup(invalid,P,questions));
  assert.throws(()=>C.parseBackup('a'.repeat(4*1024*1024+1),P,questions));
});
test('セッションを保存して復元し、パスワードを保存しない',async()=>{
  const store=memory(),calls=[];
  const client=C.createClient(config,{storage:store,fetcher:async(url,init)=>{calls.push({url,init});return response(url.endsWith('/user')?session.user:session);}});
  assert.deepEqual(await client.signIn('HANA_01','private-password'),{id,username:'hana_01'});
  assert.equal(await client.restore(),client.user);
  assert.ok(!store.getItem('english-quest-auth-example.supabase.co').includes('private-password'));
  assert.equal(calls[1].init.headers.Authorization,'Bearer access');
  assert.equal(calls[0].init.headers.apikey,config.supabasePublishableKey);
  assert.deepEqual(JSON.parse(calls[0].init.body),{action:'signin',username:'hana_01',password:'private-password'});
  assert.ok(calls[0].url.endsWith('/functions/v1/username-auth'));
});
test('期限切れはrefresh_tokenで更新し、新しいaccess_tokenで通信',async()=>{
  const store=memory();let time=0;const calls=[];
  const client=C.createClient(config,{storage:store,now:()=>time,fetcher:async(url,init)=>{
    calls.push({url,init});
    if(url.includes('grant_type=refresh_token'))return response({...session,access_token:'renewed'});
    if(url.includes('/rest/'))return response([]);
    return response(session);
  }});
  await client.signIn('hana_01','password');time=3600000;
  assert.equal(await client.read(),null);
  assert.ok(calls[1].url.includes('refresh_token'));
  assert.equal(calls[2].init.headers.Authorization,'Bearer renewed');
});
test('ユーザー名で新規登録すると、メール確認を挟まずログインする',async()=>{
  const calls=[];
  const client=C.createClient(config,{storage:memory(),fetcher:async(url,init)=>{calls.push(JSON.parse(init.body));return response(session);}});
  assert.deepEqual(await client.signUp('hana_01','password'),{id,username:'hana_01'});
  assert.deepEqual(calls,[{action:'signup',username:'hana_01',password:'password'}]);
  assert.ok(!Object.hasOwn(client.user,'email'));
});
test('ログインなしの同期を拒否し、初回INSERTと版を指定したPATCHを使う',async()=>{
  const calls=[];
  const client=C.createClient(config,{storage:memory(),fetcher:async(url,init)=>{calls.push({url,init});return response(url.includes('/username-auth')?session:[{progress:P.empty(),revision:1}]);}});
  await assert.rejects(()=>client.read(),error=>error.status===401);
  await client.signIn('hana_01','password');
  await client.write(P.empty(),null);await client.write(P.empty(),4);
  assert.equal(calls[1].init.method,'POST');assert.equal(calls[2].init.method,'PATCH');
  assert.ok(calls[2].url.includes('&revision=eq.4'));
  assert.equal(JSON.parse(calls[2].init.body).revision,5);
  assert.equal(JSON.parse(calls[2].init.body).user_id,id);
  await assert.rejects(()=>client.write(P.empty(),undefined));
});
test('更新0行・重複INSERTは競合として扱い、自動上書きに変更しない',async()=>{
  let status=200;
  const client=C.createClient(config,{storage:memory(),fetcher:async(url)=>response(url.includes('/username-auth')?session:[],url.includes('/username-auth')?200:status)});
  await client.signIn('hana_01','password');
  await assert.rejects(()=>client.write(P.empty(),2),error=>error.status===409);
  status=409;await assert.rejects(()=>client.write(P.empty(),null),error=>error.status===409);
});
test('通信失敗、権限エラー、異常な版を表示可能なエラーにし、ログアウトは端末上で完了',async()=>{
  let mode='login';
  const store=memory();
  const client=C.createClient(config,{storage:store,fetcher:async()=>{
    if(mode==='offline')throw Error('Network');
    if(mode==='denied')return response({},403);
    if(mode==='invalid')return response([{progress:{},revision:'bad'}]);
    return response(session);
  }});
  await client.signIn('hana_01','password');
  mode='denied';await assert.rejects(()=>client.read(),error=>error.status===403);
  mode='invalid';await assert.rejects(()=>client.read(),/版/);
  mode='offline';await assert.rejects(()=>client.read(),/通信/);
  assert.ok(await client.signOut());assert.equal(client.user,null);
  assert.equal(store.getItem('english-quest-auth-example.supabase.co'),'null');
});
test('記録の一致判定はJSONのプロパティ順に左右されない',()=>{
  assert.ok(C.same({a:1,b:{c:2,d:3}},{b:{d:3,c:2},a:1}));
  assert.ok(!C.same({a:[1,2]},{a:[2,1]}));
});
test('ユーザー名の重複・誤ったパスワードは、同期競合と区別して案内',async()=>{
  let code='username_taken';
  const client=C.createClient(config,{storage:memory(),fetcher:async()=>response({code},code==='username_taken'?409:401)});
  await assert.rejects(()=>client.signUp('hana_01','password'),/ユーザー名は使用/);
  code='invalid_credentials';await assert.rejects(()=>client.signIn('hana_01','password'),/ユーザー名またはパスワード/);
});
test('無効なユーザー名・パスワードは、送信せずにエラーにする',async()=>{
  let calls=0;const client=C.createClient(config,{storage:memory(),fetcher:async()=>{calls++;return response(session);}});
  await assert.rejects(()=>client.signIn('mail@example.com','password'));
  await assert.rejects(()=>client.signIn('hana_01','short'));
  await assert.rejects(()=>client.signUp('hana_01','あ'.repeat(8)));
  assert.equal(calls,0);
});
