'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Edit3, Save, X, Calendar as CalendarIcon, Clock, Target } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (patch: Partial<Task>) => Promise<void>;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'backlog' | 'doing' | 'done';
  estimatedPomodoros: number;
  dueDate?: Date;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusColors = {
  backlog: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  doing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export function TaskDetailModal({ task, open, onClose, onSave }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>();

  const watchedDueDate = watch('dueDate');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        estimatedPomodoros: task.estimatedPomodoros,
        dueDate: task.dueDate,
      });
    }
  }, [task, reset]);

  const handleSave = async (data: TaskFormData) => {
    if (!task) return;

    setIsSaving(true);
    try {
      const patch: Partial<Task> = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        estimatedPomodoros: data.estimatedPomodoros,
        dueDate: data.dueDate,
        completed: data.status === 'done',
      };

      await onSave(patch);
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        estimatedPomodoros: task.estimatedPomodoros,
        dueDate: task.dueDate,
      });
    }
    setIsEditing(false);
  };

  const progressPercentage = task 
    ? (task.completedPomodoros / task.estimatedPomodoros) * 100 
    : 0;

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-base-0/70 dark:bg-dark-base-1/70 backdrop-blur-xl border-base-2 dark:border-dark-base-2">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-text dark:text-dark-text">
            <span>Task Details</span>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-text-light dark:text-dark-text hover:text-text dark:hover:text-dark-text"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="text-text-light dark:text-dark-text hover:text-text dark:hover:text-dark-text"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSubmit(handleSave)}
                    disabled={isSaving}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-text dark:text-dark-text">
              Title
            </Label>
            {isEditing ? (
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                className="bg-base-1 dark:bg-dark-base-1"
                placeholder="Task title"
              />
            ) : (
              <p className="text-text dark:text-dark-text font-medium">{task.title}</p>
            )}
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-text dark:text-dark-text">
              Description
            </Label>
            {isEditing ? (
              <Textarea
                id="description"
                {...register('description')}
                className="bg-base-1 dark:bg-dark-base-1 min-h-[80px]"
                placeholder="Task description..."
              />
            ) : (
              <p className="text-text-light dark:text-dark-text">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-text dark:text-dark-text">Priority</Label>
              {isEditing ? (
                <Select
                  value={watch('priority')}
                  onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high')}
                >
                  <SelectTrigger className="bg-base-1 dark:bg-dark-base-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={priorityColors[task.priority]}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-text dark:text-dark-text">Status</Label>
              {isEditing ? (
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value as 'backlog' | 'doing' | 'done')}
                >
                  <SelectTrigger className="bg-base-1 dark:bg-dark-base-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="doing">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={statusColors[task.status]}>
                  {task.status === 'doing' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              )}
            </div>
          </div>

          {/* Estimated Pomodoros */}
          <div className="space-y-2">
            <Label htmlFor="estimatedPomodoros" className="text-text dark:text-dark-text">
              Estimated Pomodoros
            </Label>
            {isEditing ? (
              <Input
                id="estimatedPomodoros"
                type="number"
                min="1"
                {...register('estimatedPomodoros', { 
                  required: 'Estimated pomodoros is required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
                className="bg-base-1 dark:bg-dark-base-1"
              />
            ) : (
              <p className="text-text dark:text-dark-text">{task.estimatedPomodoros}</p>
            )}
            {errors.estimatedPomodoros && (
              <p className="text-red-500 text-sm">{errors.estimatedPomodoros.message}</p>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-text dark:text-dark-text">Progress</Label>
              <div className="flex items-center gap-1 text-sm text-text-light dark:text-dark-text">
                <Clock className="w-4 h-4" />
                {task.completedPomodoros}/{task.estimatedPomodoros} Pomodoros
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-text dark:text-dark-text">Due Date</Label>
            {isEditing ? (
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-base-1 dark:bg-dark-base-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedDueDate ? format(watchedDueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedDueDate}
                    onSelect={(date) => {
                      setValue('dueDate', date);
                      setShowCalendar(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex items-center gap-2">
                {task.dueDate ? (
                  <>
                    <Target className="w-4 h-4 text-text-light dark:text-dark-text" />
                    <span className="text-text dark:text-dark-text">
                      {format(task.dueDate, 'PPP')}
                    </span>
                  </>
                ) : (
                  <span className="text-text-light dark:text-dark-text">No due date set</span>
                )}
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="space-y-2">
            <Label className="text-text dark:text-dark-text">Created</Label>
            <p className="text-text-light dark:text-dark-text text-sm">
              {format(task.createdAt, 'PPP')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
