'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Save, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

interface PomodoroSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: PomodoroSettings) => void;
  currentSettings: PomodoroSettings;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

export function PomodoroSettingsModal({ 
  open, 
  onClose, 
  onSave, 
  currentSettings 
}: PomodoroSettingsModalProps) {
  const [settings, setSettings] = useState<PomodoroSettings>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(currentSettings);
    setHasChanges(false);
  }, [currentSettings, open]);

  const handleInputChange = (key: keyof PomodoroSettings, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    
    setSettings(prev => ({
      ...prev,
      [key]: numValue,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setSettings(currentSettings);
        setHasChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full glass-card rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-base-2 dark:border-dark-base-2">
            <Dialog.Title className="text-lg font-semibold text-text dark:text-dark-text">
              Pomodoro Settings
            </Dialog.Title>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-text-light dark:text-dark-text hover:text-text dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workDuration" className="text-sm font-medium">
                  Work Duration (minutes)
                </Label>
                <Input
                  id="workDuration"
                  type="number"
                  min="1"
                  max="90"
                  value={settings.workDuration}
                  onChange={(e) => handleInputChange('workDuration', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-text-light dark:text-dark-text">
                  How long each work session lasts
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortBreakDuration" className="text-sm font-medium">
                  Short Break Duration (minutes)
                </Label>
                <Input
                  id="shortBreakDuration"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => handleInputChange('shortBreakDuration', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-text-light dark:text-dark-text">
                  Short break between work sessions
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longBreakDuration" className="text-sm font-medium">
                  Long Break Duration (minutes)
                </Label>
                <Input
                  id="longBreakDuration"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => handleInputChange('longBreakDuration', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-text-light dark:text-dark-text">
                  Longer break after multiple work sessions
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longBreakInterval" className="text-sm font-medium">
                  Long Break Interval
                </Label>
                <Input
                  id="longBreakInterval"
                  type="number"
                  min="2"
                  max="10"
                  value={settings.longBreakInterval}
                  onChange={(e) => handleInputChange('longBreakInterval', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-text-light dark:text-dark-text">
                  Number of work sessions before a long break
                </p>
              </div>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Session Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Work Session:</span>
                  <span className="font-medium">{settings.workDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Short Break:</span>
                  <span className="font-medium">{settings.shortBreakDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Long Break:</span>
                  <span className="font-medium">{settings.longBreakDuration} min</span>
                </div>
                <div className="flex justify-between border-t border-primary/20 pt-1 mt-2">
                  <span>Full Cycle:</span>
                  <span className="font-medium">
                    {(settings.workDuration * settings.longBreakInterval) + 
                     (settings.shortBreakDuration * (settings.longBreakInterval - 1)) + 
                     settings.longBreakDuration} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-base-2 dark:border-dark-base-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="text-text-light dark:text-dark-text"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges}
                className="btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
