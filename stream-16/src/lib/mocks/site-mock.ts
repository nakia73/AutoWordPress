// サイトモック - スタンドアロン動作用

import type { Site } from '../stores/site-store';

export const mockSites: Site[] = [
  {
    id: 'site-1',
    name: 'My Blog',
    url: 'https://myblog.example.com',
    status: 'active',
    wpVersion: '6.5',
  },
  {
    id: 'site-2',
    name: 'Tech Notes',
    url: 'https://tech.example.com',
    status: 'active',
    wpVersion: '6.5',
  },
  {
    id: 'site-3',
    name: 'New Project',
    url: 'https://newproject.example.com',
    status: 'provisioning',
  },
];

export const mockWordPressAPI = {
  getStatus: (siteId: string): Promise<{ connected: boolean; version: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ connected: true, version: '6.5' });
      }, 300);
    });
  },

  testConnection: (siteId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  },
};
