import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { UserProvider } from '@/hooks/useUser';
import BottomNavWrapper from '@/components/BottomNavWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Routineo",
  description: "Your daily routine tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <div className="pb-16"> {/* Add padding to prevent content from being hidden behind nav */}
            {children}
          </div>
          <BottomNavWrapper />
        </UserProvider>
      </body>
    </html>
  );
}
