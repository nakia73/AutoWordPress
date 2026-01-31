// チャットモック - スタンドアロン動作用

import type { FocusTarget } from '../stores/focus-store';
import { mockArticles } from './article-mock';

interface ChatResponse {
  content: string;
  focusChange?: FocusTarget;
  actionTaken?: string;
}

// キーワードに基づいてレスポンスを生成
function generateResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();

  // 記事生成リクエスト
  if (lowerMessage.includes('記事') && (lowerMessage.includes('書いて') || lowerMessage.includes('作成') || lowerMessage.includes('生成'))) {
    return {
      content: `了解しました。記事を生成しています...

「AIの活用方法」というテーマで記事を作成しました。

## 概要
- タイトル: AIの活用方法 - 初心者向けガイド
- 文字数: 約2,500文字
- カテゴリ: テクノロジー

右側のプレビューで内容をご確認ください。修正が必要な場合はお知らせください。`,
      focusChange: {
        type: 'article',
        id: 'new-article',
        title: 'AIの活用方法 - 初心者向けガイド',
        status: 'draft',
      },
      actionTaken: '記事を生成しました',
    };
  }

  // 投稿一覧表示
  if (lowerMessage.includes('投稿') && lowerMessage.includes('一覧')) {
    return {
      content: `投稿一覧を表示します。

現在 ${mockArticles.length} 件の記事があります：
- 公開済み: ${mockArticles.filter(a => a.status === 'published').length} 件
- 下書き: ${mockArticles.filter(a => a.status === 'draft').length} 件
- レビュー待ち: ${mockArticles.filter(a => a.status === 'pending').length} 件

右側のパネルで一覧をご確認いただけます。`,
      focusChange: {
        type: 'article-list',
        title: '投稿一覧',
      },
    };
  }

  // サイトプレビュー
  if (lowerMessage.includes('サイト') && lowerMessage.includes('プレビュー')) {
    return {
      content: 'サイトのプレビューを表示します。右側のパネルでサイトの現在の状態を確認できます。',
      focusChange: {
        type: 'site-preview',
        title: 'サイトプレビュー',
      },
    };
  }

  // 設定
  if (lowerMessage.includes('設定')) {
    return {
      content: 'サイト設定を表示します。一般設定、表示設定、パーマリンク設定などを確認・変更できます。',
      focusChange: {
        type: 'site-settings',
        title: 'サイト設定',
      },
    };
  }

  // テーマ
  if (lowerMessage.includes('テーマ')) {
    return {
      content: '現在のテーマ情報を表示します。テーマの変更やカスタマイズが可能です。',
      focusChange: {
        type: 'theme',
        title: 'Twenty Twenty-Four',
      },
    };
  }

  // プラグイン
  if (lowerMessage.includes('プラグイン')) {
    return {
      content: 'インストール済みプラグインの一覧を表示します。有効化・無効化・更新の操作が可能です。',
      focusChange: {
        type: 'plugin-list',
        title: 'プラグイン一覧',
      },
    };
  }

  // デフォルトレスポンス
  return {
    content: `ご質問ありがとうございます。

以下のようなことができます：
- 「AIについて記事を書いて」- 記事を自動生成
- 「投稿一覧を見せて」- 投稿の一覧を表示
- 「サイトのプレビューを表示」- サイトを確認
- 「設定を確認したい」- サイト設定を表示

何かお手伝いできることはありますか？`,
  };
}

// ストリーミングレスポンスをシミュレート
export async function* mockChatStream(message: string): AsyncGenerator<string, ChatResponse> {
  const response = generateResponse(message);
  const content = response.content;

  // 文字を1つずつ返す（ストリーミングをシミュレート）
  for (let i = 0; i < content.length; i++) {
    yield content[i];
    // 句読点や改行の後は少し長めの遅延
    const char = content[i];
    if (char === '。' || char === '、' || char === '\n') {
      await new Promise((r) => setTimeout(r, 50));
    } else {
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  return response;
}

// 非ストリーミング版（シンプルなレスポンス）
export async function mockChat(message: string): Promise<ChatResponse> {
  // 応答遅延をシミュレート
  await new Promise((r) => setTimeout(r, 500));
  return generateResponse(message);
}
