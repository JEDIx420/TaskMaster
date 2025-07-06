'use client';

import { useState } from 'react';
import { chatWithAgent } from '@/lib/n8n';
import { useTasks } from './useTasks';

export interface ChatMessage {
  from: 'user' | 'agent';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: 'agent',
      text: 'Hi! I\'m your TaskMaster assistant. I can help you with your tasks or answer questions. Try commands like /list, /add [task], or /summary, or just ask me anything!',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { tasks, addTask } = useTasks();

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      from: 'user',
      text: userInput.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Handle local commands
    if (userInput.startsWith('/')) {
      const response = await handleLocalCommand(userInput);
      const agentMessage: ChatMessage = {
        from: 'agent',
        text: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentMessage]);
      return;
    }

    // Show typing indicator
    const typingMessage: ChatMessage = {
      from: 'agent',
      text: 'typing...',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, typingMessage]);
    setIsLoading(true);

    try {
      // Forward to n8n LLM agent
      const response = await chatWithAgent(userInput);
      
      // Replace typing indicator with actual response
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex]?.isTyping) {
          newMessages[lastIndex] = {
            from: 'agent',
            text: response.answer,
            timestamp: new Date(),
          };
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Chat agent error:', error);
      
      // Replace typing indicator with error message
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex]?.isTyping) {
          newMessages[lastIndex] = {
            from: 'agent',
            text: 'Sorry, I\'m having trouble connecting to my brain right now. Please try again in a moment!',
            timestamp: new Date(),
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalCommand = async (command: string): Promise<string> => {
    const cmd = command.toLowerCase();

    if (cmd === '/list') {
      if (tasks.length === 0) {
        return 'You have no tasks yet. Use /add [task name] to create your first task!';
      }
      
      const activeTasks = tasks.filter(t => !t.completed);
      const completedTasks = tasks.filter(t => t.completed);
      
      let response = `📋 **Your Tasks:**\n\n`;
      
      if (activeTasks.length > 0) {
        response += `**Active (${activeTasks.length}):**\n`;
        activeTasks.forEach(task => {
          response += `• ${task.title} (${task.status}, ${task.priority} priority)\n`;
        });
        response += '\n';
      }
      
      if (completedTasks.length > 0) {
        response += `**Completed (${completedTasks.length}):**\n`;
        completedTasks.forEach(task => {
          response += `• ✅ ${task.title}\n`;
        });
      }
      
      return response;
    }

    if (cmd.startsWith('/add ')) {
      const taskTitle = command.slice(5).trim();
      if (!taskTitle) {
        return 'Please provide a task title. Example: /add Complete project documentation';
      }

      try {
        await addTask({
          title: taskTitle,
          priority: 'medium',
          estimatedPomodoros: 1,
        });
        return `✅ Created task: "${taskTitle}"`;
      } catch (error) {
        return `❌ Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    if (cmd === '/summary') {
      const totalTasks = tasks.length;
      const activeTasks = tasks.filter(t => !t.completed);
      const completedTasks = tasks.filter(t => t.completed);
      const totalPomodoros = tasks.reduce((sum, task) => sum + task.completedPomodoros, 0);
      const highPriorityTasks = activeTasks.filter(t => t.priority === 'high');

      return `📊 **Task Summary:**
      
• Total tasks: ${totalTasks}
• Active: ${activeTasks.length}
• Completed: ${completedTasks.length}
• Total pomodoros completed: ${totalPomodoros}
• High priority tasks remaining: ${highPriorityTasks.length}

${highPriorityTasks.length > 0 ? '🚨 Focus on your high priority tasks!' : '👍 Great job staying on top of your tasks!'}`;
    }

    return `❓ Unknown command "${command}". Available commands:
• /list - Show all tasks
• /add [task] - Create a new task
• /summary - Show task statistics

Or just ask me anything about your tasks!`;
  };

  const clearChat = () => {
    setMessages([
      {
        from: 'agent',
        text: 'Chat cleared! How can I help you today?',
        timestamp: new Date(),
      }
    ]);
  };

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
  };
}
