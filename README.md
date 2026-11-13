# Yomidori Momo

文章生成・管理アプリを自力で実装するための開発用の土台です。
現在あるのは静的な React 画面と、起動確認専用の `GET /api/health` だけです。
文章CRUD、生成フォーム、文章一覧、SQLiteのスキーマ・読み書き、LLM接続は未実装です。

## 技術選定

2026-11-13 に公式資料と npm の安定版タグ・依存条件を確認しました。

| 技術 | 採用バージョン | 理由・役割 |
| --- | --- | --- |
| Node.js | 24.22.1（24 LTS） | クラウドの既存環境を利用。Express・Vite・ESLintの要件を満たす |
| npm | 11.9.0 | 1つの package.json とロックファイルで管理 |
| TypeScript | 6.0.3 | strict モード。最新安定版7.0.2は typescript-eslint の対応範囲外のため見送った |
| React / React DOM | 19.3.1 | 画面描画。学習目的なのでSSRフレームワークは導入しない |
| Vite | 8.3.8 | フロントの開発サーバーとビルド |
| Express | 5.3.0 | Node.js上の最小限のHTTPサーバー |
| CSS | 通常のCSS | 最初はCSS自体を学べる構成。Tailwind等は必要になってから検討 |
| SQLite / LLM | 未導入 | 実装段階で選定。現時点でドライバー・ORM・SDKは不要 |

追加の開発依存:

- `@vitejs/plugin-react` 6.3.0: Reactの開発時更新（Fast Refresh）。
- `tsx` 4.23.15: 開発時のサーバーのTypeScript実行。監視・再起動はNode標準のwatchを使用。
- `concurrently` 10.0.7: 1コマンドで両サーバーを起動し、終了時に両方停止。
- `eslint` 10.14.0 / `@eslint/js` 10.0.1 / `typescript-eslint` 8.72.2:
  JavaScript・TypeScriptの推奨Lintルール。
- `eslint-plugin-react-hooks` 7.1.1 / `globals` 17.14.0:
  React Hooksのルール、ブラウザとNodeのグローバル変数定義。
- `@types/react` 19.3.0 / `@types/react-dom` 19.3.0 / `@types/express` 5.0.6 /
  `@types/node` 24.19.2: 利用する実行環境・ライブラリの型定義。Nodeの型は実行環境と同じ24系。

直接依存は正確なバージョンを指定し、間接依存は `package-lock.json` で固定しています。
今後の更新時は互換性を確認してからロックファイルを更新してください。

## ディレクトリ

```text
client/
  index.html
  tsconfig.json        # ブラウザ向け（Bundler方式、JSX）
  src/
    main.tsx           # Reactの起動
    App.tsx            # 起動確認用の静的画面
    style.css
server/
  tsconfig.json        # Node向け（NodeNext方式、ES Modules）
  src/index.ts         # 起動確認用のHTTPサーバー
vite.config.ts         # clientのビルド・開発用 /api プロキシ
tsconfig.json          # Vite設定ファイルの型チェック
tsconfig.base.json     # 共通のstrict設定
eslint.config.js
.env.example           # 秘密情報の取り扱いの説明（現状は変数不要）
.nvmrc                 # Nodeのバージョン
package.json
package-lock.json
dist/                  # ビルドで生成。Git管理外
```

## 開発を始める

リポジトリのルートで実行します。

```sh
# nvmを使う場合だけ: nvm install && nvm use
node --version
npm --version
npm ci
npm run dev
```

Node 24.22.1 / npm 11.9.0 を推奨します。クラウドでは導入済みです。
初回インストール・再構築は `npm ci` を利用してください。
新しく依存を追加するときだけ `npm install` を使い、package.json とロックファイルを一緒に管理します。

手元で実行した場合の画面は `http://127.0.0.1:5173`、APIはポート3001です。
`/api` へのリクエストは Vite から Express に転送するため、開発用のCORSライブラリは不要です。
両サーバーはループバックのみに待ち受けます。ポートが使用中の場合は自動で別ポートに移動せずエラーになります。
終了は `Ctrl+C`。個別起動は `npm run dev:client` / `npm run dev:server` です。
クラウドのオンボーディング画面ではローカルURLのプレビューを前提にせず、環境内のHTTPリクエストで確認します。

```sh
curl --fail http://127.0.0.1:3001/api/health
curl --fail http://127.0.0.1:5173/api/health
# いずれも {"status":"ok"}
```

## 型チェック・Lint・ビルド

```sh
npm run typecheck
npm run lint
npm run build
```

Vite自体は型チェックをしないため、`build` は最初に明示的な型チェックを行います。
ビルド先は `dist/client/` と `dist/server/` です。
ビルド後の確認は2つのターミナルで行います。

```sh
npm start          # ビルドしたAPIサーバー: 3001
npm run preview    # ビルドした画面の確認用サーバー: 4173
```

`preview` は公開運用向けのサーバーではありません。
画面をExpressから配信する処理やデプロイ環境は今回の範囲に含めていません。
アプリのテストは機能実装時に追加します。現時点の検証対象は型・Lint・ビルド・起動とHTTP応答です。

## 構築時の検証結果

2026-11-13 の現在のクラウド環境で次を確認しました。

- `npm install`、ロックファイルからの `npm ci` が成功。
- `npm run typecheck`（build内で実行）、`npm run lint`、`npm run build` が成功。
- 開発時のAPIへの直接リクエストとVite経由のリクエストがともにHTTP 200、`{"status":"ok"}`。
- 開発サーバーを停止・再起動し、ChromiumでReact画面と `/api` 経由の応答を再確認。
- ビルド後の `npm start` と `npm run preview` が起動。
- Chromiumでビルド後のReact画面の描画、ブラウザからの `/api/health` 取得、未捕捉のJavaScript例外がないことを確認。
- `npm audit --omit=dev`: 既知の脆弱性0件。
- 開発依存を含む監査: minimatch に関係する中程度の指摘10件（依存元を含む）。
  ESLint / typescript-eslint の現行安定版が要求する10系に修正版がなく、
  11系にはAPIの削除があるため、強制上書きや `npm audit fix --force` は適用していません。
  これは開発ツールの依存であり、サーバーの実行時依存には含まれません。ツール側の対応版が出た時点で更新してください。
  詳細: [勧告](https://github.com/advisories/GHSA-g3hv-75wg-m249) /
  [minimatch公式変更履歴](https://github.com/isaacs/minimatch/blob/main/changelog.md)。

## 設定と秘密情報

現段階ではAPIキーも環境変数も必要ありません。
将来必要になったら、ルートに `.env` を作成してください。サーバーの開発・ビルド後の起動コマンドは
Node標準の `--env-file-if-exists=.env` で読み込むため、dotenvは不要です。
秘密の値はコミットせず、変数名・説明のみ `.env.example` に記載します。
**LLMのAPIキーをclientのコードや `VITE_` で始まる変数に入れないでください。**
Viteは `VITE_` 付きの値をブラウザに公開します。
また、Viteのrootは `client/` なので、フロント専用の非秘密設定を後で使う場合は `client/.env.local` に置きます。
将来のローカルDBはGit管理外の `data/` に置く方針です。現時点ではディレクトリ・DBファイルとも作成していません。
Expressの `X-Powered-By` ヘッダーは無効にしています。

## 参照した公式資料

公式サイトの本文は、公式GitHubリポジトリで公開されている資料を確認しました。
バージョンと互換性は npm registry の `latest`、`engines`、`peerDependencies` も照合しています。

- [React: Build a React app from Scratch](https://github.com/reactjs/react.dev/blob/main/src/content/learn/build-a-react-app-from-scratch.md)
- [Vite: Getting Started](https://github.com/vitejs/vite/blob/main/docs/guide/index.md)
- [Express: 公式README（インストール・最小構成）](https://github.com/expressjs/express/blob/master/Readme.md)
- [TypeScript: Module reference](https://github.com/microsoft/TypeScript-Website/blob/v2/packages/documentation/copy/en/modules-reference/Reference.md)
- [typescript-eslint: Quickstart](https://github.com/typescript-eslint/typescript-eslint/blob/main/docs/getting-started/Quickstart.mdx)
- [Node.js: Release schedule](https://github.com/nodejs/Release/blob/main/schedule.json)
- [Node 24: SQLite（Stability 1.2 / Release candidate）](https://github.com/nodejs/node/blob/v24.22.1/doc/api/sqlite.md)

Node標準のSQLite APIも検討しましたが、採用Node版ではRelease candidateであり、今はDB操作が不要なため利用していません。

## 最初の学習課題

まず `client/src/App.tsx` を変更して、入力した文章をReactのstateだけで保持し、表示するところから始めてください。
この段階ではDBやLLM接続を使わず、入力・state・表示の関係を学べます。

**ここから先は学習者本人が実装する範囲です。**
文章CRUD、SQLiteのスキーマ設計と読み書き、LLM接続、テーマ・テンションの指定、生成結果の編集・保存は未実装です。
