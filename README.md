# FitForge 🏋️

**A mobile-first workout tracker built with React Native, Expo, TypeScript and Supabase.**

FitForge focuses on straightforward workout logging, training history, progress summaries and a customizable mobile experience. It is also a portfolio project exploring authentication, async data flows, reusable UI, automated testing and native-platform debugging.

[![Android APK](https://img.shields.io/badge/Android-Download%20APK-3DDC84?logo=android&logoColor=white)](https://github.com/ShaAnder/fitforge/releases/tag/v0.3)
[![Release](https://img.shields.io/badge/Release-v0.3-blue)](https://github.com/ShaAnder/fitforge/releases/tag/v0.3)
[![Source](https://img.shields.io/badge/Source-GitHub-181717?logo=github)](https://github.com/ShaAnder/fitforge)

> **Try it:** Download the **v0.3 Android APK** from [GitHub Releases](https://github.com/ShaAnder/fitforge/releases/tag/v0.3). This is an Android app, **not a supported browser demo**. Release v0.3 is currently marked **pre-release** on GitHub. The developer reports testing this APK successfully; compatibility with every device/emulator is not guaranteed.

## 📱 Install and try FitForge

### Option A — Physical Android device (recommended)

1. Visit [FitForge v0.3 on GitHub Releases](https://github.com/ShaAnder/fitforge/releases/tag/v0.3).
2. Expand **Assets** and download the `.apk` file.
3. Open the downloaded APK on your Android device and follow Android's installation prompts. You may need to allow installation from the app you used to open the APK.
4. Launch FitForge and follow the on-screen sign-up/sign-in flow.

**Security note:** Only download the APK from this repository's official GitHub Release. Android may warn that a sideloaded app did not come from the Play Store; review the source and permissions before choosing to install.

### Option B — Android emulator

1. Start an Android emulator (for example, through Android Studio).
2. Download the v0.3 APK and install it in the emulator. Dragging the APK onto a running emulator may work; alternatively use `adb install path/to/file.apk`.
3. Launch FitForge from the emulator's app launcher.
4. For email verification, password reset or other authentication links, **open the URL inside the emulator's own browser** when testing the emulator installation.

**Why the redirect matters:** If an authentication email opens a link in your computer's desktop browser, the desktop cannot necessarily hand the deep link back to the app running in the emulator. Opening the link in the emulator browser keeps the link handling in the same Android environment. Redirect behavior can vary by email provider, browser and device configuration.

### Current testing limitations

- **Android APK:** Available in Release v0.3; developer-tested and reported working.
- **Android emulator:** A supported way to evaluate the APK, but you may need to handle auth URLs manually as described above.
- **Desktop/web:** Not an available portfolio demo. Although the Expo project includes web tooling, the browser version is **not currently confirmed functional or supported**.
- **iOS:** Source includes Expo/iOS tooling; no public iOS installable release is linked here.

## What you can explore

- **Authentication:** Email/password sign-up and sign-in, email verification, password-reset flow and session restoration.
- **Workout logging:** Record exercises, sets, reps and weight; validate inputs before saving.
- **Progress dashboard:** Workout counts, streaks, volume summaries and a weekly volume chart.
- **Workout history and exercise library:** Review saved training sessions and browse exercises.
- **Personalization:** Profile editing, avatar upload, kg/lb preferences and accent colors.
- **Notifications and settings:** Reminder configuration and related native-platform integrations.

Some secondary screens (such as community and achievements) are **placeholders**, not completed social or achievement systems. Features depend on a working backend configuration and permissions.

## Technology stack

| Area | Technology |
| --- | --- |
| Mobile UI and navigation | React Native, Expo, Expo Router, TypeScript |
| Styling and interaction | NativeWind, React Native Reanimated |
| Backend services | Supabase Auth, PostgreSQL, Storage |
| Async data and forms | TanStack React Query, React Hook Form, Zod |
| Device integrations | Expo Notifications, Expo Image Picker and linking APIs |
| Tests | Jest, jest-expo, React Native Testing Library |

## Engineering decisions

### Session bootstrap and navigation

FitForge coordinates the persisted Supabase session, authentication listeners and user-profile loading during startup. The aim is to prevent protected screens appearing before the application knows the user's authentication state. Context providers expose shared state while keeping reusable domain and data-access logic separate.

### Data access and database security

Query helpers in `lib/supabaseQueries.ts` centralize parts of the Supabase interaction and error handling. Authentication in the client is not itself an authorization boundary; access to user data and storage must also be enforced by backend/database policies. Avatar-storage policy SQL is documented in [`docs/storage-rls-policies.sql`](docs/storage-rls-policies.sql).

### Reusable UI and form handling

Shared components, reusable hooks, context providers and validation keep screens smaller and help make flows easier to test. Expo Router organizes navigation through file-based routes.

## Debugging examples

**Authentication and startup races:** The app needs to restore a session and load dependent profile data without allowing inconsistent UI or stale async work to control navigation. This prompted more careful coordination of auth state and startup loading.

**Avatar upload failures:** React Native file/blob handling and Supabase Storage authorization created intermittent upload errors. The implementation and supporting policy documentation address media transfer and per-user upload permissions. The relevant implementation can be inspected in [`lib/supabaseQueries.ts`](lib/supabaseQueries.ts).

**Web versus mobile:** Native permissions, emulator deep links and device-specific APIs don't behave the same way as a desktop React app. The Android installation and redirect instructions above are part of the project's known testing constraints.

## Testing

The repository includes Jest and React Native Testing Library coverage for utility logic, context behavior, data wrappers and components, as described in the existing project documentation. To run the locally available suite:

```bash
npm install
npm test
```

The presence of automated tests is not a claim that every feature or Android device has been covered; the packaged APK should also be tested on-device.

## Run locally (development)

### Prerequisites

- Node.js and npm
- A working Android development environment/emulator (or a physical test device)
- A Supabase project with compatible database schema, auth settings and storage policies

```bash
git clone https://github.com/ShaAnder/fitforge.git
cd fitforge
npm install
```

Create a `.env` file for your own Supabase project:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
```

Then use the package scripts:

```bash
npm start
npm run android
npm test
```

**Important:** A fresh clone requires compatible Supabase setup, including schema/policies and redirect configuration; supplying environment variables alone may not reproduce the published installation. Never place a Supabase service-role key in a mobile app or `EXPO_PUBLIC_` variable. The `npm run web` script exists for development tooling but should not be treated as a working browser release.

## Project status and next steps

- **Available for evaluation:** Android APK v0.3 (GitHub pre-release).
- **Not advertised as shipped:** Browser deployment, iOS installation, full community/achievements features.
- **Potential future work:** More advanced analytics, library filtering, offline support, richer notifications, and expanded device testing.

## Source and release

- [Repository](https://github.com/ShaAnder/fitforge)
- [Android APK — v0.3](https://github.com/ShaAnder/fitforge/releases/tag/v0.3)

Built as an independent software-development portfolio project.
