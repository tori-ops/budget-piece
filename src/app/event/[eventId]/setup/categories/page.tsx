'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCategoriesGrouped, saveEventCategories } from '@/app/actions/categories';
import type { Category } from '@prisma/client';

interface GroupedCategories {
  CORE: Category[];
  ADMIN: Category[];
  ENHANCEMENTS: Category[];
  SAFETY_NET: Category[];
  FLEX: Category[];
}

const groupLabels = {
  CORE: 'Core Categories',
  ADMIN: 'Administrative',
  ENHANCEMENTS: 'Enhancements & Extras',
  SAFETY_NET: 'Safety Net',
  FLEX: 'Flexibility',
};

const groupDescriptions = {
  CORE: 'Essential categories for your wedding',
  ADMIN: 'Fees, tips, and administrative costs',
  ENHANCEMENTS:
    'Optional enhancements and extras',
  SAFETY_NET: 'Contingency budget for unexpected costs',
  FLEX: 'Miscellaneous and other expenses',
};

export default function CategorySelectionPage({
  params,
}: {
  params: { eventId: string };
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<GroupedCategories | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategoriesGrouped();
        setCategories(data);
        // Pre-select all CORE and ADMIN by default
        const defaults = new Set<string>();
        data.CORE.forEach(c => defaults.add(c.id));
        data.ADMIN.forEach(c => defaults.add(c.id));
        data.SAFETY_NET.forEach(c => defaults.add(c.id));
        setSelected(defaults);
      } catch (err) {
        setError('Failed to load categories');
      }
    }

    loadCategories();
  }, []);

  const toggleCategory = (categoryId: string, group: string) => {
    const newSelected = new Set(selected);

    if (newSelected.has(categoryId)) {
      // Warn if disabling ADMIN or SAFETY_NET
      if (group === 'ADMIN' || group === 'SAFETY_NET') {
        setShowWarning(
          `Disabling ${group === 'ADMIN' ? 'Administrative' : 'Safety Net'} categories may leave you unprepared for hidden costs.`
        );
        return;
      }
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
      setShowWarning(null);
    }

    setSelected(newSelected);
  };

  const handleContinue = async () => {
    if (selected.size === 0) {
      setError('Please select at least one category');
      return;
    }

    setLoading(true);
    try {
      const result = await saveEventCategories(
        params.eventId,
        Array.from(selected)
      );

      if (result.success) {
        router.push(`/event/${params.eventId}/setup/priorities`);
      } else {
        setError(result.error || 'Failed to save categories');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!categories) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#D0CEB5' }}>
        <div className="max-w-2xl mx-auto">Loading categories...</div>
      </div>
    );
  }

  const groups = (['CORE', 'ADMIN', 'ENHANCEMENTS', 'SAFETY_NET', 'FLEX'] as const);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#D0CEB5' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#274E13' }}>
            Select Your Budget Categories
          </h1>
          <p style={{ color: '#274E13' }} className="text-sm">
            Choose which categories to include in your budget. We recommend keeping
            all core and administrative categories enabled.
          </p>
        </div>

        {showWarning && (
          <div
            className="mb-6 p-4 border-l-4 rounded"
            style={{
              backgroundColor: '#FFF3CD',
              borderColor: '#FFC107',
              color: '#856404',
            }}
          >
            {showWarning}
            <button
              onClick={() => setShowWarning(null)}
              className="ml-4 underline hover:no-underline"
            >
              Proceed anyway
            </button>
          </div>
        )}

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

        <div className="mb-8">
          <div className="mb-2 text-sm font-semibold" style={{ color: '#274E13' }}>
            Selected: {selected.size} categories
          </div>
        </div>

        {/* Categories by Group */}
        <div className="space-y-8">
          {groups.map(group => (
            <div key={group}>
              <div className="mb-4">
                <h2
                  className="text-lg font-semibold mb-1"
                  style={{ color: '#274E13' }}
                >
                  {groupLabels[group]}
                </h2>
                <p className="text-sm" style={{ color: '#274E13' }}>
                  {groupDescriptions[group]} ({categories[group].length})
                </p>
              </div>

              <div className="space-y-2 ml-4">
                {categories[group].map(cat => (
                  <label
                    key={cat.id}
                    className="flex items-center cursor-pointer p-3 rounded hover:opacity-80 transition"
                    style={{
                      backgroundColor: selected.has(cat.id)
                        ? 'rgba(39, 78, 19, 0.1)'
                        : 'white',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(cat.id)}
                      onChange={() => toggleCategory(cat.id, group)}
                      className="w-4 h-4 mr-3 cursor-pointer"
                      style={{ accentColor: '#274E13' }}
                    />
                    <div className="flex-1">
                      <div
                        className="font-medium"
                        style={{ color: '#274E13' }}
                      >
                        {cat.name}
                      </div>
                      <div className="text-xs" style={{ color: '#274E13' }}>
                        Base allocation weight: {(cat.baseWeight * 100).toFixed(1)}%
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-12 flex gap-4">
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
            disabled={loading}
            className="flex-1 px-6 py-3 rounded font-medium text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: '#274E13' }}
          >
            {loading ? 'Saving...' : `Continue to Priorities (${selected.size} selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}
