# TaskMaster Usage Guide

## Enhanced Pomodoro Timer with Task Integration

TaskMaster has been enhanced to provide seamless integration between Pomodoro sessions and task management. Here's how to use the new features:

### 🍅 Enhanced Pomodoro Timer Features

#### Task Selection for Work Sessions
1. On the main timer page (`/`), when in **Focus Time** mode, you'll see a task selection dropdown
2. Choose a specific task to work on during your Pomodoro session
3. The timer will display the selected task title and show progress (completed/estimated pomodoros)
4. When the work session completes, the task's completed pomodoros will automatically increment

#### Automatic Task Progress
- Work sessions automatically update the associated task's `completedPomodoros` count
- Tasks are automatically marked as "done" when completed pomodoros reach the estimated amount
- All session data is logged to n8n webhooks (if configured)

#### Session Tracking
- All completed sessions are tracked locally
- Today's session count is displayed below the timer
- Session history includes task association, duration, and timestamps

### 📊 Productivity Dashboard

Navigate to the Dashboard page and click the **Stats** tab to view:

#### Focus Session Analytics
- **Today's Sessions**: Total sessions completed today (work + breaks)
- **Focus Time Today**: Total time spent in work sessions (hours and minutes)
- **This Week**: Work sessions completed in the last 7 days
- **Daily Average**: Average sessions per day over the last week

#### Task Management Insights
- **Total Tasks**: Overview of all tasks with completion status
- **Completion Rate**: Percentage of tasks marked as complete
- **Pomodoro Progress**: Completed vs estimated pomodoro sessions across all tasks
- **Backlog**: Number of tasks waiting to be started

#### Recent Activity
- Timeline of recent Pomodoro sessions
- Shows task association, session type, duration, and completion time
- Color-coded by session type (work vs breaks)

### 🎯 Task Management Integration

#### Creating Tasks with Pomodoro Estimates
1. Use the "Add Task" button in any view (List, Kanban, Calendar)
2. Set the **Estimated Pomodoros** field when creating tasks
3. This helps with planning and tracking progress

#### Viewing Task Progress
- In all task views, you can see the pomodoro progress: `(completed/estimated)`
- Tasks automatically move to "Done" status when pomodoro target is reached
- Use the Kanban view to visualize workflow: Backlog → Doing → Done

### 🔗 n8n Integration for Session Logging

The enhanced system logs detailed session data to n8n:

#### Session Log Payload
```json
{
  "task": "Task title or 'No task selected'",
  "type": "work|shortBreak|longBreak", 
  "duration": 1500,  // seconds
  "timestamp": "2025-07-06T15:30:00.000Z",
  "notes": "Optional session notes"
}
```

#### Recommended n8n Workflow
1. **Webhook Trigger** → Receives session data
2. **Google Sheets** → Logs to a "Sessions" sheet with columns:
   - `id`, `task`, `type`, `duration`, `timestamp`, `notes`
3. **Optional**: Send Slack/email notifications for completed work sessions

### 🚀 Productivity Tips

#### Effective Workflow
1. **Plan**: Create tasks with realistic pomodoro estimates
2. **Focus**: Select a specific task before starting work sessions
3. **Track**: Review the Stats dashboard to identify patterns
4. **Adjust**: Use insights to improve time estimates and work habits

#### Best Practices
- Start each work session by selecting a task
- Take the suggested breaks between work sessions
- Review your daily stats to celebrate progress
- Adjust estimated pomodoros based on actual completion data

### 📱 Mobile Experience

The enhanced TaskMaster maintains full mobile responsiveness:
- Task selection dropdown works on touch devices
- Stats dashboard adapts to smaller screens
- Timer controls remain accessible and touch-friendly

---

**Ready to boost your productivity?** Start by creating a few tasks with pomodoro estimates, then begin your first focused work session!
