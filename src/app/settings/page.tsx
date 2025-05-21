'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import AuthGuard from '@/components/AuthGuard';
import { getUserSettings, updateUserSettings } from '@/services/settings';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [resetTime, setResetTime] = useState('06:00'); // Default to 6 AM
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      setError('');
      
      // First try to sign out
      await signOut(getAuth());
      
      // Clear any local storage items
      localStorage.removeItem('routineo_last_reset');
      
      // Small delay to ensure Firebase has processed the sign out
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then redirect
      router.push('/auth');
    } catch (err) {
      console.error('Error logging out:', err);
      if (err instanceof Error && err.message.includes('network')) {
        setError('Network error during logout. Please try again.');
      } else {
        setError('Failed to log out. Please try again.');
      }
      setIsLoggingOut(false);
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

          <div className="mt-6">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 