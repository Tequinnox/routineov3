import { db } from '@/lib/firebaseClient';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UserSettings {
  reset_time: string;  // Format: "HH:mm" (24-hour)
  user_id: string;
}

// Get user settings
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const settingsRef = doc(db, 'user_settings', userId);
  const settingsDoc = await getDoc(settingsRef);
  return settingsDoc.exists() ? settingsDoc.data() as UserSettings : null;
}

// Update user settings
export async function updateUserSettings(userId: string, settings: Pick<UserSettings, 'reset_time'>) {
  const settingsRef = doc(db, 'user_settings', userId);
  return setDoc(settingsRef, {
    ...settings,
    user_id: userId
  }, { merge: true });
} 