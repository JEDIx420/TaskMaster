import { Task } from '@/hooks/useTasks';
import { PomodoroSession } from '@/hooks/usePomodoro';

export interface ProductivityData {
  tasks: Task[];
  sessions: PomodoroSession[];
  exportedAt: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalSessions: number;
    totalFocusTime: number; // in minutes
    completionRate: number;
  };
}

export function exportProductivityData(
  tasks: Task[],
  sessions: PomodoroSession[]
): ProductivityData {
  const completedTasks = tasks.filter(t => t.completed).length;
  const workSessions = sessions.filter(s => s.type === 'work');
  const totalFocusTime = workSessions.reduce((sum, session) => sum + session.duration, 0) / 60;
  
  return {
    tasks,
    sessions,
    exportedAt: new Date().toISOString(),
    stats: {
      totalTasks: tasks.length,
      completedTasks,
      totalSessions: sessions.length,
      totalFocusTime: Math.round(totalFocusTime),
      completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
    },
  };
}

export function downloadAsJSON(data: ProductivityData, filename?: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `taskmaster-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAsCSV(data: ProductivityData, filename?: string) {
  // Export tasks as CSV
  const taskHeaders = ['id', 'title', 'description', 'status', 'priority', 'estimatedPomodoros', 'completedPomodoros', 'dueDate', 'createdAt', 'completed'];
  const taskRows = data.tasks.map(task => [
    task.id,
    `"${task.title}"`,
    `"${task.description || ''}"`,
    task.status,
    task.priority,
    task.estimatedPomodoros,
    task.completedPomodoros,
    task.dueDate?.toISOString() || '',
    task.createdAt.toISOString(),
    task.completed,
  ]);
  
  const tasksCSV = [taskHeaders.join(','), ...taskRows.map(row => row.join(','))].join('\n');
  
  // Export sessions as CSV
  const sessionHeaders = ['id', 'taskId', 'taskTitle', 'type', 'duration', 'completedAt', 'notes'];
  const sessionRows = data.sessions.map(session => [
    session.id,
    session.taskId || '',
    `"${session.taskTitle || ''}"`,
    session.type,
    session.duration,
    session.completedAt?.toISOString() || '',
    `"${session.notes || ''}"`,
  ]);
  
  const sessionsCSV = [sessionHeaders.join(','), ...sessionRows.map(row => row.join(','))].join('\n');
  
  // Create combined CSV with sections
  const combinedCSV = [
    '# TaskMaster Export',
    `# Generated on: ${data.exportedAt}`,
    `# Total Tasks: ${data.stats.totalTasks}`,
    `# Completed Tasks: ${data.stats.completedTasks}`,
    `# Total Sessions: ${data.stats.totalSessions}`,
    `# Total Focus Time: ${data.stats.totalFocusTime} minutes`,
    `# Completion Rate: ${data.stats.completionRate}%`,
    '',
    '# TASKS',
    tasksCSV,
    '',
    '# SESSIONS',
    sessionsCSV,
  ].join('\n');
  
  const blob = new Blob([combinedCSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `taskmaster-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateProductivityReport(data: ProductivityData): string {
  const { stats, exportedAt } = data;
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentSessions = data.sessions.filter(s => 
    s.completedAt && new Date(s.completedAt) >= weekAgo
  );
  
  const workSessionsThisWeek = recentSessions.filter(s => s.type === 'work').length;
  const avgSessionsPerDay = Math.round(recentSessions.length / 7);
  
  const report = `
# TaskMaster Productivity Report
Generated on: ${new Date(exportedAt).toLocaleDateString()}

## Summary Statistics
- **Total Tasks**: ${stats.totalTasks}
- **Completed Tasks**: ${stats.completedTasks}
- **Completion Rate**: ${stats.completionRate}%
- **Total Focus Sessions**: ${stats.totalSessions}
- **Total Focus Time**: ${Math.floor(stats.totalFocusTime / 60)}h ${stats.totalFocusTime % 60}m

## Recent Activity (Last 7 Days)
- **Work Sessions**: ${workSessionsThisWeek}
- **Average Sessions per Day**: ${avgSessionsPerDay}

## Task Breakdown by Status
- **Backlog**: ${data.tasks.filter(t => t.status === 'backlog').length}
- **In Progress**: ${data.tasks.filter(t => t.status === 'doing').length}
- **Completed**: ${data.tasks.filter(t => t.status === 'done').length}

## Task Breakdown by Priority
- **High Priority**: ${data.tasks.filter(t => t.priority === 'high').length}
- **Medium Priority**: ${data.tasks.filter(t => t.priority === 'medium').length}
- **Low Priority**: ${data.tasks.filter(t => t.priority === 'low').length}

---
*Generated by TaskMaster - Personal Productivity Suite*
`.trim();
  
  return report;
}
