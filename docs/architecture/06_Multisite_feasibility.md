# WordPress Multisite (マルチサイト) 実装可能性調査

**目的:**
現在の「1クライアント = 1 Dockerコンテナ」というアーキテクチャから、より効率的で管理しやすい「WordPress Multisite」への移行の妥当性を評価し、技術的な設計を行う。

## 1. WordPress Multisite とは？

WordPressの標準機能で、**1つのWordPressインストール（1つのデータベース、1つのコードベース）で複数のサイトを作成・管理する仕組み**です。
大学、大規模メディア、SaaS型ブログサービス（WordPress.com 自体もこの仕組み）で広く利用されています。

### Docker方式 (Current) vs Multisite方式 (Proposed)

| 特徴                  | Docker Container Per Client      | WordPress Multisite                 |
| :-------------------- | :------------------------------- | :---------------------------------- |
| **アーキテクチャ**    | 独立したOS・Webサーバー・DB      | 単一のアプリ・DBで論理分割          |
| **リソース効率**      | 低 (メモリ50MB x 100 = 5GB)      | **高** (共有メモリ + キャッシュ)    |
| **保守 (Update)**     | 100回実行が必要 (またはCIで一括) | **1回で全サイト適用**               |
| **隔離性 (Security)** | 高 (他サイトに影響しない)        | 中 (プラグイン/テーマは共有)        |
| **構築速度**          | コンテナ起動 (30-60秒)           | **サイト作成 (0.1秒)**              |
| **Exit Strategy**     | コンテナ/DBをDumpして渡す        | XMLエクスポート/Migrationプラグイン |

## 2. 実装設計 (Architecture Design)

### 2.1 構成図

```mermaid
graph TD
    User[End User] --> Cloudflare
    Cloudflare -->|Reverse Proxy| Nginx[Nginx Reverse Proxy]
    Nginx -->|FastCGI| WP[WordPress Multisite Core]
    WP --> Redis[Redis Object Cache]
    WP --> DB[PostgreSQL / MySQL]

    subgraph "Logical Sites"
        SiteA[Site A (Client A)]
        SiteB[Site B (Client B)]
        SiteN[Site N (Client N)]
    end

    WP --> SiteA
    WP --> SiteB
    WP --> SiteN
```

### 2.2 ドメインマッピング (Domain Mapping)

以前はプラグインが必要でしたが、最新のWordPressでは標準機能で**「サイトごとに異なる独自ドメイン」**を割り当て可能です（Domain Mapping）。

- **Network Admin:** `network.productblog.com`
- **Site A:** `example.com/blog/` (Reverse Proxy経由)
  - 内部的には `site-a.productblog.com` として作成し、マッピングさせる。
- **Site B:** `another-client.com/news/`

### 2.3 リバースプロキシとの連携

Multisiteで最も技術的な難所となるのが、「サブディレクトリ運用（`example.com/blog/`）」のリクエストを正しく処理することです。

- **Client Side:** `example.com/blog/` -> `proxy_pass https://productblog-node1.com/`
- **WP Side:**
  - `HTTP_HOST` ヘッダーを見てサイトを判別するが、リバースプロキシ経由だと `productblog-node1.com` になってしまう可能性がある。
  - **対策:** `X-Forwarded-Host` ヘッダーを正しく設定し、`wp-config.php` でその値を読み取ってホスト判別を行うロジックを入れる。

## 3. ロックイン回避 (Exit Strategy)

「1つの巨大なWordPress」になると、解約時にデータを渡せるか（ロックインされないか）が懸念点となります。

- **Export:** 標準の「ツール > エクスポート (XML)」で記事・画像・コメントを出力可能。
- **Migration:** `All-in-One WP Migration` などのプラグインを使えば、シングルサイトとして他サーバーへ引越し可能。
- **結論:** Docker方式より手軽さは劣る（ファイル一式渡すだけではないため）が、標準機能で十分に移行可能であり、**ロックインにはならない**。

## 4. 結論 (Decision)

**GO: WordPress Multisiteを採用すべき。**

- **理由1:** MVPにおける初期構築コストとランニングコストを劇的に下げられる。
- **理由2:** 「3分でセットアップ」を「0秒（即時）」に短縮できる。
- **理由3:** バージョン管理、セキュリティパッチ適用が一元管理でき、少人数での運用に適している。
