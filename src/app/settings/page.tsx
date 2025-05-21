'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import AuthGuard from '@/components/AuthGuard';
import { getUserSettings, updateUserSettings } from '@/services/settings';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Generate time options in 30-minute intervals
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

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
      <div className="min-h-screen bg-gray-50 pt-16 px-4">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetTime">Reset Routine At</Label>
                  <Select
                    value={resetTime}
                    onValueChange={setResetTime}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="resetTime" className="w-full">
                      <SelectValue placeholder="Select reset time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Your routine items will reset at this time each day
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="space-y-2">
                <Label>Account</Label>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Logging out...</span>
                    </div>
                  ) : (
                    'Log Out'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
} 