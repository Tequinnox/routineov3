'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import AuthGuard from '@/components/AuthGuard';
import { getUserSettings, updateUserSettings } from '@/services/settings';

export default function SettingsPage() {
  const { user } = useUser();
  const [resetTime, setResetTime] = useState('06:00'); // Default to 6 AM
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        console.log('Loading settings for user:', user.uid);
        const settings = await getUserSettings(user.uid);
        console.log('Loaded settings:', settings);
        if (settings?.reset_time) {
          setResetTime(settings.reset_time);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings');
      }
    };
    loadSettings();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSaving) return;

    try {
      setIsSaving(true);
      setError('');
      console.log('Saving settings for user:', user.uid, 'reset_time:', resetTime);
      await updateUserSettings(user.uid, { reset_time: resetTime });
      console.log('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-semibold mb-6">Settings</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="resetTime" className="block text-sm font-medium text-gray-700">
                Daily Reset Time
              </label>
              <input
                type="time"
                id="resetTime"
                value={resetTime}
                onChange={(e) => setResetTime(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your routine items will reset at this time each day
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
} 