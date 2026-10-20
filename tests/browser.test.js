/* 実ブラウザのfile://起動を確認。外部依存なし。EDGE_PATHで実行ファイルを指定できます。 */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const {questions,units}=require('../scripts/questions.js');
const P=require('../scripts/progress.js');
const original=require('./step1-questions.json');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
class CDP {
  constructor(ws){
    this.ws=ws;this.id=0;this.pending=new Map();this.errors=[];
    ws.addEventListener('message',event=>{
      const message=JSON.parse(event.data);
      if(message.id){
        const pending=this.pending.get(message.id);
        if(pending){clearTimeout(pending.timer);this.pending.delete(message.id);message.error?pending.reject(new Error(JSON.stringify(message.error))):pending.resolve(message.result);}
      } else if(message.method==='Runtime.exceptionThrown') this.errors.push(message.params.exceptionDetails);
    });
  }
  send(method,params={}){
    return new Promise((resolve,reject)=>{
      const id=++this.id;
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('CDP timeout: '+method));},15000);
      this.pending.set(id,{resolve,reject,timer});
      this.ws.send(JSON.stringify({id,method,params}));
    });
  }
  async evaluate(expression){
    const result=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
    if(result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
}
test('Edge実画面: 全コース・単元・復習・再起動保存・移行・モバイル・キーボード',{timeout:120000},async t=>{
  const edge=process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  try{await fs.access(edge);}catch{t.skip('Edgeがありません。EDGE_PATHにChromium系ブラウザを指定してください。');return;}
  const tempRoot=await fs.realpath(os.tmpdir());
  const profile=await fs.mkdtemp(path.join(tempRoot,'english-quest-browser-'));
  const browserArgs=['--headless=new','--disable-gpu','--disable-extensions','--disable-background-networking','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'];
  let browser;
  let cdp;
  async function connect(){
    await fs.unlink(path.join(profile,'DevToolsActivePort')).catch(()=>{});
    browser=spawn(edge,browserArgs,{stdio:'ignore',windowsHide:true});
    let port;
    for(let i=0;i<150;i++){
      try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}
    }
    assert.ok(port,'Edgeのデバッグ接続が開始した');
    // 起動直後のEdgeタブが応答しない環境でも、専用の新規タブに接続する。
    const page=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
    const ws=new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
    cdp=new CDP(ws);
    await cdp.send('Page.enable');await cdp.send('Runtime.enable');
  }
  try{
    await connect();
    const url=process.env.QUEST_TEST_URL||pathToFileURL(path.resolve(__dirname,'../index.html')).href;
    const accountKey='english-quest-account-11111111-1111-4111-8111-111111111111';
    async function waitFor(expression){for(let i=0;i<150;i++){if(await cdp.evaluate(expression))return;await pause(50);}throw Error('Timed out: '+expression);}
    async function navigate(){await cdp.send('Page.navigate',{url});await waitFor(`document.readyState==='complete'&&!!document.querySelector('#account-form,[data-action="grade"]')`);}
    const click=async selector=>{
      // 詳細なデータ管理は、学習記録の下方から開く。
      if(selector==='[data-action="account"]'&&!await cdp.evaluate(`!!document.querySelector('[data-action="account"]')`))await click('nav [data-action="records"]');
      return cdp.evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(selector)});if(!b)throw Error('Missing '+${JSON.stringify(selector)});b.click()})()`);
    };
    const text=()=>cdp.evaluate('document.querySelector("main").innerText');
    const saved=()=>cdp.evaluate(`JSON.parse(localStorage.getItem('${accountKey}'))`);
    const artifacts=path.join(__dirname,'artifacts');await fs.mkdir(artifacts,{recursive:true});
    async function screenshot(name){const image=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await fs.writeFile(path.join(artifacts,name+'.png'),Buffer.from(image.data,'base64'));}
    async function viewport(width,height=1000){await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});}
    async function noOverflow(){assert.ok(await cdp.evaluate('document.documentElement.scrollWidth<=innerWidth'),'横はみ出しなし');}
    async function login(name='hana_01',intent='login'){
      await cdp.evaluate(`document.querySelector('#account-username').value=${JSON.stringify(name)};document.querySelector('#account-password').value='password123';document.querySelector('#account-form').requestSubmit(document.querySelector('button[value="${intent}"]'))`);
      await waitFor(`!!document.querySelector('[data-action="grade"]')`);
    }
    async function correctAnswer(correct=true){
      const prompt=await cdp.evaluate(`document.querySelector('h1').textContent`),q=questions.find(q=>q.prompt===prompt);assert.ok(q);
      const option=correct?q.answer:q.options.find(o=>o!==q.answer);await click(`[data-action="answer"][data-option="${q.options.indexOf(option)}"]`);
      assert.equal(await cdp.evaluate(`document.querySelectorAll('.option:disabled').length`),4);
      assert.ok((await text()).includes(q.explanation));
      assert.match(await cdp.evaluate(`document.querySelector('.answer-explanation').textContent`),/解説/);
      if(q.category==='vocabulary'){
        assert.equal(await cdp.evaluate(`document.querySelectorAll('.word-guide dt').length`),4);
        const actual=await cdp.evaluate(`Array.from(document.querySelectorAll('.word-guide dt>span')).map(el=>el.textContent)`);assert.deepEqual(actual,q.options);
        for(const word of q.options)assert.ok((await text()).includes(require('../scripts/vocabulary.js')[word].meaning));
      }else assert.equal(await cdp.evaluate(`document.querySelector('.word-guide')`),null);
      assert.equal(await cdp.evaluate('document.activeElement.id'),'feedback');return q;
    }
    async function finish(count){for(let i=0;i<count;i++){await correctAnswer();await click('[data-action="next"]');}assert.match(await text(),/パーフェクト|クエストクリア/);}
    async function sync(){await click('[data-action="account"]');await waitFor(`!document.querySelector('[data-action="sync"]').disabled`);await click('[data-action="sync"]');await waitFor(`!document.querySelector('[data-action="sync"]').disabled`);}
    await navigate();await cdp.evaluate('localStorage.clear()');await navigate();
    await t.test('接続設定がない場合もゲスト学習を許可せず、ログインボタンを無効化',async()=>{
      assert.match(await text(),/公開版からアクセス/);
      assert.equal(await cdp.evaluate(`document.querySelector('button[value="login"]').disabled`),true);
      assert.equal(await cdp.evaluate(`document.querySelector('nav').hidden`),true);
      await click('nav [data-action="home"]');assert.equal(await cdp.evaluate(`!!document.querySelector('[data-action="grade"]')`),false);
      assert.equal(await cdp.evaluate(`localStorage.getItem('english-quest-v2')`),null);
    });
    const mockSource=`(()=>{
      const settings={supabaseUrl:'https://testing.supabase.co',supabasePublishableKey:'sb_publishable_testing',signupEnabled:true};
      Object.defineProperty(window,'QuestConfig',{configurable:true,get:()=>settings,set:()=>{}});
      const ids={hana_01:'11111111-1111-4111-8111-111111111111',sora_02:'22222222-2222-4222-8222-222222222222'};
      const user=name=>({id:ids[name],user_metadata:{username:name}});
      const state=window.eqMock={offline:false,expired:false,rejectLogin:false,holdRestore:false,release:null,calls:[],remote:null,otherRemote:null};
      const native=window.fetch;
      window.fetch=async(url,init={})=>{
        if(!String(url).startsWith(settings.supabaseUrl))return native(url,init);
        state.calls.push({url:String(url),method:init.method,body:init.body});
        if(state.offline)throw Error('offline');
        const reply=(data,status=200)=>new Response(data===null?'':JSON.stringify(data),{status});
        const name=(init.headers?.Authorization||'').includes('sora_02')?'sora_02':'hana_01';
        if(String(url).includes('/username-auth')){
          const body=JSON.parse(init.body);if(state.rejectLogin)return reply({code:'invalid_credentials'},401);
          return reply({access_token:'test-'+body.username,refresh_token:'refresh-'+body.username,expires_in:3600,user:user(body.username)});
        }
        if(String(url).includes('/auth/v1/user')){if(state.holdRestore)await new Promise(resolve=>state.release=resolve);return reply(state.expired?{}:user(name),state.expired?401:200);}
        if(String(url).includes('/auth/v1/logout'))return reply(null);
        if(state.expired)return reply({},401);
        const key=name==='sora_02'?'otherRemote':'remote';
        if(init.method==='GET')return reply(state[key]?[state[key]]:[]);
        if(init.method==='POST'&&state[key])return reply({},409);
        if(init.method==='PATCH'&&new URL(url).searchParams.get('revision')!=='eq.'+state[key]?.revision)return reply([]);
        const body=JSON.parse(init.body);state[key]={progress:body.progress,revision:body.revision};return reply([state[key]]);
      };
    })();`;
    const injection=await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:mockSource});await navigate();
    await t.test('未ログイン時はナビ・演習・記録・バックアップを遮断し、以前の記録も表示しない',async()=>{
      await cdp.evaluate(`localStorage.setItem('english-quest-v2',JSON.stringify({...QuestProgress.empty(),xp:777}));localStorage.setItem('${accountKey}',JSON.stringify({...QuestProgress.empty(),xp:999}))`);await navigate();
      for(const action of ['home','records']){await click('nav [data-action="'+action+'"]');assert.ok(!/777|999/.test(await text()));}
      assert.equal(await cdp.evaluate(`!!document.querySelector('#backup-file,[data-action="start-all"],[data-action="answer"]')`),false);
      assert.equal(await cdp.evaluate(`document.querySelector('nav').hidden`),true);
      for(const width of [320,375,1280]){await viewport(width);await noOverflow();await screenshot('login-dark-'+width);}
      assert.equal(await cdp.evaluate(`getComputedStyle(document.documentElement).colorScheme`),'dark');
      await cdp.evaluate(`window.eqMock.rejectLogin=true;document.querySelector('#account-username').value='hana_01';document.querySelector('#account-password').value='password123';document.querySelector('#account-form').requestSubmit()`);
      await waitFor(`document.querySelector('#cloud-status').textContent.includes('パスワードを確認')`);
      assert.equal(await cdp.evaluate(`document.querySelector('nav').hidden`),true);
      await cdp.evaluate(`window.eqMock.rejectLogin=false;localStorage.removeItem('${accountKey}')`);
    });
    await t.test('ユーザー名で新規登録してホームへ進み、以前のゲスト記録を自動混入しない',async()=>{
      await login('HANA_01','signup');assert.match(await text(),/累計 0 XP/);
      assert.deepEqual(await cdp.evaluate(`JSON.parse(window.eqMock.calls.filter(c=>c.url.includes('/username-auth')).at(-1).body)`),{action:'signup',username:'hana_01',password:'password123'});
      assert.equal(await cdp.evaluate(`document.querySelector('nav').hidden`),false);
      assert.equal(await cdp.evaluate(`document.querySelector('nav [data-action="account"]')`),null);
      assert.ok(await cdp.evaluate(`document.querySelector('[data-action="sign-out"]').getBoundingClientRect().top>document.querySelector('.course-grid').getBoundingClientRect().bottom`));
      await viewport(1280);await screenshot('home-dark-desktop');await click('[data-action="records"]');
      assert.match(await text(),/0回回答.*—/s);await click('[data-action="home"]');
    });
    await t.test('中2は271語・文法100問を表示し、熟語も4択・全選択肢の解説で学べる',async()=>{
      await click('[data-action="home"]');await click('[data-grade="2"]');
      assert.match(await cdp.evaluate(`document.querySelector('.course-card.vocabulary').textContent`),/271問/);
      assert.match(await cdp.evaluate(`document.querySelector('.course-card.grammar').textContent`),/100問/);
      await click('[data-action="course"][data-category="vocabulary"]');assert.equal(await cdp.evaluate(`document.querySelectorAll('.unit-card').length`),7);
      await viewport(320);await noOverflow();await screenshot('momo-vocabulary-units-mobile');
      await cdp.evaluate(`window.originalCreateQuest=QuestProgress.createQuest;QuestProgress.createQuest=()=>window.originalCreateQuest([QuestData.questions.find(q=>q.answer==='introduce ... to ～')]);`);
      await click('[data-action="start-all"]');const q=await correctAnswer(false);assert.equal(q.answer,'introduce ... to ～');await noOverflow();await screenshot('momo-phrase-feedback-mobile');
      await click('[data-action="next"]');await click('[data-action="home"]');await click('[data-action="review"]');await click('[data-action="start-review"]');await correctAnswer();await click('[data-action="next"]');
      await cdp.evaluate(`QuestProgress.createQuest=window.originalCreateQuest;localStorage.removeItem('${accountKey}');localStorage.removeItem('${accountKey}:sync')`);
      await navigate();await waitFor(`!!document.querySelector('[data-action="grade"]')`);await viewport(1280);
      await click('[data-grade="2"]');await click('[data-action="course"][data-category="grammar"]');assert.equal(await cdp.evaluate(`document.querySelectorAll('.unit-card').length`),10);assert.match(await text(),/発展/);await screenshot('momo-grammar-units');
    });
    await t.test('3学年×2コース各10問・27単元・XP・正答率・完了記録を維持',async()=>{
      for(const grade of [1,2,3])for(const category of ['vocabulary','grammar']){
        await click('[data-action="home"]');await click('[data-grade="'+grade+'"]');await click('[data-action="course"][data-category="'+category+'"]');await click('[data-action="start-all"]');await finish(10);
        assert.ok((await text()).includes(category==='vocabulary'?'+140':'+190'));assert.match(await text(),/100%/);
      }
      assert.equal((await saved()).xp,990);assert.equal((await saved()).sessions,6);
      for(const unit of units){await click('[data-action="home"]');await click('[data-grade="'+unit.grade+'"]');await click('[data-action="course"][data-category="'+unit.category+'"]');await click('[data-unit="'+unit.id+'"]');await finish(10);}
      assert.equal((await saved()).sessions,6+units.length);
    });
    await t.test('暗い画面でも誤答・二重操作防止・復習解除・履歴を維持',async()=>{
      await click('[data-action="home"]');await click('[data-grade="1"]');await click('[data-action="course"][data-category="vocabulary"]');await click('[data-action="start-all"]');
      const q=await correctAnswer(false),before=await saved();assert.deepEqual(before.reviewIds,[q.id]);
      await click('[data-action="answer"][data-option="0"]');assert.deepEqual(await saved(),before);await screenshot('quiz-dark-wrong');
      await click('[data-action="home"]');await click('[data-action="review"]');await click('[data-action="start-review"]');await correctAnswer();await screenshot('quiz-dark-correct');await click('[data-action="next"]');
      assert.deepEqual((await saved()).reviewIds,[]);await screenshot('result-dark');
      await click('[data-action="records"]');assert.match(await text(),/問題ごとの回答履歴/);await screenshot('analysis-dark');
    });
    await t.test('3学年の英文法で正解・不正解・復習正解のいずれも解説を表示',async()=>{
      for(const grade of [1,2,3]){
        await click('[data-action="home"]');await click('[data-grade="'+grade+'"]');await click('[data-action="course"][data-category="grammar"]');await click('[data-action="start-all"]');
        const wrong=await correctAnswer(false);assert.ok((await saved()).reviewIds.includes(wrong.id));
        await click('[data-action="home"]');await click('[data-action="review"]');await click('[data-action="start-review"]');await correctAnswer();await click('[data-action="next"]');
        assert.ok(!(await saved()).reviewIds.includes(wrong.id));
      }
      await screenshot('grammar-explained-result');
    });
    await t.test('320px・375px・PCで全学習画面に横はみ出しがない',async()=>{
      for(const width of [320,375,1280]){
        await viewport(width);await click('[data-action="home"]');await noOverflow();if(width===375)await screenshot('home-dark-mobile');
        await click('[data-action="course"][data-category="grammar"]');await noOverflow();await click('[data-action="start-all"]');await noOverflow();await correctAnswer();await noOverflow();
        await click('[data-action="records"]');await noOverflow();await click('[data-action="account"]');await noOverflow();
      }
    });
    await t.test('学習を端末とクラウドに保存し、通信失敗の保持・再同期・競合の両選択を維持',async()=>{
      await sync();
      async function answerOnce(){await click('[data-action="home"]');await click('[data-action="course"][data-category="vocabulary"]');await click('[data-action="start-all"]');await correctAnswer();await click('[data-action="account"]');}
      const before=(await saved()).xp;
      await cdp.evaluate('window.eqMock.offline=true');await answerOnce();await waitFor(`document.querySelector('#cloud-status').textContent.includes('通信できません')`);
      assert.equal((await saved()).xp,before+10);
      await cdp.evaluate('window.eqMock.offline=false');await sync();assert.equal(await cdp.evaluate('window.eqMock.remote.progress.xp'),before+10);
      await cdp.evaluate('window.eqMock.remote.revision++;window.eqMock.remote.progress.xp=4000');await answerOnce();await waitFor(`!!document.querySelector('[data-action="use-cloud"]')`);await click('[data-action="use-cloud"]');await waitFor(`!document.querySelector('.sync-conflict')`);assert.equal((await saved()).xp,4000);
      await cdp.evaluate('window.eqMock.remote.revision++;window.eqMock.remote.progress.xp=5000');await answerOnce();await waitFor(`!!document.querySelector('[data-action="use-local"]')`);await click('[data-action="use-local"]');await waitFor(`!document.querySelector('.sync-conflict')`);assert.equal(await cdp.evaluate('window.eqMock.remote.progress.xp'),4010);
    });
    await t.test('ログアウト直後に学習画面を閉じ、別利用者の成績と分離する',async()=>{
      await click('[data-action="home"]');
      await click('[data-action="sign-out"]');await waitFor(`!!document.querySelector('#account-form')&&!document.querySelector('button[value="login"]').disabled`);
      assert.equal(await cdp.evaluate(`document.querySelector('nav').hidden`),true);assert.ok(!(await text()).includes('4010'));assert.equal((await saved()).xp,4010);
      await login('sora_02');assert.match(await text(),/累計 0 XP/);await click('[data-action="account"]');assert.match(await text(),/sora_02/);
      await click('[data-action="sign-out"]');await waitFor(`!document.querySelector('button[value="login"]').disabled`);await login();assert.match(await text(),/累計 4010 XP/);
      assert.equal(await cdp.evaluate(`JSON.parse(localStorage.getItem('english-quest-v2')).xp`),777);
    });
    await t.test('再読込中は認証確認まで記録を表示せず、確認後に同じ記録を復元する',async()=>{
      const hold=await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:'window.eqMock.holdRestore=true;'});
      await navigate();await waitFor(`typeof window.eqMock.release==='function'`);
      assert.equal(await cdp.evaluate(`document.querySelector('nav').hidden`),true);assert.ok(!(await text()).includes('4010'));
      await cdp.evaluate('window.eqMock.release()');await waitFor(`!!document.querySelector('[data-action="grade"]')`);assert.match(await text(),/累計 4010 XP/);
      await cdp.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:hold.identifier});
    });
    await t.test('認証切れでは学習を止め、再ログインして未同期記録を取り戻せる',async()=>{
      await click('[data-action="account"]');await cdp.evaluate('window.eqMock.expired=true');await click('[data-action="sync"]');await waitFor(`!!document.querySelector('#account-form')`);
      assert.match(await text(),/有効期限/);assert.equal(await cdp.evaluate(`document.querySelector('nav').hidden`),true);assert.equal((await saved()).xp,4010);
      await cdp.evaluate('window.eqMock.expired=false');await login();assert.match(await text(),/累計 4010 XP/);
    });
    await t.test('バックアップは確認後に取り込み、認証情報を含めず書き出す',async()=>{
      await click('[data-action="account"]');const filename=path.join(artifacts,'focus-import.json');await fs.writeFile(filename,JSON.stringify({...P.empty(),xp:70,answered:5,correct:5,sessions:1}));
      async function selectFile(name){const doc=await cdp.send('DOM.getDocument'),node=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#backup-file'});await cdp.send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:[name]});}
      await selectFile(filename);await waitFor(`!!document.querySelector('[data-action="confirm-import"]')`);assert.equal((await saved()).xp,4010);
      await click('[data-action="confirm-import"]');await waitFor(`!document.querySelector('[data-action="sync"]').disabled`);assert.equal((await saved()).xp,70);
      assert.equal(await cdp.evaluate(`JSON.parse(localStorage.getItem('${accountKey}-before-import')).xp`),4010);
      const invalid=path.join(artifacts,'focus-invalid.json');await fs.writeFile(invalid,'{broken');await selectFile(invalid);await waitFor(`document.querySelector('#cloud-status').textContent.includes('読み取れません')`);assert.equal((await saved()).xp,70);
      await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:artifacts});const before=new Set(await fs.readdir(artifacts));await click('[data-action="export"]');let exported;
      for(let i=0;i<100;i++){exported=(await fs.readdir(artifacts)).find(n=>/^english-quest-.*\.json$/.test(n)&&!before.has(n));if(exported)break;await pause(50);}assert.ok(exported);
      const data=JSON.parse(await fs.readFile(path.join(artifacts,exported),'utf8'));assert.equal(data.data.xp,70);assert.equal(data.access_token,undefined);
      await click('[data-action="copy-guest"]');await waitFor(`!!document.querySelector('.import-preview')`);assert.match(await text(),/777 XP/);await click('[data-action="cancel-import"]');assert.equal((await saved()).xp,70);
    });
    await t.test('キーボード操作と動きを減らす設定、暗い背景と文字コントラストを確認',async()=>{
      await click('[data-action="home"]');await click('[data-action="course"][data-category="grammar"]');await click('[data-action="start-all"]');await cdp.send('Page.bringToFront');await cdp.evaluate(`document.querySelector('.option').focus()`);
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13});await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});assert.equal(await cdp.evaluate('document.activeElement.id'),'feedback');
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});assert.equal(await cdp.evaluate('document.activeElement.dataset.action'),'next');
      const contrast=await cdp.evaluate(`(()=>{const lum=s=>{const a=s.match(/[\\d.]+/g).slice(0,3).map(v=>{v=Number(v)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2]};const el=document.querySelector('.question-card'),a=lum(getComputedStyle(el).color),b=lum(getComputedStyle(el).backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)})()`);assert.ok(contrast>=7,'問題文のコントラスト7以上');
      await click('[data-action="home"]');await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});assert.equal(await cdp.evaluate(`getComputedStyle(document.querySelector('.book')).animationName`),'none');
    });
    await t.test('ブラウザの完全終了後も同じアカウントの記録を保持する',async()=>{
      const before=await saved();await cdp.send('Browser.close');cdp.ws.close();for(let i=0;i<100&&browser.exitCode===null;i++)await pause(50);assert.notEqual(browser.exitCode,null);
      await connect();await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:mockSource});await navigate();await waitFor(`!!document.querySelector('[data-action="grade"]')`);assert.deepEqual(await saved(),before);
    });
    await t.test('通信不能では保存済みセッションでも初回画面を開放せず、再確認で復帰',async()=>{
      const offline=await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:'window.eqMock.offline=true;'});await navigate();await waitFor(`!!document.querySelector('[data-action="restore-session"]')`);
      assert.equal(await cdp.evaluate(`document.querySelector('nav').hidden`),true);await cdp.evaluate('window.eqMock.offline=false');await click('[data-action="restore-session"]');await waitFor(`!!document.querySelector('[data-action="grade"]')`);await cdp.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:offline.identifier});
    });
    await t.test('保存したセッションが無効なら記録を表示せず、再ログインを求める',async()=>{
      const before=await saved();
      const invalid=await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:'window.eqMock.expired=true;'});
      await navigate();await waitFor(`document.querySelector('#cloud-status').textContent.includes('有効期限')`);
      assert.equal(await cdp.evaluate(`document.querySelector('nav').hidden`),true);assert.deepEqual(await saved(),before);
      assert.equal(await cdp.evaluate(`JSON.parse(localStorage.getItem('english-quest-auth-testing.supabase.co'))`),null);
      await cdp.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:invalid.identifier});await cdp.evaluate('window.eqMock.expired=false');await login();
    });
    await t.test('端末への保存失敗を表示し、ログイン中の回答・同期画面は維持する',async()=>{
      await cdp.evaluate(`Storage.prototype.setItem=function(){throw new DOMException('Quota exceeded','QuotaExceededError')}`);
      await click('[data-action="course"][data-category="vocabulary"]');await click('[data-action="start-all"]');await correctAnswer();
      assert.match(await cdp.evaluate(`document.querySelector('#storage-notice').textContent`),/保存/);
      await click('[data-action="account"]');assert.match(await text(),/アカウントで学習中/);
    });
    assert.deepEqual(cdp.errors,[],'未処理のJavaScript例外なし');
  } finally {
    if(cdp){try{await cdp.send('Browser.close');}catch{}cdp.ws.close();}browser?.kill();
    const resolved=path.resolve(profile);assert.equal(path.dirname(resolved),tempRoot);assert.ok(path.basename(resolved).startsWith('english-quest-browser-'));
    try{await fs.rm(resolved,{recursive:true,force:true,maxRetries:2,retryDelay:100});}catch{}
  }
});
