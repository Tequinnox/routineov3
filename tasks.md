# ✅ Routineo MVP Build Tasks (Firebase + Dashboard Template Edition)

---

## 🚀 PHASE 1: Bootstrap & Template

### 1.1 — Clone Vercel Next.js Dashboard Template
- Start: Use `npx create-next-app -e https://github.com/vercel/nextjs-dashboard`
- End: Template boots and renders main UI

### 1.2 — Setup Tailwind CSS (Preconfigured)
- Start: Confirm Tailwind is functional
- End: `.bg-blue-500` styles an element

### 1.3 — Install Firebase SDK
- Start: `npm install firebase`
- End: Create `lib/firebaseClient.ts` with config

### 1.4 — Add Firebase Env Vars
- Start: `.env.local` with Firebase credentials
- End: App loads credentials and Firebase initializes

---

## 🔐 PHASE 2: Auth Setup

### 2.1 — Enable Firebase Auth Providers
- Start: Enable Email/Password + Google in Firebase console
- End: Auth system is ready

### 2.2 — Build Login/Signup Page
- Start: Form at `/auth`
- End: User can sign up or log in; redirected to Home

### 2.3 — Add useUser() Hook
- Start: Wrap Firebase `onAuthStateChanged`
- End: Session state is accessible across app

### 2.4 — Protect Routes
- Start: Wrap pages in auth check
- End: Unauthenticated users redirected to `/auth`

---

## 📋 PHASE 3: Firestore Models

### 3.1 — Enable Firestore
- Start: Activate in Firebase console
- End: Ready to store `items` and `user_settings`

### 3.2 — Create `items` Collection
- Start: Add sample document with expected fields
- End: Verified working in Firestore

### 3.3 — Create `user_settings` Collection
- Start: Store `reset_time` under user UID
- End: Settings load correctly

---

## 📄 PHASE 4: Pages & Navigation

### 4.1 — Create `/` Home Screen
- Start: Show current day's items grouped by part of day
- End: Rendered list with checkbox toggle

### 4.2 — Create `/edit` Page
- Start: UI to add/edit/delete items
- End: Firestore updates reflect in UI

### 4.3 — Create `/settings` Page
- Start: UI to set `reset_time`
- End: Saves setting to Firestore

### 4.4 — Add `<BottomNav />` Component
- Start: Bottom tabs: Home | Edit | Settings
- End: Persistent on all pages post-login

---

## 🧱 PHASE 5: Item Logic

### 5.1 — Add `useItems()` Hook
- Start: Fetch today’s items by user + weekday
- End: Logs correct list

### 5.2 — Toggle `is_checked`
- Start: Add checkbox handler
- End: Firestore updates when toggled

### 5.3 — Submit New Item
- Start: Create via form on `/edit`
- End: Item shows in Firestore and UI

### 5.4 — Delete or Edit Item
- Start: Add actions to each item row
- End: Changes persist in DB

---

## ⚙️ PHASE 6: Daily Reset

### 6.1 — Store Last Reset in localStorage
- Start: Save timestamp after reset
- End: Skips repeat resets

### 6.2 — Compare to `reset_time`
- Start: On load, fetch setting + compare time
- End: Logs “Reset needed” or “Skip”

### 6.3 — Reset Items
- Start: Set today’s `is_checked = false`
- End: Firestore reflects update

---

## 📦 PHASE 7: Mobile Deployment

### 7.1 — Init Capacitor
- Start: `npx cap init`
- End: `capacitor.config.ts` created

### 7.2 — Export Site
- Start: `next build && next export && npx cap copy`
- End: Files copied to native projects

### 7.3 — Open and Run in Simulator
- Start: `npx cap open ios` or `android`
- End: App launches natively

---

## ✅ Final Checks

- [ ] Can log in/out
- [ ] Can add/edit/delete items
- [ ] Can mark items complete
- [ ] Items reset at correct time
- [ ] Navigation is persistent on mobile
