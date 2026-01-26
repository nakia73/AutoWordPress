// Argo Note - Inngest Webhook Route
// Handles all Inngest function invocations

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import {
  provisionBlog,
  analyzeProduct,
  generateArticle,
  syncWordPress,
  executeSchedule,
  scheduleCron,
  triggerScheduleManually,
} from '@/lib/inngest/functions';

// Export the Inngest serve handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    provisionBlog,
    analyzeProduct,
    generateArticle,
    syncWordPress,
    executeSchedule,
    scheduleCron,
    triggerScheduleManually,
  ],
});
