'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, Target, TrendingUp, CheckCircle, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/useTasks';
import { usePomodoro, PomodoroSession } from '@/hooks/usePomodoro';
import { exportProductivityData, downloadAsJSON, downloadAsCSV } from '@/lib/export';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
}

function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-text-light dark:text-dark-text mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center space-x-1 mt-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500">{trend.value}% {trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskStatsProps {
  tasks: ReturnType<typeof useTasks>['tasks'];
}

function TaskStats({ tasks }: TaskStatsProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => t.status === 'doing').length;
    const backlog = tasks.filter(t => t.status === 'backlog').length;
    
    const totalEstimated = tasks.reduce((sum, task) => sum + task.estimatedPomodoros, 0);
    const totalCompleted = tasks.reduce((sum, task) => sum + task.completedPomodoros, 0);
    
    return {
      total,
      completed,
      inProgress,
      backlog,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      pomodoroProgress: totalEstimated > 0 ? Math.round((totalCompleted / totalEstimated) * 100) : 0,
      totalEstimated,
      totalCompleted,
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Tasks"
        value={stats.total}
        description={`${stats.completed} completed, ${stats.inProgress} in progress`}
        icon={<Target className="h-4 w-4 text-text-light dark:text-dark-text" />}
      />
      <StatsCard
        title="Completion Rate"
        value={`${stats.completionRate}%`}
        description="Tasks completed"
        icon={<CheckCircle className="h-4 w-4 text-green-500" />}
      />
      <StatsCard
        title="Pomodoro Progress"
        value={`${stats.totalCompleted}/${stats.totalEstimated}`}
        description={`${stats.pomodoroProgress}% of estimated sessions`}
        icon={<Clock className="h-4 w-4 text-blue-500" />}
      />
      <StatsCard
        title="Backlog"
        value={stats.backlog}
        description="Tasks waiting to start"
        icon={<Calendar className="h-4 w-4 text-orange-500" />}
      />
    </div>
  );
}

interface SessionStatsProps {
  sessions: PomodoroSession[];
}

function SessionStats({ sessions }: SessionStatsProps) {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const week = new Date(today);
    week.setDate(week.getDate() - 7);
    
    const todaySessions = sessions.filter(s => {
      if (!s.completedAt) return false;
      const sessionDate = new Date(s.completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });
    
    const weekSessions = sessions.filter(s => {
      if (!s.completedAt) return false;
      return new Date(s.completedAt) >= week;
    });
    
    const workSessionsToday = todaySessions.filter(s => s.type === 'work').length;
    const workSessionsWeek = weekSessions.filter(s => s.type === 'work').length;
    const totalWorkTime = workSessionsToday * 25; // 25 minutes per work session
    const avgSessionsPerDay = weekSessions.length > 0 ? Math.round(weekSessions.length / 7) : 0;
    
    return {
      todayTotal: todaySessions.length,
      workSessionsToday,
      workSessionsWeek,
      totalWorkTime,
      avgSessionsPerDay,
    };
  }, [sessions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Today's Sessions"
        value={stats.todayTotal}
        description={`${stats.workSessionsToday} work sessions`}
        icon={<Clock className="h-4 w-4 text-primary dark:text-dark-primary" />}
      />
      <StatsCard
        title="Focus Time Today"
        value={`${Math.floor(stats.totalWorkTime / 60)}h ${stats.totalWorkTime % 60}m`}
        description="Time spent in work sessions"
        icon={<Target className="h-4 w-4 text-green-500" />}
      />
      <StatsCard
        title="This Week"
        value={stats.workSessionsWeek}
        description="Work sessions completed"
        icon={<Calendar className="h-4 w-4 text-blue-500" />}
      />
      <StatsCard
        title="Daily Average"
        value={stats.avgSessionsPerDay}
        description="Sessions per day (7-day avg)"
        icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
      />
    </div>
  );
}

export function StatsReportDashboard() {
  const { tasks } = useTasks();
  const { completedSessions } = usePomodoro();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  const handleExport = (format: 'json' | 'csv') => {
    const data = exportProductivityData(tasks, completedSessions);
    if (format === 'json') {
      downloadAsJSON(data);
    } else {
      downloadAsCSV(data);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text dark:text-dark-text">Productivity Dashboard</h2>
          <p className="text-text-light dark:text-dark-text">
            Track your focus sessions and task completion
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {(['today', 'week', 'month'] as const).map((period) => (
              <Badge
                key={period}
                variant={timeframe === period ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setTimeframe(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Badge>
            ))}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('json')}
            >
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
            Focus Sessions
          </h3>
          <SessionStats sessions={completedSessions} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
            Task Management
          </h3>
          <TaskStats tasks={tasks} />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest focus sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2 border-b border-base-2 dark:border-dark-base-2 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      session.type === 'work' ? 'bg-primary' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-text dark:text-dark-text">
                        {session.taskTitle || 'General Focus'}
                      </p>
                      <p className="text-xs text-text-light dark:text-dark-text">
                        {session.type === 'work' ? 'Work Session' : 
                         session.type === 'shortBreak' ? 'Short Break' : 'Long Break'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text dark:text-dark-text">
                      {Math.floor(session.duration / 60)} min
                    </p>
                    {session.completedAt && (
                      <p className="text-xs text-text-light dark:text-dark-text">
                        {new Date(session.completedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {completedSessions.length === 0 && (
                <p className="text-text-light dark:text-dark-text text-center py-4">
                  No sessions completed yet. Start your first Pomodoro!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
