'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Identity=require('../scripts/identity.js');
const {createHandler,internalEmail}=require('../supabase/functions/username-auth/handler.js');
const pub='sb_publishable_test',secret='sb_secret_server_only';
const origin='https://english-quest-sepia.vercel.app';
const id='11111111-1111-4111-8111-111111111111';
function setup({duplicate=false,denied=false,rate=false,unavailable=false}={}){
  const calls=[];
  const vars={SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEYS:JSON.stringify({default:pub}),SUPABASE_SECRET_KEYS:JSON.stringify({default:secret})};
  const handler=createHandler({env:key=>vars[key],fetcher:async(url,init)=>{
    const body=JSON.parse(init.body);calls.push({url,headers:init.headers,body});
    if(unavailable)throw Error('offline');
    if(url.includes('/rpc/'))return Response.json(!rate);
    if(url.includes('/admin/users'))return Response.json(duplicate?{error_code:'email_exists'}:{id},{status:duplicate?422:200});
    return Response.json(denied?{error_code:'invalid_credentials'}:{access_token:'access',refresh_token:'refresh',expires_in:3600,user:{id,email:body.email}},{status:denied?400:200});
  }});
  return {calls,handler};
}
function request(body={action:'signup',username:'HANA_01',password:'password123'},headers={}){
  return new Request('https://example.supabase.co/functions/v1/username-auth',{method:'POST',headers:{origin,apikey:pub,'content-type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
}
test('ユーザー名を正規化し、範囲外・メール・日本語を拒否。パスワードも共通規則',()=>{
  assert.equal(Identity.normalizeUsername(' HANA_01 '),'hana_01');
  assert.equal(Identity.normalizeUsername('ＨＡＮＡ_０１'),'hana_01');
  for(const name of ['aa','a'.repeat(25),'hana@example.com','はな','../hana',null])assert.throws(()=>Identity.normalizeUsername(name));
  for(const password of ['short','a'.repeat(65),' '.repeat(8),'あ'.repeat(8),null])assert.throws(()=>Identity.validatePassword(password));
  assert.equal(Identity.validatePassword('a b!1234'),'a b!1234');
});
test('内部識別子は予約済み.invalidドメインを使い、名前の正規化が安定',async()=>{
  assert.equal(await internalEmail('HANA_01'),await internalEmail('hana_01'));
  assert.notEqual(await internalEmail('hana_01'),await internalEmail('hana_02'));
  assert.match(await internalEmail('hana_01'),/^eq-[a-f0-9]{64}@users\.english-quest\.invalid$/);
});
test('新規登録はサーバー内で確認済み利用者を作成し、メールを送らずセッションを返す',async()=>{
  const {handler,calls}=setup();const result=await handler(request());
  assert.equal(result.status,200);
  const body=await result.json();assert.equal(body.user.user_metadata.username,'hana_01');
  assert.equal(body.user.email,undefined);assert.equal(body.access_token,'access');
  const admin=calls.find(c=>c.url.includes('/admin/users'));
  assert.equal(admin.body.email_confirm,true);assert.deepEqual(admin.body.user_metadata,{username:'hana_01'});
  assert.equal(admin.headers.apikey,secret);
  assert.ok(!JSON.stringify(body).includes(secret));
  assert.ok(!calls.some(c=>/signup|invite|recover/.test(c.url)));
  assert.equal(calls.at(-1).headers.apikey,pub);
});
test('ログインは利用者を作成せず、間違った資格情報を統一したエラーにする',async()=>{
  const good=setup();assert.equal((await good.handler(request({action:'signin',username:'hana_01',password:'password123'}))).status,200);
  assert.ok(!good.calls.some(c=>c.url.includes('/admin/users')));
  const bad=setup({denied:true});const result=await bad.handler(request({action:'signin',username:'hana_01',password:'wrong-password'}));
  assert.equal(result.status,401);assert.deepEqual(await result.json(),{code:'invalid_credentials'});
});
test('重複ユーザー名で既存利用者の情報・パスワードを更新しない',async()=>{
  const {handler,calls}=setup({duplicate:true});const result=await handler(request());
  assert.equal(result.status,409);assert.deepEqual(await result.json(),{code:'username_taken'});
  assert.ok(!calls.some(c=>c.url.includes('/token')));
  assert.ok(calls.every(c=>c.headers.apikey===secret));
});
test('無効なOrigin・APIキー・メソッド・巨大な本文を認証処理の前に拒否',async()=>{
  const {handler,calls}=setup();
  assert.equal((await handler(request(undefined,{origin:'https://evil.invalid'}))).status,403);
  assert.equal((await handler(request(undefined,{apikey:'wrong'}))).status,401);
  assert.equal((await handler(new Request('https://example.test/'))).status,405);
  assert.equal((await handler(request('x'.repeat(4097)))).status,413);
  assert.equal((await handler(request('{broken'))).status,400);
  assert.equal((await handler(request({action:'admin',username:'hana_01',password:'password123'}))).status,400);
  assert.equal(calls.length,0);
});
test('試行回数制限は鍵付きハッシュを使い、制限時・DB障害時は登録を止める',async()=>{
  const limited=setup({rate:true});assert.equal((await limited.handler(request())).status,429);
  assert.equal(limited.calls.length,1);
  const bucket=limited.calls[0].body;assert.match(bucket.p_bucket_key,/^[a-f0-9]{64}$/);assert.equal(bucket.p_attempt_limit,5);
  assert.ok(!bucket.p_bucket_key.includes('hana'));
  const down=setup({unavailable:true});assert.equal((await down.handler(request())).status,503);
  assert.equal(down.calls.length,1);
});
test('未ログインのCORS事前確認と、秘密キー未設定に対応',async()=>{
  const {handler}=setup();const result=await handler(new Request('https://example.test/',{method:'OPTIONS',headers:{origin}}));
  assert.equal(result.status,204);assert.equal(result.headers.get('access-control-allow-origin'),origin);
  assert.equal(result.headers.get('cache-control'),'no-store');
  const missing=createHandler({env:()=>undefined});assert.equal((await missing(request())).status,503);
});
