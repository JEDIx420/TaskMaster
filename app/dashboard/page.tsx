'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { List, Kanban, Calendar as CalendarIcon, BarChart3, Settings } from 'lucide-react';
import { TaskListView } from '@/components/task-views/task-list-view';
import { TaskKanbanView } from '@/components/task-views/task-kanban-view';
import { TaskCalendarView } from '@/components/task-views/task-calendar-view';
import { StatsReportDashboard } from '@/components/stats-report-dashboard';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { useTaskModal } from '@/hooks/useTaskModal';
import { useTasks, Task } from '@/hooks/useTasks';
import { getWebhook } from '@/lib/n8n';
import { Button } from '@/components/ui/button';

type ViewType = 'list' | 'kanban' | 'calendar' | 'stats';

const views = [
  { id: 'list' as const, name: 'List', icon: List },
  { id: 'kanban' as const, name: 'Kanban', icon: Kanban },
  { id: 'calendar' as const, name: 'Calendar', icon: CalendarIcon },
  { id: 'stats' as const, name: 'Stats', icon: BarChart3 },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedView, setSelectedView] = useState<ViewType>('list');
  const { tasks, updateTask } = useTasks();
  const { selectedTask, isOpen, openTask, closeTask } = useTaskModal();

  // Check if essential webhooks are configured
  const hasWebhooksConfigured = () => {
    return getWebhook('N8N_WEBHOOK_GET_TASKS') || getWebhook('N8N_WEBHOOK_ADD_TASK');
  };

  const openSettings = () => {
    // Trigger settings modal - this would need to be implemented via context or state management
    window.dispatchEvent(new CustomEvent('openSettings'));
  };

  useEffect(() => {
    const view = searchParams.get('view') as ViewType;
    if (view && views.some(v => v.id === view)) {
      setSelectedView(view);
    }
  }, [searchParams]);

  const handleViewChange = (index: number) => {
    const view = views[index];
    setSelectedView(view.id);
    
    // Update URL without page reload
    const params = new URLSearchParams(searchParams);
    params.set('view', view.id);
    router.push(`/dashboard?${params.toString()}`, { scroll: false });
  };

  const handleSaveTask = async (taskPatch: Partial<Task>) => {
    if (!selectedTask) return;
    await updateTask(selectedTask.id, taskPatch);
  };

  const selectedIndex = views.findIndex(v => v.id === selectedView);

  return (
    <div className="min-h-screen bg-base-0 dark:bg-dark-base-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text dark:text-dark-text mb-2">
            Task Dashboard
          </h1>
          <p className="text-text-light dark:text-dark-text">
            Manage your tasks and track your productivity
          </p>
        </div>

        <Tab.Group selectedIndex={selectedIndex} onChange={handleViewChange}>
          <Tab.List className="flex space-x-1 rounded-xl glass-card p-1 mb-8">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <Tab
                  key={view.id}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      selected
                        ? 'bg-primary text-white shadow'
                        : 'text-text-light dark:text-dark-text hover:bg-base-1 dark:hover:bg-dark-base-1 hover:text-text dark:hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{view.name}</span>
                  </div>
                </Tab>
              );
            })}
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel className="focus:outline-none">
              {tasks.length === 0 && !hasWebhooksConfigured() ? (
                <div className="glass-card p-12 rounded-xl text-center">
                  <Settings className="w-16 h-16 text-text-light dark:text-dark-text mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                    No Webhooks Configured
                  </h3>
                  <p className="text-text-light dark:text-dark-text mb-6">
                    Connect TaskMaster to your n8n workflows to sync tasks and enable external integrations.
                  </p>
                  <Button 
                    onClick={openSettings}
                    className="btn-primary"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Webhooks
                  </Button>
                </div>
              ) : (
                <TaskListView onTaskClick={openTask} />
              )}
            </Tab.Panel>
            <Tab.Panel className="focus:outline-none">
              {tasks.length === 0 && !hasWebhooksConfigured() ? (
                <div className="glass-card p-12 rounded-xl text-center">
                  <Settings className="w-16 h-16 text-text-light dark:text-dark-text mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                    No Webhooks Configured
                  </h3>
                  <p className="text-text-light dark:text-dark-text mb-6">
                    Connect TaskMaster to your n8n workflows to sync tasks and enable external integrations.
                  </p>
                  <Button 
                    onClick={openSettings}
                    className="btn-primary"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Webhooks
                  </Button>
                </div>
              ) : (
                <TaskKanbanView onTaskClick={openTask} />
              )}
            </Tab.Panel>
            <Tab.Panel className="focus:outline-none">
              {tasks.length === 0 && !hasWebhooksConfigured() ? (
                <div className="glass-card p-12 rounded-xl text-center">
                  <Settings className="w-16 h-16 text-text-light dark:text-dark-text mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                    No Webhooks Configured
                  </h3>
                  <p className="text-text-light dark:text-dark-text mb-6">
                    Connect TaskMaster to your n8n workflows to sync tasks and enable external integrations.
                  </p>
                  <Button 
                    onClick={openSettings}
                    className="btn-primary"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Webhooks
                  </Button>
                </div>
              ) : (
                <TaskCalendarView onTaskClick={openTask} />
              )}
            </Tab.Panel>
            <Tab.Panel className="focus:outline-none">
              <StatsReportDashboard />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <TaskDetailModal
          task={selectedTask}
          open={isOpen}
          onClose={closeTask}
          onSave={handleSaveTask}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-0 dark:bg-dark-base-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-text-light dark:text-dark-text">Loading dashboard...</div>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}