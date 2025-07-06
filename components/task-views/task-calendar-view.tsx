'use client';

import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasks, Task } from '@/hooks/useTasks';
import { TaskModal } from '@/components/task-modal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
}

export function TaskCalendarView({ onTaskClick }: { onTaskClick?: (task: Task) => void }) {
  const { tasks, loading, addTask, updateTask, refetch } = useTasks();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: task.dueDate!,
        end: new Date(task.dueDate!.getTime() + 60 * 60 * 1000), // 1 hour duration
        resource: task,
      }));
  }, [tasks]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = '#0284c7'; // primary color

    switch (task.priority) {
      case 'high':
        backgroundColor = '#dc2626'; // red
        break;
      case 'medium':
        backgroundColor = '#d97706'; // orange
        break;
      case 'low':
        backgroundColor = '#059669'; // green
        break;
    }

    if (task.status === 'done') {
      backgroundColor = '#6b7280'; // gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: task.status === 'done' ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    setSelectedDate(start);
    setShowTaskModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    const task = event.resource;
    onTaskClick?.(task);
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description?: string;
    estimatedPomodoros: number;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
  }) => {
    setIsCreating(true);
    try {
      await addTask({
        ...taskData,
        dueDate: selectedDate || taskData.dueDate,
      });
      setSelectedDate(undefined);
      // The addTask function will now automatically refetch tasks
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setSelectedDate(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-light dark:text-dark-text">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text dark:text-dark-text">
          Calendar View
        </h3>
        <Button 
          className="btn-primary"
          onClick={() => setShowTaskModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            defaultView={Views.MONTH}
            popup
            className="text-text dark:text-dark-text"
          />
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl">
        <h4 className="font-medium text-text dark:text-dark-text mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-text-light dark:text-dark-text">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-600 rounded"></div>
            <span className="text-text-light dark:text-dark-text">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-text-light dark:text-dark-text">Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded opacity-60"></div>
            <span className="text-text-light dark:text-dark-text">Completed</span>
          </div>
        </div>
      </div>

      <TaskModal
        open={showTaskModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
      />
    </div>
  );
}