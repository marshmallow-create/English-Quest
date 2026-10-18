# STEP 3 実装・公開記録

## 結果

- 公開URL： https://english-quest-sepia.vercel.app/
- Vercelプロジェクト：`english-quest` / `prj_emUiPuYxhrSZ9Z9OnZbBWRhQ5zeV`
- 本番デプロイ：`dpl_HfbMyxzy3ga2jg5tgKCLZ9pe4v6y`、状態 `READY`
- Supabaseプロジェクト：`english-quest` / `eyxwnhcewhlbpvtsdbha`、東京リージョン
- Supabase組織：ユーザー指定の `wxvqnqtyjcgihdjbvxuc`。新規プロジェクト作成の見積もりは月額0ドル。
- Gitコミット・Pushは実施せず、作業フォルダーの変更ファイルをVercel API経由で直接公開。

ユーザーの依頼により、メール方式からユーザー名・パスワード方式へ変更しました。新規登録は有効です。メールアドレスの入力、確認メール、SMTP設定は不要です。パスワード再設定・アカウント復旧は今回の対象外です。

## React・TypeScriptへの移行の判断

仕様書のSTEP 3は「移行の要否判断」です。今回はHTML/CSS/JavaScriptを維持しました。現在の画面数では全面移行を必須とせず、300問・XP・履歴・オフライン起動と既存テストを継続して使う方針です。ReactやTypeScriptに移行したという扱いにはしていません。

この実行環境ではnpmレジストリへの通信がEACCESで拒否されました。実装は追加依存パッケージを必要としない構成です。将来、画面・権限・同期状態がさらに増える時点で移行を再評価します。

## 保存・認証・同期

- ゲストの `english-quest-v2` とスキーマ2、300問のID、XPの計算を維持。
- アカウント別の保存キーに分離し、ログインだけではゲスト記録をアカウントに混ぜない。
- ユーザー名・パスワードを`username-auth` Edge Functionに送信。正規化したユーザー名から内部識別子を生成し、Supabase Authの管理APIで確認済み利用者として作成して通常のパスワード認証を行う。内部識別子には予約済みの`.invalid`ドメインを使用し、メールを送信しない。
- ユーザー名は半角英字・数字・`_`の3〜24文字。大文字・小文字は同じ名前として扱う。パスワードは半角英数字・記号8〜64文字。入力規則は`identity.js`でブラウザ・Edge Function間で共有。
- パスワードのハッシュ化・照合はSupabase Authに任せ、アプリでは保存しない。アクセストークンと更新トークンをこのブラウザに保存し、期限が近い場合は更新。
- 管理者の秘密キーはEdge Functionの標準環境変数だけから取得し、ブラウザやVercelには配布しない。応答にも含めない。登録・ログインの連続試行を非公開DBの原子的なカウンターで制限し、カウンターが利用できない場合も認証を通さない。
- 学習記録の書き出しは `{ application, formatVersion, exportedAt, data }` のJSON。認証情報を含めない。v2保存データそのもののJSONも取り込み可能。
- 取り込みはプレビューと明示操作が必要。置き換え前の端末記録は `-before-import` キーに退避。退避・保存に失敗した場合は置き換えを中止。
- 同期は利用者ごとに1つのスナップショットと版番号を使用。初回はINSERT、以後は `user_id` と前の `revision` の両方が一致する行だけをPATCH。
- 同時更新の0行応答・409は競合として表示。自動マージ・自動XP加算を行わず、端末側とクラウド側のどちらを使うか選択。
- 端末の記録をクラウドへ上書きする場合も、確認した版に対してだけ更新。選択中に他端末で変更された場合は再び競合として扱う。
- 通信失敗時は端末内の記録と未同期状態を保持。「同期する」で再試行。
- ログアウトは端末のログイン情報を消してゲスト記録へ戻る。アカウント記録の控えは端末に保持する。

## DBの設定と検証

`supabase/schema.sql` を専用プロジェクトに実行済みです。既存テーブルを消す処理はありません。同じSQLをセットアップ済みプロジェクトへ再実行する必要はありません。

`public.english_quest_progress` の主キーは認証利用者のUUIDです。RLSを有効にし、`authenticated` にだけSELECT・INSERT・UPDATEを付与。各ポリシーは `(select auth.uid()) = user_id` を検査し、UPDATEにはUSINGとWITH CHECKを設定しています。匿名利用者の権限とDELETE権限は付与していません。記録へのアクセスに秘密キーやSECURITY DEFINER関数は使用していません。

実DBで一時的なテスト利用者・記録をトランザクション内に作成し、次を確認してROLLBACKしました。

- 本人の行だけをSELECTでき、本人の版を指定したUPDATEが成功。
- 他利用者の行の読み込み・更新が拒否される。
- 古い版のUPDATEが0行となる。
- 所有者の書き換え・匿名アクセスが拒否される。
- 最終確認で学習記録0行・テスト利用者0件。テストデータの残存なし。
- Supabase Security Advisorsの指摘0件。

## ユーザー名認証の追加セットアップと実通信検証

`supabase/username-auth.sql`を適用し、`supabase/functions/username-auth/index.js`を`username-auth`として公開済みです。`verify_jwt=false`で登録前の呼び出しを受け、関数内で公開キー・入力・試行回数を検証します。公開用キーだけでは記録の読み書きはできません。登録時にメール送信APIは呼びません。

`private.english_quest_auth_attempts`はRLS有効・公開ポリシーなしで一般利用者を拒否し、`service_role`だけがカウンター関数を実行できます。IP・ユーザー名そのものは保存せず、秘密鍵付きハッシュと10分間の件数を保存します。IP別・ユーザー名別のログイン制限と、登録のIP別・全体件数制限を設けています。

実際の公開Edge FunctionとAuth・REST APIを通して次を確認しました。テスト用のランダムなユーザー名・パスワードのみ使用し、秘密情報は検証出力に表示していません。

- 2人の新規登録が200で成功し、それぞれ異なる利用者IDを取得。
- 大文字に変えた同名での新規登録は409、誤ったパスワードでのログインは401。
- 両者とも再ログイン成功。登録時と同じ利用者IDを取得。
- 1人目で125 XPの記録を保存し、新しいログインセッションから125 XPを取得。
- 2人目から記録一覧を取得すると0行で、1人目の記録が見えない。
- 認証トークンの更新が200で成功。
- ログアウトが204で成功。検証用の2アカウント・学習記録・一時テーブル・通信検証用拡張は削除し、残存0件を確認。
- 本番URLのHTML・設定・認証スクリプトがHTTP 200で取得でき、新規登録有効・ユーザー名認証エンドポイントへの切り替え・CSPを確認。

追加後のSecurity Advisorsでは、試行回数テーブルに公開ポリシーがない旨のINFOが出ます。一般利用者を拒否する意図した設定です。Authの漏洩パスワード検出が無効というWARNは残っています。通信検証用の`pg_net`は検証後に削除しました。

セットアップ直前の利用者と学習記録は0件だったため、メール方式の既存アカウントを変換する必要はありませんでした。ゲスト保存データ・JSONバックアップは従来どおり利用できます。

## Vercelの設定

- Build Command：`node scripts/build.js`
- Output Directory：`dist`
- Node.js：22.x
- Framework：指定なし（静的サイト）
- 本番環境変数：`SUPABASE_URL`、`SUPABASE_PUBLISHABLE_KEY`、`SUPABASE_SIGNUP_ENABLED=true`。公開可能な値のみ。
- `scripts/config.js` は公開版のビルド時に生成。ソース側の同ファイルは未接続のまま残すため、ファイル起動で意図せずクラウドへ通信しない。
- CSP、nosniff、Referrer-Policyを設定。テスト、Git情報、環境ファイル、バックアップは公開出力に含めない。
- Git連携による自動デプロイは設定していない。

Vercel接続の一部の参照APIは `marshmallow2` スコープへの403になります。プロジェクトの作成・設定・デプロイ・READYとエイリアスの取得は成功しました。公開URLのHTTP取得も別経路で200を確認済みですが、ビルドログ取得と公開版のブラウザ操作は未確認です。変更前の公開版については、ユーザーからホーム画面が表示されたとの確認を得ています。

## ローカル検証

```powershell
npm test
node scripts/build.js
node scripts/test-built.js
```

自動テスト52件成功。従来の演習・復習・学習分析に加え、ユーザー名での登録・再ログイン、バックアップの実ファイル入出力、アカウント分離、認証トークン更新、未同期の保持、接続復帰、競合の両方の選択、ログアウトを検証しています。サーバー側の重複・不正入力・送信元・試行回数制限・依存先障害も検証しています。

画面テストの認証・同期通信はテスト用モックを使います。実通信での認証・保存・取得は上記のとおり別途検証済みです。公開用ビルドはローカルHTTPで9つの参照ファイル、CSP、非公開ファイルへの404を確認しました。

この環境ではHTTP版・公開URL向けのEdge操作はCDPの `Page.enable` がタイムアウトし、確認できませんでした。ローカルファイル版でのEdge操作は成功しています。スマートフォン実機での操作は未検証です。

## 変更ファイル

追加：`scripts/cloud.js`、`scripts/config.js`、`scripts/build.js`、`scripts/test-built.js`、`tests/cloud.test.js`、`supabase/schema.sql`、`package.json`、`package-lock.json`、`vercel.json`、`.vercelignore`、`.env.example`、この記録。

更新：`index.html`、`scripts/app.js`、`style.css`、`tests/browser.test.js`、`.gitignore`、`README.md`。

Gitのコミット・Push、AI APIの追加は行っていません。
