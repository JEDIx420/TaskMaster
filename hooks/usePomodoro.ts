'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logSession } from '@/lib/n8n';

export interface PomodoroSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number; // in seconds
  completedAt?: Date;
  notes?: string;
}

interface PomodoroState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: 'work' | 'shortBreak' | 'longBreak';
  session: number;
  currentTaskId?: string;
  currentTaskTitle?: string;
}

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // after how many work sessions
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

const TIMER_MODES = {
  work: { label: 'Focus Time', color: 'text-primary dark:text-dark-primary' },
  shortBreak: { label: 'Short Break', color: 'text-green-500' },
  longBreak: { label: 'Long Break', color: 'text-blue-500' },
};

export function usePomodoro(onWorkSessionComplete?: (taskId: string) => Promise<void>) {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [timer, setTimer] = useState<PomodoroState>({
    minutes: DEFAULT_SETTINGS.workDuration,
    seconds: 0,
    isRunning: false,
    mode: 'work',
    session: 1,
  });
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          // Reset timer with new settings if not running
          if (!timer.isRunning) {
            const duration = parsed.workDuration * 60;
            setTotalSeconds(duration);          setTimer((prev: PomodoroState) => ({
            ...prev,
            minutes: Math.floor(duration / 60),
            seconds: duration % 60,
          }));
          }
        }
      } catch (error) {
        console.error('Failed to load pomodoro settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroSettings', JSON.stringify(updated));
    }
  }, [settings]);

  // Set current task for the session
  const setCurrentTask = useCallback((taskId?: string, taskTitle?: string) => {
    setTimer((prev: PomodoroState) => ({
      ...prev,
      currentTaskId: taskId,
      currentTaskTitle: taskTitle,
    }));
  }, []);

  // Get duration for current mode
  const getDuration = useCallback((mode: PomodoroState['mode']) => {
    switch (mode) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  }, [settings]);

  // Reset timer
  const resetTimer = useCallback(() => {
    const duration = getDuration(timer.mode);
    setTotalSeconds(duration);
    setTimer((prev: PomodoroState) => ({
      ...prev,
      minutes: Math.floor(duration / 60),
      seconds: duration % 60,
      isRunning: false,
    }));
  }, [timer.mode, getDuration]);

  // Switch mode
  const switchMode = useCallback((mode: PomodoroState['mode']) => {
    const duration = getDuration(mode);
    setTotalSeconds(duration);
    setTimer((prev: PomodoroState) => ({
      ...prev,
      mode,
      minutes: Math.floor(duration / 60),
      seconds: duration % 60,
      isRunning: false,
    }));
  }, [getDuration]);

  // Toggle timer
  const toggleTimer = useCallback(() => {
    setTimer((prev: PomodoroState) => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  // Handle session completion
  const completeSession = useCallback(async (notes?: string) => {
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      taskId: timer.currentTaskId,
      taskTitle: timer.currentTaskTitle,
      type: timer.mode,
      duration: totalSeconds,
      completedAt: new Date(),
      notes,
    };

    // Add to completed sessions
    setCompletedSessions((prev: PomodoroSession[]) => [session, ...prev]);

    // Log to n8n if configured
    try {
      await logSession({
        task: timer.currentTaskTitle || 'No task selected',
        type: timer.mode,
        duration: totalSeconds,
        timestamp: session.completedAt!.toISOString(),
        notes,
      });
    } catch (error) {
      console.warn('Failed to log session to n8n:', error);
    }

    // Increment task pomodoros if work session with a task
    if (timer.mode === 'work' && timer.currentTaskId && onWorkSessionComplete) {
      try {
        await onWorkSessionComplete(timer.currentTaskId);
      } catch (error) {
        console.warn('Failed to increment task pomodoros:', error);
      }
    }

    // Auto-advance to next session type
    if (timer.mode === 'work') {
      const nextMode = timer.session % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      switchMode(nextMode);
      setTimer((prev: PomodoroState) => ({ ...prev, session: prev.session + 1 }));
    } else {
      switchMode('work');
    }

    return session;
  }, [timer, totalSeconds, settings.longBreakInterval, switchMode]);

  // Timer effect
  useEffect(() => {
    if (timer.isRunning && (timer.minutes > 0 || timer.seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setTimer((prev: PomodoroState) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else {
            // Timer finished
            completeSession();
            return { ...prev, isRunning: false };
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, timer.minutes, timer.seconds, completeSession]);

  // Calculate progress
  const progress = ((totalSeconds - (timer.minutes * 60 + timer.seconds)) / totalSeconds) * 100;

  // Format time display
  const formatTime = useCallback((mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get today's sessions
  const getTodaySessions = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return completedSessions.filter((session: PomodoroSession) => {
      if (!session.completedAt) return false;
      const sessionDate = new Date(session.completedAt);
      return sessionDate >= today && sessionDate < tomorrow;
    });
  }, [completedSessions]);

  // Get sessions by task
  const getSessionsByTask = useCallback((taskId: string) => {
    return completedSessions.filter((session: PomodoroSession) => session.taskId === taskId);
  }, [completedSessions]);

  return {
    // State
    timer,
    settings,
    totalSeconds,
    progress,
    completedSessions,
    
    // Actions
    toggleTimer,
    resetTimer,
    switchMode,
    setCurrentTask,
    updateSettings,
    completeSession,
    
    // Utilities
    formatTime,
    getTodaySessions,
    getSessionsByTask,
    
    // Constants
    TIMER_MODES,
    
    // Computed
    isWorkSession: timer.mode === 'work',
    currentDisplay: formatTime(timer.minutes, timer.seconds),
    todayWorkSessions: getTodaySessions().filter((s: PomodoroSession) => s.type === 'work').length,
  };
}
