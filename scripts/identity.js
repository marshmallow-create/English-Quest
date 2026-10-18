/* ユーザー名・パスワードの入力規則。ブラウザと認証関数で共有。 */
(function(root){
  'use strict';
  function normalizeUsername(value){
    if(typeof value!=='string')throw new Error('ユーザー名を入力してください。');
    const username=value.trim().normalize('NFKC').toLowerCase();
    if(!/^[a-z0-9_]{3,24}$/.test(username))throw new Error('ユーザー名は半角英字・数字・_で3〜24文字にしてください。');
    return username;
  }
  function validatePassword(value){
    if(typeof value!=='string'||! /^[\x20-\x7e]{8,64}$/.test(value)||!value.trim())throw new Error('パスワードは半角英数字・記号で8〜64文字にしてください。');
    return value;
  }
  const api={normalizeUsername,validatePassword};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.QuestIdentity=api;
})(typeof globalThis!=='undefined'?globalThis:this);
