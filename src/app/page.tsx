'use client';

import { useUser } from "@/hooks/useUser";
import AuthGuard from "@/components/AuthGuard";
import { useItems } from "@/hooks/useItems";
import { ItemCard } from "@/components/ItemCard";
import { auth } from "@/lib/firebaseClient";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading: userLoading } = useUser();
  const { items, loading: itemsLoading, error, toggleItem } = useItems(user?.uid || '');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (userLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const itemsByPartOfDay = items.reduce((acc, item) => {
    if (!acc[item.part_of_day]) {
      acc[item.part_of_day] = [];
    }
    acc[item.part_of_day].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Today's Routine</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
          {(['morning', 'afternoon', 'evening'] as const).map((partOfDay) => (
            <div key={partOfDay} className="space-y-2">
              <h2 className="text-lg font-semibold capitalize">{partOfDay}</h2>
              <div className="space-y-2">
                {itemsByPartOfDay[partOfDay]?.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                  />
                ))}
                {!itemsByPartOfDay[partOfDay]?.length && (
                  <div className="text-gray-500 text-center py-4">
                    No items for {partOfDay}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
