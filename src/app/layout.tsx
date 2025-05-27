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
          <div className="pt-[calc(3rem+env(safe-area-inset-top))] pb-16"> {/* Add padding for header and nav */}
            {children}
          </div>
          <BottomNavWrapper />
        </UserProvider>
      </body>
    </html>
  );
}
