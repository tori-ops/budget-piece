'use client';

import { useState } from 'react';

interface AllocationData {
  categoryId: string;
  categoryName: string;
  categoryGroup: string;
  allocatedCents: number;
  baseWeight: number;
}

interface DashboardData {
  eventId: string;
  title: string;
  weddingDate: Date;
  timezone: string;
  totalBudgetCents: number;
  totalAllocatedCents: number;
  allocationsByGroup: Record<string, AllocationData[]>;
  categoryCount: number;
}

interface EnhancedDashboardProps {
  data: DashboardData;
}

const groupLabels: Record<string, string> = {
  CORE: 'Core Categories',
  ADMIN: 'Administrative',
  ENHANCEMENTS: 'Enhancements',
  SAFETY_NET: 'Safety Net',
  FLEX: 'Flexibility',
};

const groupEmojis: Record<string, string> = {
  CORE: '🎁',
  ADMIN: '📋',
  ENHANCEMENTS: '✨',
  SAFETY_NET: '🛡️',
  FLEX: '🎲',
};

export function EnhancedDashboard({ data }: EnhancedDashboardProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('CORE');

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const allocationPercentage = Math.round(
    (data.totalAllocatedCents / data.totalBudgetCents) * 100
  );

  const remaining = data.totalBudgetCents - data.totalAllocatedCents;
  const remainingPercentage = 100 - allocationPercentage;

  const getHealthColor = (percentage: number) => {
    if (percentage >= 95) return '#e74c3c'; // Red - too much allocated
    if (percentage >= 85) return '#f39c12'; // Orange - high allocation
    if (percentage >= 60) return '#27ae60'; // Green - good allocation
    return '#3498db'; // Blue - conservative
  };

  const groups = Object.keys(data.allocationsByGroup).sort();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D0CEB5' }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-sm" style={{ borderColor: 'rgba(39, 78, 19, 0.1)', backgroundColor: 'rgba(208, 206, 181, 0.95)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold" style={{ color: '#274E13' }}>
            {data.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#274E13', opacity: 0.8 }}>
            📅 {formatDate(data.weddingDate)} • 🌍 {data.timezone}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Budget */}
          <div className="rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#274E13', opacity: 0.7 }}>
              Total Budget
            </p>
            <p className="text-3xl font-bold" style={{ color: '#274E13' }}>
              {formatCurrency(data.totalBudgetCents)}
            </p>
            <p className="text-xs mt-2" style={{ color: '#274E13', opacity: 0.6 }}>
              For {data.categoryCount} categories
            </p>
          </div>

          {/* Allocated */}
          <div className="rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#274E13', opacity: 0.7 }}>
              Allocated
            </p>
            <p className="text-3xl font-bold" style={{ color: '#274E13' }}>
              {formatCurrency(data.totalAllocatedCents)}
            </p>
            <p className="text-xs mt-2" style={{ color: '#274E13', opacity: 0.6 }}>
              {allocationPercentage}% of budget
            </p>
          </div>

          {/* Remaining */}
          <div className="rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#274E13', opacity: 0.7 }}>
              Remaining
            </p>
            <p className="text-3xl font-bold" style={{ color: '#274E13' }}>
              {formatCurrency(remaining)}
            </p>
            <p className="text-xs mt-2" style={{ color: '#274E13', opacity: 0.6 }}>
              {remainingPercentage}% available
            </p>
          </div>

          {/* Budget Health */}
          <div className="rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#274E13', opacity: 0.7 }}>
              Budget Health
            </p>
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(39, 78, 19, 0.1)" strokeWidth="8" />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={getHealthColor(allocationPercentage)}
                  strokeWidth="8"
                  strokeDasharray={`${(allocationPercentage / 100) * 282.7} 282.7`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: getHealthColor(allocationPercentage) }}>
                  {allocationPercentage}%
                </span>
              </div>
            </div>
            <p className="text-xs text-center" style={{ color: '#274E13', opacity: 0.6 }}>
              {allocationPercentage >= 95 ? '⚠️ High' : allocationPercentage >= 85 ? '📈 Good' : '✅ Healthy'}
            </p>
          </div>
        </div>

        {/* Category Allocations */}
        <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="border-b p-6" style={{ borderColor: 'rgba(39, 78, 19, 0.1)' }}>
            <h2 className="text-2xl font-bold" style={{ color: '#274E13' }}>
              Budget Allocation by Category
            </h2>
            <p className="text-sm mt-1" style={{ color: '#274E13', opacity: 0.7 }}>
              Click groups to expand and see details
            </p>
          </div>

          {/* Groups */}
          <div>
            {groups.map((group) => {
              const allocations = data.allocationsByGroup[group];
              const groupTotal = allocations.reduce((sum, a) => sum + a.allocatedCents, 0);
              const groupPercentage = Math.round((groupTotal / data.totalBudgetCents) * 100);
              const isExpanded = expandedGroup === group;

              return (
                <div key={group} className="border-b" style={{ borderColor: 'rgba(39, 78, 19, 0.1)' }}>
                  {/* Group Header */}
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : group)}
                    className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'rgba(39, 78, 19, 0.02)' }}
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <span className="text-2xl">{groupEmojis[group]}</span>
                      <div>
                        <p className="font-semibold" style={{ color: '#274E13' }}>
                          {groupLabels[group]}
                        </p>
                        <p className="text-xs" style={{ color: '#274E13', opacity: 0.6 }}>
                          {allocations.length} categories • {formatCurrency(groupTotal)}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(39, 78, 19, 0.1)' }}>
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            backgroundColor: '#274E13',
                            width: `${groupPercentage}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right" style={{ color: '#274E13' }}>
                        {groupPercentage}%
                      </span>
                      <span className="text-xl transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded Categories */}
                  {isExpanded && (
                    <div className="bg-white">
                      {allocations.map((allocation, idx) => {
                        const categoryPercentage = Math.round(
                          (allocation.allocatedCents / data.totalBudgetCents) * 100
                        );

                        return (
                          <div
                            key={allocation.categoryId}
                            className="p-4 flex items-center justify-between border-t"
                            style={{
                              borderColor: 'rgba(39, 78, 19, 0.05)',
                              backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(39, 78, 19, 0.02)',
                            }}
                          >
                            <div className="flex-1">
                              <p className="font-medium" style={{ color: '#274E13' }}>
                                {allocation.categoryName}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(39, 78, 19, 0.1)' }}>
                                  <div
                                    className="h-full transition-all duration-300 rounded-full"
                                    style={{
                                      backgroundColor: '#274E13',
                                      width: `${categoryPercentage}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-12" style={{ color: '#274E13', opacity: 0.7 }}>
                                  {categoryPercentage}%
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-bold" style={{ color: '#274E13' }}>
                                {formatCurrency(allocation.allocatedCents)}
                              </p>
                              <p className="text-xs" style={{ color: '#274E13', opacity: 0.6 }}>
                                ← Base weight: {(allocation.baseWeight * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#274E13' }}
          >
            Edit Priorities
          </button>
          <button
            className="px-6 py-3 rounded-lg font-medium border-2 transition-all duration-300 hover:opacity-80"
            style={{ color: '#274E13', borderColor: '#274E13', backgroundColor: 'transparent' }}
          >
            View Scenarios
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 px-6 text-center" style={{ borderColor: 'rgba(39, 78, 19, 0.1)' }}>
        <p className="text-sm" style={{ color: '#274E13', opacity: 0.7 }}>
          The Missing Piece Planning and Events, LLC • Version 1.1.1
        </p>
      </footer>
    </div>
  );
}
