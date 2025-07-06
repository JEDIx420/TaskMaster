// FILE: components/ChatMessages.tsx

'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ChatMessage } from '@/hooks/useChat';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-base-0/50 to-base-1/30 dark:from-dark-base-0/50 dark:to-dark-base-1/30 chat-messages">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex ${
              message.from === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                message.from === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-primary/10 dark:bg-dark-primary/10 text-primary-900 dark:text-primary-100 rounded-bl-md border border-primary/20 dark:border-dark-primary/20'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.isTyping ? (
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-current rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-current rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-current rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-xs opacity-70">Assistant is typing...</span>
                  </div>
                ) : (
                  message.text
                )}
              </div>
              
              <div className={`text-xs mt-2 ${
                message.from === 'user' 
                  ? 'text-white/70' 
                  : 'text-text-light/60 dark:text-dark-text/60'
              }`}>
                {format(message.timestamp, 'HH:mm')}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <div ref={messagesEndRef} />
    </div>
  );
}
