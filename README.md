# FitForge (Expo + Supabase)

A mobile workout tracker built with Expo Router, TypeScript, NativeWind, and
Supabase.

## What’s Implemented

### Core screens (existing)

- Auth: login, signup, verify email, resend verification, forgot password, reset
  password
- Tabs: Dashboard, Exercise Library, Log Workout, History, Profile (hidden
  route)
- UI primitives: `TabScreen`, `Button`, `Card`, `ModalView`, `CustomAlert`

### Core user loop

1. Discover exercises (Library)
2. Log workout (Log Workout)
3. Save workout to Supabase
4. View workout history (History)
5. See progress (Dashboard) — UI exists, data wiring needs finishing (see below)

## MVP Reality Check (as of May 6, 2026)

You are close. The app reads as “real product” once these are addressed:

### MVP blockers / polish gaps

3. **Dead-end navigation in Nav Drawer**
   - Drawer contains routes like `/(tabs)/settings`, `/(tabs)/achievements`,
     `/(tabs)/community`, `/privacy` which don’t exist yet.

4. **Alert UX inconsistency**
   - `AlertContext` exists and is used in auth screens.
   - Profile and Log Workout still use local state / native alerts in places.

## By-Friday Plan (High ROI)

This is the shortest path to “portfolio-ready MVP”.

### 1) Make workouts a single source of truth (AuthContext)

**Goal:** Dashboard, History, and other screens can all read the same `workouts`
state.

- Update: `context/AuthContext.tsx`
  - Call `refreshWorkouts()` automatically when `user.id` becomes available.
  - Clear workouts on logout / when `user` becomes null.

### 2) Refresh workouts after saving

**Goal:** After saving a workout, Dashboard updates without relaunching.

- Update: `app/(tabs)/log-workout.tsx`
  - Pull `refreshWorkouts` from `useAuth()`.
  - After successful `insert`, call `await refreshWorkouts()`.

### 3) Ensure workout `date` is always present

**Goal:** Sorting + History rendering never breaks.

- Update: `app/(tabs)/log-workout.tsx`
  - Include `date: new Date().toISOString()` in the insert.

### 4) Fix dashboard calculations to match real data

**Goal:** `totalSets`, streak, and weekly volume use the real saved workout
shape.

- Update: `helpers/dashboardUtils.ts`
  - Count sets using `workout.exercises[].sets.length`.
  - Parse `total_volume` defensively (number or string).
  - Use `workout.date ?? workout.created_at` for all date logic.

### 5) Unify alert UX

**Goal:** Consistent branded alerts across the app.

- Update: `app/(tabs)/profile.tsx`
  - Replace native `Alert.alert` with `useAlert().showAlert`.

- Optional update: `app/(tabs)/log-workout.tsx`
  - Replace local alert state with `AlertContext` (or keep local for now if you
    want minimal edits).

### 6) Remove dead routes (or add placeholders)

**Goal:** No broken navigation.

- Update: `components/ui/NavDrawer.tsx`
  - EITHER remove/disable items that don’t exist yet
  - OR create minimal placeholder routes to match the drawer.

## Notes on Current Data Model

### Saved workouts (observed from usage)

- Stored in Supabase table `workouts`
- Inserted from `app/(tabs)/log-workout.tsx` as:
  - `user_id`
  - `exercises` (array)
  - `total_volume` (number)
  - `notes` (string)
  - **Recommended:** `date` (ISO string)

### Workout sets

Sets are nested under exercises:

```ts
workout.exercises: Array<{
  name: string;
  sets: Array<{ reps: string; weight: string; id: number }>
}>
```

## Running the App

```bash
npm install
npx expo start
```

## Portfolio “Stand Out” Features (after MVP polish)

If time remains after the by-Friday list:

### Best front-end-heavy upgrades

- **Workout Templates** (save a workout structure and start from it)
- **“Last performed” / suggested weight** in Log Workout when adding an exercise
  (pull from history)
- **Type safety pass**: replace `any` with typed `Workout`, `WorkoutExercise`,
  `WorkoutSet`, `Profile`

### Bigger engineering signal (optional)

- Offline-first logging with queued sync

## Known UI placeholders (acceptable for MVP if labeled)

- Library exercise GIF (“coming soon”)
- Profile achievements/lifetime totals/recent workouts sections
