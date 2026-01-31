'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
      // テキストエリアの高さをリセット
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, onSend, disabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter で送信、Shift+Enter で改行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Escape でクリア
    if (e.key === 'Escape') {
      setMessage('');
    }
  }, [handleSend]);

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 高さを自動調整（最大5行）
      textarea.style.height = 'auto';
      const maxHeight = 5 * 24; // 5行 × 24px (line-height)
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    }
  }, []);

  return (
    <div className="p-4 border-t border-sidebar-border">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm',
              'focus:outline-none focus:ring-1 focus:ring-ring',
              'placeholder:text-muted-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'max-h-[120px]'
            )}
          />
        </div>
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Enter で送信 / Shift+Enter で改行
      </p>
    </div>
  );
}
