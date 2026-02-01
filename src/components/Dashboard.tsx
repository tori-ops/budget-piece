'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/logout';

interface Event {
  id: string;
  title: string;
  weddingDate: Date;
  timezone: string;
  status: string;
  totalBudgetCents: number;
  role: string;
  createdAt: Date;
}

interface DashboardProps {
  events: Event[];
}

export function Dashboard({ events }: DashboardProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatBudget = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const daysUntilWedding = (date: Date) => {
    const today = new Date();
    const wedding = new Date(date);
    const diff = Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D0CEB5' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-sm" style={{ borderColor: 'rgba(39, 78, 19, 0.1)', backgroundColor: 'rgba(208, 206, 181, 0.95)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#274E13' }}>
              The Budget Piece
            </h1>
            <p className="text-sm" style={{ color: '#274E13' }}>
              Manage your wedding budget
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/events/new')}
              className="px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#274E13' }}
            >
              + New Event
            </button>
            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-lg font-medium border-2 transition-all duration-300 hover:opacity-80"
              style={{ color: '#274E13', borderColor: '#274E13' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {events.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="mb-6 text-6xl">💍</div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#274E13' }}>
              No events yet
            </h2>
            <p className="text-lg mb-8" style={{ color: '#274E13' }}>
              Create your first wedding event to get started
            </p>
            <Link
              href="/events/new"
              className="inline-block px-8 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#274E13' }}
            >
              Create Event
            </Link>
          </div>
        ) : (
          // Events Grid
          <div>
            <h2 className="text-2xl font-bold mb-8" style={{ color: '#274E13' }}>
              Your Events ({events.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const daysLeft = daysUntilWedding(event.weddingDate);
                const isUpcoming = daysLeft > 0;

                return (
                  <Link
                    key={event.id}
                    href={`/event/${event.id}`}
                    className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-100"
                    onMouseEnter={() => setHoveredId(event.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    {/* Card Background Gradient on Hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                      style={{ backgroundColor: '#274E13' }}
                    />

                    {/* Content */}
                    <div className="relative p-6">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: isUpcoming ? 'rgba(39, 78, 19, 0.1)' : 'rgba(200, 200, 200, 0.2)',
                            color: '#274E13',
                          }}
                        >
                          {isUpcoming ? `${daysLeft} days left` : 'Past'}
                        </span>

                        {/* Role Badge */}
                        <span className="text-xs font-medium" style={{ color: '#274E13', opacity: 0.7 }}>
                          {event.role === 'COUPLE_OWNER' ? '👑' : '🤝'} {event.role === 'COUPLE_OWNER' ? 'Owner' : 'Guest'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-3 truncate group-hover:text-opacity-80 transition-all duration-300" style={{ color: '#274E13' }}>
                        {event.title}
                      </h3>

                      {/* Date and Location */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#274E13' }}>
                          <span>📅</span>
                          <span>{formatDate(event.weddingDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#274E13' }}>
                          <span>🌍</span>
                          <span>{event.timezone}</span>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="pt-4 border-t" style={{ borderColor: 'rgba(39, 78, 19, 0.1)' }}>
                        <p className="text-xs mb-1" style={{ color: '#274E13', opacity: 0.7 }}>
                          Total Budget
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#274E13' }}>
                          {formatBudget(event.totalBudgetCents)}
                        </p>
                      </div>

                      {/* Hover Action Arrow */}
                      <div
                        className="absolute top-6 right-6 text-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2"
                        style={{ color: '#274E13' }}
                      >
                        →
                      </div>
                    </div>

                    {/* Bottom Accent */}
                    <div
                      className="h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: '#274E13' }}
                    />
                  </Link>
                );
              })}

              {/* Create New Event Card */}
              <Link
                href="/events/new"
                className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-100 flex items-center justify-center min-h-64"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px dashed rgba(39, 78, 19, 0.3)',
                }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">+</div>
                  <p className="font-semibold" style={{ color: '#274E13' }}>
                    Create Event
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#274E13', opacity: 0.7 }}>
                    Start a new wedding
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}
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
