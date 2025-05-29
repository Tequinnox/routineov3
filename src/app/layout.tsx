'use client';

import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Inter } from 'next/font/google';
import "./globals.css";
import { UserProvider } from '@/hooks/useUser';
import BottomNavWrapper from '../components/BottomNavWrapper';
import Header from '../components/Header';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.setStyle({ style: Style.Light });
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <UserProvider>
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <BottomNavWrapper />
        </UserProvider>
      </body>
    </html>
  );
}
