# Auth Flow Notes

This note is for explaining the FitForge auth and dashboard bootstrap flow in a
clear interview-ready way.

It focuses on the logic in [context/AuthContext.tsx](../context/AuthContext.tsx).

## Flow 1: Cold Open With a Stored Session

### Goal

Ensure the app does not show dashboard content too early and does not bootstrap
user-scoped data until auth state is definitively known.

### Core code pieces for this flow

These are the exact pieces in `AuthContext` that create the flow:

#### 1. Initial provider state

```ts
const [user, setUser] = useState<User | null>(null);
const [session, setSession] = useState<Session | null>(null);
const [profile, setProfile] = useState<Profile | null>(null);
const [workouts, setWorkouts] = useState<Workout[]>([]);
const [loading, setLoading] = useState(true);
const [authResolved, setAuthResolved] = useState(false);
```

This is the starting point for the whole auth boot process.

#### 2. Stable refs used by the flow

```ts
const showAlertRef = useRef<typeof showAlert | null>(null);
const lastUserIdRef = useRef<string | null>(null);
```

`showAlertRef` keeps alerts callable from long-running async work without
forcing effect reruns.

`lastUserIdRef` prevents duplicate bootstrap work for the same user.

### Mount state

The provider starts with:

- `loading = true`
- `authResolved = false`
- `user = null`
- `session = null`
- `profile = null`
- `workouts = []`

This means the UI should still be blocked while auth is being resolved.

### Effect 1: Resolve auth state

The first `useEffect` is responsible only for auth resolution.

#### Exact effect entry guard and local cleanup state

```ts
useEffect(() => {
	let cancelled = false;
	let unsubscribe: (() => void) | null = null;
```

This effect uses a local `cancelled` flag so stale async completions do not keep
writing state after cleanup.

It:

1. tries to initialize Supabase
2. calls `supabase.auth.getSession()`
3. stores `session` and `user`
4. sets `authResolved = true` once the initial auth check is complete
5. registers `onAuthStateChange` so later login/logout events keep auth state in sync

#### Supabase initialization and failure branch

```ts
try {
	supabase = getSupabase();
} catch (err: unknown) {
	const message = getErrorMessage(err);

	if (!cancelled) {
		setSession(null);
		setUser(null);
		setAuthResolved(true);
		setLoading(false);

		showAlertRef.current?.("Configuration Error", message, "error");
	}
	return;
}
```

This is the branch that safely fails closed if Supabase cannot even be created.

#### Initial session lookup

```ts
const {
	data: { session },
	error,
} = await supabase.auth.getSession();

if (!cancelled) {
	setSession(session);
	setUser(session?.user ?? null);
}
```

This is the handoff point where the provider learns whether a user already has
an active session.

#### Auth resolution handoff

```ts
finally {
	if (!cancelled) {
		setAuthResolved(true);
	}
}
```

This line is the gate-release point for effect two.

#### Real-time auth listener

```ts
const {
	data: { subscription },
} = supabase.auth.onAuthStateChange((_event, currentSession) => {
	if (cancelled) return;
	setSession(currentSession);
	setUser(currentSession?.user ?? null);
});

unsubscribe = () => subscription.unsubscribe();
```

This is what keeps the provider in sync after the initial session check.

If Supabase initialization fails, it safely resets auth state, ends loading, and
shows an error.

### Effect 2: Bootstrap or clear user-scoped data

The second `useEffect` is gated behind `authResolved`.

#### Gate that prevents early bootstrap

```ts
useEffect(() => {
	if (!authResolved) return;

	let cancelled = false;
```

This is the most important control-flow guard in the file.

That means it does nothing until the first effect has finished deciding the auth
state.

Once `authResolved` is true, it does one of two things:

#### No user

If there is no user id, it:

- clears `profile`
- clears `workouts`
- resets accent state to the default
- sets `loading = false`

#### Exact no-user branch

```ts
if (!currentUserId) {
	lastUserIdRef.current = null;
	setProfile(null);
	setWorkouts([]);
	setAccentId("green");
	setLoading(false);
	return;
}
```

This is why the second effect is not only a happy-path bootstrapper. It also
owns safe cleanup when there is no authenticated user.

#### User exists

If there is a user id, it:

1. prevents duplicate bootstrap for the same user with `lastUserIdRef`
2. loads or creates the user profile
3. loads workouts ordered by newest first
4. updates profile, accent state, and workouts
5. sets `loading = false`

#### Dedupe guard for repeated bootstrap

```ts
if (lastUserIdRef.current === currentUserId) return;
lastUserIdRef.current = currentUserId;
```

This prevents repeated bootstrapping for the same already-resolved user.

#### Bootstrap loading handoff

```ts
setLoading(true);
```

Even after auth is resolved, the app still needs to block until profile and
workouts are ready.

#### Profile fetch or create

```ts
const { data: existingProfile, error: profileErr } = await supabase
	.from("profiles")
	.select("*")
	.eq("id", currentUserId)
	.maybeSingle();

let resolvedProfile = existingProfile;

if (!resolvedProfile) {
	const defaultUsername = currentUserEmail.split("@")[0]?.trim() || "User";

	const { error: upsertErr } = await supabase.from("profiles").upsert({
		id: currentUserId,
		username: defaultUsername,
		updated_at: new Date().toISOString(),
	});

	const { data: createdProfile } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", currentUserId)
		.single();

	resolvedProfile = createdProfile;
}
```

This is the part that makes the dashboard robust for first-time users who have
auth but no profile row yet.

#### Workout load

```ts
const { data: workoutsData, error: workoutsErr } = await supabase
	.from("workouts")
	.select("*")
	.eq("user_id", currentUserId)
	.order("date", { ascending: false });
```

This is the dashboard data fetch for recent user activity.

#### Final guarded state commit

```ts
if (cancelled) return;

setProfile(resolvedProfile);
setAccentId(normalizeAccentKey(resolvedProfile?.accent) as AccentKey);
setWorkouts(workoutsData || []);
```

This is the point where the bootstrap effect finally commits the resolved user
state into the provider.

#### Final loading release

```ts
finally {
	if (!cancelled) {
		setLoading(false);
	}
}
```

This is the line that tells the rest of the app the boot flow is done.

### What `authResolved` protects

`authResolved` is a gate between:

- "I am still determining auth state"
- "it is now safe to make user-scoped data decisions"

It does not mean the session is valid.
It means the initial auth check has finished decisively.

That result could be:

- a valid session
- no session
- auth lookup failure

### What `lastUserIdRef` protects

`lastUserIdRef` is a dedupe guard.

It prevents the bootstrap effect from reloading profile and workouts again for
the same already-resolved user id.

It is not a data store.
It only prevents unnecessary repeated bootstrap work.

### Why `loading` and cancellation are both needed

They solve different problems.

#### `loading`

Controls what the UI is allowed to show while auth and initial user data are
still unresolved.

#### cancellation

Prevents stale async work from setting state after the effect instance is no
longer current or after the provider unmounts.

### Failure mode if bootstrap runs too early

If the second effect ran before auth resolution finished, the app could:

- treat the user as unauthenticated too early
- clear profile/workout state prematurely
- stop loading too early
- create flicker or inconsistent transitions before the real auth result arrives

The split-effect design prevents that.

## Flow 2: Mid-Boot Auth Change Race

### Scenario

A user cold-opens the app with a stored session.
`getSession()` succeeds.
Before the bootstrap effect finishes loading profile and workouts, an auth state
change sets the user to signed out.

### What the provider currently does well

The auth listener updates `session` and `user` immediately when Supabase reports
the auth state change.

That means the bootstrap effect dependencies change and React will clean up the
old effect instance before running a new one.

The cleanup sets the effect-local `cancelled` flag to `true`.

The next bootstrap run sees there is no user id and safely clears:

- `profile`
- `workouts`
- accent state

and then ends loading.

#### Exact race-relevant code pieces

```ts
supabase.auth.onAuthStateChange((_event, currentSession) => {
	if (cancelled) return;
	setSession(currentSession);
	setUser(currentSession?.user ?? null);
});
```

```ts
return () => {
	cancelled = true;
	if (unsubscribe) unsubscribe();
};
```

```ts
return () => {
	cancelled = true;
};
```

These are the pieces that let React invalidate the old async path when auth
state changes.

### What `cancelled` does protect

It protects against the old async bootstrap finishing and then applying state
after that effect instance has been invalidated.

In this implementation, the old effect checks `cancelled` before applying the
resolved profile, accent, and workout state.

### What `cancelled` does not protect

It does not stop the network requests themselves.

The old requests can still continue running in the background.
It only prevents their results from being committed once the effect is stale.

### Could stale profile/workout data still land?

This provider is fairly well protected against that specific stale-commit race
because the effect checks `cancelled` before calling the final state setters.

So stale profile/workout state should not win once the auth change has caused
the old effect instance to be cleaned up.

The remaining weakness is wasted work rather than incorrect final state:

- the requests still run
- profile creation or fetch logic may still complete unnecessarily
- the provider relies on effect cleanup timing rather than request cancellation

### One concrete improvement

Track a request version or active bootstrap token and compare it before every
state commit, or move the Supabase reads behind an abortable wrapper where
possible.

A simple version-id guard would make the protection more explicit and easier to
reason about in interviews and maintenance.

## Short Interview Summary

"I split auth resolution and dashboard bootstrap into separate effects so the
provider never makes user-scoped data decisions before the initial auth check is
finished. `authResolved` is the gate for that handoff. `lastUserIdRef` prevents
duplicate bootstrap for the same user. `loading` controls what the UI may show,
while cancellation prevents stale async completions from mutating state after an
effect has been invalidated. That gives a smoother boot path and avoids early
dashboard flicker or premature clearing of user data."

## Recall Later

Use this section as your short review checklist before interview reps.

### Must-recall code pieces

- initial state: `loading`, `authResolved`, `user`, `session`, `profile`, `workouts`
- effect one local guards: `cancelled`, `unsubscribe`
- `getSupabase()` failure branch
- `supabase.auth.getSession()`
- `setAuthResolved(true)` in `finally`
- `supabase.auth.onAuthStateChange(...)`
- effect two gate: `if (!authResolved) return`
- no-user branch that clears profile/workouts and resets accent state
- `lastUserIdRef` dedupe guard
- profile fetch / create path
- workout load query
- `if (cancelled) return` before final state commit
- `setLoading(false)` in the effect cleanup path

### Recall questions

1. Why is `authResolved` a gate instead of just checking `user`?
2. Why is the second effect both a bootstrapper and a cleanup effect?
3. What problem does `lastUserIdRef` solve that dependency arrays do not solve by themselves?
4. What does `cancelled` prevent, and what does it not prevent?
5. What exact line releases the second effect to run?
6. What exact line prevents stale profile and workout data from being committed?

### To do later

- add a matching sign-in flow section with exact code pieces
- add a sign-out flow section with the auth listener consequences
- add one short diagram showing auth resolution first, bootstrap second
- practice answering the flow in under 60 seconds and under 90 seconds
