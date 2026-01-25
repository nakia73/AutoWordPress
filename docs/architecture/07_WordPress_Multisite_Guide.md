# WordPress Multisite 実装ガイド

> **サービス名:** Argo Note
> **関連ドキュメント:** [マスターアーキテクチャ](./00_Master_Architecture.md) | [インフラ仕様](./03_Infrastructure_Ops.md) | [Multisite実装可能性調査](./06_Multisite_feasibility.md)
> **実装フェーズ:** [Phase 1: Infrastructure + Auth](../phases/Phase1_Infrastructure.md)

---

## 1. WordPress Multisiteとは

### 1.1 基本概念

WordPress Multisiteは**「1つのWordPressコアで、複数のWordPressサイトを一元管理する仕組み」**です。

```
通常のWordPress:
  1インストール = 1サイト
  DB = 1サイト専用
  ユーザー・テーマ・プラグイン = サイト単位

WordPress Multisite:
  1インストール = 複数サイト
  WordPressコア = 1つ
  DB = 共有（テーブルはサイトごとに自動分割）
  管理構造 = 階層化
```

**イメージ:** 「OSは1つ、仮想マシンが大量にぶら下がっている」構造に近い。

### 1.2 Argo Noteでの採用理由

| 観点 | Docker構成 | Multisite構成 |
|------|-----------|---------------|
| リソース効率 | 低（50MB × N） | **高**（共有メモリ） |
| 保守・更新 | N回実行 | **1回で全適用** |
| 構築速度 | 30-60秒 | **0.1秒以下** |
| 運用コスト | 高 | **低** |

**結論:** MVP期限（1ヶ月）と予算（$100/月）の制約下で、Multisiteが最適解。

---

## 2. プラットフォーム構造

### 2.1 全体アーキテクチャ

```
Argo Note（プラットフォーマー）
 └ WordPress Multisite（1インストール）
    ├ user-a.argonote.app（ユーザーA）
    ├ user-b.argonote.app（ユーザーB）
    ├ user-c.argonote.app（ユーザーC）
    └ ...
```

### 2.2 ユーザー登録フロー

1. ユーザーがArgo Noteに登録
2. ボタン押下でWordPressサイト生成
3. Multisite APIで新サイト作成
4. 管理ユーザー紐付け
5. サブドメイン自動割当

**所要時間:** 0.1秒以下

---

## 3. ドメイン戦略

### 3.1 初期提供：サブドメイン方式

```
user-a.argonote.app
user-b.argonote.app
user-c.argonote.app
```

**技術実装:**
- DNSで `*.argonote.app` をWordPressサーバーに向ける
- Multisiteをサブドメイン方式で構成
- 新規ユーザー登録時にサブドメイン自動割当

**業界標準:** Shopify / Notion / Webflow と同じ構造

### 3.2 SEOとサブドメインの関係

**Googleの公式スタンス:**
- サブドメインは「別サイトとして扱われる場合が多い」
- ただし親ドメインの影響を完全には切り離せない

**実務的現実:**
- `user-a.argonote.app` は `argonote.app` の評価・ペナルティを部分的に共有
- プラットフォーム全体の品質がSEOに影響

**結論:** 本気でSEOをやるユーザーは「独自ドメイン」を求める（自然な流れ）

### 3.3 独自ドメイン対応（Domain Mapping）

**対応可否:** ✅ 可能（ただし設計が重要）

**仕組み:**
```
初期状態:
  user-a.argonote.app
      ↓（Domain Mapping設定）
独自ドメイン適用後:
  www.user-domain.com
```

**技術的流れ:**
1. ユーザーがDNSでAレコード or CNAMEを設定
2. Argo Note側でドメインを特定サイトIDに紐付け
3. WordPressがURLを置き換えて配信

**中身は同じサイト、入口ドメインだけが変わる**

### 3.4 SEO評価の引き継ぎ

**条件付きで可能:**

| 要素 | 対応内容 |
|------|----------|
| canonical | 独自ドメインに切替 |
| 301リダイレクト | 旧URLから新URLへ |
| sitemap | 独自ドメインで再生成 |
| Search Console | 再登録 |

**ベストケース:** 初期段階からcanonical・内部リンク・sitemapを正しく設計していれば、SEO評価をほぼそのまま引き継げる

### 3.5 ダメな設計パターン

| パターン | 問題 |
|----------|------|
| 完全別サイトとして再作成 | SEOほぼリセット |
| サブドメインと独自ドメイン併存（canonical未設定） | 重複コンテンツで評価低下 |

### 3.6 課金戦略との連携

| フェーズ | 提供内容 | 課金 |
|----------|----------|------|
| 初期 | `user.argonote.app` | 基本プラン |
| 中級 | 独自ドメイン接続 | **有料オプション** |
| 上級 | 完全SEO運用向け設定 | 上位プラン |

**独自ドメイン対応が有料の理由:**
- サポート工数増加
- SSL証明書管理
- DNSトラブル対応
- SEO責任範囲の拡大

---

## 4. セキュリティ設計

### 4.1 構造的リスクの認識

**Multisiteの本質:**
- WordPressコア: 1つ
- PHP実行環境: 1つ
- DB: 1つ
- ファイルシステム: 1つ

**これは「アプリケーションレベルのマルチテナント」**
（OSやコンテナでは分離されていない）

| 項目 | Multisite | Docker分離 |
|------|-----------|------------|
| PHPプロセス | 共有 | 分離 |
| ファイル | 共有 | 分離 |
| DB | 共有 | 分離 |
| 侵害時影響 | **横断的** | 局所的 |

**重要:** 1点突破 = 全体影響 という設計であることを認識する

### 4.2 想定される脅威

| リスク | 攻撃経路 | 影響範囲 |
|--------|----------|----------|
| プラグイン脆弱性 | 脆弱プラグイン → PHPコード実行 | 全サイト |
| ファイルアップロード | 悪意あるPHP/JS混入 | 他サイトファイルアクセス |
| SQLインジェクション | DB横断アクセス | 他ユーザーデータ流出 |
| DoS/リソース枯渇 | 無限ループ・重いクエリ | 全サイト速度低下 |
| 管理者権限事故 | network権限の誤付与 | 全体崩壊 |

### 4.3 防御策（レイヤー別）

#### レイヤー1: 権限設計（最重要）

```php
// 絶対ルール
ユーザー権限 = site admin まで
network admin = 100%自社のみ

// 禁止事項（ユーザーに許可しない）
- プラグイン追加
- テーマ追加
- PHP編集
- FTP/SFTP
```

**SaaS = 自由を与えない**

#### レイヤー2: プラグイン戦略

| ルール | 内容 |
|--------|------|
| 採用基準 | 自社検証済みのみ |
| チェック項目 | 更新頻度・メンテ状況 |
| 更新 | 自動更新ON |

**脆弱性の90%以上はプラグイン起因**

#### レイヤー3: ファイルシステム制御

```php
// wp-config.php
define('DISALLOW_FILE_EDIT', true);   // エディタ無効化
define('DISALLOW_FILE_MODS', true);   // ファイル変更禁止

// サーバー設定
- wp-config.php 書き込み不可
- uploadsディレクトリでPHP実行禁止
```

#### レイヤー4: WAF（Web Application Firewall）

**防御対象:**
- SQLインジェクション（SQLi）
- クロスサイトスクリプティング（XSS）
- リモートコード実行（RCE）
- Bot攻撃

**推奨:** Cloudflare WAF（既存インフラと統合）

#### レイヤー5: リソース制限

| 設定 | 目的 |
|------|------|
| PHP-FPM制限 | プロセス数・メモリ制限 |
| クエリ制限 | 長時間クエリの強制終了 |
| レートリミット | 過剰リクエストの遮断 |

**目的:** 1ユーザーで全体を落とさせない

#### レイヤー6: バックアップ & リカバリ

| 種類 | 頻度 | 保持期間 |
|------|------|----------|
| フルバックアップ | 毎日 | 7日間 |
| 差分バックアップ | 毎時 | 24時間 |
| 即時ロールバック | 常時待機 | - |

**侵害 = 即復旧できる体制**

### 4.4 構造的限界の認識

**どれだけ対策しても残る制約:**
- 「1 WordPress = 1障害ドメイン」
- Dockerのような OS分離・プロセス完全分離 は不可能

**これは設計思想の違い**（トレードオフとして受け入れる）

### 4.5 Multisite vs Docker: 選択基準

| 観点 | Multisite | Docker分離 |
|------|-----------|------------|
| セキュリティ | △ | ◎ |
| スケール | ◎ | △ |
| 運用コスト | ◎ | ❌ |
| 自動化 | ◎ | △ |
| 障害分離 | ❌ | ◎ |

**Multisiteを選ぶべきケース:**
- ユーザーに自由を与えない
- SEO・コンテンツ生成が主目的
- 高速にスケールしたい
- 制限付きSaaSモデル

**Docker分離を選ぶべきケース:**
- ユーザーが開発者
- プラグイン自由
- 法人向け厳格SLA
- 責任分界点が厳密

---

## 5. スケーリング戦略

### 5.1 段階的拡張計画

| フェーズ | サイト数 | インフラ |
|----------|----------|----------|
| MVP | ~100 | 単一VPS |
| Growth | ~500 | VPS強化 + Redis |
| Scale | ~1000+ | 読み取りレプリカ |
| Enterprise | 無制限 | クラスタ構成 |

### 5.2 100サイトの根拠

**単一VPS（4GB RAM）での現実的上限:**
- WordPress Multisite + Redis Object Cache
- 平均的なトラフィック想定
- 適切なキャッシュ設定

詳細は [03_Infrastructure_Ops.md](./03_Infrastructure_Ops.md) を参照

---

## 6. Exit Strategy（データ可搬性）

### 6.1 ユーザーがサービスを離れる場合

| 方法 | 内容 |
|------|------|
| XMLエクスポート | 標準機能で記事・画像・コメント出力 |
| Migrationプラグイン | All-in-One WP Migration等で完全移行 |
| API経由 | REST APIでデータ取得 |

### 6.2 ロックイン回避の設計

**原則:**
- 課金停止後もブログは表示し続ける
- データエクスポートは常に可能
- 標準フォーマット（XML）での出力

詳細は [06_Multisite_feasibility.md](./06_Multisite_feasibility.md) を参照

---

## 7. 技術要件サマリー

### 7.1 必須コンポーネント

- [ ] WordPress Multisite（サブドメイン型）
- [ ] ドメインマッピング機構
- [ ] SSL（SNI対応・Let's Encrypt）
- [ ] WAF（Cloudflare）
- [ ] Redis Object Cache
- [ ] 自動バックアップ

### 7.2 URL・SEO関連

- [ ] canonical制御
- [ ] 301リダイレクト機構
- [ ] sitemap自動生成
- [ ] robots.txt管理

### 7.3 管理UI

- [ ] ユーザー向けサイト管理画面
- [ ] 独自ドメイン設定UI
- [ ] DNS設定ガイド

---

## 8. 用語集

| 用語 | 説明 |
|------|------|
| WordPress Multisite | 1つのWordPressで複数サイトを運営できる公式機能 |
| サブドメイン | `user.example.com` のようなURL形式 |
| 独自ドメイン | ユーザー自身が取得した `example.com` |
| Domain Mapping | 1つのサイトに複数ドメインを割り当てる技術 |
| canonical | 検索エンジンに「正規URL」を伝える指定 |
| 301リダイレクト | 恒久的なURL転送（SEO評価を引き継ぐ） |
| WAF | Web Application Firewall（Webアプリケーションファイアウォール） |
| マルチテナント | 1つのシステムで複数の顧客を収容する設計 |

---

## 9. 関連ドキュメント

- [00_Master_Architecture.md](./00_Master_Architecture.md) - 全体アーキテクチャ
- [03_Infrastructure_Ops.md](./03_Infrastructure_Ops.md) - インフラ詳細設計
- [06_Multisite_feasibility.md](./06_Multisite_feasibility.md) - 採用決定の経緯
- [Phase 1: Infrastructure](../phases/Phase1_Infrastructure.md) - 実装フェーズ
- [Phase 8: Custom Domain](../phases/Phase8_CustomDomain.md) - 独自ドメイン機能
