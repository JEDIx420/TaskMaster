'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTasks, Task } from '@/hooks/useTasks';
import { TaskModal } from '@/components/task-modal';

const columns = {
  backlog: { title: 'Backlog', color: 'bg-gray-100 dark:bg-gray-800' },
  doing: { title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900' },
  done: { title: 'Done', color: 'bg-green-100 dark:bg-green-900' },
};

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function TaskKanbanView({ onTaskClick }: { onTaskClick?: (task: Task) => void }) {
  const { tasks, loading, addTask, updateTask } = useTasks();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as Task['status'];
      try {
        await updateTask(draggableId, { 
          status: newStatus,
          completed: newStatus === 'done'
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
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
      await addTask(taskData);
      // The addTask function will now automatically refetch tasks
    } finally {
      setIsCreating(false);
    }
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
          Kanban Board
        </h3>
        <Button 
          className="btn-primary" 
          onClick={() => setShowTaskModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(columns).map(([status, column]) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-text dark:text-dark-text">
                  {column.title}
                </h4>
                <Badge variant="secondary">
                  {getTasksByStatus(status as Task['status']).length}
                </Badge>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] p-4 rounded-lg transition-colors ${
                      snapshot.isDraggingOver
                        ? 'bg-primary/10 dark:bg-dark-primary/10'
                        : 'bg-base-1 dark:bg-dark-base-1'
                    }`}
                  >
                    <div className="space-y-3">
                      {getTasksByStatus(status as Task['status']).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`glass-card p-4 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                              onClick={(e) => {
                                // Allow drag to work, but also allow click when not dragging
                                if (!snapshot.isDragging) {
                                  e.stopPropagation();
                                  onTaskClick?.(task);
                                }
                              }}
                            >
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-medium text-text dark:text-dark-text">
                                    {task.title}
                                  </h5>
                                  {task.description && (
                                    <p className="text-sm text-text-light dark:text-dark-text mt-1">
                                      {task.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-1 text-text-light dark:text-dark-text">
                                    <Clock className="w-3 h-3" />
                                    {task.completedPomodoros}/{task.estimatedPomodoros}
                                  </div>
                                  <Badge className={priorityColors[task.priority]}>
                                    {task.priority}
                                  </Badge>
                                </div>

                                {task.completedPomodoros > 0 && (
                                  <div className="w-full bg-base-2 dark:bg-dark-base-2 rounded-full h-1.5">
                                    <div 
                                      className="bg-primary dark:bg-dark-primary h-1.5 rounded-full transition-all duration-300"
                                      style={{ 
                                        width: `${(task.completedPomodoros / task.estimatedPomodoros) * 100}%` 
                                      }}
                                    />
                                  </div>
                                )}

                                {task.dueDate && (
                                  <div className="flex items-center gap-1 text-xs text-text-light dark:text-dark-text">
                                    <Target className="w-3 h-3" />
                                    Due {task.dueDate.toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <TaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
      />
    </div>
  );
}