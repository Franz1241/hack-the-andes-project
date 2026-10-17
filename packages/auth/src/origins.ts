export function parseAllowedOrigins(commaSeparatedOrigins: string): string[] {
	return commaSeparatedOrigins
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);
}
