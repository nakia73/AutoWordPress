# Phase 10: GSC Integration（Google Search Console連携・自律改善）

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [AIパイプライン仕様](../architecture/04_AI_Pipeline.md) | [Phase 15: Prompt Intelligence](./Phase15_PromptIntelligence.md)
> **前のフェーズ:** [← Phase 9: SSO](./Phase9_SSO.md) | **次のフェーズ:** [Phase 11: Headless Evaluation →](./Phase11_HeadlessEvaluation.md)

**テーマ:** Autonomous Optimization
**ゴール:** Google Search Console APIと連携し、AIが自律的に記事を改善する仕組みを構築
**前提:** Phase 6（MVP Launch）完了後、十分なデータ蓄積後に実装

---

## 1. 目的

記事を書いて終わりではなく、**「成果の出る記事を残し、出ない記事を改善する」**ことが本質的に重要です。

**第一原理:**
- 表示回数が多いがクリックされない → タイトル/メタの問題
- クリックされるが直帰率が高い → コンテンツの問題
- 検索順位が低い → SEO構造の問題

これらをAIが**自動で検出し、改善提案・実行**します。

---

## 2. 機能要件

### 2.1 GSC連携データ

| データ | 用途 |
|--------|------|
| 検索クエリ | どんなキーワードで表示されているか |
| 表示回数 | 潜在的なトラフィック |
| クリック数 | 実際のトラフィック |
| CTR | クリック率（タイトルの魅力度） |
| 掲載順位 | SEO効果の指標 |

### 2.2 AIによる自律的リライト

| 要素 | 改善方法 |
|------|---------|
| タイトル | より魅力的なタイトルをAIが提案 |
| メタディスクリプション | クリックを誘導する文言に改善 |
| 見出し構造 | 検索意図に沿った構成に最適化 |

### 2.3 自動化レベル

| レベル | 動作 |
|--------|------|
| 手動 | 改善提案を表示するのみ |
| 承認制 | 改善案生成後、ユーザー承認で適用 |
| 完全自動 | AIが判断して自動リライト |

---

## 3. 成功基準

- GSC連携成功率 99%以上
- 改善適用後のCTR向上 平均20%
- ユーザー満足度 80%以上

---

## 4. 実装優先度

十分なトラフィックデータ蓄積後に意味を持つ機能。上位プランの目玉機能として検討。

---

## 5. Phase 15（Prompt Intelligence）との連携

本フェーズで取得するGSCデータは、**Phase 15: Prompt Intelligence** の基盤データとなります。

**データ連携フロー:**

```
GSC API → article_performance_metrics → Prompt Intelligence分析
```

**連携内容:**

| GSCデータ | Phase 15での活用 |
|-----------|-----------------|
| インプレッション | プロンプト効果スコア（PES）算出 |
| クリック | 成功パターン特定 |
| CTR | タイトル生成プロンプトの評価 |
| 平均順位 | SEO効果測定 |

**詳細:** [Phase 15: Prompt Intelligence](./Phase15_PromptIntelligence.md)
