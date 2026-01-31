'use client';

import { Sparkles, FileText, List, Globe, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/lib/hooks';

const suggestions = [
  {
    icon: FileText,
    text: 'AIについて記事を書いて',
    description: '最新のAI技術に関する記事を生成',
  },
  {
    icon: List,
    text: '投稿一覧を見せて',
    description: 'WordPressの投稿一覧を表示',
  },
  {
    icon: Globe,
    text: 'サイトのプレビューを表示',
    description: 'サイトの現在の状態を確認',
  },
  {
    icon: Settings,
    text: '設定を確認したい',
    description: 'サイト設定を確認・変更',
  },
];

export function WelcomeView() {
  const { sendMessage, isStreaming } = useChat();

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* アイコン */}
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>

        {/* メッセージ */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          何かお手伝いしましょうか？
        </h2>
        <p className="text-muted-foreground mb-8">
          左のチャットで指示を入力するか、以下の操作例をクリックしてください
        </p>

        {/* 操作例 */}
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.text}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => sendMessage(suggestion.text)}
              disabled={isStreaming}
            >
              <suggestion.icon className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <div className="font-medium">{suggestion.text}</div>
                <div className="text-xs text-muted-foreground">
                  {suggestion.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
