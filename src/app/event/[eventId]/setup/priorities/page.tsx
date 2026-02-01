'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface EventCategory {
  categoryId: string;
  category: {
    id: string;
    name: string;
    baseWeight: number;
  };
}

type TierType = 'TOP' | 'IMPORTANT' | 'NICE';

export default function PrioritiesPage({
  params,
}: {
  params: { eventId: string };
}) {
  const router = useRouter();
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [tiers, setTiers] = useState<Record<string, TierType>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(
          `/api/event/${params.eventId}/categories`
        );
        if (!response.ok) throw new Error('Failed to load categories');
        const data = await response.json();
        
        setEventCategories(data);
        
        // Initialize all as IMPORTANT
        const initialTiers: Record<string, TierType> = {};
        data.forEach((ec: EventCategory) => {
          initialTiers[ec.categoryId] = 'IMPORTANT';
        });
        setTiers(initialTiers);
      } catch (err) {
        setError('Failed to load categories');
      }
    }

    loadCategories();
  }, [params.eventId]);

  const handleTierChange = (categoryId: string, tier: TierType) => {
    setTiers(prev => ({
      ...prev,
      [categoryId]: tier,
    }));
  };

  const topPriorityCount = Object.values(tiers).filter(t => t === 'TOP').length;
  const isValid = topPriorityCount >= 3 && topPriorityCount <= 5;

  const handleContinue = async () => {
    if (!isValid) {
      setError(
        `Please select 3-5 top priority categories (currently ${topPriorityCount})`
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/event/${params.eventId}/allocations/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tiers }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate allocations');
      }

      router.push(`/event/${params.eventId}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sortedCategories = [...eventCategories].sort((a, b) =>
    a.category.name.localeCompare(b.category.name)
  );

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#D0CEB5' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#274E13' }}>
            Set Your Budget Priorities
          </h1>
          <p style={{ color: '#274E13' }} className="text-sm">
            Mark 3-5 categories as "Top Priority" to guide your budget allocation.
            Top priority items get 40% more than standard categories.
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 border-l-4 rounded"
            style={{
              backgroundColor: '#F8D7DA',
              borderColor: '#F5C6CB',
              color: '#721C24',
            }}
          >
            {error}
          </div>
        )}

        <div className="mb-8 p-4 rounded" style={{ backgroundColor: 'rgba(39, 78, 19, 0.05)' }}>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: '#274E13' }}
              >
                Top Priorities: {topPriorityCount}/5
              </div>
              <div className="text-xs mt-1" style={{ color: '#274E13' }}>
                {isValid ? '✓ Valid' : `Need ${3 - topPriorityCount} more`}
              </div>
            </div>
            <div
              className="h-2 flex-1 rounded overflow-hidden"
              style={{ backgroundColor: 'rgba(39, 78, 19, 0.1)' }}
            >
              <div
                className="h-full transition-all"
                style={{
                  backgroundColor: '#274E13',
                  width: `${Math.min((topPriorityCount / 5) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3 mb-8">
          {sortedCategories.map(ec => (
            <div
              key={ec.categoryId}
              className="p-4 rounded-lg border-2"
              style={{
                backgroundColor: 'white',
                borderColor: tiers[ec.categoryId] === 'TOP' ? '#274E13' : 'rgba(39, 78, 19, 0.1)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: '#274E13' }}>
                    {ec.category.name}
                  </h3>
                  <p className="text-xs" style={{ color: '#274E13' }}>
                    Base weight: {(ec.category.baseWeight * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {(['TOP', 'IMPORTANT', 'NICE'] as const).map(tier => (
                  <button
                    key={tier}
                    onClick={() => handleTierChange(ec.categoryId, tier)}
                    className="flex-1 px-3 py-2 rounded text-sm font-medium transition"
                    style={{
                      backgroundColor:
                        tiers[ec.categoryId] === tier
                          ? '#274E13'
                          : 'rgba(39, 78, 19, 0.1)',
                      color: tiers[ec.categoryId] === tier ? 'white' : '#274E13',
                    }}
                  >
                    {tier === 'TOP' ? '⭐ Top' : tier === 'IMPORTANT' ? 'Important' : 'Nice'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded font-medium border-2 hover:opacity-80 transition"
            style={{
              color: '#274E13',
              borderColor: '#274E13',
              backgroundColor: 'transparent',
            }}
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={loading || !isValid}
            className="flex-1 px-6 py-3 rounded font-medium text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: '#274E13' }}
          >
            {loading ? 'Generating budget...' : 'Generate Budget & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
