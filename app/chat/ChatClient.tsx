// FILE: app/chat/ChatClient.tsx

// FILE: app/chat/ChatClient.tsx

'use client';

import { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInputBar } from '@/components/ChatInputBar';
import { getWebhook } from '@/lib/n8n';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export function ChatClient() {
  const { messages, sendMessage, clearChat, isLoading } = useChat();

  // Check if chat webhook is configured
  const isChatConfigured = () => {
    return !!getWebhook('N8N_WEBHOOK_CHAT');
  };

  const openSettings = () => {
    // Trigger settings modal
    window.dispatchEvent(new CustomEvent('openSettings'));
  };

  // Focus management for better UX
  useEffect(() => {
    // Auto-focus input when component mounts
    const timer = setTimeout(() => {
      const input = document.querySelector('input[placeholder*="Type a message"]') as HTMLInputElement;
      input?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Render chat configuration warning if webhook not set up
  if (!isChatConfigured()) {
    return (
      <div className="min-h-screen bg-base-0 dark:bg-dark-base-0 pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
          <div className="h-full flex flex-col items-center justify-center glass-card rounded-2xl border border-base-2 dark:border-dark-base-2">
            <div className="text-center p-12">
              <Settings className="w-16 h-16 text-text-light dark:text-dark-text mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                Chat Assistant Not Configured
              </h3>
              <p className="text-text-light dark:text-dark-text mb-6">
                Set up the N8N_WEBHOOK_CHAT URL in Settings to enable AI-powered conversations with your task assistant.
              </p>
              <Button 
                onClick={openSettings}
                className="btn-primary"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Chat Webhook
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-0 dark:bg-dark-base-0 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
        <div className="h-full flex flex-col glass-card rounded-2xl overflow-hidden shadow-xl border border-base-2 dark:border-dark-base-2">
          <ChatHeader onClearChat={clearChat} />
          
          <ChatMessages messages={messages} />
          
          <ChatInputBar 
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
