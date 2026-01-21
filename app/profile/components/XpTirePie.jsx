export const PIE_COLORS = [
  "#dc0000",
  "#ff8700",
  "#ffd100",
  "#00d2be",
  "#0090ff",
  "#1e41ff",
  "#006f62",
  "#b6babd",
];

export function XpTirePie({ items, total }) {
  const size = 240;
  const center = size / 2;
  const segmentRadius = 72;
  const segmentStroke = 14;
  const rubberRadius = 94;
  const rubberStroke = 36;
  const rimRadius = 52;
  const rimStroke = 12;
  const hubRadius = 34;
  const safeTotal = total > 0 ? total : 1;
  const circumference = 2 * Math.PI * segmentRadius;
  const gap = 4;
  let offset = 0;

  const segments = items
    .map((item, index) => ({
      value: Math.max(Number(item?.value) || 0, 0),
      color: PIE_COLORS[index % PIE_COLORS.length],
      key: `${item.label}-${index}`,
    }))
    .filter((item) => item.value > 0)
    .map((item) => {
      const length = (item.value / safeTotal) * circumference;
      const dashLength = Math.max(length - gap, 0);
      const dashArray = `${dashLength} ${circumference - dashLength}`;
      const dashOffset = -offset;
      offset += length;
      return (
        <circle
          key={item.key}
          className="xp-tire-segment"
          cx={center}
          cy={center}
          r={segmentRadius}
          stroke={item.color}
          strokeWidth={segmentStroke}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
        />
      );
    });

  return (
    <svg
      className="xp-tire-svg"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Top XP sources pie chart"
    >
      <defs>
        <linearGradient id="xpRimGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fafc" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#94a3b8" stopOpacity="0.18" />
          <stop offset="1" stopColor="#f8fafc" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="xpHubGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#111827" stopOpacity="0.95" />
          <stop offset="1" stopColor="#020617" stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle
        className="xp-tire-rubber"
        cx={center}
        cy={center}
        r={rubberRadius}
        strokeWidth={rubberStroke}
      />
      <circle
        className="xp-tire-sidewall"
        cx={center}
        cy={center}
        r={rubberRadius - rubberStroke / 2 + 2}
        strokeWidth="2"
      />
      <circle
        className="xp-tire-stripe"
        cx={center}
        cy={center}
        r={rubberRadius + rubberStroke / 2 - 2}
        strokeWidth="4"
      />
      <circle
        className="xp-tire-tread xp-tire-tread--outer"
        cx={center}
        cy={center}
        r={rubberRadius + rubberStroke / 2 - 6}
        strokeWidth="2"
      />
      <circle
        className="xp-tire-tread xp-tire-tread--inner"
        cx={center}
        cy={center}
        r={rubberRadius - rubberStroke / 2 + 6}
        strokeWidth="1.5"
      />
      <g transform={`rotate(-90 ${center} ${center})`}>{segments}</g>
      <circle
        className="xp-tire-rim"
        cx={center}
        cy={center}
        r={rimRadius}
        strokeWidth={rimStroke}
        stroke="url(#xpRimGradient)"
      />
      <circle
        className="xp-tire-hub"
        cx={center}
        cy={center}
        r={hubRadius}
        fill="url(#xpHubGradient)"
      />
    </svg>
  );
}

export function buildPieData(items, maxItems = 7) {
  const normalized = items
    .map((item) => ({
      label: item.label,
      value: Number(item.value) || 0,
    }))
    .filter((item) => item.value > 0);

  if (normalized.length <= maxItems) {
    return normalized;
  }

  const primary = normalized.slice(0, maxItems);
  const otherTotal = normalized
    .slice(maxItems)
    .reduce((sum, item) => sum + item.value, 0);

  if (otherTotal > 0) {
    primary.push({ label: "Other", value: otherTotal });
  }

  return primary;
}
