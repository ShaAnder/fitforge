import renderer, { act } from "react-test-renderer";

import { AuthProvider, useAuth } from "../../context/AuthContext";
import { getSupabase } from "../../lib/supabase";

jest.mock("../../context/AlertContext", () => ({
	useAlert: () => ({
		showAlert: mockShowAlert,
	}),
}));

const mockShowAlert = jest.fn();

const mockSetAccentId = jest.fn();

jest.mock("../../context/AccentContext", () => ({
	useAccentContext: () => ({ setAccentId: mockSetAccentId }),
}));

jest.mock("../../lib/supabase", () => ({
	getSupabase: jest.fn(),
}));

const mockedGetSupabase = getSupabase as jest.Mock;

let authApi: ReturnType<typeof useAuth> | null = null;

function Consumer() {
	authApi = useAuth();
	return null;
}

function createSupabaseMock() {
	const profilesQuery = {
		select: jest.fn().mockReturnThis(),
		eq: jest.fn().mockReturnThis(),
		maybeSingle: jest.fn().mockResolvedValue({
			data: null,
			error: null,
		}),
		upsert: jest.fn().mockReturnValue({
			select: jest.fn().mockReturnValue({
				single: jest.fn().mockResolvedValue({
					data: {
						id: "user-123",
						username: "new-name",
						accent: "blue",
					},
					error: null,
				}),
			}),
		}),
	};

	const workoutsQuery = {
		select: jest.fn().mockReturnThis(),
		eq: jest.fn().mockReturnThis(),
		order: jest.fn().mockResolvedValue({
			data: [],
			error: null,
		}),
	};

	return {
		auth: {
			getSession: jest.fn().mockResolvedValue({
				data: { session: null },
				error: null,
			}),
			onAuthStateChange: jest.fn(() => {
				return { data: { subscription: { unsubscribe: jest.fn() } } };
			}),
			signInWithPassword: jest.fn(),
			signOut: jest.fn(),
			signUp: jest.fn(),
			updateUser: jest.fn(),
		},
		from: jest.fn((table: string) => {
			if (table === "profiles") return profilesQuery;
			if (table === "workouts") return workoutsQuery;
			return {};
		}),
		storage: { from: jest.fn() },
		functions: { invoke: jest.fn() },
	};
}

describe("AuthContext", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		authApi = null;
		mockedGetSupabase.mockReturnValue(createSupabaseMock());
	});

	it("initializes and exposes auth methods", async () => {
		await act(async () => {
			renderer.create(
				<AuthProvider>
					<Consumer />
				</AuthProvider>,
			);
		});

		expect(authApi).not.toBeNull();
		expect(typeof authApi?.signIn).toBe("function");
		expect(typeof authApi?.signOut).toBe("function");
		expect(typeof authApi?.updateProfile).toBe("function");
	});

	it("calls signInWithPassword when signIn succeeds", async () => {
		const supabase = createSupabaseMock();
		supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
		mockedGetSupabase.mockReturnValue(supabase);

		await act(async () => {
			renderer.create(
				<AuthProvider>
					<Consumer />
				</AuthProvider>,
			);
		});

		await act(async () => {
			await authApi?.signIn("sam@example.com", "password123");
		});

		expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
			email: "sam@example.com",
			password: "password123",
		});
	});

	it("calls signUp with the verification redirect and triggers the success callback", async () => {
		const supabase = createSupabaseMock();
		supabase.auth.signUp.mockResolvedValue({ error: null });
		mockedGetSupabase.mockReturnValue(supabase);

		const onSuccess = jest.fn();

		await act(async () => {
			renderer.create(
				<AuthProvider>
					<Consumer />
				</AuthProvider>,
			);
		});

		await act(async () => {
			await authApi?.signup("sam@example.com", "password123", onSuccess);
		});

		expect(supabase.auth.signUp).toHaveBeenCalledWith({
			email: "sam@example.com",
			password: "password123",
			options: {
				emailRedirectTo:
					"https://shaander.github.io/fitforge/web-redirect-verify.html",
			},
		});
		expect(mockShowAlert).toHaveBeenCalledWith(
			"Account Created",
			"Please check your email to confirm your account.\n\nYou can close this and log in after confirming.",
			"success",
		);
		expect(onSuccess).toHaveBeenCalledTimes(1);
	});

	it("signOut calls Supabase with local scope", async () => {
		const supabase = createSupabaseMock();
		supabase.auth.signOut.mockResolvedValue({ error: null });
		mockedGetSupabase.mockReturnValue(supabase);

		await act(async () => {
			renderer.create(
				<AuthProvider>
					<Consumer />
				</AuthProvider>,
			);
		});

		await act(async () => {
			await authApi?.signOut();
		});

		expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
	});

	it("updateProfile updates the accent state after a successful upsert", async () => {
		const supabase = createSupabaseMock();
		supabase.auth.getSession.mockResolvedValueOnce({
			data: {
				session: {
					user: { id: "user-123", email: "sam@example.com" },
				},
			},
			error: null,
		});
		mockedGetSupabase.mockReturnValue(supabase);

		await act(async () => {
			renderer.create(
				<AuthProvider>
					<Consumer />
				</AuthProvider>,
			);
		});

		await act(async () => {
			await authApi?.updateProfile({ username: "new-name", accent: "blue" });
		});

		expect(supabase.from).toHaveBeenCalledWith("profiles");
		expect(mockSetAccentId).toHaveBeenCalled();
	});
});
