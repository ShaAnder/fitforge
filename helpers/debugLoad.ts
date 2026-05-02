type DebugMeta = Record<string, unknown>;

type DebugLoadHandle = {
	success: (extra?: DebugMeta) => void;
	error: (err: unknown, extra?: DebugMeta) => void;
};

let loadSeq = 0;

const nowMs = () => {
	// Use high-resolution timer when available
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const perf: any = (globalThis as any).performance;
	if (perf && typeof perf.now === "function") return perf.now();
	return Date.now();
};

const shouldLog = () => {
	// Expo / React Native exposes __DEV__
	// eslint-disable-next-line no-undef
	return typeof __DEV__ !== "undefined" ? __DEV__ : false;
};

/**
 * Dev-only load logger.
 *
 * Usage:
 * const load = debugLoad("History.loadWorkouts", { userId });
 * try { ...; load.success({ count }); } catch (e) { load.error(e); }
 */
export const debugLoad = (
	label: string,
	meta: DebugMeta = {},
): DebugLoadHandle => {
	if (!shouldLog()) {
		return {
			success: () => {},
			error: () => {},
		};
	}

	const id = ++loadSeq;
	const startedAt = nowMs();
	console.log(`[load:start] ${label} (#${id})`, meta);

	return {
		success: (extra: DebugMeta = {}) => {
			const ms = Math.round(nowMs() - startedAt);
			console.log(`[load:end] ${label} (#${id}) ${ms}ms`, {
				...meta,
				...extra,
			});
		},
		error: (err: unknown, extra: DebugMeta = {}) => {
			const ms = Math.round(nowMs() - startedAt);
			console.error(`[load:error] ${label} (#${id}) ${ms}ms`, {
				...meta,
				...extra,
				err,
			});
		},
	};
};
