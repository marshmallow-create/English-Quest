/* 任意ログインと同期。秘密キーを使わず、SupabaseのRLSで利用者ごとに分離します。 */
(function(root) {
  'use strict';
  const Identity=typeof module!=='undefined'&&module.exports?require('./identity.js'):root.QuestIdentity;
  class CloudError extends Error {
    constructor(message,status=0) { super(message);this.status=status; }
  }
  function config(raw={}) {
    if(!raw.supabaseUrl || !raw.supabasePublishableKey) return null;
    const url=new URL(raw.supabaseUrl);
    if(url.protocol!=='https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname)) throw new CloudError('同期先の設定が正しくありません。');
    if(!String(raw.supabasePublishableKey).startsWith('sb_publishable_')) throw new CloudError('同期には公開用のpublishableキーを設定してください。');
    return {url:url.origin,key:raw.supabasePublishableKey};
  }
  function userKey(id) {
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new CloudError('利用者情報を確認できませんでした。');
    return `english-quest-account-${id}`;
  }
  function scopedStorage(storage,id) {
    const key=userKey(id);
    return {
      getItem(name) { return name==='english-quest-v1'?null:storage.getItem(name.replace('english-quest-v2',key)); },
      setItem(name,value) { storage.setItem(name.replace('english-quest-v2',key),value); }
    };
  }
  function same(a,b) {
    function stable(value) {
      if(Array.isArray(value)) return value.map(stable);
      if(value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
      return value;
    }
    return JSON.stringify(stable(a))===JSON.stringify(stable(b));
  }
  function parseBackup(text,P,questions) {
    if(typeof text!=='string'||text.length>4*1024*1024) throw new CloudError('4MB以下のEnglish Questバックアップを選んでください。');
    let raw;
    try{raw=JSON.parse(text);}catch{throw new CloudError('JSONファイルを読み取れませんでした。');}
    const data=raw?.application==='english-quest'&&raw.formatVersion===1?raw.data:raw;
    if(!data||data.schemaVersion!==2||!['xp','answered','correct','sessions'].every(k=>Number.isSafeInteger(data[k])&&data[k]>=0)||data.correct>data.answered||!data.questionStats||typeof data.questionStats!=='object'||Array.isArray(data.questionStats)||!Array.isArray(data.reviewIds)||!Array.isArray(data.studyDates)) throw new CloudError('対応する学習記録ではありません。現在の記録は変更していません。');
    return P.normalize(data,questions);
  }
  function createClient(settings,{storage,fetcher=fetch,now=()=>Date.now()}={}) {
    const cfg=config(settings);
    if(!cfg) return null;
    const sessionKey=`english-quest-auth-${new URL(cfg.url).hostname}`;
    let session=null;
    try{session=JSON.parse(storage.getItem(sessionKey));}catch{ /* 保存不可でもログイン自体はメモリで利用可能 */ }
    function setSession(value) {
      session=value;
      try{storage.setItem(sessionKey,JSON.stringify(value));}catch{ /* アカウント画面でブラウザ保存の制限も案内 */ }
    }
    async function request(path,{method='GET',body,token,headers={}}={}) {
      let response;
      try{response=await fetcher(cfg.url+path,{method,headers:{apikey:cfg.key,...(token?{Authorization:`Bearer ${token}`} : {}),...(body?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});}
      catch{throw new CloudError('通信できませんでした。端末の記録は保存されています。接続を確認して再試行してください。');}
      const text=await response.text();
      let data=null;try{data=text?JSON.parse(text):null;}catch{throw new CloudError('同期先から正しい応答を受け取れませんでした。',response.status);}
      if(!response.ok){
        if(path==='/functions/v1/username-auth'){
          const messages={username_taken:'そのユーザー名は使用されています。別の名前を選んでください。',invalid_credentials:'ユーザー名またはパスワードを確認してください。',invalid_credentials_format:'ユーザー名とパスワードの入力規則をご確認ください。',too_many_attempts:'試行回数が多いため、少し時間をおいて再試行してください。'};
          throw new CloudError(messages[data?.code]||'登録・ログインを完了できませんでした。時間をおいて再試行してください。',response.status);
        }
        if(response.status===401||response.status===403) throw new CloudError('ログイン情報またはアクセス権を確認できませんでした。もう一度ログインしてください。',response.status);
        if(response.status===409) throw new CloudError('別の端末で記録が更新されています。同期する記録を選び直してください。',409);
        if(response.status===429) throw new CloudError('操作が集中しています。少し時間をおいて再試行してください。',429);
        throw new CloudError('操作を完了できませんでした。入力内容や同期先の設定をご確認ください。',response.status);
      }
      return data;
    }
    function acceptSession(data) {
      userKey(data?.user?.id||'');
      if(typeof data.access_token!=='string'||typeof data.refresh_token!=='string'||!Number.isFinite(data.expires_in)) throw new CloudError('ログイン情報を読み取れませんでした。');
      let username=session?.user?.username||'学習者';
      try{username=Identity.normalizeUsername(data.user.user_metadata?.username||data.user.username||username);}catch{ /* 表示名だけの異常は認証の権限に使用しない */ }
      setSession({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:now()+data.expires_in*1000,user:{id:data.user.id,username}});
      return session.user;
    }
    let refreshing=null;
    async function token() {
      if(!session?.access_token) throw new CloudError('ログインしてください。',401);
      if(session.expires_at<=now()+60000){
        if(!refreshing) refreshing=request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}}).then(acceptSession).finally(()=>{refreshing=null;});
        await refreshing;
      }
      return session.access_token;
    }
    return {
      get user(){return session?.user||null;},
      async restore(){
        if(!session) return null;
        const data=await request('/auth/v1/user',{token:await token()});
        userKey(data?.id||'');
        if(data.id!==session.user.id) {setSession(null);throw new CloudError('利用者情報が一致しません。再ログインしてください。',401);}
        return session.user;
      },
      async signIn(username,password){return acceptSession(await request('/functions/v1/username-auth',{method:'POST',body:{action:'signin',username:Identity.normalizeUsername(username),password:Identity.validatePassword(password)}}));},
      async signUp(username,password){
        const data=await request('/functions/v1/username-auth',{method:'POST',body:{action:'signup',username:Identity.normalizeUsername(username),password:Identity.validatePassword(password)}});
        return acceptSession(data);
      },
      async signOut(){
        let failure=null;
        try{if(session) await request('/auth/v1/logout',{method:'POST',token:await token()});}catch(error){failure=error;}
        setSession(null);
        return failure;
      },
      async read(){
        const access=await token();const id=session.user.id;
        const rows=await request(`/rest/v1/english_quest_progress?user_id=eq.${id}&select=progress,revision`,{token:access});
        if(!Array.isArray(rows)||rows.length>1) throw new CloudError('クラウド記録の形式を確認できませんでした。');
        const row=rows[0]||null;
        if(row&&(!Number.isSafeInteger(row.revision)||row.revision<1)) throw new CloudError('クラウド記録の版を確認できませんでした。');
        return row;
      },
      async write(progress,revision){
        const access=await token();const id=session.user.id;
        const inserting=revision===null;
        if(!inserting&&(!Number.isSafeInteger(revision)||revision<1)) throw new CloudError('先にクラウドの記録を確認してください。');
        const rows=await request(`/rest/v1/english_quest_progress${inserting?'':`?user_id=eq.${id}&revision=eq.${revision}`}`,{method:inserting?'POST':'PATCH',token:access,headers:{Prefer:'return=representation'},body:{user_id:id,progress,revision:inserting?1:revision+1}});
        if(!Array.isArray(rows)||rows.length!==1) throw new CloudError('別の端末で記録が更新されています。同期する記録を選び直してください。',409);
        return rows[0];
      }
    };
  }
  const api={CloudError,config,userKey,scopedStorage,same,parseBackup,createClient};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.QuestCloud=api;
})(typeof globalThis!=='undefined'?globalThis:this);
