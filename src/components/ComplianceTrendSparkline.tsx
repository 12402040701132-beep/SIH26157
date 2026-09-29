import React from 'react';

interface ComplianceTrendSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}

export const ComplianceTrendSparkline: React.FC<ComplianceTrendSparklineProps> = ({
  data,
  width = 180,
  height = 42,
  color = '#3B82F6',
  fill = true
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const paddingY = 4;
  const paddingX = 4;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * graphWidth;
    const y = height - paddingY - ((val - min) / range) * graphHeight;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const fillD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const isUp = lastPoint.val >= firstPoint.val;

  return (
    <div className="flex items-center gap-3">
      <svg width={width} height={height} className="overflow-visible">
        {fill && (
          <path
            d={fillD}
            fill={color}
            fillOpacity={0.15}
          />
        )}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={3}
          fill={color}
          stroke="#0B1120"
          strokeWidth={1.5}
        />
      </svg>
      <div className="text-right">
        <div className="text-xs font-bold font-mono text-slate-100">
          {data[data.length - 1]}%
        </div>
        <div className={`text-[10px] font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(data[data.length - 1] - data[0])}% 30d
        </div>
      </div>
    </div>
  );
};
