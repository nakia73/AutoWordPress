'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Site = {
  id: string;
  slug: string;
};

const CRON_PRESETS = [
  { label: 'Daily at 9 AM', value: '0 9 * * *' },
  { label: 'Every Monday, Wednesday, Friday', value: '0 9 * * 1,3,5' },
  { label: 'Twice a week (Mon, Thu)', value: '0 9 * * 1,4' },
  { label: 'Weekly (Monday)', value: '0 9 * * 1' },
  { label: 'Custom', value: 'custom' },
];

export function NewScheduleForm({
  sites,
  defaultSiteId,
}: {
  sites: Site[];
  defaultSiteId?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    siteId: defaultSiteId || sites[0]?.id || '',
    cronPreset: '0 9 * * 1,3,5',
    customCron: '',
    articlesPerRun: '1',
    publishMode: 'draft' as 'draft' | 'publish',
    isActive: true,
  });

  const cronExpression =
    formData.cronPreset === 'custom'
      ? formData.customCron
      : formData.cronPreset;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: formData.siteId,
          cronExpression,
          articlesPerRun: parseInt(formData.articlesPerRun, 10),
          publishMode: formData.publishMode,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create schedule');
      }

      const { schedule } = await response.json();
      router.push(`/dashboard/schedules/${schedule.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="siteId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Site
        </label>
        <select
          id="siteId"
          value={formData.siteId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, siteId: e.target.value }))
          }
          className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.slug}.argonote.app
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="cronPreset"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Schedule Frequency
        </label>
        <select
          id="cronPreset"
          value={formData.cronPreset}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, cronPreset: e.target.value }))
          }
          className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CRON_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {formData.cronPreset === 'custom' && (
        <div>
          <label
            htmlFor="customCron"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Custom Cron Expression
          </label>
          <Input
            id="customCron"
            type="text"
            value={formData.customCron}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customCron: e.target.value }))
            }
            placeholder="0 9 * * 1,3,5"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: minute hour day month weekday (e.g., &quot;0 9 * * 1,3,5&quot; for Mon/Wed/Fri at 9 AM)
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="articlesPerRun"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Articles per Run
        </label>
        <Input
          id="articlesPerRun"
          type="number"
          min="1"
          max="10"
          value={formData.articlesPerRun}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, articlesPerRun: e.target.value }))
          }
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Number of articles to generate each time the schedule runs (1-10).
        </p>
      </div>

      <div>
        <label
          htmlFor="publishMode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Publish Mode
        </label>
        <select
          id="publishMode"
          value={formData.publishMode}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              publishMode: e.target.value as 'draft' | 'publish',
            }))
          }
          className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">
            Draft - Generate and save for review
          </option>
          <option value="publish">
            Publish - Automatically publish to WordPress
          </option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
          }
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Activate schedule immediately
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={isLoading}>
          {isLoading ? 'Creating...' : 'Create Schedule'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
