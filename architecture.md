# 🧠 Routineo App Architecture (Firebase + Vercel Dashboard Template)

## 📱 Overview

Routineo is a mobile-only personal routine tracking app designed for users to:
- Log in/sign up
- View and check off routine **items** each day
- Edit their routine (add/edit/delete items)
- Set a daily reset time for auto-refresh

---

## 🧰 Tech Stack

- **Frontend**: [Next.js Dashboard Template by Vercel](https://vercel.com/templates/next.js/dashboard)
- **Auth**: Firebase Auth (email/password, Google OAuth)
- **Database**: Firestore (NoSQL)
- **Mobile Shell**: Capacitor (iOS/Android native support)

---

## 🖥️ Screens and Navigation

- **Login / Sign-up Page**: Firebase Auth
- **Home Screen**: View today's routine items; mark as done
- **Edit Routine Page**: Add, edit, delete routine items
- **Settings Page**: Update reset time
- **Bottom Navigation Bar**: Present across all 4 main screens

---

## 🗂️ Folder Structure

```bash
routineo/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Home screen
│   ├── auth/                 # Login/Signup
│   ├── edit/                 # Edit routine items
│   ├── settings/             # User preferences
│
├── components/
│   ├── ItemCard.tsx          # UI for displaying individual items
│   ├── ItemForm.tsx          # Form for creating/editing items
│   └── BottomNav.tsx         # Bottom navigation bar
│
├── lib/
│   ├── firebaseClient.ts
│   ├── firestore.ts
│   └── time.ts
│
├── types/
│   └── item.ts
│
├── services/
│   ├── items.ts
│   └── auth.ts
│
├── hooks/
│   ├── useUser.ts
│   └── useItems.ts
│
├── capacitor/
├── public/
├── styles/
├── .env.local
├── package.json
└── README.md
```

---

## 🧠 Firestore Models

### Collection: `items`
```json
{
  "name": "Take vitamins",
  "part_of_day": "morning",
  "day_of_week": ["Monday", "Tuesday"],
  "order": 1,
  "is_checked": false,
  "user_id": "firebase-uid"
}
```

### Collection: `user_settings`
```json
{
  "reset_time": "06:00"
}
```

---

## 🔄 Daily Reset Logic

- Compare current time to `reset_time`
- If reset is due and hasn't been performed today:
  - Reset all today's `is_checked` values to `false`
  - Track last reset in `localStorage`

---

## 🛠️ Responsibilities

| Layer         | Technology          | Role                                      |
|---------------|---------------------|-------------------------------------------|
| UI            | Next.js Template    | Screens, navigation, layout               |
| Auth          | Firebase Auth       | Login, Signup, Session                    |
| DB            | Firestore           | Store items and settings                  |
| Native Shell  | Capacitor           | Deploy as native app on iOS/Android       |

---

## 📲 Mobile Packaging (Capacitor)

- `npx cap init`
- `next build && next export && npx cap copy`
- Open in Xcode / Android Studio and publish

---

## ✨ Future Ideas

- Reminders via push notifications
- Progress streak tracking
- Item analytics and reports
