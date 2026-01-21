export function sanitizeTokenString(value) {
  if (typeof value !== "string") {
    return "";
  }

  let cleaned = value.trim();

  const hasDoubleQuotes =
    cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.length > 1;
  const hasSingleQuotes =
    cleaned.startsWith("'") && cleaned.endsWith("'") && cleaned.length > 1;

  if (hasDoubleQuotes || hasSingleQuotes) {
    cleaned = cleaned.slice(1, -1);
  }

  return cleaned.replace(/\s+/g, "");
}
