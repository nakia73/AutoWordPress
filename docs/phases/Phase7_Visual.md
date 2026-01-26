# Phase 7: Visual（画像自動生成）

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [AIパイプライン仕様](../architecture/04_AI_Pipeline.md)
> **前のフェーズ:** [← Phase 6: MVP Launch](./Phase6_MVPLaunch.md) | **次のフェーズ:** [Phase 8: Custom Domain →](./Phase8_CustomDomain.md)

**テーマ:** Visual Appeal
**ゴール:** AI画像生成により、記事のアイキャッチ画像を自動作成する
**前提:** Phase 6（MVP Launch）完了後、Betaフィードバックに基づき優先度決定

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

### 3.2 データベース

本フェーズで拡張・追加するテーブル：
- `products` - 画像スタイル設定を追加
- `generated_images` - 生成画像履歴

**詳細スキーマ:** [バックエンド・DB仕様書](../architecture/02_Backend_Database.md#画像生成phase-7) を参照

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

**注意:** 具体的な数値目標は設定しない（CONCEPT_DECISIONS.md J6参照）

**KPI（重要指標）:**
- 画像生成が安定して成功すること
- 生成された画像がユーザーに受け入れられること
- 画像付き記事のCTRが向上すること
- 生成処理が十分に高速であること

---

## 6. 実装優先度

コスト影響があるため、プラン設計と合わせて検討。上位プランの差別化要素として位置づけ。
ユーザーの「画像を用意する手間」を解消する重要機能。
