(function () {
  'use strict';
  const {questions, units} = window.QuestData;
  const P = window.QuestProgress;
  // localStorage のプロパティアクセス自体が禁止されている環境にも対応。
  let storage;
  try { storage = window.localStorage; } catch { storage = {getItem(){throw new Error('Storage unavailable');},setItem(){throw new Error('Storage unavailable');}}; }
  const loaded = P.load(storage,questions);
  const progress = loaded.progress;
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
    if (!P.save(storage,progress)) notice('学習記録を保存できませんでした。保存容量やブラウザ設定をご確認ください。今回の記録は画面を閉じると失われる可能性があります。');
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
  home(false);
})();
