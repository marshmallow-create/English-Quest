(function () {
  'use strict';
  const {questions, units} = window.QuestData;
  const P = window.QuestProgress;
  const C = window.QuestCloud;
  // localStorage のプロパティアクセス自体が禁止されている環境にも対応。
  let storage;
  try { storage = window.localStorage; } catch { storage = {getItem(){throw new Error('Storage unavailable');},setItem(){throw new Error('Storage unavailable');}}; }
  const loaded = P.load(storage,questions);
  let progress = loaded.progress;
  let activeStorage = storage;
  let cloud = null;
  let cloudMessage = 'ログイン・同期は公開版の接続設定後に利用できます。バックアップは今すぐ利用できます。';
  try { cloud = C.createClient(window.QuestConfig || {},{storage});if(cloud)cloudMessage='ログインすると、この端末とクラウドの学習記録を同期できます。'; } catch(error) { cloudMessage=error.message; }
  let currentUser = null;
  let revision;
  let dirty = false;
  let busy = false;
  let conflict = null;
  let generation = 0;
  let syncTimer;
  let pendingImport = null;
  const main = document.getElementById('main');
  let grade = 1;
  let category = 'vocabulary';
  let screen = 'home';
  let quest = null;
  let questTitle = '';
  let retryQuestions = [];
  const esc = value => String(value).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const percent = (correct,total) => total ? `${Math.round(correct/total*100)}%` : '—';
  const categoryName = c => c === 'vocabulary' ? '英単語' : '英文法';
  const statsFor = list => list.reduce((s,q) => {const stat = progress.questionStats[q.id]; s.attempts += stat?.attempts || 0; s.correct += stat?.correct || 0; return s;},{attempts:0,correct:0});
  function notice(message) {
    const element = document.getElementById('storage-notice');
    element.textContent = message;
    element.hidden = !message;
  }
  notice(loaded.notice);
  function persist() {
    if (!P.save(activeStorage,progress)) notice('学習記録を保存できませんでした。保存容量やブラウザ設定をご確認ください。今回の記録は画面を閉じると失われる可能性があります。');
    if(currentUser) { dirty=true;saveMeta();clearTimeout(syncTimer);syncTimer=setTimeout(pushCloud,500); }
  }
  function saveMeta() {
    if(!currentUser)return;
    try{storage.setItem(C.userKey(currentUser.id)+':sync',JSON.stringify({revision,dirty}));}catch{notice('このブラウザへの保存が制限されています。画面を閉じる前にバックアップを書き出してください。');}
  }
  function accountChanged() {if(screen==='account')accountScreen(false);}
  function storeAccount(data,version) {
    progress=P.normalize(data,questions);revision=version;dirty=false;conflict=null;
    if(!P.save(activeStorage,progress))notice('クラウドの記録は読み込めましたが、ブラウザへの保存に失敗しました。');
    saveMeta();
  }
  function switchUser(user) {
    generation++;clearTimeout(syncTimer);busy=false;conflict=null;pendingImport=null;quest=null;
    currentUser=user;
    activeStorage=user?C.scopedStorage(storage,user.id):storage;
    const next=P.load(activeStorage,questions);
    progress=next.progress;
    revision=undefined;dirty=false;
    if(user){
      try{const meta=JSON.parse(storage.getItem(C.userKey(user.id)+':sync'));if(meta){revision=meta.revision;dirty=Boolean(meta.dirty);}}catch{dirty=true;}
      // メタ情報を保存できなかった記録を、未保存の変更として保護する。
      if(revision===undefined && (progress.answered||progress.xp||progress.sessions))dirty=true;
    }
    if(next.notice)notice(next.notice);
  }
  async function refreshCloud() {
    if(!cloud||!currentUser||busy)return;
    const ticket=generation;busy=true;cloudMessage='クラウドの記録を確認しています…';accountChanged();
    try{
      const remote=await cloud.read();
      if(ticket!==generation)return;
      const remoteProgress=remote?C.parseBackup(JSON.stringify(remote.progress),P,questions):null;
      if(remote && C.same(progress,remoteProgress)){revision=remote.revision;dirty=false;conflict=null;saveMeta();cloudMessage='同期済みです。';}
      else if(remote && !dirty && screen!=='quiz') {storeAccount(remoteProgress,remote.revision);cloudMessage='クラウドの記録を読み込みました。';}
      else if(remote && (revision!==remote.revision || screen==='quiz')) {conflict={progress:remoteProgress,revision:remote.revision};cloudMessage='端末とクラウドに異なる記録があります。使う記録を選んでください。';}
      else if(!remote){revision=null;saveMeta();cloudMessage=dirty?'端末の記録をクラウドに保存します。':'クラウドの記録はまだありません。学習すると同期されます。';}
      else cloudMessage='端末に未同期の記録があります。';
    }catch(error){if(ticket===generation)cloudMessage=error.message;}
    finally{if(ticket===generation){busy=false;accountChanged();}}
    if(ticket===generation&&dirty&&!conflict&&revision!==undefined)await pushCloud();
  }
  async function pushCloud() {
    if(!cloud||!currentUser||busy||conflict||!dirty||revision===undefined)return;
    const ticket=generation;
    const snapshot=structuredClone(progress);
    busy=true;let succeeded=false;cloudMessage='記録を同期しています…';accountChanged();
    try{
      const result=await cloud.write(snapshot,revision);
      if(ticket!==generation)return;
      revision=result.revision;dirty=!C.same(progress,snapshot);saveMeta();succeeded=true;
      cloudMessage=dirty?'新しい回答を同期しています…':'同期済みです。';
    }catch(error){
      if(ticket!==generation)return;
      cloudMessage=error.message;
      if(error.status===409){
        try{const remote=await cloud.read();if(ticket===generation&&remote)conflict={progress:C.parseBackup(JSON.stringify(remote.progress),P,questions),revision:remote.revision};}catch{ /* 端末の未同期記録は保持 */ }
      }
    }finally{if(ticket===generation){busy=false;accountChanged();}}
    if(ticket===generation&&succeeded&&dirty&&!conflict){clearTimeout(syncTimer);syncTimer=setTimeout(pushCloud,500);}
  }
  async function login(username,password,signup) {
    if(!cloud||busy)return;
    if(signup&&!window.QuestConfig?.signupEnabled){cloudMessage='新規登録は一時停止中です。ゲスト学習・バックアップをご利用ください。';accountChanged();return;}
    busy=true;cloudMessage='ログイン情報を確認しています…';accountChanged();
    try{
      const user=signup?await cloud.signUp(username,password):await cloud.signIn(username,password);
      if(user){switchUser(user);cloudMessage='ログインしました。ゲストの記録は別に残しています。';await refreshCloud();}
      else cloudMessage='登録・ログインを完了できませんでした。再試行してください。';
    }catch(error){cloudMessage=error.message;}
    finally{busy=false;accountChanged();}
  }
  async function logout() {
    if(!cloud||busy)return;
    busy=true;generation++;clearTimeout(syncTimer);accountChanged();
    const error=await cloud.signOut();switchUser(null);
    cloudMessage=error?'この端末からログアウトしました。通信できなかったため、サーバー側のセッション終了は確認できませんでした。':'ログアウトしました。ゲストの記録に戻りました。';
    accountChanged();
  }
  function display(html, focus = true) {
    main.innerHTML = html;
    document.querySelectorAll('nav button').forEach(b => {
      if (b.dataset.action === screen) b.setAttribute('aria-current','page');
      else b.removeAttribute('aria-current');
    });
    if (focus) {
      const heading = main.querySelector('h1');
      heading?.setAttribute('tabindex','-1');
      heading?.focus();
      window.scrollTo(0,0);
    }
  }
  function back(action = 'home', text = 'ホームへ') { return `<button class="text-button back" data-action="${action}">← ${text}</button>`; }
  function gradePicker() {
    return `<div class="grade-picker" role="group" aria-label="学年を選択">${[1,2,3].map(g=>`<button data-action="grade" data-grade="${g}" aria-pressed="${g===grade}">中学${g}年<span>中${g}</span></button>`).join('')}</div>`;
  }
  function home(focus = true) {
    screen = 'home';
    const level = Math.floor(progress.xp/100)+1;
    const review = questions.filter(q => q.grade === grade && progress.reviewIds.includes(q.id));
    const today = progress.studyDates.includes(P.dayKey());
    display(`<section class="hero">
      <div class="hero-copy"><p class="eyebrow">YOUR DAILY ADVENTURE</p><h1>今日の一歩を、<br><span>未来のチカラに。</span></h1><p>英語の世界を冒険しよう。<br>1回最大10問、きみだけのクエストが待っている！</p><span class="hero-badge">✦ まちがいも、成長のヒント。</span></div>
      <div class="hero-art" aria-hidden="true"><span class="art-star star-one">✧</span><span class="art-star star-two">✦</span><span class="art-label">LET’S EXPLORE!</span><div class="book-orbit"><div class="book">📖</div></div><span class="art-chip chip-a">Aa</span><span class="art-chip chip-b">+ XP</span><span class="art-path">● ┄┄┄ ● ┄┄┄ ★</span></div>
    </section>
    <section class="player-panel" aria-label="冒険のステータス">
      <div class="level-badge"><span>LEVEL</span><strong>${level}</strong></div>
      <div class="xp-block"><div class="xp-label"><strong>冒険者レベル ${level}</strong><span>累計 ${progress.xp} XP</span></div><progress value="${progress.xp%100}" max="100" aria-label="次のレベルへの進捗"></progress><small>次のレベルまであと ${100-progress.xp%100} XP</small></div>
      <div class="streak"><span aria-hidden="true">🔥</span><div><strong>${P.streak(progress)}<small> 日</small></strong><span>連続学習</span></div></div>
    </section>
    <section class="quest-section"><div class="section-heading"><div><p class="eyebrow">CHOOSE YOUR QUEST</p><h2>さあ、何に挑戦する？</h2></div><span class="step-label">まずは学年を選ぼう</span></div>
      ${gradePicker()}
      <div class="course-grid">
        <button class="course-card vocabulary" data-action="course" data-category="vocabulary"><span class="course-top"><span class="course-icon" aria-hidden="true">Aa</span><span class="pill">正解 +10 XP</span></span><span class="course-name">英単語クエスト</span><span class="course-description">ことばを集めて、世界を広げよう。</span><span class="course-bottom">中${grade} · ${questions.filter(q=>q.grade===grade&&q.category==='vocabulary').length}問 / 1回最大10問 <span aria-hidden="true">↗</span></span></button>
        <button class="course-card grammar" data-action="course" data-category="grammar"><span class="course-top"><span class="course-icon" aria-hidden="true">✎</span><span class="pill">正解 +15 XP</span></span><span class="course-name">英文法クエスト</span><span class="course-description">文のしくみを知って、伝える力に。</span><span class="course-bottom">中${grade} · ${questions.filter(q=>q.grade===grade&&q.category==='grammar').length}問 / 1回最大10問 <span aria-hidden="true">↗</span></span></button>
        <button class="course-card review" data-action="review"><span class="course-top"><span class="course-icon" aria-hidden="true">↺</span><span class="pill">${review.length}問が待機中</span></span><span class="course-name">復習クエスト</span><span class="course-description">もう一度の挑戦で、苦手を自信に。</span><span class="course-bottom">中${grade} · ${review.length ? 'まちがえた問題に再挑戦' : 'まちがえた問題を自動で登録'} <span aria-hidden="true">↗</span></span></button>
      </div>
    </section>
    <section class="daily-panel"><div class="daily-icon" aria-hidden="true">${today?'🏅':'⚑'}</div><div><h2>${today?'今日のクエスト達成！':'今日のミッション'}</h2><p>${today?'この調子！ もう一度の挑戦も、明日の一歩も大歓迎。':'クエストを1回クリアしよう。最後の問題まで回答すると達成！'}</p></div><span class="daily-status">${today?'達成済み ✓':'未クリア'}</span></section>
    <div class="home-summary"><span>これまでに <strong>${progress.answered}問</strong> に挑戦</span><span>累計正答率 <strong>${percent(progress.correct,progress.answered)}</strong></span><button class="text-button" data-action="records">学習記録を見る →</button></div>`,focus);
  }
  function unitScreen() {
    screen = 'units';
    const list = questions.filter(q => q.grade === grade && q.category === category);
    const matching = units.filter(u => u.grade === grade && u.category === category);
    display(`${back()}<div class="page-heading"><p class="eyebrow">BUILD YOUR SKILLS</p><h1>中${grade} · ${categoryName(category)}クエスト</h1><p>気になる単元から始めよう。少ない問題でも、確かな一歩。</p></div>
      <button class="wide-start" data-action="start-all"><span><strong>全単元にチャレンジ</strong><small>全${list.length}問からランダムに最大10問</small></span><span>スタート →</span></button>
      <h2 class="small-heading">単元を選ぶ</h2><div class="unit-grid">${matching.map((u,i)=>{
        const subset = list.filter(q=>q.unitId===u.id);
        const stat = statsFor(subset);
        const attempted = subset.filter(q=>progress.questionStats[q.id]?.attempts).length;
        return `<button class="unit-card" data-action="start-unit" data-unit="${u.id}"><span class="unit-number">${String(i+1).padStart(2,'0')}</span><strong>${esc(u.name)}</strong><span>${esc(u.description)}</span><span>${subset.length}問収録 · 挑戦済み ${attempted}問 · 1回最大10問</span><span class="unit-meta">回答 ${stat.attempts}回 <span>正答率 ${percent(stat.correct,stat.attempts)} →</span></span></button>`;
      }).join('')}</div><p class="hint">5問連続正解で +20 XP！ 正答率はこれまでの回答履歴から計算します。</p>`);
  }
  function reviewScreen() {
    screen = 'review';
    const list = questions.filter(q=>q.grade===grade && progress.reviewIds.includes(q.id));
    display(`${back()}<div class="page-heading"><p class="eyebrow">TURN MISTAKES INTO STRENGTHS</p><h1>中${grade} · 復習クエスト</h1><p>正解できた問題は、自動で復習リストから卒業！</p></div>${list.length ? `<button class="wide-start" data-action="start-review"><span><strong>${list.length}問の苦手に再挑戦</strong><small>1回最大10問 · XPは元のコースと同じ</small></span><span>スタート →</span></button><div class="review-list">${list.map(q=>`<div class="review-item"><span class="tag">${categoryName(q.category)}</span><strong>${esc(q.prompt)}</strong><small>これまで ${progress.questionStats[q.id]?.attempts || 0}回回答</small></div>`).join('')}</div>` : `<div class="empty-state"><span aria-hidden="true">✧</span><h2>今のところ、苦手はゼロ！</h2><p>まちがえた問題がここに集まります。<br>英単語や英文法のクエストに挑戦してみよう。</p><button class="primary" data-action="home">クエストを選ぶ →</button></div>`}`);
  }
  function start(list,title) {
    if (!list.length) { reviewScreen(); return; }
    quest = P.createQuest(list);
    questTitle = title;
    retryQuestions = [...list];
    screen = 'quiz';
    quiz();
  }
  function quiz() {
    const question = quest.questions[quest.index];
    const result = quest.answers[quest.index];
    const unit = units.find(u=>u.id===question.unitId);
    display(`<div class="quiz-top"><button class="text-button" data-action="exit">← ホームへ戻る</button><span>回答済みのXP・履歴は保存されます</span></div>
      <section class="quiz-wrap"><div class="quiz-heading"><span class="tag">${esc(questTitle)}</span><span class="session-xp">✦ ${quest.xp} XP</span></div>
      <div class="question-progress"><span>QUESTION <strong>${quest.index+1}</strong> / ${quest.questions.length}</span><span>${quest.combo}問連続正解</span></div><progress value="${quest.answers.length}" max="${quest.questions.length}" aria-label="回答済みの問題数"></progress>
      <div class="question-card"><p class="eyebrow">${categoryName(question.category)} · ${esc(unit.name)}</p><h1>${esc(question.prompt)}</h1><p class="question-help">正しい答えをひとつ選ぼう。</p>
      <div class="options" role="group" aria-label="4つの選択肢">${question.options.map((option,i)=>{
        const correct = result && option === question.answer;
        const wrong = result && option === result.selected && !result.correct;
        return `<button class="option ${correct?'is-correct':''} ${wrong?'is-wrong':''}" data-action="answer" data-option="${i}" ${result?'disabled':''}><span class="option-letter" aria-hidden="true">${'ABCD'[i]}</span><span lang="en">${esc(option)}</span>${correct?'<strong>✓ 正解</strong>':wrong?'<strong>✕ 選んだ答え</strong>':''}</button>`;
      }).join('')}</div>
      ${result ? `<div id="feedback" class="feedback ${result.correct?'positive':'negative'}" tabindex="-1" role="status"><h2>${result.correct?'✓ 正解！':'✕ おしい！ 次につなげよう'}</h2><p>正解：<strong lang="en">${esc(question.answer)}</strong></p><p>${esc(question.explanation)}</p><div class="reward">${result.correct?`+${result.xp} XP`:'この問題を復習リストに登録しました'}${result.bonus?' · 5問連続正解ボーナス +20 XP を含む':''}${result.levelUp?' · 🎉 レベルアップ！':''}</div></div><button class="primary next" data-action="next">${quest.completed?'結果を見る ✦':'次の問題へ →'}</button>` : ''}
      </div></section>`,!result);
    if (result) document.getElementById('feedback').focus();
  }
  function results() {
    screen = 'results';
    const correct = quest.answers.filter(a=>a.correct).length;
    const mistakes = quest.answers.filter(a=>!a.correct).map(a=>questions.find(q=>q.id===a.id));
    const perfect = correct === quest.questions.length;
    display(`<section class="result-wrap"><p class="eyebrow">QUEST COMPLETE</p><div class="trophy" aria-hidden="true">${perfect?'🏆':'🌟'}</div><h1>${perfect?'パーフェクト！':'クエストクリア！'}</h1><p>${esc(questTitle)} · ${quest.questions.length}問完了<br>${perfect?'すばらしい！ この調子で冒険を続けよう。':'一歩前進！ 挑戦した分だけ、力になっているよ。'}</p><div class="result-stats"><div><span>正解数</span><strong>${correct}<small> / ${quest.questions.length}</small></strong></div><div><span>正答率</span><strong>${percent(correct,quest.questions.length)}</strong></div><div><span>獲得XP</span><strong>+${quest.xp}</strong></div></div><p class="result-detail">連続正解ボーナス ${quest.bonusCount}回 · +${quest.bonusCount*20} XP（獲得XPに含む）<br>現在レベル ${Math.floor(progress.xp/100)+1} · 累計 ${progress.xp} XP</p>
      ${mistakes.length?`<div class="mistake-list"><h2>次はきっと、できる。</h2><p>今回まちがえた${mistakes.length}問を復習リストに登録しました。</p>${mistakes.map(q=>`<details><summary>${esc(q.prompt)}</summary><p>正解：<strong>${esc(q.answer)}</strong></p><p>${esc(q.explanation)}</p></details>`).join('')}</div>`:'<p class="perfect-message">✦ 全問正解、おめでとう！</p>'}
      <div class="result-actions">${mistakes.length?'<button class="primary" data-action="retry-mistakes">まちがえた問題を復習 →</button>':''}<button class="${mistakes.length?'secondary':'primary'}" data-action="retry">もう一度挑戦</button><button class="text-button" data-action="home">ホームへ戻る</button></div></section>`);
  }
  function accountScreen(focus=true) {
    screen='account';
    const disabled=busy?'disabled':'';
    display(`${back()}<div class="page-heading"><p class="eyebrow">SAVE YOUR ADVENTURE</p><h1>保存・同期</h1><p>登録なしでも学習できます。大切な記録を、自分の方法で保存しよう。</p></div>
      <section class="account-panel"><h2>${currentUser?'アカウントで学習中':'ゲストで学習中'}</h2><p>${currentUser?`ログイン中：${esc(currentUser.username||'学習者')}<br>アカウントの記録とゲストの記録は別に保存します。`:'今の記録はこのブラウザに保存されています。'}</p><div class="backup-summary"><span>累計 <strong>${progress.xp} XP</strong></span><span><strong>${progress.answered}回</strong>回答</span><span>復習 <strong>${progress.reviewIds.length}問</strong></span></div>
      <h3>バックアップ</h3><p>ファイルを書き出して、別の端末や公開版の「取り込み」から続けられます。ログイン情報は含みません。</p><button class="secondary" data-action="export">記録を書き出す</button><label class="file-label" for="backup-file">バックアップを取り込む（JSON・4MBまで）</label><input id="backup-file" type="file" accept=".json,application/json" ${disabled}>
      ${pendingImport?`<div class="import-preview"><h3>取り込む記録の確認</h3><p>${pendingImport.xp} XP · ${pendingImport.answered}回回答 · 復習${pendingImport.reviewIds.length}問<br>現在表示中の記録を置き換えます。現在の記録はブラウザの復旧用キーにも退避します。</p><button class="primary" data-action="confirm-import" ${disabled}>この記録で置き換える</button> <button class="text-button" data-action="cancel-import">キャンセル</button></div>`:''}</section>
      <section class="account-panel"><h2>任意ログイン・クラウド同期</h2><p id="cloud-status" role="status">${esc(cloudMessage)}</p>
      ${cloud?currentUser?`<p>回答は端末に保存してから同期します。通信が戻ったら「同期する」で再試行できます。</p><div class="account-actions"><button class="primary" data-action="sync" ${disabled}>同期する</button><button class="secondary" data-action="sign-out" ${disabled}>ログアウト</button></div><button class="text-button" data-action="copy-guest" ${disabled}>ゲスト記録をこのアカウントに取り込む →</button>
      ${conflict?`<div class="sync-conflict"><h3>どちらの記録を使いますか？</h3><p>自動で足し合わせず、両方の記録を残したまま選べます。選択前に必要な記録を書き出してください。</p><div class="backup-summary"><span>この端末：${progress.xp} XP / ${progress.answered}回回答</span><span>クラウド：${conflict.progress.xp} XP / ${conflict.progress.answered}回回答</span></div><button class="secondary" data-action="use-cloud" ${disabled}>クラウドの記録をこの端末で使う</button><button class="secondary" data-action="use-local" ${disabled}>この端末の記録でクラウドを置き換える</button></div>`:''}`:`<p>ユーザー名とパスワードで登録・ログインできます。メールアドレスやメール確認は不要です。同じアカウントなら、別のスマホでも成績や進捗を引き継げます。</p><form id="account-form"><label for="account-username">ユーザー名</label><input id="account-username" type="text" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" minlength="3" maxlength="24" pattern="[A-Za-z0-9_]{3,24}" aria-describedby="username-help" required ${disabled}><small id="username-help">半角英字・数字・_、3〜24文字（例：hana_01）。大文字と小文字は区別しません。</small><label for="account-password">パスワード（半角英数字・記号8〜64文字）</label><input id="account-password" type="password" name="password" minlength="8" maxlength="64" autocomplete="current-password" required ${disabled}><div class="account-actions"><button class="primary" type="submit" name="intent" value="login" ${disabled}>ログイン</button><button class="secondary" type="submit" name="intent" value="signup" ${disabled}>新規登録</button></div></form>`:''}
      ${cloud&&!currentUser&&!window.QuestConfig?.signupEnabled?'<p class="notice">新規登録は一時停止中です。ゲスト学習と既存アカウントのログインは利用できます。</p>':''}
      <p class="hint">共有端末では、学習後にログアウトしてください。ゲストの記録とバックアップは、ブラウザデータやファイルを削除すると失われます。ログイン後も、ファイルの保管先にご注意ください。</p></section>`,focus);
    const signupButton=main.querySelector('button[value="signup"]');
    if(signupButton&&!window.QuestConfig?.signupEnabled)signupButton.disabled=true;
  }
  function exportProgress() {
    const content=JSON.stringify({application:'english-quest',formatVersion:1,exportedAt:new Date().toISOString(),data:progress},null,2);
    const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`english-quest-${P.dayKey()}-${Date.now()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function confirmImport() {
    if(!pendingImport||busy)return;
    // 退避に失敗したら置き換えを中止。元の記録を保護する。
    try{activeStorage.setItem(P.KEY+'-before-import',JSON.stringify(progress));}
    catch{cloudMessage='現在の記録を退避できませんでした。取り込みを中止しました。先に書き出しや保存容量をご確認ください。';accountChanged();return;}
    const previous=progress;
    progress=pendingImport;
    if(!P.save(activeStorage,progress)){progress=previous;cloudMessage='取り込みを保存できませんでした。現在の記録は変更していません。';accountChanged();return;}
    pendingImport=null;quest=null;cloudMessage='記録を取り込みました。';
    if(currentUser){dirty=true;saveMeta();clearTimeout(syncTimer);refreshCloud();}
    accountChanged();
  }
  async function resolveConflict(useLocal) {
    if(!conflict||busy||!currentUser)return;
    try{
      activeStorage.setItem(P.KEY+'-before-sync',JSON.stringify(progress));
      if(useLocal){
        // 最後に確認したクラウドの版だけを更新。直後に他端末で変更された場合も上書きしない。
        const remoteVersion=conflict.revision;
        try{activeStorage.setItem(P.KEY+'-cloud-before-sync',JSON.stringify(conflict.progress));}catch{throw new Error('クラウド記録を退避できませんでした。先に保存容量をご確認ください。');}
        revision=remoteVersion;conflict=null;dirty=true;saveMeta();await pushCloud();
      }else{
        const ticket=generation;busy=true;accountChanged();
        try{const remote=await cloud.read();if(ticket!==generation)return;if(!remote)throw new Error('クラウド記録が見つかりませんでした。');storeAccount(C.parseBackup(JSON.stringify(remote.progress),P,questions),remote.revision);cloudMessage='クラウドの記録をこの端末に復元しました。';}
        finally{if(ticket===generation)busy=false;}
      }
    }catch(error){cloudMessage=error.message;}
    accountChanged();
  }
  document.addEventListener('submit',event=>{
    if(event.target.id!=='account-form')return;
    event.preventDefault();
    const fields=new FormData(event.target);
    login(String(fields.get('username')),String(fields.get('password')),event.submitter?.value==='signup');
  });
  document.addEventListener('change',async event=>{
    if(event.target.id!=='backup-file')return;
    const file=event.target.files?.[0];if(!file)return;
    const ticket=generation;
    try{
      if(file.size>4*1024*1024)throw new Error('4MB以下のファイルを選んでください。');
      const text=await file.text();if(ticket!==generation)return;
      pendingImport=C.parseBackup(text,P,questions);cloudMessage='取り込む記録を確認してください。まだ現在の記録は変更していません。';
    }catch(error){pendingImport=null;cloudMessage=error.message;}
    accountChanged();
  });
  function analysisPanel() {
    const analysis = window.QuestAnalysis.summarize(progress,questions,units);
    const coverage = analysis.grades.find(g=>g.grade===grade);
    const suggestions = analysis.recommendations.filter(u=>u.grade===grade).slice(0,3);
    const max = Math.max(1,...analysis.days.map(day=>day.answered));
    return `<section class="analysis-panel" aria-labelledby="analysis-heading"><div class="section-heading"><div><p class="eyebrow">YOUR NEXT STEP</p><h2 id="analysis-heading">学びの振り返り</h2></div><span class="tag">中${grade}の学習ヒント</span></div>
      <div class="analysis-grid"><section class="coverage-card"><h3>中${grade}の挑戦状況</h3><p class="coverage-count"><strong>${coverage.attempted}</strong> / ${coverage.total}問</p><progress value="${coverage.attempted}" max="${coverage.total}" aria-label="中${grade}の挑戦済み問題数"></progress><p>一度でも正解：${coverage.correctOnce}問<br>まだ挑戦していない問題：${coverage.total-coverage.attempted}問</p><small>同じ問題の繰り返し回答は、問題数を増やしません。</small></section>
      <section class="weekly-card"><h3>直近7日間 <small>全学年</small></h3><p class="weekly-total"><strong>${analysis.week.answered}回</strong>回答 · 正答率 <strong>${percent(analysis.week.correct,analysis.week.answered)}</strong></p><ol class="activity-chart" aria-label="日別の回答数">${analysis.days.map(day=>`<li><span class="activity-count">${day.answered}</span><div class="activity-track" aria-hidden="true"><span style="height:${Math.round(day.answered/max*100)}%"></span></div><time datetime="${day.date}">${Number(day.date.slice(5,7))}/${Number(day.date.slice(8))}</time><span class="sr-only">：${day.answered}回回答、${day.correct}回正解</span></li>`).join('')}</ol><small>回答日時のある履歴を端末の日付で集計。旧集計値は含みません。</small></section></div>
      <div class="recommendations"><h3>次に取り組もう</h3>${suggestions.length ? `<p>現在の復習対象が多い単元から表示しています。</p><div class="recommendation-list">${suggestions.map(u=>`<button class="recommendation" data-action="start-unit" data-unit="${u.id}"><span><strong>${esc(u.name)}</strong><small>復習対象 ${u.reviewCount}問 · ${u.attempts}回回答 · 正答率 ${percent(u.correct,u.attempts)}</small></span><span>単元に挑戦 →</span></button>`).join('')}</div><button class="text-button" data-action="review">苦手問題だけを復習する →</button>` : `<p>${coverage.attempted ? '今の学年に復習待ちの問題はありません。未挑戦の問題や別の単元にも挑戦してみよう。' : 'まずはクエストに挑戦しよう。回答がたまると、復習したい単元がここに表示されます。'}</p><button class="text-button" data-action="home">クエストを選ぶ →</button>`}</div></section>`;
  }
  function records() {
    screen = 'records';
    display(`${back()}<div class="page-heading"><p class="eyebrow">YOUR ADVENTURE LOG</p><h1>学習記録</h1><p>積み重ねた一歩を、振り返ろう。</p></div><div class="record-grid"><div class="record-card"><span>累計回答数</span><strong>${progress.answered}<small> 問</small></strong></div><div class="record-card"><span>累計正答率</span><strong>${percent(progress.correct,progress.answered)}</strong></div><div class="record-card"><span>クリアしたクエスト</span><strong>${progress.sessions}<small> 回</small></strong></div><div class="record-card"><span>学習日数 / 連続学習</span><strong>${progress.studyDates.length}<small> 日 / ${P.streak(progress)}日</small></strong></div></div>
      ${analysisPanel()}
      <h2 class="small-heading">単元ごとの記録</h2><div class="record-units">${[1,2,3].map(g=>`<section class="record-grade"><h3>中学${g}年</h3>${units.filter(u=>u.grade===g).map(u=>{const s=statsFor(questions.filter(q=>q.unitId===u.id));return `<div class="record-row"><span>${esc(u.name)}<small>${categoryName(u.category)} · ${s.attempts}回回答</small></span><strong>${percent(s.correct,s.attempts)}</strong></div>`;}).join('')}</section>`).join('')}</div>
      <h2 class="small-heading">問題ごとの回答履歴</h2><div class="history-list">${questions.filter(q=>progress.questionStats[q.id]?.attempts).map(q=>{const s=progress.questionStats[q.id];return `<details><summary><span>中${q.grade} · ${esc(q.prompt)}</span><small>${s.correct} / ${s.attempts}回正解</small></summary>${s.history.length?`<ol>${[...s.history].reverse().map(h=>`<li><time datetime="${esc(h.at)}">${esc(new Date(h.at).toLocaleString('ja-JP'))}</time><span>${h.correct?'✓ 正解':'✕ 不正解'} · ${esc(h.selected)}</span></li>`).join('')}</ol>`:'<p>過去の回答日時は記録されていません。</p>'}</details>`;}).join('')||'<p class="hint">まだ回答履歴はありません。最初のクエストに挑戦してみよう！</p>'}</div>
      ${progress.migrationNote?`<p class="notice">${esc(progress.migrationNote)}</p>`:''}<p class="hint">学習日数と連続学習は、クエストの最後まで回答した端末のローカル日付で記録します。途中までの回答も、XP・正答率・問題別履歴に残ります。</p>`);
  }
  document.addEventListener('click',event=>{
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    switch (button.dataset.action) {
      case 'home': case 'exit': home(); break;
      case 'records': records(); break;
      case 'account': accountScreen(); break;
      case 'export': exportProgress(); break;
      case 'confirm-import': confirmImport(); break;
      case 'cancel-import': pendingImport=null;accountChanged();break;
      case 'copy-guest': pendingImport=P.load(storage,questions).progress;accountChanged();break;
      case 'sync': refreshCloud();break;
      case 'sign-out': logout();break;
      case 'use-cloud': resolveConflict(false);break;
      case 'use-local': resolveConflict(true);break;
      case 'grade': {
        grade=Number(button.dataset.grade);
        home(false);
        main.querySelector(`[data-grade="${grade}"]`).focus();
        break;
      }
      case 'course': category=button.dataset.category; unitScreen(); break;
      case 'review': reviewScreen(); break;
      case 'start-unit': {
        const unit=units.find(u=>u.id===button.dataset.unit);
        start(questions.filter(q=>q.unitId===unit.id),`中${grade} · ${unit.name}`); break;
      }
      case 'start-all': start(questions.filter(q=>q.grade===grade&&q.category===category),`中${grade} · ${categoryName(category)}`); break;
      case 'start-review': start(questions.filter(q=>q.grade===grade&&progress.reviewIds.includes(q.id)),`中${grade} · 苦手の復習`); break;
      case 'answer': {
        const q=quest.questions[quest.index];
        const result=P.answer(progress,quest,q.options[Number(button.dataset.option)]);
        if (result) { quest.answers[quest.index].levelUp=result.levelUp; persist(); quiz(); }
        break;
      }
      case 'next': if (quest.completed) results(); else if (P.next(quest)) quiz(); break;
      case 'retry': start(retryQuestions,questTitle); break;
      case 'retry-mistakes': start(quest.answers.filter(a=>!a.correct).map(a=>questions.find(q=>q.id===a.id)),`中${grade} · 苦手の復習`); break;
    }
  });
  // 確認メールのリダイレクトに認証情報が含まれていても、URLに残さない。
  if(location.hash.includes('access_token=')||location.hash.includes('error_description=')){
    history.replaceState(null,'',location.pathname+location.search);
    cloudMessage='「保存・同期」からログインしてください。';
  }
  if(cloud?.user){
    try{switchUser(cloud.user);}catch(error){cloudMessage=error.message;}
  }
  home(false);
  if(cloud?.user)cloud.restore().then(()=>refreshCloud()).catch(error=>{cloudMessage=error.message;accountChanged();});
})();
