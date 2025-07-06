import { useState, useEffect } from 'react';
import { getTasks, getWebhook, safePost } from '@/lib/n8n';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  estimatedPomodoros: number;
  completedPomodoros: number;
  dueDate?: Date;
  createdAt: Date;
  completed: boolean;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for the new feature',
    status: 'doing',
    priority: 'high',
    estimatedPomodoros: 3,
    completedPomodoros: 1,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    completed: false,
  },
  {
    id: '2',
    title: 'Review code changes',
    status: 'backlog',
    priority: 'medium',
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    createdAt: new Date(),
    completed: false,
  },
  {
    id: '3',
    title: 'Update dependencies',
    status: 'done',
    priority: 'low',
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: new Date(),
    completed: true,
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if webhook is configured before attempting to fetch
      const webhookUrl = getWebhook('N8N_WEBHOOK_GET_TASKS');
      if (!webhookUrl) {
        // No webhook configured, use mock data silently
        setTasks(mockTasks);
        setLoading(false);
        return;
      }
      
      const data = await getTasks();
      const parsedTasks = Array.isArray(data) ? data.map((task: any) => ({
        ...task,
        // Ensure proper data types
        estimatedPomodoros: Number(task.estimatedPomodoros) || 1,
        completedPomodoros: Number(task.completedPomodoros) || 0,
        // Defensive defaults
        status: task.status || 'backlog',
        priority: task.priority || 'medium',
        completed: task.status === 'done' || task.completed === true,
        // Parse dates
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      })) : [];
      
      setTasks(parsedTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to fetch tasks');
      // Fallback to mock data if webhook fails
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (taskData: {
    title: string;
    description?: string;
    estimatedPomodoros?: number;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: Date;
  }) => {
    try {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskData.title,
        description: taskData.description,
        status: 'backlog',
        priority: taskData.priority || 'medium',
        estimatedPomodoros: taskData.estimatedPomodoros || 1,
        completedPomodoros: 0,
        dueDate: taskData.dueDate,
        createdAt: new Date(),
        completed: false,
      };

      // Try to post to n8n webhook
      try {
        const webhookUrl = getWebhook('N8N_WEBHOOK_ADD_TASK');
        if (webhookUrl) {
          await safePost('N8N_WEBHOOK_ADD_TASK', {
            id: newTask.id,
            title: newTask.title,
            description: newTask.description,
            status: newTask.status,
            priority: newTask.priority,
            estimatedPomodoros: newTask.estimatedPomodoros,
            completedPomodoros: newTask.completedPomodoros,
            dueDate: newTask.dueDate?.toISOString(),
            createdAt: newTask.createdAt.toISOString(),
          });
        }
      } catch (webhookError) {
        toast({
          title: 'Sync Warning',
          description: `Task created locally but failed to sync: ${webhookError instanceof Error ? webhookError.message : 'Unknown error'}`,
          variant: 'destructive',
        });
      }

      setTasks(prev => [newTask, ...prev]);
      
      // Refresh from external source to ensure consistency
      try {
        await fetchTasks();
      } catch (refreshError) {
        console.warn('Failed to refresh tasks after add:', refreshError);
      }
      
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: 'Failed to create task',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Try to post to n8n webhook
      try {
        const webhookUrl = getWebhook('N8N_WEBHOOK_UPDATE_TASK');
        if (webhookUrl) {
          await safePost('N8N_WEBHOOK_UPDATE_TASK', {
            id,
            ...updates,
            dueDate: updates.dueDate?.toISOString(),
          });
        }
      } catch (webhookError) {
        toast({
          title: 'Sync Warning',
          description: `Task updated locally but failed to sync: ${webhookError instanceof Error ? webhookError.message : 'Unknown error'}`,
          variant: 'destructive',
        });
      }

      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      );
      
      // Refresh from external source to ensure consistency
      try {
        await fetchTasks();
      } catch (refreshError) {
        console.warn('Failed to refresh tasks after update:', refreshError);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: 'Failed to update task',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Try to post to n8n webhook
      try {
        const webhookUrl = getWebhook('N8N_WEBHOOK_DELETE_TASK');
        if (webhookUrl) {
          await safePost('N8N_WEBHOOK_DELETE_TASK', { id });
        }
      } catch (webhookError) {
        toast({
          title: 'Sync Warning',
          description: `Task deleted locally but failed to sync: ${webhookError instanceof Error ? webhookError.message : 'Unknown error'}`,
          variant: 'destructive',
        });
      }

      setTasks(prev => prev.filter(task => task.id !== id));
      
      // Refresh from external source to ensure consistency
      try {
        await fetchTasks();
      } catch (refreshError) {
        console.warn('Failed to refresh tasks after delete:', refreshError);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast({
        title: 'Failed to delete task',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { 
        completed: !task.completed,
        status: !task.completed ? 'done' : 'backlog'
      });
    }
  };

  const incrementTaskPomodoros = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const updatedPomodoros = task.completedPomodoros + 1;
      await updateTask(taskId, { 
        completedPomodoros: updatedPomodoros,
        // Mark as done if estimated pomodoros are completed
        ...(updatedPomodoros >= task.estimatedPomodoros ? { 
          status: 'done' as const, 
          completed: true 
        } : {})
      });
    } catch (err) {
      console.error('Failed to increment task pomodoros:', err);
      throw err;
    }
  };

  const getTask = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    incrementTaskPomodoros,
    getTask,
    refetch: fetchTasks,
  };
}