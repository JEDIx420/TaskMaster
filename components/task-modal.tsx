'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Calendar, Clock, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description?: string;
    estimatedPomodoros: number;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function TaskModal({ open, onClose, onSubmit, isLoading = false }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedPomodoros: 1,
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || isLoading) return;

    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        estimatedPomodoros: formData.estimatedPomodoros,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        estimatedPomodoros: 1,
        priority: 'medium',
        dueDate: '',
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="glass-card rounded-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-text dark:text-dark-text">
              Create New Task
            </Dialog.Title>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="text-text-light dark:text-dark-text hover:text-text dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-text dark:text-dark-text">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What needs to be done?"
                className="bg-base-1 dark:bg-dark-base-1 border-base-2 dark:border-dark-base-2"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-text dark:text-dark-text">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add more details..."
                className="bg-base-1 dark:bg-dark-base-1 border-base-2 dark:border-dark-base-2 min-h-[80px]"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pomodoros" className="text-sm font-medium text-text dark:text-dark-text flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pomodoros
                </Label>
                <Input
                  id="pomodoros"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.estimatedPomodoros}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedPomodoros: parseInt(e.target.value) || 1 }))}
                  className="bg-base-1 dark:bg-dark-base-1 border-base-2 dark:border-dark-base-2"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-text dark:text-dark-text flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-base-1 dark:bg-dark-base-1 border-base-2 dark:border-dark-base-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium text-text dark:text-dark-text flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="bg-base-1 dark:bg-dark-base-1 border-base-2 dark:border-dark-base-2"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={!formData.title.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}