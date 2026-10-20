'use strict';
const fs=require('node:fs');
const path=require('node:path');
const Cloud=require('./cloud.js');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'dist');
// 公開するファイルだけをコピー。.git、テスト、バックアップ、環境ファイルは含めない。
fs.mkdirSync(path.join(output,'scripts'),{recursive:true});
for(const file of ['index.html','style.css']) fs.copyFileSync(path.join(root,file),path.join(output,file));
for(const file of ['questions-step2.js','momo-words.js','momo-grammar.js','momo-quest.js','questions.js','vocabulary.js','progress.js','analysis.js','identity.js','cloud.js','app.js']) fs.copyFileSync(path.join(root,'scripts',file),path.join(output,'scripts',file));
const config={supabaseUrl:process.env.SUPABASE_URL||'',supabasePublishableKey:process.env.SUPABASE_PUBLISHABLE_KEY||'',signupEnabled:process.env.SUPABASE_SIGNUP_ENABLED==='true'};
if(Boolean(config.supabaseUrl)!==Boolean(config.supabasePublishableKey)) throw Error('SUPABASE_URL と SUPABASE_PUBLISHABLE_KEY は両方設定してください。');
Cloud.config(config);
fs.writeFileSync(path.join(output,'scripts','config.js'),`window.QuestConfig = ${JSON.stringify(config).replace(/</g,'\\u003c')};\n`);
console.log(`Static build ready: ${path.relative(root,output)} (cloud sync ${config.supabaseUrl?'configured':'not configured'})`);
