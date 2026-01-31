'use client';

import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/lib/stores';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 py-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary/20 text-primary' : 'bg-secondary text-foreground'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-primary/10 text-foreground'
            : 'bg-secondary text-foreground'
        )}
      >
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Action Taken Badge */}
        {message.metadata?.actionTaken && (
          <div className="mt-2 text-xs text-primary">
            ✓ {message.metadata.actionTaken}
          </div>
        )}

        {/* Error Badge */}
        {message.metadata?.isError && (
          <div className="mt-2 text-xs text-destructive">
            エラーが発生しました
          </div>
        )}
      </div>
    </div>
  );
}
