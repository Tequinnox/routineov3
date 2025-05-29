'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseClient';
import { FirebaseError } from 'firebase/app';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError('');
      console.log('Attempting auth with:', { email, isSignUp });
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Handle specific error cases
      if (err.code === 'auth/network-request-failed') {
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setError(`Network error. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          // Wait 2 seconds before retrying
          setTimeout(() => {
            handleEmailAuth(e);
          }, 2000);
          return;
        }
        setError("Network connection failed. Please check your internet connection and try again.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
      setRetryCount(0);
    } finally {
      if (retryCount >= MAX_RETRIES) {
        setIsLoading(false);
      }
    }
  };

  // Reset retry count when email or password changes
  useEffect(() => {
    setRetryCount(0);
  }, [email, password]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <img
          src="/icons/app-icon/rivo icon v2.png"
          alt="Rivo logo"
          className="mx-auto mb-6 w-20 h-20 object-contain"
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-white border rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black/50"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-white border rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black/50"
              />
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-black/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>{retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Signing in...'}</span>
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-4 w-full text-sm text-black hover:text-black/80"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 