'use client';

import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, PencilSquareIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/edit', label: 'Edit', icon: PencilSquareIcon },
  { path: '/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1
                ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
} 