'use client';

import { useState } from 'react';
import { Plus, Check, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: Date;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project documentation',
      completed: false,
      estimatedPomodoros: 3,
      completedPomodoros: 1,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Review code changes',
      completed: false,
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      createdAt: new Date(),
    },
  ]);
  
  const [newTask, setNewTask] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.trim(),
        completed: false,
        estimatedPomodoros,
        completedPomodoros: 0,
        createdAt: new Date(),
      };
      setTasks(prev => [task, ...prev]);
      setNewTask('');
      setEstimatedPomodoros(1);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Add Task Form */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-text mb-4">Add New Task</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-surface-600 border-surface-400 text-text placeholder:text-text/50"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text/60" />
            <Input
              type="number"
              min="1"
              max="10"
              value={estimatedPomodoros}
              onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value) || 1)}
              className="w-16 bg-surface-600 border-surface-400 text-text text-center"
            />
            <Button onClick={addTask} className="btn-primary">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-text mb-4">
            Active Tasks ({activeTasks.length})
          </h3>
          <div className="space-y-3">
            {activeTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-text/70 mb-4">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskItem({ 
  task, 
  onToggle, 
  onDelete 
}: { 
  task: Task; 
  onToggle: (id: string) => void; 
  onDelete: (id: string) => void; 
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
      task.completed 
        ? 'bg-surface-600/50 opacity-60' 
        : 'bg-surface-600 hover:bg-surface-500'
    }`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? 'bg-primary border-primary'
            : 'border-surface-300 hover:border-primary'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 text-white" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${
          task.completed ? 'line-through text-text/50' : 'text-text'
        }`}>
          {task.title}
        </div>
        <div className="flex items-center gap-4 text-sm text-text/60 mt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
          </span>
          {task.completedPomodoros > 0 && (
            <div className="flex-1 bg-surface-700 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(task.completedPomodoros / task.estimatedPomodoros) * 100}%` 
                }}
              />
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 p-1 text-text/40 hover:text-red-400 transition-colors duration-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}