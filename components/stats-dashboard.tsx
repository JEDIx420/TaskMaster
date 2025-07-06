'use client';

import { BarChart3, Clock, Target, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text/60 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-text mt-1">{value}</p>
          {subtitle && (
            <p className="text-text/50 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-primary">{icon}</div>
      </div>
      {trend && (
        <div className="flex items-center mt-4 pt-4 border-t border-surface-400">
          <TrendingUp className={`w-4 h-4 mr-1 ${
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          }`} />
          <span className={`text-sm font-medium ${
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-text/50 text-sm ml-1">vs last week</span>
        </div>
      )}
    </div>
  );
}

export function StatsDashboard() {
  const stats = [
    {
      title: 'Today\'s Focus',
      value: '4h 25m',
      subtitle: '8 pomodoros completed',
      icon: <Clock className="w-6 h-6" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Tasks Completed',
      value: 12,
      subtitle: 'This week',
      icon: <Target className="w-6 h-6" />,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Productivity Score',
      value: '94%',
      subtitle: 'Above average',
      icon: <BarChart3 className="w-6 h-6" />,
      trend: { value: 3, isPositive: true },
    },
    {
      title: 'Current Streak',
      value: '7 days',
      subtitle: 'Keep it up!',
      icon: <TrendingUp className="w-6 h-6" />,
      trend: { value: 15, isPositive: true },
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      
      {/* Weekly Overview */}
      <div className="glass-card p-6 rounded-xl mt-6">
        <h3 className="text-lg font-semibold text-text mb-4">Weekly Overview</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const height = Math.random() * 60 + 20; // Mock data
            const isToday = index === 3; // Mock today as Thursday
            
            return (
              <div key={day} className="flex flex-col items-center">
                <div className="text-xs text-text/60 mb-2">{day}</div>
                <div className="w-8 bg-surface-600 rounded-t-md relative" style={{ height: '80px' }}>
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${
                      isToday ? 'bg-primary' : 'bg-surface-400'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="text-xs text-text/50 mt-2">
                  {Math.floor(height / 10)}h
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}