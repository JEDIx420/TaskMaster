'use client';

import { useState } from 'react';
import { Task } from './useTasks';

export function useTaskModal() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setIsOpen(true);
  };

  const closeTask = () => {
    setIsOpen(false);
    setSelectedTask(null);
  };

  return {
    selectedTask,
    isOpen,
    openTask,
    closeTask,
  };
}
