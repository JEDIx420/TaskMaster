'use client';

import { useState } from 'react';
import { Play, Pause, RotateCcw, Settings, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTasks } from '@/hooks/useTasks';

export function PomodoroTimer() {
  const { tasks, incrementTaskPomodoros } = useTasks();
  const {
    timer,
    progress,
    toggleTimer,
    resetTimer,
    switchMode,
    setCurrentTask,
    TIMER_MODES,
    currentDisplay,
    todayWorkSessions,
  } = usePomodoro(incrementTaskPomodoros);
  const [showSettings, setShowSettings] = useState(false);

  const workTasks = tasks.filter(task => !task.completed);

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setCurrentTask(task.id, task.title);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Task Selection */}
      {timer.mode === 'work' && (
        <div className="w-full max-w-md">
          <Select
            value={timer.currentTaskId || ''}
            onValueChange={handleTaskSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a task for this session" />
            </SelectTrigger>
            <SelectContent>
              {workTasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>{task.title}</span>
                    <span className="text-xs text-text-light dark:text-dark-text">
                      ({task.completedPomodoros}/{task.estimatedPomodoros})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex space-x-2 glass-card p-2 rounded-lg">
        {Object.entries(TIMER_MODES).map(([key, mode]) => (
          <button
            key={key}
            onClick={() => switchMode(key as keyof typeof TIMER_MODES)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              timer.mode === key
                ? 'bg-primary dark:bg-dark-primary text-white shadow-lg'
                : 'text-text dark:text-dark-text hover:bg-base-1 dark:hover:bg-dark-base-1'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center">
        {/* Progress Ring */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-base-2 dark:text-dark-base-2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={`transition-all duration-1000 ${TIMER_MODES[timer.mode].color}`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <div className={`timer-display ${TIMER_MODES[timer.mode].color} text-center`}>
              {currentDisplay}
            </div>
            <div className="text-text-light dark:text-dark-text text-base sm:text-lg font-medium mt-1 sm:mt-2">
              Session {timer.session}
            </div>
            {timer.currentTaskTitle && timer.mode === 'work' && (
              <div className="text-text-light dark:text-dark-text text-xs sm:text-sm mt-1 max-w-48 sm:max-w-60 text-center truncate">
                {timer.currentTaskTitle}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="flex items-center space-x-6 text-sm text-text-light dark:text-dark-text">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>Today: {todayWorkSessions} sessions</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={toggleTimer}
          size="lg"
          className={`btn-primary ${timer.isRunning ? 'animate-pulse-glow' : ''}`}
        >
          {timer.isRunning ? (
            <Pause className="w-6 h-6 mr-2" />
          ) : (
            <Play className="w-6 h-6 mr-2" />
          )}
          {timer.isRunning ? 'Pause' : 'Start'}
        </Button>
        
        <Button onClick={resetTimer} variant="outline" size="lg" className="btn-secondary">
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="btn-secondary"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full max-w-md glass-card p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-text dark:text-dark-text">Timer Settings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-light dark:text-dark-text">Work Duration</span>
              <span className="text-sm font-medium">25 min</span>
            </div>
            <p className="text-xs text-text-light dark:text-dark-text">
              Configure durations in settings modal (coming soon)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
