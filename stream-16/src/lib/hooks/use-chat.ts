'use client';

import { useCallback } from 'react';
import { useChatStore, useFocusStore } from '@/lib/stores';
import { mockChat } from '@/lib/mocks';

/**
 * チャット機能を提供するカスタムフック
 * ChatPanel, WelcomeView など複数のコンポーネントから使用可能
 */
export function useChat() {
  const { addMessage, setStreaming, isStreaming } = useChatStore();
  const { setFocus } = useFocusStore();

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isStreaming) return;

    // ユーザーメッセージを追加
    addMessage({
      role: 'user',
      content: message,
    });

    // ストリーミング開始
    setStreaming(true);

    try {
      // モックレスポンスを取得
      const response = await mockChat(message);

      // AIレスポンスを追加
      addMessage({
        role: 'assistant',
        content: response.content,
        metadata: {
          focusChange: response.focusChange,
          actionTaken: response.actionTaken,
        },
      });

      // フォーカス変更があれば適用
      if (response.focusChange) {
        setFocus(response.focusChange);
      }
    } catch (error) {
      // エラーメッセージを追加
      addMessage({
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
        metadata: { isError: true },
      });
    } finally {
      setStreaming(false);
    }
  }, [addMessage, setStreaming, setFocus, isStreaming]);

  return {
    sendMessage,
    isStreaming,
  };
}
