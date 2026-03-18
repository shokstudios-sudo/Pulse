interface LatencySparklineProps {
  data: number[];
  width?: number;
  height?: number;
  status: 'up' | 'down' | 'slow';
}

const statusColors = {
  up: "#10B981",
  down: "#EF4444",
  slow: "#F59E0B",
};

const LatencySparkline = ({ data, width = 120, height = 32, status }: LatencySparklineProps) => {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  const color = statusColors[status];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${status}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Fill area */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${status})`}
      />
    </svg>
  );
};

export default LatencySparkline;
