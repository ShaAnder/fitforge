export function isError(value: unknown): value is Error {
	return (
		typeof value === "object" &&
		value !== null &&
		"message" in value &&
		typeof value.message === "string"
	);
}

export function getErrorMessage(err: unknown): string {
	if (isError(err)) return err.message;
	if (typeof err === "string") return err;
	return "An unknown error occurred";
}
