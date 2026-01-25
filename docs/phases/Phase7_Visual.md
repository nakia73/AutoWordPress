# Phase 7: Visual（画像自動生成）詳細仕様書

**テーマ:** Visual Appeal
**ゴール:** AI画像生成により、記事のアイキャッチ画像を自動作成する
**前提:** Phase 5（MVP Launch）完了後、Betaフィードバックに基づき優先度決定

---

## 1. 目的

ブログ記事において、アイキャッチ画像はCTR向上・SEO効果・ブランディングに重要です。
本フェーズでAI生成により**記事内容に最適化された画像**を自動作成します。

---

## 2. 機能要件

### 2.1 画像生成フロー

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   記事生成    │────▶│  要約抽出    │────▶│ プロンプト生成│────▶│  画像生成    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │  WP投稿      │
                                                               │ (アイキャッチ) │
                                                               └──────────────┘
```

### 2.2 画像生成API候補

| API | 特徴 | コスト | 品質 |
|-----|------|--------|------|
| DALL-E 3 | 高品質、テキスト描画可能 | $0.04-0.12/枚 | ◎ |
| Stable Diffusion XL | オープンソース | インフラコストのみ | ○ |
| Midjourney API | アーティスティック | $0.01-0.05/枚 | ◎ |

**初期採用:** DALL-E 3（品質と安定性を優先）

### 2.3 ユーザー設定

| 設定項目 | オプション | デフォルト |
|---------|-----------|-----------|
| スタイル | フォトリアル / イラスト / ミニマル / 3D | イラスト |
| カラーテーマ | ブランドカラー指定 / 自動 | 自動 |
| 画像サイズ | 1200x630 / 1200x1200 / 1920x1080 | 1200x630 |
| テキストオーバーレイ | タイトル挿入 / なし | なし |

---

## 3. 技術実装

### 3.1 プロンプト生成ロジック

```typescript
// 記事内容からプロンプトを生成
async function generateImagePrompt(article: Article): Promise<string> {
  const prompt = await llm.generate({
    system: `You are an expert at creating image prompts for blog articles.
             Create a prompt for DALL-E 3 that captures the essence of the article.
             Style: ${article.settings.imageStyle}
             Color theme: ${article.settings.colorTheme}`,
    user: `Article title: ${article.title}
           Summary: ${article.summary}
           Keywords: ${article.keywords.join(', ')}`
  });
  return prompt;
}
```

### 3.2 データベーススキーマ

```sql
-- 画像設定
ALTER TABLE products ADD COLUMN image_style VARCHAR(50) DEFAULT 'illustration';
ALTER TABLE products ADD COLUMN color_theme VARCHAR(50) DEFAULT 'auto';
ALTER TABLE products ADD COLUMN image_size VARCHAR(20) DEFAULT '1200x630';

-- 生成画像履歴
CREATE TABLE generated_images (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES articles(id),
  prompt TEXT,
  image_url VARCHAR(500),
  storage_path VARCHAR(500),
  generation_time_ms INTEGER,
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 コスト管理

| プラン | 月間生成上限 | 超過時の動作 |
|--------|------------|-------------|
| Basic | 10枚 | 生成停止 |
| Pro | 50枚 | 追加課金 |
| Enterprise | 無制限 | - |

---

## 4. セキュリティ & 実用性の考慮

- **コンテンツフィルタリング:** 不適切な画像生成を防止
- **キャッシュ:** 同一プロンプトの再利用でコスト削減
- **フォールバック:** 生成失敗時はデフォルト画像を使用
- **ストレージ:** 生成画像はS3/R2に保存、WPにはURL参照

---

## 5. 成功基準

| 指標 | 目標 |
|------|------|
| 画像生成成功率 | 95%以上 |
| ユーザー満足度 | 80%以上 |
| CTR向上 | 画像なし記事と比較して20%以上 |
| 平均生成時間 | 30秒以内 |

---

## 6. 実装優先度

コスト影響があるため、プラン設計と合わせて検討。上位プランの差別化要素として位置づけ。
ユーザーの「画像を用意する手間」を解消する重要機能。
