'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Timer, LayoutDashboard, Settings, Menu, X, Sun, Moon, MessageCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { SettingsModal } from '@/components/settings-modal';

export function Navigation() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navigation = [
    { name: 'Timer', href: '/', icon: Timer },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
  ];

  const isDarkMode = theme === 'dark';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary dark:bg-dark-primary rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-text dark:text-dark-text">TaskMaster</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-text-light dark:text-dark-text" />
                <Switch
                  checked={isDarkMode}
                  onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  className={`${
                    isDarkMode ? 'bg-primary' : 'bg-base-2'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
                <Moon className="w-4 h-4 text-text-light dark:text-dark-text" />
              </div>

              {/* Settings Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="text-text-light dark:text-dark-text hover:text-text dark:hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-base-2 dark:border-dark-base-2">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text dark:text-dark-text hover:bg-base-1 dark:hover:bg-dark-base-1'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-text dark:text-dark-text">Dark Mode</span>
                <Switch
                  checked={isDarkMode}
                  onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  className={`${
                    isDarkMode ? 'bg-primary' : 'bg-base-2'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              {/* Mobile Settings */}
              <button
                onClick={() => {
                  setSettingsOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-text dark:text-dark-text hover:bg-base-1 dark:hover:bg-dark-base-1 w-full"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}