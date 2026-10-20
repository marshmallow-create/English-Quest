/* 公開用distをローカルHTTPで配信し、実ブラウザの回帰テストを実行します。 */
'use strict';
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const output=path.resolve(__dirname,'../dist');
const config=require('../vercel.json');
function serveBuilt(){
const server=http.createServer(async(request,response)=>{
  try{
    const url=new URL(request.url,'http://localhost');
    const filename=path.resolve(output,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    const relative=path.relative(output,filename);
    if(relative.startsWith('..')||path.isAbsolute(relative)){response.writeHead(403).end();return;}
    const content=await fs.readFile(filename);
    for(const header of config.headers[0].headers)response.setHeader(header.key,header.value);
    response.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'})[path.extname(filename)]||'application/octet-stream');
    response.end(content);
  }catch{response.writeHead(404).end();}
});
return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve({server,url:`http://127.0.0.1:${server.address().port}/`}));});
}
module.exports={serveBuilt};
if(require.main===module){
  const assert=require('node:assert/strict');
  (async()=>{
    const site=await serveBuilt();
    try{
      const page=await fetch(site.url);
      assert.equal(page.status,200);
      assert.ok(page.headers.get('Content-Security-Policy').includes("script-src 'self'"));
      const html=await page.text();
      const paths=[...html.matchAll(/(?:src|href)="((?:scripts\/|style\.css)[^"]*)"/g)].map(m=>m[1]);
      assert.ok(paths.includes('scripts/cloud.js'));
      for(const file of paths){const result=await fetch(new URL(file,site.url));assert.equal(result.status,200,file);assert.ok((await result.text()).length>0,file);}
      for(const hidden of ['.env','.git/config','tests/browser.test.js','scripts/build.js','momo_choice_英単語一覧20261020.xlsx'])assert.equal((await fetch(new URL(hidden,site.url))).status,404,hidden);
      console.log(`Built HTTP check passed: ${paths.length} assets, CSP, private file exclusions`);
    }finally{await new Promise(resolve=>site.server.close(resolve));}
  })().catch(error=>{console.error(error);process.exitCode=1;});
}
