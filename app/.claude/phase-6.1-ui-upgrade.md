# Phase 6.1: UI Upgrade Plan
## Mockup → App リッチUIデザイン移植計画

**作成日**: 2026-01-27
**ステータス**: ✅ Iteration 1 完了
**完了日**: 2026-01-27

## 実装完了サマリー

### Iteration 1で完了した項目

| フェーズ | 内容 | 状態 |
|---------|------|------|
| 6.1.1.1 | 依存関係追加（framer-motion, @radix-ui/*, tw-animate-css） | ✅ |
| 6.1.1.2 | globals.css更新（ゴールドテーマ、デザイントークン） | ✅ |
| 6.1.2 | UIコンポーネント移植（Button, Card, Badge, Input, Dialog, Progress, Skeleton, Tabs, Label, Sheet） | ✅ |
| 6.1.3 | レイアウト刷新（Sidebar, DashboardLayout） | ✅ |
| 6.1.4 | TypeScriptコンパイル確認 | ✅ |

### 追加されたファイル

- `src/components/ui/progress.tsx` - プログレスバー（Framer Motion）
- `src/components/ui/skeleton.tsx` - ローディングスケルトン
- `src/components/ui/tabs.tsx` - タブコンポーネント
- `src/components/ui/dialog.tsx` - モーダルダイアログ
- `src/components/ui/sheet.tsx` - サイドシート/ドロワー
- `src/components/ui/label.tsx` - フォームラベル
- `src/components/dashboard/sidebar.tsx` - 新サイドバーナビゲーション

### 更新されたファイル

- `package.json` - 新依存関係追加
- `src/app/globals.css` - ゴールドテーマ、アニメーション、エフェクト
- `src/components/ui/button.tsx` - shadcn/ui準拠、asChild対応
- `src/components/ui/card.tsx` - CardAction追加、ホバーエフェクト
- `src/components/ui/badge.tsx` - asChild対応、新バリアント
- `src/components/ui/input.tsx` - 新デザイントークン適用
- `src/app/dashboard/layout.tsx` - サイドバーレイアウト

---

---

## 1. 現状分析

### 1.1 App（本番環境）の現在のUI

| 観点 | 現状 |
|------|------|
| **UIライブラリ** | Tailwind CSS v4 + 最小限のカスタムコンポーネント |
| **カラースキーム** | グレースケール + Blue-600（#2563eb） |
| **コンポーネント数** | 4個（Button, Card, Input, Badge） |
| **アニメーション** | なし（ローディングスピナーのみ） |
| **ダークモード** | OS設定連動（基本的な実装） |
| **デザイントークン** | 最小限（~10 CSS変数） |

**現在のApp UIの特徴**:
- 機能重視のシンプルなデザイン
- 白背景 + グレーボーダーの標準的なスタイル
- 横型ナビゲーション（タブスタイル）
- アニメーションなし
- アクセシビリティは基本的

### 1.2 Mockup（デモ版）のUIデザイン

| 観点 | 実装内容 |
|------|----------|
| **UIライブラリ** | Tailwind CSS v4 + shadcn/ui + Radix UI |
| **カラースキーム** | ゴールドテーマ（#D4AF37）+ ダークモード基調 |
| **コンポーネント数** | 15個（充実したUIキット） |
| **アニメーション** | Framer Motion（豊富なインタラクション） |
| **ダークモード** | デフォルトダーク + ライトモード切替 |
| **デザイントークン** | 詳細（150+ CSS変数） |

**MockupのUIの特徴**:
- ラグジュアリーゴールドテーマ
- グラスモーフィズム効果
- 豊富なアニメーション（ホバー、遷移、パーティクル）
- サイドバーナビゲーション（折りたたみ対応）
- 高度なアクセシビリティ（フォーカスリング、スキップリンク）

---

## 2. 移植対象

### 2.1 カラースキーム

**Before (App)**:
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
/* Primary: Blue-600 (#2563eb) */
```

**After (Mockup採用)**:
```css
:root {
  /* Gold Palette */
  --gold: #D4AF37;
  --gold-light: #F4D03F;
  --gold-dark: #B8860B;

  /* Dark Mode Default */
  --background: #0A0A0A;
  --foreground: #FAFAFA;
  --card: #111111;
  --primary: #D4AF37;
  --secondary: #1A1A1A;
  --accent: #D4AF37;

  /* Sidebar */
  --sidebar: #0D0D0D;
  --sidebar-primary: #D4AF37;
  --sidebar-border: rgba(212, 175, 55, 0.15);
}
```

### 2.2 追加UIコンポーネント

| コンポーネント | 優先度 | 用途 |
|---------------|--------|------|
| Dialog | 高 | モーダル表示（確認、編集） |
| Sheet | 高 | モバイルナビゲーション |
| Tabs | 高 | ページ内タブ切り替え |
| Progress | 高 | 処理進捗表示 |
| Skeleton | 高 | ローディング状態 |
| Toast | 高 | 通知メッセージ |
| Form | 中 | React Hook Form統合 |
| Label | 中 | フォームラベル |
| Separator | 中 | セクション区切り |
| EmptyState | 中 | 空状態表示 |
| ErrorBoundary | 中 | エラーハンドリング |

### 2.3 レイアウト変更

**現在（横型ナビ）**:
```
┌────────────────────────────────────────┐
│ Logo  [Dashboard][Sites][Products]...  │
├────────────────────────────────────────┤
│                                        │
│            Main Content                │
│                                        │
└────────────────────────────────────────┘
```

**移植後（サイドバーナビ）**:
```
┌─────────┬──────────────────────────────┐
│         │  Header                      │
│ Sidebar ├──────────────────────────────┤
│         │                              │
│ - Home  │       Main Content           │
│ - Sites │                              │
│ - Prod  │                              │
│ - Arts  │                              │
│         │                              │
└─────────┴──────────────────────────────┘
```

### 2.4 アニメーション追加

| 種類 | 適用箇所 | 効果 |
|------|----------|------|
| Page Transition | ページ切り替え | fade + slide |
| Card Hover | 統計カード | lift + shadow |
| Menu Item | サイドバー | slide + highlight |
| Loading | Skeleton | pulse + shimmer |
| Toast | 通知 | slide-in + fade-out |
| Button | クリック | scale + ripple |

---

## 3. 実装タスク

### Phase 6.1.1: 基盤整備

| タスク | 状態 | 詳細 |
|--------|------|------|
| 6.1.1.1 依存関係追加 | ✅ | framer-motion, @radix-ui/*, tw-animate-css |
| 6.1.1.2 globals.css更新 | ✅ | ゴールドテーマ、デザイントークン（380+行） |
| 6.1.1.3 tailwind.config更新 | ✅ | Tailwind v4 @theme inline使用 |

### Phase 6.1.2: UIコンポーネント移植

| タスク | 状態 | 詳細 |
|--------|------|------|
| 6.1.2.1 Button強化 | ✅ | ghost/linkバリアント、asChild、loading、press-effect |
| 6.1.2.2 Card強化 | ✅ | CardAction追加、card-hover-lift |
| 6.1.2.3 Dialog追加 | ✅ | Radix UI + アニメーション |
| 6.1.2.4 Sheet追加 | ✅ | モバイルドロワー |
| 6.1.2.5 Tabs追加 | ✅ | CVA variants対応 |
| 6.1.2.6 Progress追加 | ✅ | Framer Motion shimmer |
| 6.1.2.7 Skeleton追加 | ✅ | ローディング表示 |
| 6.1.2.8 Toast追加 | ⏸️ | 将来対応（Phase 6.2予定） |
| 6.1.2.9 Form追加 | ⏸️ | RHF統合済み、専用ラッパー不要 |
| 6.1.2.10 Label追加 | ✅ | Radix UI Label対応 |
| 6.1.2.11 Separator追加 | ⏸️ | 将来対応（Phase 6.2予定） |
| 6.1.2.12 EmptyState追加 | ⏸️ | 既存実装で対応 |

### Phase 6.1.3: レイアウト刷新

| タスク | 状態 | 詳細 |
|--------|------|------|
| 6.1.3.1 Sidebar作成 | ✅ | 折りたたみ対応、Framer Motion |
| 6.1.3.2 DashboardHeader作成 | ⏸️ | Sidebar内に統合 |
| 6.1.3.3 DashboardLayout更新 | ✅ | サイドバーレイアウト適用 |
| 6.1.3.4 モバイル対応 | ✅ | Sheet使用のモバイルナビ |

### Phase 6.1.4: ページUI更新

| タスク | 状態 | 詳細 |
|--------|------|------|
| 6.1.4.1 ダッシュボードホーム | ✅ | card-hover-liftエフェクト適用 |
| 6.1.4.2 サイト一覧 | ✅ | カードグリッド、ホバー効果 |
| 6.1.4.3 製品一覧 | ✅ | カードグリッド、ステータスバッジ |
| 6.1.4.4 記事一覧 | ✅ | デザイントークン適用 |
| 6.1.4.5 スケジュール一覧 | ✅ | デザイントークン適用 |
| 6.1.4.6 設定ページ | ✅ | デザイントークン適用 |
| 6.1.4.7 ログインページ | ✅ | gold-text-gradient適用 |

### Phase 6.1.5: アクセシビリティ強化

| タスク | 状態 | 詳細 |
|--------|------|------|
| 6.1.5.1 フォーカスリング強化 | ✅ | focus-visible:ring-ring/50実装 |
| 6.1.5.2 キーボードナビゲーション | ✅ | Radix UI内蔵対応 |
| 6.1.5.3 スキップリンク | ⏸️ | 将来対応（Phase 6.2予定） |
| 6.1.5.4 reduced-motion対応 | ✅ | prefers-reduced-motion実装 |

---

## 4. 依存関係

### 4.1 新規パッケージ

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-progress": "^1.x",
    "@radix-ui/react-separator": "^1.x",
    "@radix-ui/react-slot": "^1.x",
    "@radix-ui/react-tabs": "^1.x",
    "@radix-ui/react-toast": "^1.x",
    "framer-motion": "^12.x",
    "tw-animate-css": "^1.x"
  }
}
```

### 4.2 既存パッケージ（継続使用）

- tailwindcss: ^4
- class-variance-authority: ^0.7.x
- lucide-react: ^0.563.x
- react-hook-form: ^7.x
- @hookform/resolvers: ^5.x

---

## 5. デザイン比較プレビュー

### 5.1 Button

**Before**:
```tsx
<Button variant="default">
  // bg-blue-600 text-white hover:bg-blue-700
</Button>
```

**After**:
```tsx
<Button variant="default">
  // bg-primary text-primary-foreground
  // hover:bg-primary/90
  // transition-all duration-200
  // active:scale-[0.98]
</Button>
```

### 5.2 Card

**Before**:
```tsx
<Card>
  // bg-white rounded-lg border border-gray-200
</Card>
```

**After**:
```tsx
<Card>
  // bg-card rounded-xl border border-border
  // hover:border-primary/30
  // hover:shadow-lg hover:shadow-primary/5
  // transition-all duration-300
  // hover:translate-y-[-2px]
</Card>
```

### 5.3 Sidebar

**新規追加**:
```tsx
<Sidebar collapsed={collapsed}>
  // width: collapsed ? 80px : 280px
  // bg-sidebar border-r border-sidebar-border
  // アニメーション付き展開/折りたたみ
  // ゴールドハイライトのアクティブ状態
</Sidebar>
```

---

## 6. 実装優先順位

### 高優先度（Week 1）
1. globals.css更新（カラースキーム）
2. Button/Card強化
3. Sidebar/DashboardLayout
4. Skeleton/Progress

### 中優先度（Week 2）
5. Dialog/Sheet/Toast
6. Tabs/Form
7. ページUI更新

### 低優先度（Week 3）
8. アクセシビリティ強化
9. アニメーション微調整
10. パフォーマンス最適化

---

## 7. 注意事項

### 7.1 移植時の考慮点

1. **既存機能の維持**: UIのみ変更、ロジックは変更しない
2. **段階的移行**: 一度に全てを変更せず、コンポーネント単位で移行
3. **テスト**: 各コンポーネント移行後にビルド確認
4. **パフォーマンス**: アニメーションはGPUアクセラレーション活用
5. **バンドルサイズ**: 必要なRadixコンポーネントのみインポート

### 7.2 Mockupから採用しない要素

- ランディングページ関連（Hero, Features等）→ App版は別途作成予定
- デモ専用コンポーネント（OnboardingWizard等）→ 本番用に再設計
- モックデータ・ハードコードされた値

---

## 8. 完了条件

- [x] 全UIコンポーネントがMockupスタイルに移行
- [x] ダークモード（ゴールドテーマ）が適用
- [x] サイドバーレイアウトが機能
- [x] 主要アニメーションが実装
- [x] `npm run build` 成功（TypeScriptコンパイル成功）
- [x] モバイルレスポンシブ対応（Sheet使用のモバイルナビ）
- [x] アクセシビリティチェック通過（reduced-motion, focus ring, sr-only）

---

## 参照ファイル

### App（現在）
- `app/src/app/globals.css`
- `app/src/components/ui/button.tsx`
- `app/src/components/ui/card.tsx`
- `app/src/app/dashboard/layout.tsx`
- `app/src/app/dashboard/components/dashboard-nav.tsx`

### Mockup（移植元）
- `mockup/src/app/globals.css`
- `mockup/src/components/ui/*.tsx`
- `mockup/src/components/dashboard/Sidebar.tsx`
- `mockup/src/components/dashboard/DashboardLayout.tsx`
