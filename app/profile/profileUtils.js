export function formatXp(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) {
    return `${formatSig(value / 1_000_000)}mb`;
  }
  if (absValue >= 1_000) {
    return `${formatSig(value / 1_000)}kb`;
  }
  return Math.round(value).toString();
}

export function getInitials(label) {
  return label
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatSig(value) {
  const abs = Math.abs(value);
  if (abs >= 100) {
    return value.toFixed(0);
  }
  if (abs >= 10) {
    return value.toFixed(1);
  }
  return value.toFixed(2);
}
