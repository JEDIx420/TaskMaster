'use client';

import { PomodoroTimer } from '@/components/pomodoro-timer';

export default function Home() {
  return (
    <div className="min-h-screen bg-base-0 dark:bg-dark-base-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
}