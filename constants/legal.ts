export type LegalSection = {
	heading: string;
	body: readonly string[];
};

export type LegalDoc = {
	title: string;
	updated: string;
	intro?: readonly string[];
	sections: readonly LegalSection[];
};

/**
 * Privacy Policy Content.
 *
 * Static legal document displayed in the Privacy screen.
 * Marked as MVP/Portfolio to set realistic user expectations.
 */
export const PRIVACY = {
	title: "Privacy Policy (MVP / Portfolio)",
	updated: "May 6, 2026",
	intro: [
		"FitForge is a portfolio/MVP fitness app. This page explains what data is used and stored when you use the app.",
	],
	sections: [
		{
			heading: "What data we collect",
			body: [
				"Depending on the features you use, FitForge may store:",
				"- Account info (such as your email) provided during sign-in",
				"- Profile info you choose to add (such as a display name)",
				"- Workout data you enter (exercises, sets, reps, weights, and notes)",
				"- Derived workout stats (such as total volume) used for dashboard summaries",
			],
		},
		{
			heading: "How we use your data",
			body: [
				"We use stored data to:",
				"- Authenticate you and keep you signed in",
				"- Save and display your workouts in History and Dashboard",
				"- Show basic progress summaries (for example, weekly volume and streaks)",
			],
		},
		{
			heading: "Third-party services",
			body: [
				"FitForge uses third-party infrastructure to operate (for example, authentication and database services). These services may process data as needed to provide the app’s functionality.",
			],
		},
		{
			heading: "Data retention",
			body: [
				"Workouts and profile data are retained until you delete them (if the app provides deletion features) or until the project is reset/removed.",
				"Because this is an MVP/portfolio project, long-term retention guarantees are not provided.",
			],
		},
		{
			heading: "Security",
			body: [
				"We take reasonable steps to protect data, but no method of storage or transmission is 100% secure.",
			],
		},
		{
			heading: "Contact",
			body: ["If you have questions about privacy, contact the project owner."],
		},
	],
} satisfies LegalDoc;

/**
 * Terms of Service Content.
 *
 * Static legal document displayed in the Terms screen.
 * Marked as MVP/Portfolio to set realistic user expectations.
 */
export const TERMS = {
	title: "Terms of Service (MVP / Portfolio)",
	updated: "May 6, 2026",
	intro: [
		"FitForge is a portfolio/MVP app. By using the app, you agree to these terms.",
	],
	sections: [
		{
			heading: "1) MVP / ‘as-is’ basis",
			body: [
				"The app is provided on an ‘as-is’ and ‘as-available’ basis, without warranties of any kind.",
				"Features may change, break, or be removed at any time.",
			],
		},
		{
			heading: "2) Not medical advice",
			body: [
				"FitForge does not provide medical advice. Always consult a qualified professional before starting or changing an exercise program.",
			],
		},
		{
			heading: "3) Your content",
			body: [
				"You are responsible for the workout data and other content you enter.",
				"Do not enter sensitive information you wouldn’t want stored online.",
			],
		},
		{
			heading: "4) Acceptable use",
			body: [
				"You agree not to misuse the app, attempt unauthorized access, or interfere with service operation.",
			],
		},
		{
			heading: "5) Limitation of liability",
			body: [
				"To the maximum extent permitted by law, the project owner is not liable for any damages arising from your use of the app.",
			],
		},
		{
			heading: "6) Contact",
			body: [
				"If you have questions about these terms, contact the project owner.",
			],
		},
	],
} satisfies LegalDoc;
