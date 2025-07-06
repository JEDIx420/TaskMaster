// FILE: components/settings-modal.tsx

'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { validateWebhookUrl } from '@/lib/n8n';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

interface WebhookSettings {
  N8N_WEBHOOK_LOG_SESSION: string;
  N8N_WEBHOOK_ADD_TASK: string;
  N8N_WEBHOOK_UPDATE_TASK: string;
  N8N_WEBHOOK_DELETE_TASK: string;
  N8N_WEBHOOK_GET_TASKS: string;
  N8N_WEBHOOK_CHAT: string;
}

const defaultWebhooks: WebhookSettings = {
  N8N_WEBHOOK_LOG_SESSION: '',
  N8N_WEBHOOK_ADD_TASK: '',
  N8N_WEBHOOK_UPDATE_TASK: '',
  N8N_WEBHOOK_DELETE_TASK: '',
  N8N_WEBHOOK_GET_TASKS: '',
  N8N_WEBHOOK_CHAT: '',
};

const webhookLabels = {
  N8N_WEBHOOK_LOG_SESSION: 'Log Session Webhook',
  N8N_WEBHOOK_ADD_TASK: 'Add Task Webhook',
  N8N_WEBHOOK_UPDATE_TASK: 'Update Task Webhook',
  N8N_WEBHOOK_DELETE_TASK: 'Delete Task Webhook',
  N8N_WEBHOOK_GET_TASKS: 'Get Tasks Webhook',
  N8N_WEBHOOK_CHAT: 'Chat Assistant Webhook',
};

const webhookDescriptions = {
  N8N_WEBHOOK_LOG_SESSION: 'Called when a Pomodoro session is completed',
  N8N_WEBHOOK_ADD_TASK: 'Called when a new task is created',
  N8N_WEBHOOK_UPDATE_TASK: 'Called when a task is updated or moved',
  N8N_WEBHOOK_DELETE_TASK: 'Called when a task is deleted',
  N8N_WEBHOOK_GET_TASKS: 'Called to fetch all tasks from external source',
  N8N_WEBHOOK_CHAT: 'Called to chat with LLM assistant agent',
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [webhooks, setWebhooks] = useState<WebhookSettings>(defaultWebhooks);
  const [hasChanges, setHasChanges] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadWebhooks();
    }
  }, [open]);

  const loadWebhooks = () => {
    try {
      const stored = localStorage.getItem('taskmasterWebhooks');
      if (stored) {
        const parsed = JSON.parse(stored);
        setWebhooks({ ...defaultWebhooks, ...parsed });
      } else {
        setWebhooks(defaultWebhooks);
      }
      setHasChanges(false);
      setValidationStatus({});
    } catch (error) {
      console.error('Failed to load webhooks from localStorage:', error);
      setWebhooks(defaultWebhooks);
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const allUrlsValid = (): boolean => {
    return Object.values(webhooks).every(url => !url || isValidUrl(url));
  };

  const handleInputChange = (key: keyof WebhookSettings, value: string) => {
    setWebhooks(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    
    // Clear validation status when URL changes
    if (validationStatus[key] !== undefined) {
      setValidationStatus(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateWebhooks = async (): Promise<boolean> => {
    setIsValidating(true);
    const status: Record<string, boolean> = {};
    let allValid = true;

    for (const [key, url] of Object.entries(webhooks)) {
      if (url.trim()) {
        const isValid = await validateWebhookUrl(url);
        status[key] = isValid;
        if (!isValid) {
          allValid = false;
        }
      }
    }

    setValidationStatus(status);
    setIsValidating(false);
    return allValid;
  };

  const handleSave = async () => {
    if (!allUrlsValid()) {
      toast({
        title: 'Invalid URLs',
        description: 'Please ensure all webhook URLs are valid http/https URLs.',
        variant: 'destructive',
      });
      return;
    }

    const isValid = await validateWebhooks();
    
    if (!isValid) {
      toast({
        title: 'Webhook Validation Failed',
        description: 'Some webhook URLs are not reachable. Please check your n8n workflows.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Only save non-empty webhooks
      const cleanedWebhooks = Object.fromEntries(
        Object.entries(webhooks).filter(([_, url]) => url.trim())
      );
      
      localStorage.setItem('taskmasterWebhooks', JSON.stringify(cleanedWebhooks));
      setHasChanges(false);
      
      toast({
        title: 'Settings Saved',
        description: 'Webhook URLs have been validated and saved successfully.',
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to save webhooks to localStorage:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setWebhooks(defaultWebhooks);
    setValidationStatus({});
    setHasChanges(true);
  };

  const getValidationIcon = (key: string) => {
    const url = webhooks[key as keyof WebhookSettings];
    if (!url.trim()) return null;
    
    if (validationStatus[key] === true) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (validationStatus[key] === false) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="glass-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-text dark:text-dark-text">
              Webhook Settings
            </Dialog.Title>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-text-light dark:text-dark-text hover:text-text dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="text-sm text-text-light dark:text-dark-text">
              Configure your n8n webhook URLs to enable external integrations. URLs will be validated before saving.
            </div>

            {Object.entries(webhookLabels).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium text-text dark:text-dark-text">
                  {label}
                </Label>
                <div className="relative">
                  <Input
                    id={key}
                    type="url"
                    value={webhooks[key as keyof WebhookSettings]}
                    onChange={(e) => handleInputChange(key as keyof WebhookSettings, e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    className={`bg-base-1 dark:bg-dark-base-1 border-base-2 dark:border-dark-base-2 pr-10 ${
                      webhooks[key as keyof WebhookSettings] && !isValidUrl(webhooks[key as keyof WebhookSettings])
                        ? 'border-red-300 dark:border-red-600'
                        : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getValidationIcon(key)}
                  </div>
                </div>
                <p className="text-xs text-text-light dark:text-dark-text">
                  {webhookDescriptions[key as keyof WebhookSettings]}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-base-2 dark:border-dark-base-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="text-text-light dark:text-dark-text"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || !allUrlsValid() || isValidating}
                className="btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {isValidating ? 'Validating...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}