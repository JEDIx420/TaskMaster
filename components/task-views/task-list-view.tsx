'use client';

import { useState } from 'react';
import { Plus, Check, Trash2, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTasks, Task } from '@/hooks/useTasks';
import { TaskModal } from '@/components/task-modal';

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function TaskListView({ onTaskClick }: { onTaskClick?: (task: Task) => void }) {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async (taskData: {
    title: string;
    description?: string;
    estimatedPomodoros: number;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
  }) => {
    setIsCreating(true);
    try {
      await addTask(taskData);
    } finally {
      setIsCreating(false);
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-light dark:text-dark-text">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Task Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text dark:text-dark-text">
          Task List
        </h3>
        <Button 
          onClick={() => setShowTaskModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="glass-card p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
            Active Tasks ({activeTasks.length})
          </h4>
          <div className="space-y-3">
            {activeTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="glass-card p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-text-light dark:text-dark-text mb-4">
            Completed ({completedTasks.length})
          </h4>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="glass-card p-12 rounded-xl text-center">
          <div className="text-text-light dark:text-dark-text mb-4">
            No tasks yet. Create your first task to get started!
          </div>
          <Button 
            onClick={() => setShowTaskModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Task
          </Button>
        </div>
      )}

      <TaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
      />
    </div>
  );
}

function TaskItem({ 
  task, 
  onToggle, 
  onDelete,
  onTaskClick
}: { 
  task: Task; 
  onToggle: (id: string) => void; 
  onDelete: (id: string) => void; 
  onTaskClick?: (task: Task) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
      task.completed 
        ? 'bg-base-1/50 dark:bg-dark-base-1/50 opacity-60' 
        : 'bg-base-1 dark:bg-dark-base-1 hover:bg-base-2 dark:hover:bg-dark-base-2'
    }`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? 'bg-primary border-primary'
            : 'border-base-3 dark:border-dark-base-3 hover:border-primary'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 text-white" />}
      </button>
      
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onTaskClick?.(task)}
      >
        <div className={`font-medium ${
          task.completed ? 'line-through text-text-light dark:text-dark-text' : 'text-text dark:text-dark-text'
        }`}>
          {task.title}
        </div>
        {task.description && (
          <div className="text-sm text-text-light dark:text-dark-text mt-1">
            {task.description}
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-text-light dark:text-dark-text mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
          </span>
          {task.completedPomodoros > 0 && (
            <div className="flex-1 bg-base-2 dark:bg-dark-base-2 rounded-full h-1.5 max-w-24">
              <div 
                className="bg-primary dark:bg-dark-primary h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(task.completedPomodoros / task.estimatedPomodoros) * 100}%` 
                }}
              />
            </div>
          )}
          <Badge className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {task.dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex-shrink-0 p-1 text-text-light dark:text-dark-text hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
      >
        {isDeleting ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}