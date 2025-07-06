// FILE: components/ChatHeader.tsx

'use client';

import { Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClearChat: () => void;
}

export function ChatHeader({ onClearChat }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-base-2 dark:border-dark-base-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 dark:bg-dark-primary/10 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary dark:text-dark-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-text dark:text-dark-text">
            Chat Assistant
          </h1>
          <p className="text-sm text-text-light dark:text-dark-text">
            Ask questions or use commands
          </p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearChat}
        className="text-text-light dark:text-dark-text hover:text-red-500 dark:hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Clear Chat
      </Button>
    </div>
  );
}
