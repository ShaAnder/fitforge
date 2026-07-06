/**
 * Type guard that checks whether a value is an Error object.
 * Useful for safely narrowing unknown error types.
 */
export function isError(value: unknown): value is Error {
	// Check if the value is a non-null object
	// This guards against primitives and null which can't be Errors
	return (
		typeof value === "object" &&
		value !== null &&
		// Verify it has a message property
		"message" in value &&
		// Make sure the message is actually a string
		typeof value.message === "string"
	);
}

/**
 * Safely extracts a readable error message from any thrown value.
 * Handles Error instances, plain strings, and unknown cases gracefully.
 */
export function getErrorMessage(err: unknown): string {
	// If it's already an Error (per our type guard), grab its message
	if (isError(err)) return err.message;

	// Handle the simple case where someone passed a plain string
	if (typeof err === "string") return err;

	// Fallback for anything else we don't recognize
	return "An unknown error occurred";
}
