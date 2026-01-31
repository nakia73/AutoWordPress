# セキュリティ修正タスク

> **作成日:** 2026-01-30
> **対象:** Stream02 WP-CLI コマンドインジェクション脆弱性
> **優先度:** Critical

---

## 概要

セキュリティレビューで検出されたコマンドインジェクション脆弱性の修正。
ユーザー入力がシェルコマンドに直接埋め込まれている問題を解決する。

## 影響範囲

- `stream-02/src/lib/vps/wp-cli.ts` - 複数メソッド
- `stream-02/src/lib/wordpress/client.ts` - Content-Disposition ヘッダー

---

## タスク一覧

### Critical（コマンドインジェクション対策）

- [ ] **T1**: シェルエスケープ関数の追加
  - ファイル: `stream-02/src/lib/utils/shell-escape.ts`
  - 内容: シェル特殊文字をエスケープする関数
  - 参考: `$`, `` ` ``, `"`, `'`, `\`, `;`, `|`, `&`, `(`, `)`, `<`, `>`, `\n` をエスケープ

- [ ] **T2**: 入力バリデーション関数の追加
  - ファイル: `stream-02/src/lib/utils/validation.ts`
  - 内容:
    - `validateSlug(slug)`: `^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$` または `^[a-z0-9]$`
    - `validateEmail(email)`: 標準的なメール形式
    - `validateSiteTitle(title)`: 長さ制限（1-200文字）、危険文字チェック
    - `validateThemeName(theme)`: `^[a-z0-9_-]+$`
    - `validatePluginName(plugin)`: `^[a-z0-9_-]+$`

- [ ] **T3**: `wp-cli.ts` の各メソッド修正
  - `createSite()` - エスケープ + バリデーション適用
  - `siteExists()` - エスケープ適用
  - `createApplicationPassword()` - エスケープ + バリデーション適用
  - `activateThemeForSite()` - エスケープ + バリデーション適用
  - `installTheme()` - バリデーション適用
  - `installPlugin()` - バリデーション適用
  - `updateOption()` - エスケープ適用
  - `flushRewriteRules()` - エスケープ適用

### Medium（その他の修正）

- [ ] **T4**: Content-Disposition ヘッダー修正
  - ファイル: `stream-02/src/lib/wordpress/client.ts`
  - 内容: filename をサニタイズ（`"`, `\n`, `\r` を除去）

- [ ] **T5**: ログ出力から機密情報除去
  - ファイル: `stream-02/src/lib/vps/wp-cli.ts`
  - 内容: `console.error` の出力内容をレビュー、機密情報をマスク

### 検証

- [ ] **T6**: テスト追加・実行
  - バリデーション関数のユニットテスト
  - エスケープ関数のユニットテスト
  - `npm run lint` エラーなし
  - `npm run build` 成功
  - `npm run test` 全テスト通過

---

## 完了条件

```bash
cd stream-02
npm run lint    # エラーなし
npm run build   # 成功
npm run test    # 全テスト通過
```

---

## 参考資料

- OWASP Command Injection: https://owasp.org/www-community/attacks/Command_Injection
- Node.js shell escape best practices
