'use client';

import { FocusBar } from '../main/focus-bar';
import { ContentDisplay } from '../main/content-display';
import { ActionBar } from '../main/action-bar';

export function MainArea() {
  return (
    <main className="flex-1 flex flex-col h-full bg-background">
      {/* Focus Bar */}
      <FocusBar />

      {/* Content Display */}
      <div className="flex-1 overflow-auto">
        <ContentDisplay />
      </div>

      {/* Action Bar */}
      <ActionBar />
    </main>
  );
}
