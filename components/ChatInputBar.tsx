// FILE: components/ChatInputBar.tsx

'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputBarProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInputBar({ onSendMessage, isLoading }: ChatInputBarProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await onSendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const commands = [
    { cmd: '/list', desc: 'Show all tasks' },
    { cmd: '/add [task]', desc: 'Create a new task' },
    { cmd: '/summary', desc: 'Show task statistics' },
  ];

  return (
    <div className="border-t border-base-2 dark:border-dark-base-2 bg-base-0/80 dark:bg-dark-base-0/80 backdrop-blur-sm">
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="px-4 py-2 border-b border-base-2 dark:border-dark-base-2 bg-primary/5 dark:bg-dark-primary/5"
          >
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-text-light dark:text-dark-text font-medium">💡 Quick commands:</span>
              {commands.map((command, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(command.cmd + (command.cmd === '/add' ? ' ' : ''));
                    inputRef.current?.focus();
                  }}
                  className="px-2 py-1 bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary rounded hover:bg-primary/20 dark:hover:bg-dark-primary/20 transition-colors"
                >
                  <span className="font-mono">{command.cmd}</span>
                  <span className="ml-1 opacity-70">• {command.desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type a message or try /list, /add [task], /summary..."
              className="chat-input bg-base-1 dark:bg-dark-base-1/60 border-base-3 dark:border-dark-base-3 rounded-full px-4 py-3 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              disabled={isLoading}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text hover:text-text dark:hover:text-dark-text transition-colors"
              >
                ×
              </button>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="sm"
            className="btn-primary rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
