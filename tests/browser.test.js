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
    const pages=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const ws=new WebSocket(pages.find(page=>page.type==='page').webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
    cdp=new CDP(ws);
    await cdp.send('Page.enable');await cdp.send('Runtime.enable');
  }
  try{
    await connect();
    const url=process.env.QUEST_TEST_URL||pathToFileURL(path.resolve(__dirname,'../index.html')).href;
    async function navigate(){
      await cdp.send('Page.navigate',{url});
      for(let i=0;i<100;i++){
        if(await cdp.evaluate(`document.readyState==='complete' && !!document.querySelector('[data-action="grade"]')`)) return;
        await pause(50);
      }
      throw Error('ホーム画面が表示されません');
    }
    const click=selector=>cdp.evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)});if(!button)throw Error('Button missing: '+${JSON.stringify(selector)});button.click();})()`);
    const text=()=>cdp.evaluate('document.querySelector("main").innerText');
    const saved=()=>cdp.evaluate(`JSON.parse(localStorage.getItem('english-quest-v2'))`);
    async function correctAnswer(correct=true){
      const prompt=await cdp.evaluate(`document.querySelector('h1').textContent`);
      const q=questions.find(q=>q.prompt===prompt);
      assert.ok(q,'問題データに対応した問題が表示された');
      const option=correct?q.answer:q.options.find(o=>o!==q.answer);
      await click(`[data-action="answer"][data-option="${q.options.indexOf(option)}"]`);
      assert.ok(await cdp.evaluate(`document.querySelectorAll('.option:disabled').length===4`),'回答後の4択は無効');
      assert.ok((await text()).includes(q.explanation),'日本語解説を表示');
      assert.equal(await cdp.evaluate('document.activeElement.id'),'feedback','判定にフォーカス');
      return q;
    }
    async function finish(count){for(let i=0;i<count;i++){await correctAnswer();await click('[data-action="next"]');}assert.match(await text(),/クエストクリア|パーフェクト/);}
    async function viewport(width,height=900){await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});}
    async function noOverflow(){assert.ok(await cdp.evaluate('document.documentElement.scrollWidth<=window.innerWidth'), '横スクロールがない');}
    const artifacts=path.join(__dirname,'artifacts');
    await fs.mkdir(artifacts,{recursive:true});
    async function screenshot(name){const result=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await fs.writeFile(path.join(artifacts,name+'.png'),Buffer.from(result.data,'base64'));}
    await navigate();
    await cdp.evaluate('localStorage.clear()');await navigate();
    await viewport(1280,1100);await noOverflow();await screenshot('home-desktop');
    async function waitFor(expression){
      for(let i=0;i<150;i++){if(await cdp.evaluate(expression))return;await pause(50);}
      throw Error('Timed out: '+expression);
    }
    async function selectFile(filename){
      const doc=await cdp.send('DOM.getDocument');
      const node=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#backup-file'});
      await cdp.send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:[filename]});
    }
    await t.test('バックアップは確認後に取り込み、元記録を退避。破損ファイルでは変更しない',async()=>{
      const fixture={...P.empty(),xp:70,answered:5,correct:5,sessions:1};
      const filename=path.join(artifacts,'import-test.json');
      await fs.writeFile(filename,JSON.stringify({application:'english-quest',formatVersion:1,data:fixture}));
      await click('[data-action="account"]');await viewport(320);await noOverflow();
      await selectFile(filename);await waitFor(`!!document.querySelector('[data-action="confirm-import"]')`);
      assert.equal(await saved(),null,'確認前には取り込まない');
      await click('[data-action="confirm-import"]');assert.equal((await saved()).xp,70);
      assert.equal(await cdp.evaluate(`JSON.parse(localStorage.getItem('english-quest-v2-before-import')).xp`),0);
      const invalid=path.join(artifacts,'invalid-test.json');await fs.writeFile(invalid,'{broken');
      await selectFile(invalid);await waitFor(`document.querySelector('#cloud-status').textContent.includes('読み取れません')`);
      assert.equal((await saved()).xp,70);
      await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:artifacts});
      const existingExports=new Set(await fs.readdir(artifacts));
      await click('[data-action="export"]');
      let exported;
      for(let i=0;i<100;i++){
        exported=(await fs.readdir(artifacts)).find(name=>/^english-quest-.*\.json$/.test(name)&&!existingExports.has(name));if(exported)break;await pause(50);
      }
      assert.ok(exported,'JSONバックアップを書き出した');
      const backup=JSON.parse(await fs.readFile(path.join(artifacts,exported),'utf8'));
      assert.equal(backup.data.xp,70);assert.equal(backup.application,'english-quest');assert.equal(backup.access_token,undefined);
      await cdp.evaluate('localStorage.clear()');await navigate();await viewport(1280,1100);
    });
    await t.test('初回の学習分析は未回答を0%扱いせず、未挑戦の案内を表示',async()=>{
      await click('[data-action="records"]');
      assert.match(await cdp.evaluate(`document.querySelector('.coverage-count').textContent`),/0\s*\/\s*100問/);
      assert.match(await cdp.evaluate(`document.querySelector('.weekly-total').textContent`),/0回回答.*—/);
      assert.equal(await cdp.evaluate(`document.querySelectorAll('.recommendation').length`),0);
      await noOverflow();await click('[data-action="home"]');
    });
    await t.test('3学年×2コースから各10問を回答、ボーナス・正答率・累計XPを確認',async()=>{
      for(const grade of [1,2,3]) for(const category of ['vocabulary','grammar']){
        await click('[data-action="home"]');
        await click(`[data-action="grade"][data-grade="${grade}"]`);
        await click(`[data-action="course"][data-category="${category}"]`);
        await click('[data-action="start-all"]');
        await finish(10);
        assert.match(await text(),/100%/);
        assert.ok((await text()).includes(category==='vocabulary'?'+140':'+190'));
      }
      const data=await saved();assert.equal(data.xp,990);assert.equal(data.answered,60);assert.equal(data.sessions,6);assert.equal(data.streakDays,1);
    });
    await t.test('15単元が個別に開始・完了できる',async()=>{
      for(const unit of units){
        await click('[data-action="home"]');await click(`[data-grade="${unit.grade}"]`);
        await click(`[data-action="course"][data-category="${unit.category}"]`);
        await click(`[data-action="start-unit"][data-unit="${unit.id}"]`);
        await finish(Math.min(10,questions.filter(q=>q.unitId===unit.id).length));
      }
    });
    await t.test('誤答と二重操作、再読込後の保存、復習正解で解除、空リスト',async()=>{
      await click('[data-action="home"]');await click('[data-grade="1"]');
      await click('[data-action="course"][data-category="vocabulary"]');await click('[data-action="start-all"]');
      const q=await correctAnswer(false);
      const before=await saved();assert.deepEqual(before.reviewIds,[q.id]);
      await click('[data-action="answer"][data-option="0"]');assert.deepEqual(await saved(),before);
      await navigate();assert.deepEqual(await saved(),before);
      await click('[data-action="review"]');await click('[data-action="start-review"]');
      await correctAnswer();await screenshot('quiz-feedback');await click('[data-action="next"]');
      assert.deepEqual((await saved()).reviewIds,[]);
      assert.match(await text(),/100%/);
      await screenshot('result');
      await click('[data-action="home"]');await click('[data-action="review"]');assert.match(await text(),/苦手はゼロ/);
      const after=await saved();await navigate();assert.deepEqual(await saved(),after);
      await click('[data-action="records"]');assert.match(await text(),/問題ごとの回答履歴/);
      await cdp.evaluate(`Array.from(document.querySelectorAll('.history-list summary')).find(s=>s.textContent.includes(${JSON.stringify(q.prompt)})).click()`);
      assert.ok((await text()).includes('不正解'));
    });
    await t.test('旧版移行は一度だけで、元データを保持。破損データを退避',async()=>{
      await cdp.evaluate(`localStorage.clear();localStorage.setItem('english-quest-v1',JSON.stringify({answered:20,correct:12,sessions:3,reviewIds:['old-unknown']}))`);
      await navigate();assert.equal((await saved()).answered,20);assert.equal((await saved()).sessions,3);
      assert.ok(await cdp.evaluate(`!!localStorage.getItem('english-quest-v1')`));
      await cdp.evaluate(`localStorage.setItem('english-quest-v1',JSON.stringify({answered:999}))`);await navigate();assert.equal((await saved()).answered,20);
      await cdp.evaluate(`localStorage.setItem('english-quest-v2','{broken')`);await navigate();
      assert.equal(await cdp.evaluate(`localStorage.getItem('english-quest-v2-recovery')`),'{broken');
      assert.match(await cdp.evaluate(`document.querySelector('#storage-notice').textContent`),/復旧用/);
      await cdp.evaluate('localStorage.clear()');await navigate();
    });
    await t.test('11問の復習は10問で終了し、残り1問も次の復習で解除できる',async()=>{
      const fixture=P.empty();
      for(const q of questions.filter(q=>q.grade===1).slice(0,11)){
        const quest=P.createQuest([q]);P.answer(fixture,quest,q.options.find(o=>o!==q.answer));
      }
      await cdp.evaluate(`localStorage.setItem('english-quest-v2',${JSON.stringify(JSON.stringify(fixture))})`);await navigate();
      await click('[data-action="review"]');await click('[data-action="start-review"]');await finish(10);
      assert.equal((await saved()).reviewIds.length,1);
      await click('[data-action="home"]');await click('[data-action="review"]');await click('[data-action="start-review"]');await finish(1);
      assert.equal((await saved()).reviewIds.length,0);
    });
    await t.test('STEP 1の保存記録で分析を集計、復習単元のボタンから再挑戦できる',async()=>{
      const fixture=P.empty();
      for(const [index,q] of original.slice(0,2).entries()){
        const quest=P.createQuest([q]);P.answer(fixture,quest,index?q.answer:q.options.find(o=>o!==q.answer));
      }
      await cdp.evaluate(`localStorage.setItem('english-quest-v2',${JSON.stringify(JSON.stringify(fixture))})`);await navigate();
      assert.deepEqual(await saved(),fixture);
      await click('[data-action="records"]');
      assert.match(await cdp.evaluate(`document.querySelector('.coverage-count').textContent`),/2\s*\/\s*100問/);
      assert.match(await cdp.evaluate(`document.querySelector('.weekly-total').textContent`),/2回回答.*50%/);
      assert.match(await cdp.evaluate(`document.querySelector('.recommendation').textContent`),/復習対象 1問/);
      assert.equal(await cdp.evaluate(`document.querySelectorAll('.activity-chart li').length`),7);
      await viewport(1280);await noOverflow();await screenshot('analysis-desktop');
      await viewport(320);await noOverflow();await screenshot('analysis-mobile');
      await click('.recommendation');
      const prompt=await cdp.evaluate(`document.querySelector('h1').textContent`);
      assert.equal(questions.find(q=>q.prompt===prompt).unitId,'g1-words');
    });
    await t.test('320px・375px・PCでホームと各画面に横はみ出しがない',async()=>{
      for(const width of [320,375,1280]){
        await viewport(width);
        await click('[data-action="home"]');await noOverflow();if(width===375)await screenshot('home-mobile');
        await click('[data-action="course"][data-category="grammar"]');await noOverflow();
        await click('[data-action="start-all"]');await noOverflow();
        await correctAnswer();await noOverflow();
        for(let i=1;i<10;i++){await click('[data-action="next"]');await correctAnswer();}
        await click('[data-action="next"]');await noOverflow();
        await click('[data-action="records"]');await noOverflow();
        await click('[data-action="home"]');await click('[data-action="review"]');await noOverflow();
      }
    });
    await t.test('キーボードのEnter回答・Tab移動と、動きを減らす設定',async()=>{
      await viewport(375);await click('[data-action="home"]');
      await click('[data-action="course"][data-category="grammar"]');await click('[data-action="start-all"]');
      await cdp.send('Page.bringToFront');
      await cdp.evaluate(`document.querySelector('.option').focus()`);
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13});
      await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
      assert.equal(await cdp.evaluate('document.activeElement.id'),'feedback');
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
      assert.equal(await cdp.evaluate('document.activeElement.dataset.action'),'next');
      await click('[data-action="home"]');
      await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      assert.equal(await cdp.evaluate(`getComputedStyle(document.querySelector('.book')).animationName`),'none');
    });
    assert.deepEqual(cdp.errors,[],'JavaScriptの未処理例外なし');
    await t.test('ブラウザを完全に終了して同じプロファイルで開き直しても学習記録を保持',async()=>{
      const before=await saved();
      await cdp.send('Browser.close');cdp.ws.close();
      for(let i=0;i<100&&browser.exitCode===null;i++)await pause(50);
      assert.notEqual(browser.exitCode,null,'ブラウザプロセスが終了');
      await connect();await navigate();
      assert.deepEqual(await saved(),before);
      assert.ok((await text()).includes(`累計 ${before.xp} XP`));
    });
    await t.test('保存容量不足でも回答を続けられ、保存失敗を画面に表示',async()=>{
      const injection=await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:`Storage.prototype.setItem=function(){throw new DOMException('Quota exceeded','QuotaExceededError');};`});
      await navigate();
      await click('[data-action="course"][data-category="vocabulary"]');await click('[data-action="start-all"]');
      await correctAnswer();
      assert.match(await cdp.evaluate(`document.querySelector('#storage-notice').textContent`),/保存できません/);
      assert.match(await text(),/次の問題へ/);
      await cdp.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});
    });
    await t.test('任意ログイン・アカウント分離・再接続同期・競合選択・ログアウトを画面で検証',async()=>{
      const mockSource=`(()=>{
        const settings={supabaseUrl:'https://testing.supabase.co',supabasePublishableKey:'sb_publishable_testing',signupEnabled:true};
        Object.defineProperty(window,'QuestConfig',{configurable:true,get:()=>settings,set:()=>{}});
        const user={id:'11111111-1111-4111-8111-111111111111',user_metadata:{username:'hana_01'}};
        window.eqMock={offline:false,remote:null,calls:[]};
        const nativeFetch=window.fetch;
        window.fetch=async(url,init={})=>{
          if(!String(url).startsWith(settings.supabaseUrl))return nativeFetch(url,init);
          const state=window.eqMock;state.calls.push({url:String(url),method:init.method,body:init.body});
          if(state.offline)throw Error('offline');
          const reply=(data,status=200)=>new Response(data===null?'':JSON.stringify(data),{status});
          if(String(url).includes('/auth/v1/token')||String(url).includes('/functions/v1/username-auth'))return reply({access_token:'test-access',refresh_token:'test-refresh',expires_in:3600,user});
          if(String(url).includes('/auth/v1/user'))return reply(user);
          if(String(url).includes('/auth/v1/logout'))return reply(null);
          if(init.method==='GET')return reply(state.remote?[state.remote]:[]);
          if(init.method==='POST'&&state.remote)return reply({},409);
          if(init.method==='PATCH'&&new URL(url).searchParams.get('revision')!=='eq.'+state.remote?.revision)return reply([]);
          const body=JSON.parse(init.body);state.remote={progress:body.progress,revision:body.revision};return reply([state.remote]);
        };
      })();`;
      const injection=await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:mockSource});
      await navigate();
      await cdp.evaluate(`localStorage.clear();localStorage.setItem('english-quest-v2',JSON.stringify({...QuestProgress.empty(),xp:70,answered:5,correct:5,sessions:1}))`);
      await navigate();await click('[data-action="account"]');
      assert.equal(await cdp.evaluate(`document.querySelector('input[type="email"]')`),null);
      await viewport(320);await noOverflow();await screenshot('username-login-mobile');
      await cdp.evaluate(`document.querySelector('#account-username').value='HANA_01';document.querySelector('#account-password').value='password123';document.querySelector('#account-form').requestSubmit(document.querySelector('button[value="signup"]'))`);
      await waitFor(`!!document.querySelector('[data-action="copy-guest"]')&&!document.querySelector('[data-action="sync"]').disabled`);
      assert.match(await text(),/累計 0 XP/,'ゲストの記録を自動混入しない');
      assert.match(await text(),/ログイン中：hana_01/);
      assert.deepEqual(await cdp.evaluate(`JSON.parse(window.eqMock.calls.find(call=>call.url.includes('/username-auth')).body)`),{action:'signup',username:'hana_01',password:'password123'});
      await click('[data-action="copy-guest"]');await click('[data-action="confirm-import"]');
      await waitFor(`window.eqMock.remote?.progress.xp===70`);
      const accountKey='english-quest-account-11111111-1111-4111-8111-111111111111';
      async function localXp(){return cdp.evaluate(`JSON.parse(localStorage.getItem('${accountKey}')).xp`);}
      async function answerOnce(){await click('[data-action="home"]');await click('[data-action="course"][data-category="vocabulary"]');await click('[data-action="start-all"]');await correctAnswer();await click('[data-action="account"]');}
      await answerOnce();await waitFor(`window.eqMock.remote.progress.xp===80`);
      assert.equal((await saved()).xp,70,'ゲストの記録は維持');assert.equal(await localXp(),80);
      await cdp.evaluate(`window.eqMock.offline=true`);await answerOnce();
      await waitFor(`document.querySelector('#cloud-status').textContent.includes('通信できません')`);
      assert.equal(await localXp(),90);assert.equal(await cdp.evaluate('window.eqMock.remote.progress.xp'),80);
      await cdp.evaluate(`window.eqMock.offline=false`);await click('[data-action="sync"]');await waitFor(`window.eqMock.remote.progress.xp===90`);
      await cdp.evaluate(`window.eqMock.remote.revision++;window.eqMock.remote.progress.xp=1000`);
      await answerOnce();await waitFor(`!!document.querySelector('[data-action="use-cloud"]')`);
      assert.equal(await localXp(),100);await click('[data-action="use-cloud"]');await waitFor(`!document.querySelector('.sync-conflict')`);
      assert.equal(await localXp(),1000);
      assert.equal(await cdp.evaluate(`JSON.parse(localStorage.getItem('${accountKey}-before-sync')).xp`),100);
      await cdp.evaluate(`window.eqMock.remote.revision++;window.eqMock.remote.progress.xp=2000`);
      await answerOnce();await waitFor(`!!document.querySelector('[data-action="use-local"]')`);
      await click('[data-action="use-local"]');await waitFor(`window.eqMock.remote.progress.xp===1010`);
      assert.equal(await cdp.evaluate(`JSON.parse(localStorage.getItem('${accountKey}-cloud-before-sync')).xp`),2000);
      await viewport(320);await noOverflow();await screenshot('account-mobile');
      await click('[data-action="sign-out"]');await waitFor(`!!document.querySelector('#account-form')`);
      assert.equal((await saved()).xp,70);assert.equal(await localXp(),1010);
      assert.match(await text(),/ゲストで学習中/);
      await cdp.evaluate(`document.querySelector('#account-username').value='hana_01';document.querySelector('#account-password').value='password123';document.querySelector('#account-form').requestSubmit(document.querySelector('button[value="login"]'))`);
      await waitFor(`!!document.querySelector('[data-action="sign-out"]')&&!document.querySelector('[data-action="sync"]').disabled`);
      assert.match(await text(),/累計 1010 XP/);
      assert.deepEqual(await cdp.evaluate(`JSON.parse(window.eqMock.calls.filter(call=>call.url.includes('/username-auth')).at(-1).body)`),{action:'signin',username:'hana_01',password:'password123'});
      await cdp.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});
    });
    assert.deepEqual(cdp.errors,[],'再起動後もJavaScriptの未処理例外なし');
  } finally {
    if(cdp){try{await cdp.send('Browser.close');}catch{}cdp.ws.close();}
    browser?.kill();
    // 作成した一時ディレクトリに限定して削除。ブラウザが解放しない場合は残す。
    const resolved=path.resolve(profile);
    assert.equal(path.dirname(resolved),tempRoot);
    assert.ok(path.basename(resolved).startsWith('english-quest-browser-'));
    try{await fs.rm(resolved,{recursive:true,force:true,maxRetries:2,retryDelay:100});}catch{}
  }
});
