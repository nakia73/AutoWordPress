'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Schedule = {
  id: string;
  isActive: boolean;
};

export function ScheduleActions({ schedule }: { schedule: Schedule }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const handleAction = async (actionType: 'toggle' | 'trigger' | 'delete') => {
    setIsLoading(true);
    setAction(actionType);

    try {
      const response = await fetch(`/api/schedules/${schedule.id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: actionType }),
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      if (actionType === 'delete') {
        router.push('/dashboard/schedules');
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => handleAction('trigger')}
        loading={isLoading && action === 'trigger'}
      >
        Run Now
      </Button>
      <Button
        variant="outline"
        onClick={() => handleAction('toggle')}
        loading={isLoading && action === 'toggle'}
      >
        {schedule.isActive ? 'Deactivate' : 'Activate'}
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          if (confirm('Are you sure you want to delete this schedule?')) {
            handleAction('delete');
          }
        }}
        loading={isLoading && action === 'delete'}
      >
        Delete
      </Button>
    </div>
  );
}
