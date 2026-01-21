export function SparkLine({ data }) {
  if (!data?.length) {
    return <p className="graph-empty">XP data not available yet.</p>;
  }

  const width = 520;
  const height = 220;
  const padding = 24;

  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const denominator = Math.max(data.length - 1, 1);
  const stepX = (width - padding * 2) / denominator;

  const points = data.map((point, index) => {
    const x = padding + stepX * index;
    const y =
      height - padding - (point.value / maxValue) * (height - padding * 2);
    return { ...point, x, y };
  });

  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div>
      <svg
        className="sparkline"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="XP progression chart"
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
        <polyline
          fill="none"
          stroke="var(--color-f1-red)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={pointString}
        />
        {points.map((point, index) => (
          <circle
            key={`${point.id}-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="var(--color-f1-white)"
            stroke="var(--color-f1-red)"
            strokeWidth="1"
          />
        ))}
      </svg>
      <div className="sparkline-legend">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}
