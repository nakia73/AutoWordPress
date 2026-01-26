// Argo Note - Inngest Client
// For background job processing

import { Inngest } from 'inngest';

// Create a client to send and receive events
export const inngest = new Inngest({
  id: 'argo-note',
  name: 'Argo Note',
});

// Event types for type safety
export type InngestEvents = {
  'product/analyze': {
    data: {
      productId: string;
      mode: 'url' | 'interactive' | 'research';
      url?: string;
      answers?: Record<string, string>;
      keywords?: string[];
    };
  };
  'article/generate': {
    data: {
      articleId: string;
      productId: string;
      targetKeyword: string;
      clusterId?: string;
    };
  };
  'wordpress/sync': {
    data: {
      articleId: string;
      siteId: string;
      action: 'create' | 'update' | 'delete';
    };
  };
  'blog/provision': {
    data: {
      siteId: string;
      userId: string;
      subdomain: string;
      theme: string;
    };
  };
  'schedule/execute': {
    data: {
      scheduleId: string;
      scheduleJobId: string;
    };
  };
  'schedule/trigger-manual': {
    data: {
      scheduleId: string;
    };
  };
};
