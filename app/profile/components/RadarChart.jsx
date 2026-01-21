export function RadarChart({ data, title }) {
  const safeData = Array.isArray(data) ? data : [];
  if (safeData.length === 0) {
    return <p className="graph-empty">Skill data not available yet.</p>;
  }

  const size = 360;
  const center = size / 2;
  const radius = 120;
  const labelOffset = 44;
  const levels = 5;

  const values = safeData.map((item) => Math.max(Number(item?.value) || 0, 0));
  const hasValues = values.some((value) => value > 0);
  if (!hasValues) {
    return <p className="graph-empty">Skill data not available yet.</p>;
  }
  const maxValue = Math.max(100, ...values, 1);
  const angleStep = (Math.PI * 2) / safeData.length;
  const startAngle = -Math.PI / 2;

  const axes = safeData.map((item, index) => {
    const angle = startAngle + index * angleStep;
    const ratio = values[index] / maxValue;
    const valueRadius = ratio * radius;
    const x = center + Math.cos(angle) * valueRadius;
    const y = center + Math.sin(angle) * valueRadius;
    const axisX = center + Math.cos(angle) * radius;
    const axisY = center + Math.sin(angle) * radius;
    const labelX = center + Math.cos(angle) * (radius + labelOffset);
    const labelY = center + Math.sin(angle) * (radius + labelOffset);
    const alignment = getRadarLabelAlignment(angle);

    return {
      id: `${item.label}-${index}`,
      label: item.label,
      x,
      y,
      axisX,
      axisY,
      labelX,
      labelY,
      alignment,
    };
  });

  const ringPolygons = Array.from({ length: levels }, (_, levelIndex) => {
    const ringRadius = (radius / levels) * (levelIndex + 1);
    const points = axes
      .map((_, axisIndex) => {
        const angle = startAngle + axisIndex * angleStep;
        const x = center + Math.cos(angle) * ringRadius;
        const y = center + Math.sin(angle) * ringRadius;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <polygon
        key={`ring-${levelIndex}`}
        className="radar-gridline"
        points={points}
      />
    );
  });

  const polygonPoints = axes.map((axis) => `${axis.x},${axis.y}`).join(" ");

  return (
    <svg
      className="radar-chart"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={title}
      overflow="visible"
    >
      <title>{title}</title>
      <g>{ringPolygons}</g>
      {axes.map((axis) => (
        <line
          key={`axis-${axis.id}`}
          className="radar-axis"
          x1={center}
          y1={center}
          x2={axis.axisX}
          y2={axis.axisY}
        />
      ))}
      <polygon className="radar-shape" points={polygonPoints} />
      {axes.map((axis) => (
        <circle
          key={`point-${axis.id}`}
          className="radar-point"
          cx={axis.x}
          cy={axis.y}
          r="4"
        />
      ))}
      {axes.map((axis) => (
        <text
          key={`label-${axis.id}`}
          className="radar-label"
          x={axis.labelX}
          y={axis.labelY}
          textAnchor={axis.alignment.anchor}
          dominantBaseline={axis.alignment.baseline}
        >
          {axis.label}
        </text>
      ))}
    </svg>
  );
}

function getRadarLabelAlignment(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const anchor = Math.abs(cos) < 0.2 ? "middle" : cos > 0 ? "start" : "end";
  const baseline =
    Math.abs(sin) < 0.2 ? "middle" : sin > 0 ? "hanging" : "baseline";

  return { anchor, baseline };
}
