'use client';

import { ChatMessageList } from './chat-message-list';
import { ChatInput } from './chat-input';
import { useChat } from '@/lib/hooks';

export function ChatPanel() {
  const { sendMessage, isStreaming } = useChat();

  return (
    <div className="flex flex-col h-full">
      <ChatMessageList />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
