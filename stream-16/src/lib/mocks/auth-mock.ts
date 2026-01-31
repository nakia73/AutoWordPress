// 認証モック - スタンドアロン動作用

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export const mockUser: MockUser = {
  id: 'mock-user-1',
  email: 'demo@argonote.ai',
  name: 'Demo User',
  avatarUrl: undefined, // アバターなし（イニシャル表示）
};

export const mockAuth = {
  getUser: (): Promise<MockUser> => {
    return Promise.resolve(mockUser);
  },

  isAuthenticated: (): boolean => {
    return true;
  },

  signOut: (): Promise<void> => {
    console.log('[Mock] Sign out');
    return Promise.resolve();
  },
};
