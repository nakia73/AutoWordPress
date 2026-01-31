'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from './chat-message';
import { useChatStore } from '@/lib/stores';
import { Loader2 } from 'lucide-react';

export function ChatMessageList() {
  const { messages, isStreaming } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">
          メッセージを入力して<br />会話を始めましょう
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="flex gap-3 py-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div className="bg-secondary rounded-lg px-4 py-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
