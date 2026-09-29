import React, { useState } from 'react';
import { EntityRecord } from '../data/benchmarkData';
import { BarChart3, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface PeerComparisonProps {
  entities: EntityRecord[];
  initialSelectedId?: string;
}

export const PeerComparison: React.FC<PeerComparisonProps> = ({
  entities,
  initialSelectedId
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>(
    initialSelectedId || (entities[0]?.entity_id ?? 'ENT-001')
  );

  const selectedEntity = entities.find(e => e.entity_id === selectedEntityId) || entities[0];

  const dimensions = [
    "Alert Telemetry Volume",
    "Triage Duration Realism",
    "Escalation Fidelity",
    "Critical Asset Coverage",
    "Investigation Depth",
    "Supervisory Compliance"
  ];

  // Derive realistic operational scores (0-100) based on injected flaws
  const hasGap = selectedEntity.known_execution_gap;
  const hasNeg = selectedEntity.known_negative_space;

  const targetScores = [
    hasNeg ? 42 : 88,
    hasGap ? 34 : 86,
    hasGap ? 28 : 79,
    hasNeg ? 38 : 96,
    hasGap ? 40 : 84,
    Math.max(15, 100 - (selectedEntity.risk_score || 50))
  ];

  const peerAverages = [76, 73, 68, 86, 75, 72];

  // SVG Radar Chart Math
  const size = 320;
  const center = size / 2;
  const radius = center - 50;
  const numPoints = dimensions.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const targetPolyPoints = targetScores
    .map((v, i) => {
      const { x, y } = getCoordinates(v, i);
      return `${x},${y}`;
    })
    .join(' ');

  const peerPolyPoints = peerAverages
    .map((v, i) => {
      const { x, y } = getCoordinates(v, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Grid levels at 25%, 50%, 75%, 100%
  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Sector Peer Benchmarking & Radar Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Compare entity SOC operational telemetry fidelity against the critical infrastructure cohort average
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="peer-target-select" className="text-xs text-slate-400 font-medium">Target Entity:</label>
          <select
            id="peer-target-select"
            aria-label="Target Entity"
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-100 font-medium focus:outline-hidden focus:border-blue-500"
          >
            {entities.map(e => (
              <option key={e.entity_id} value={e.entity_id}>
                {e.entity_name} ({e.sector})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Metric Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Card */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Multi-Axis Operational Radar
              </h2>
              <p className="text-xs text-slate-400">0-100 Supervisory Fidelity Index</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-500 rounded-xs" />
                <span className="text-blue-400">{selectedEntity.entity_name.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-500 rounded-xs" />
                <span className="text-slate-400">Peer Average</span>
              </div>
            </div>
          </div>

          {/* SVG Radar */}
          <div className="relative py-2 flex justify-center">
            <svg width={size} height={size} className="overflow-visible">
              {/* Concentric Polygons */}
              {gridLevels.map(level => {
                const points = Array.from({ length: numPoints })
                  .map((_, i) => {
                    const { x, y } = getCoordinates(level, i);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={level}
                    points={points}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="1"
                    strokeDasharray={level < 100 ? '2,2' : undefined}
                  />
                );
              })}

              {/* Radial Axis Lines */}
              {Array.from({ length: numPoints }).map((_, i) => {
                const { x, y } = getCoordinates(100, i);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#1E293B"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Peer Polygon (Slate) */}
              <polygon
                points={peerPolyPoints}
                fill="rgba(148, 163, 184, 0.15)"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />

              {/* Target Entity Polygon (Blue) */}
              <polygon
                points={targetPolyPoints}
                fill="rgba(59, 130, 246, 0.25)"
                stroke="#3B82F6"
                strokeWidth="2.5"
              />

              {/* Points on Target Polygon */}
              {targetScores.map((v, i) => {
                const { x, y } = getCoordinates(v, i);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3B82F6"
                    stroke="#0B1120"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Dimension Labels */}
              {dimensions.map((dim, i) => {
                const angle = (Math.PI * 2 / numPoints) * i - Math.PI / 2;
                const r = radius + 24;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                const textAnchor = x > center + 10 ? 'start' : x < center - 10 ? 'end' : 'middle';
                return (
                  <text
                    key={dim}
                    x={x}
                    y={y + 4}
                    textAnchor={textAnchor}
                    className="text-[10px] fill-slate-300 font-medium"
                  >
                    {dim}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="w-full text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800/80 flex items-center justify-between">
            <span>Higher radius = stronger compliance & realistic operational rigor</span>
            <span className="font-mono text-blue-400 font-bold">100 Max</span>
          </div>
        </div>

        {/* Side-by-Side Key Metrics Table */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800/80 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Operational Variance vs Sector Baseline
              </h2>
              <p className="text-xs text-slate-400">Detailed metric comparison highlighting supervisory deviation</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Supervisory Metric</th>
                    <th className="py-2.5 px-3 font-semibold text-center">{selectedEntity.entity_name.split(' ')[0]}</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Sector Avg</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {dimensions.map((dim, i) => {
                    const target = targetScores[i];
                    const peer = peerAverages[i];
                    const delta = target - peer;
                    const isPositive = delta > 0;
                    const isNeutral = delta === 0;

                    return (
                      <tr key={dim} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-medium text-slate-200">
                          {dim}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-blue-400">
                          {target}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">
                          {peer}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          <span className={`inline-flex items-center gap-1 ${
                            isPositive ? 'text-emerald-400' :
                            isNeutral ? 'text-slate-400' : 'text-red-400'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> :
                             isNeutral ? <Minus className="w-3 h-3" /> :
                             <TrendingDown className="w-3 h-3" />}
                            {delta > 0 ? `+${delta}` : delta} pts
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 mt-4 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Negative variance indicates active supervisory risk. For instance, low <em>Triage Duration Realism</em> coupled with suppressed <em>Escalation Fidelity</em> points to SLA falsification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
