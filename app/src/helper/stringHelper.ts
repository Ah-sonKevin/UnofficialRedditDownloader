const MAX_NAME_SIZE = 100;
export function cleanString(text: string): string {
	return text
		.replace(/\W/gi, "_")
		.replace(/_+/gi, "_")
		.replace(/^_/, "")
		.replace(/_$/, "")
		.substr(0, MAX_NAME_SIZE);
}
