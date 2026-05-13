# FitForge

![FitForge](assets/images/icon.png)

**FitForge** is a cross-platform fitness tracking mobile app built with Expo and
React Native. It delivers fast workout logging, meaningful analytics, secure
Supabase-backed authentication, and a polished boot experience that keeps the
splash screen visible until the entire app (auth + data) is ready.

---

## Contents

- [Project Objectives](#project-objectives)
- [User Experience](#user-experience)
- [Key Design & Architecture Choices](#key-design--architecture-choices)
- [Features](#features)
- [Testing](#testing)
- [Challenges](#challenges)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup & Local Development](#setup--local-development)
- [Deployment Notes](#deployment-notes)
- [Future Enhancements](#future-enhancements)
- [Credits](#credits)
- [License](#license)

---

## Project Objectives

This project was built as a **portfolio showcase** to demonstrate
production-grade React Native development:

- Clean architecture with separated concerns (contexts, helpers, lib,
  components)
- Robust authentication + data bootstrapping flow
- Testable business logic (dashboard math, unit conversion, Supabase wrappers)
- Stable, memoized context providers to prevent render loops and performance
  issues
- Professional error handling, loading states, and user feedback via global
  alerts
- Reusable, accessible UI components with consistent theming (accent system)

---

## User Experience

### Target Audience

Fitness enthusiasts who want a **simple, fast, and beautiful** workout logger
without bloat. Also built to impress recruiters and technical evaluators.

### Core User Flows

- **Onboarding**: Secure email/password signup → email verification → login
- **Daily Use**: Quick workout logging → instant dashboard refresh
- **Review**: History, streak tracking, weekly volume charts, progress cards
- **Customization**: Profile, accent color picker, unit preference (kg/lbs),
  notifications
- **Support**: Bug reporting, privacy/terms, community placeholder

### Boot Experience

The native splash screen stays visible until:

1. Expo Router is ready
2. Supabase session is restored
3. User profile + recent workouts are loaded

This eliminates the common “flash of unauthenticated content” problem.

---

## Key Design & Architecture Choices

- **Dark-first UI** with dynamic accent colors (green default, changeable via
  profile)
- **Context-driven state**: `AuthContext`, `AlertContext`, `AccentContext`
- **Stabilized providers**: `useCallback` + `useMemo` + `useRef` patterns to
  prevent render loops (especially important in tests)
- **Data Layer**: Clean wrappers in `lib/supabaseQueries.ts` with logging and
  error handling
- **Helpers**: Pure functions for dashboard calculations, unit conversion,
  notifications
- **Navigation**: Expo Router (file-based) + protected routes + custom tab bar
  with center log button + slide-up drawer
- **Theming**: NativeWind + accent system for consistent, swappable color
  schemes

---

## Features

### Authentication & Onboarding

- Full email/password auth with Supabase
- Email verification + resend flow
- Password reset with deep linking support
- Global `AlertContext` for consistent success/error messaging
- Secure session restoration + real-time auth listener

### Dashboard

- Current streak counter
- Monthly volume & workout count cards
- Weekly volume bar chart (`WeeklyVolumeChart`)
- Personalized greeting
- Unit-aware display (kg ↔ lbs)

### Workout Logging

- Dynamic exercise slots
- Set/reps/weight tracking
- Exercise library integration
- Validation before saving
- Auto-refresh dashboard after logging

### Additional Screens

- **History** – Past workouts with filters
- **Library** – Browse / search exercises
- **Profile** – Edit details, avatar upload, accent picker
- **Settings** – Units, notifications, bug report
- **Report Bug**, Achievements, Community (placeholders)

### Other Polish

- Push notification setup (expo-notifications with safe fallbacks)
- Avatar upload to Supabase Storage
- Responsive cards, modals, progress bars, and loading states

---

## Testing

FitForge follows a **hybrid testing strategy** focused on critical logic and
stability.

### Covered Areas

- Dashboard utilities (`dashboardUtils.ts`)
- Unit conversion logic (`unitConverter.ts`)
- Supabase query wrappers (`supabaseQueries.test.ts`)
- `AuthContext` (bootstrap flow, loading states, error handling)
- `AlertContext` & `AccentContext` stability
- Core UI components (Button, LoadingScreen, CustomAlert, etc.)

### Running Tests

```bash
npm test                    # Full suite
npm test -- tests/context/AuthContext.test.tsx   # Single file
```

## Challenges

This project encountered real-world integration and platform challenges during
development. Addressing these helped harden the app and surface common pitfalls
when building mobile apps with React Native + Supabase.

- **First native app: web ≠ mobile** — Symptom: code patterns from web didn't
  transfer directly; navigation felt clunky, contexts re-rendered excessively,
  and platform-specific APIs (camera, notifications, permissions) required
  special handling. Root cause: React Native has different lifecycle and
  threading models; web idioms don't map 1:1 to mobile. Solution: adopted
  memoization + `useCallback` + `useMemo` throughout contexts to prevent render
  storms; used Expo modules (`expo-notifications`, `expo-image-picker`,
  `expo-permissions`) for safe platform abstraction; learned to debug on both
  Android emulator and physical device early.

- **AuthContext: state management + bootstrap** — Symptom: the context needed to
  handle sign-up, login, logout, password reset, email verification, and profile
  data loading without triggering re-renders or race conditions. Root cause:
  naive state management led to components rendering multiple times per second;
  Supabase session changes, profile loads, and UI updates happened
  asynchronously and out of order. Solution: stabilized the context with
  `useCallback` for all listeners and state setters; kept only minimal state
  (session, user, profile) in context and pushed helpers to separate hooks; used
  a bootstrap sequence (restore session → load profile → mark ready) so the
  splash screen stays visible until data is truly ready. See
  [context/AuthContext.tsx](context/AuthContext.tsx).

- **Learning Supabase from scratch** — Symptom: early integration attempts
  didn't account for RLS policies, real-time subscriptions, and the difference
  between the Supabase JS SDK (web-optimized) and React Native. Root cause:
  Supabase documentation is web-centric; mobile environments have stricter
  serialization, different permission models, and network timeouts. Solution:
  built a query wrapper layer (`lib/supabaseQueries.ts`) to isolate Supabase
  calls; applied RLS policies rigorously and tested each policy before moving
  forward; documented storage bucket permissions in
  [docs/storage-rls-policies.sql](docs/storage-rls-policies.sql); increased
  request timeouts for mobile networks (60s vs web defaults); avoided Supabase
  Storage SDK for uploads in favor of direct HTTP REST calls with bearer token
  (more reliable in RN).

- **Breaking up settings: context + hooks pattern** — Symptom: profile data
  (units, notifications, accent color, name, email) lived in one giant context
  that mixed UI state with data state. Root cause: no clear separation between
  what belongs in global context (auth session, theme) and what belongs in local
  component state or custom hooks. Solution: created dedicated contexts
  (`AccentContext`, `AlertContext`) and custom hooks (`useAccent`,
  `useReminderSettings`, `useProfilePreferences`) so each domain is
  independently testable; moved profile mutations to query functions rather than
  context methods, simplifying logic; contexts now only manage global settings
  that multiple features need. This made testing easier and reduced context
  churn.

- **Avatar upload: serialization + RLS policy** — Symptom: image uploads failed
  intermittently with "Aborted" or "Network request failed" when sending a
  picked image from the app. Root cause: (1) React Native/SDK serialization
  mismatch (raw ArrayBuffer didn't serialize reliably on RN) and (2) Storage RLS
  policies blocked INSERTs for unauthorised object names. Fixes applied: fetch
  the local file as a Blob and PUT it to Supabase Storage using the user's
  access token; add Storage RLS SQL to allow authenticated users to upload files
  whose names start with their user id; increase request timeout and reduce
  client-side image quality to speed transfers. See
  [lib/supabaseQueries.ts](lib/supabaseQueries.ts) and
  [docs/storage-rls-policies.sql](docs/storage-rls-policies.sql).

### Deep Dive: Avatar Upload Fix

The avatar upload challenge involved multiple interconnected issues. Here's how
I debugged and resolved it:

**Steps taken:**

1. Added targeted logging around the image picker, file read, and upload calls
   to capture file sizes, MIME types, and HTTP responses.
2. Reproduced the failure and identified that `ArrayBuffer` serialization was
   unreliable in the RN environment; switching to a web-style `Blob` fixed
   serialization for network transport.
3. Verified auth was present and passed the existing `access_token` from
   `AuthContext` to the uploader to avoid extra `getSession()` network calls.
4. Applied a Storage RLS policy so authenticated users could INSERT objects
   whose filenames began with their user id (SQL in
   `docs/storage-rls-policies.sql`).
5. Reduced image quality at selection and increased fetch timeout to 60s for
   robustness on slow mobile networks.

**Core code change** (from `lib/supabaseQueries.ts`):

```ts
// Read local file as a Blob
const response = await fetch(asset.uri);
if (!response.ok) throw new Error("Failed to read file");
const blob = await response.blob();

// Direct PUT to Supabase Storage REST endpoint using auth token
const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/avatars/${fileName}`;
await fetch(uploadUrl, {
	method: "PUT",
	headers: {
		"Content-Type": blob.type,
		"Authorization": `Bearer ${accessToken}`,
	},
	body: blob,
});
```

This combination fixed the abort/network errors and made uploads reliable.

## Project Structure

```txt
fitforge/
├── app.json
├── babel.config.js
├── eas.json
├── expo-env.d.ts
├── global.css
├── jest.config.js
├── jest.setup.js
├── metro.config.js
├── nativewind-env.d.ts
├── package.json
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── __mocks__/
│   └── react-native-css-interop.js
├── android/
│   ├── build.gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── settings.gradle
│   └── app/
│       ├── build.gradle
│       └── src/
├── app/
│   ├── _layout.tsx
│   ├── forgot-password.tsx
│   ├── login.tsx
│   ├── resend-verification.tsx
│   ├── reset-password.tsx
│   ├── signup.tsx
│   ├── verify-email.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── achievements.tsx
│       ├── community.tsx
│       ├── dashboard.tsx
│       ├── history.tsx
│       ├── index.tsx
│       ├── library.tsx
│       ├── log-workout.tsx
│       ├── more.tsx
│       ├── privacy.tsx
│       ├── profile.tsx
│       ├── report-bug.tsx
│       ├── settings.tsx
│       └── tabs-specific files
├── assets/
│   ├── fonts/
│   └── images/
├── components/
│   ├── __tests__/
│   ├── common/
│   │   ├── Avatar.tsx
│   │   ├── Header.tsx
│   │   └── StatCard.tsx
│   ├── dashboard/
│   │   └── WeeklyVolumeChart.tsx
│   ├── layout/
│   │   └── TabScreen.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── LoadingScreen.tsx
│   └── workout/
│       └── ExerciseSlot.tsx
├── constants/
│   ├── accents.ts
│   ├── legal.ts
│   └── reminders.ts
├── context/
│   ├── AccentContext.tsx
│   ├── AlertContext.tsx
│   └── AuthContext.tsx
├── docs/
│   └── storage-rls-policies.sql
├── handlers/
│   └── notificationHandler.ts
├── helpers/
│   ├── dashboardUtils.ts
│   ├── logWorkoutUtils.ts
│   └── notificationHelpers.ts
├── hooks/
│   ├── useAccent.ts
│   ├── useAccountActions.ts
│   └── useAuthActions.ts
├── lib/
│   ├── supabase.ts
│   └── supabaseQueries.ts
├── tests/
│   ├── app/
│   ├── components/
│   └── helpers/
├── types/
│   └── index.ts
└── utils/
    ├── avatarUtils.ts
    ├── getError.ts
    └── unitUtils.ts

```

## Technologies Used

- **Expo** (SDK + Router + Notifications + Splash Screen)
- **React Native** + TypeScript
- **Supabase** (Auth, Postgres, Storage, Realtime)
- **NativeWind** (Tailwind CSS for React Native)
- **Jest** + **jest-expo** + React Testing Library
- **React Reanimated**, `@expo/vector-icons`, and other Expo modules

---

## Setup & Local Development

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator or a physical device
- A Supabase project with the required tables (`profiles`, `workouts`) and
  storage bucket

### Installation

```bash
git clone <your-repo-url>
cd fitforge
npm install
```

## Environment Variables

Create a .env file in the root (or use Expo EAS secrets for production):

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Run Commands

```bash
npm run start          # Start development server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run web version (secondary)

npm test               # Run full test suite
```

## Deployment Notes

- Built for Expo Application Services (EAS) builds
- Splash screen is configured in app.json using assets/images/splash-icon.png
- Use environment-specific Supabase keys in production
- Web version is functional but the app is mobile-first

## Future Enhancements

- Advanced analytics & trend charts
- Enhanced exercise library with muscle group filters and search
- Social features (share workouts, community feed)
- Offline support (WatermelonDB or similar)
- Apple Health / Google Fit integration
- Full dark/light mode toggle (beyond current accent system)

## Credits

Built as a focused portfolio project to demonstrate real-world React Native +
Supabase skills. Special thanks to:

- The Expo team for excellent tooling and documentation
- Supabase for making auth and backend simple and powerful
- The React Native and Jest communities

## License

MIT © shaAnder
