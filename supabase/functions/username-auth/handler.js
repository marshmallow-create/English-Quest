/* メールを収集せず、Supabase Authの確認済み内部IDとしてユーザー名を登録する。 */
(function(root){
  'use strict';
  const Identity=typeof module!=='undefined'&&module.exports?require('../../../scripts/identity.js'):root.QuestIdentity;
  const origins=new Set(['https://english-quest-sepia.vercel.app','https://english-quest-marshmallow2.vercel.app']);
  const encode=new TextEncoder();
  const hex=buffer=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
  async function internalEmail(username){
    const hash=hex(await crypto.subtle.digest('SHA-256',encode.encode(Identity.normalizeUsername(username))));
    // .invalid は実在するメールの送信先ではない。ユーザーのメールアドレスは不要。
    return `eq-${hash}@users.english-quest.invalid`;
  }
  function createHandler({env,fetcher=fetch}){
    function keys(name,fallback){
      try{const values=Object.values(JSON.parse(env(name)||'{}')).filter(v=>typeof v==='string'&&v);if(values.length)return values;}catch{}
      const legacy=env(fallback);return legacy?[legacy]:[];
    }
    const publicKeys=keys('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY');
    const adminKey=keys('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY')[0];
    const base=env('SUPABASE_URL');
    return async function handler(req){
      const origin=req.headers.get('origin');
      const cors={'Access-Control-Allow-Origin':origin&&origins.has(origin)?origin:'https://english-quest-sepia.vercel.app','Access-Control-Allow-Headers':'apikey, content-type, authorization, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
      const reply=(status,body)=>Response.json(body,{status,headers:cors});
      if(origin&&!origins.has(origin))return reply(403,{code:'origin_not_allowed'});
      if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
      if(req.method!=='POST')return reply(405,{code:'method_not_allowed'});
      if(!base||!adminKey||!publicKeys.length)return reply(503,{code:'auth_unavailable'});
      if(!publicKeys.includes(req.headers.get('apikey')))return reply(401,{code:'invalid_api_key'});
      if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return reply(415,{code:'invalid_request'});
      let input;
      try{
        if(Number(req.headers.get('content-length'))>4096)return reply(413,{code:'invalid_request'});
        const reader=req.body?.getReader();if(!reader)return reply(400,{code:'invalid_request'});
        const chunks=[];let length=0;
        while(true){const item=await reader.read();if(item.done)break;length+=item.value.length;if(length>4096){await reader.cancel();return reply(413,{code:'invalid_request'});}chunks.push(item.value);}
        const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
        input=JSON.parse(new TextDecoder().decode(bytes));
      }catch{return reply(400,{code:'invalid_request'});}
      let username,password;
      try{username=Identity.normalizeUsername(input?.username);password=Identity.validatePassword(input?.password);}catch{return reply(400,{code:'invalid_credentials_format'});}
      if(!['signin','signup'].includes(input?.action))return reply(400,{code:'invalid_request'});
      async function api(path,body,admin=false){
        const key=admin?adminKey:publicKeys[0];
        const response=await fetcher(base+path,{method:'POST',headers:{apikey:key,'Content-Type':'application/json',...(admin&&key.startsWith('eyJ')?{Authorization:`Bearer ${key}`}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
        let data;try{data=await response.json();}catch{data=null;}
        return {ok:response.ok,status:response.status,data};
      }
      async function take(bucket,limit){
        const hmac=await crypto.subtle.importKey('raw',encode.encode(adminKey),{name:'HMAC',hash:'SHA-256'},false,['sign']);
        const hash=hex(await crypto.subtle.sign('HMAC',hmac,encode.encode(bucket)));
        const result=await api('/rest/v1/rpc/english_quest_take_auth_attempt',{p_bucket_key:hash,p_attempt_limit:limit},true);
        if(!result.ok||typeof result.data!=='boolean')throw Error('Limiter unavailable');
        return result.data;
      }
      try{
        const action=input.action;
        const ip=req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
        // IPに加えて、登録総数・ユーザー名別の制限もDBで原子的に適用。
        if(!await take(`${action}:ip:${ip}`,action==='signup'?5:30))return reply(429,{code:'too_many_attempts'});
        if(!await take(action==='signup'?'signup:global':`signin:user:${username}`,action==='signup'?30:10))return reply(429,{code:'too_many_attempts'});
        const email=await internalEmail(username);
        if(action==='signup'){
          const created=await api('/auth/v1/admin/users',{email,password,email_confirm:true,user_metadata:{username}},true);
          if(!created.ok){
            if(created.status===422||created.data?.error_code==='email_exists'||created.data?.code==='email_exists')return reply(409,{code:'username_taken'});
            return reply(created.status===429?429:503,{code:created.status===429?'too_many_attempts':'auth_unavailable'});
          }
        }
        const result=await api('/auth/v1/token?grant_type=password',{email,password});
        if(!result.ok)return reply(result.status===429?429:401,{code:result.status===429?'too_many_attempts':'invalid_credentials'});
        const session=result.data;
        if(!session?.access_token||!session.refresh_token||!session.user?.id||!Number.isFinite(session.expires_in))return reply(503,{code:'auth_unavailable'});
        // メールや管理者用レスポンスはクライアントに返さない。
        return reply(200,{access_token:session.access_token,refresh_token:session.refresh_token,expires_in:session.expires_in,token_type:'bearer',user:{id:session.user.id,user_metadata:{username}}});
      }catch{return reply(503,{code:'auth_unavailable'});}
    };
  }
  const api={createHandler,internalEmail};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.QuestUsernameAuth=api;
})(typeof globalThis!=='undefined'?globalThis:this);
