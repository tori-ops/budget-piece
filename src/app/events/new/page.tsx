'use client';

import { createEvent } from '@/app/actions/createEvent';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedTimezone, setDetectedTimezone] = useState<string>('UTC');
  const [editingTimezone, setEditingTimezone] = useState(false);

  // Detect timezone on client
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTimezone(tz);
    } catch (err) {
      setDetectedTimezone('UTC');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const weddingDate = formData.get('weddingDate') as string;
    const timezone = formData.get('timezone') as string;
    const totalBudgetCents = parseInt(formData.get('totalBudgetCents') as string, 10);

    // Client-side validation
    if (!title?.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!weddingDate) {
      setError('Wedding date is required');
      setLoading(false);
      return;
    }

    if (!timezone) {
      setError('Timezone is required');
      setLoading(false);
      return;
    }

    if (!totalBudgetCents || totalBudgetCents <= 0) {
      setError('Budget must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      await createEvent({
        title,
        weddingDate,
        timezone,
        totalBudgetCents,
      });
      // Redirect happens in server action
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Wedding Event</h1>
            <p className="text-gray-600">Start planning your perfect wedding budget</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Event Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., Sarah & John's Wedding"
                required
                maxLength={120}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Max 120 characters</p>
            </div>

            {/* Wedding Date */}
            <div>
              <label htmlFor="weddingDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Wedding Date
              </label>
              <input
                id="weddingDate"
                name="weddingDate"
                type="date"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Timezone
              </label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">
                  Detected: <span className="font-medium">{detectedTimezone}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setEditingTimezone(!editingTimezone)}
                  className="text-xs text-purple-600 hover:text-purple-700 underline"
                  disabled={loading}
                >
                  {editingTimezone ? 'done' : 'change'}
                </button>
              </div>

              {editingTimezone ? (
                <input
                  name="timezone"
                  type="text"
                  placeholder="e.g., America/New_York or UTC"
                  defaultValue={detectedTimezone}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                />
              ) : (
                <input
                  name="timezone"
                  type="hidden"
                  value={detectedTimezone}
                />
              )}
            </div>

            {/* Total Budget */}
            <div>
              <label htmlFor="totalBudgetCents" className="block text-sm font-semibold text-gray-700 mb-2">
                Total Wedding Budget
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-600 text-lg">$</span>
                <input
                  id="totalBudgetCents"
                  name="totalBudgetCents"
                  type="number"
                  placeholder="e.g., 30000"
                  required
                  min="1"
                  max="1000000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Maximum $1,000,000</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 font-semibold rounded-lg transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating event...
                </div>
              ) : (
                'Create Event'
              )}
            </button>
          </form>

          {/* Helper Text */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> Your timezone will be used to display all dates and times correctly throughout the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
