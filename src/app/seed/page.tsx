'use client';

import { seedMasterCategoriesAction } from '@/app/actions/seedCategories';
import { useState } from 'react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await seedMasterCategoriesAction();
      setResult(res);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#D0CEB5' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#274E13' }}>
          Database Seeding
        </h1>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400"
          style={{ backgroundColor: loading ? undefined : '#274E13' }}
        >
          {loading ? 'Seeding...' : 'Seed 27 Master Categories'}
        </button>

        {result && (
          <div
            className={`mt-8 p-6 rounded-lg border-2 ${
              result.success
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <h2 className="text-xl font-bold mb-2">
              {result.success ? '✓ Success' : '✗ Error'}
            </h2>
            <p className="text-lg mb-2">{result.error || JSON.stringify(result)}</p>
            {result.created !== undefined && (
              <div className="text-sm text-gray-600">
                <p>Created: {result.created}</p>
                <p>Skipped: {result.skipped}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This page is for development/initialization only.
            Remove it before deploying to production, or add authentication gates.
          </p>
        </div>
      </div>
    </div>
  );
}
