import React, { useState } from 'react';
import { EntityRecord } from '../data/benchmarkData';
import { MapPin, Globe, Layers, AlertTriangle, ShieldCheck, ExternalLink, Zap } from 'lucide-react';

interface GeographicRiskMapProps {
  entities: EntityRecord[];
  onSelectEntity: (entityId: string) => void;
}

export const GeographicRiskMap: React.FC<GeographicRiskMapProps> = ({
  entities,
  onSelectEntity
}) => {
  const [viewMode, setViewMode] = useState<'geographic' | 'sector'>('geographic');
  const [selectedEntity, setSelectedEntity] = useState<EntityRecord | null>(entities[0] || null);

  const highRiskEntities = entities.filter(e => (e.risk_score || 0) >= 70);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
      {/* Top Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              National Infrastructure Risk Telemetry Map
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial distribution of supervisory risk across Indian Critical Infrastructure hubs
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('geographic')}
            className={`px-3 py-1 font-semibold rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'geographic'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Geographic Hubs</span>
          </button>
          <button
            onClick={() => setViewMode('sector')}
            className={`px-3 py-1 font-semibold rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'sector'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sector Enclaves</span>
          </button>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Interactive Map Container */}
        <div className="lg:col-span-7 relative w-full h-[340px] bg-slate-950/90 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
          {/* Subtle Radar Scan Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />

          {/* India Regional Outline SVG */}
          <svg
            viewBox="0 0 500 560"
            className="w-full h-full max-h-[310px] select-none"
          >
            <defs>
              <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Stylized India Geography Contour */}
            <path
              d="M 230 40 
                 L 260 70 L 310 90 L 305 130 L 350 145 L 390 135 L 430 160 L 460 170 L 450 200 L 410 215 L 370 205 L 340 230 L 345 280 L 360 300 L 320 330 L 290 380 L 270 440 L 250 490 L 240 520 L 230 490 L 210 440 L 180 370 L 160 310 L 120 270 L 110 240 L 140 220 L 160 180 L 180 150 L 190 100 L 215 60 Z"
              fill="url(#gridGradient)"
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />

            {/* Regional Connecting Fiber Lines */}
            <path
              d="M 220 160 L 170 310 L 230 440 L 340 260 L 250 290 Z"
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="1"
              strokeOpacity="0.4"
              strokeDasharray="3 3"
            />

            {/* Entity Nodes / Pins */}
            {entities.map((ent) => {
              const isSelected = selectedEntity?.entity_id === ent.entity_id;
              const isHigh = (ent.risk_score || 0) >= 70;
              const isMed = (ent.risk_score || 0) >= 40 && (ent.risk_score || 0) < 70;
              const color = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#22C55E';

              // Map percent coords to SVG 500x560 space
              const cx = (ent.geo_coordinates.xPercent / 100) * 440 + 40;
              const cy = (ent.geo_coordinates.yPercent / 100) * 480 + 40;

              return (
                <g
                  key={ent.entity_id}
                  className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  onClick={() => setSelectedEntity(ent)}
                >
                  {/* Pulsing ring for high risk */}
                  {isHigh && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 16 : 12}
                      fill={color}
                      opacity={0.2}
                      className="animate-ping"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 11 : 8}
                    fill={color}
                    fillOpacity={0.25}
                    stroke={color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />

                  {/* Core dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 5 : 3.5}
                    fill={color}
                  />

                  {/* Label */}
                  <text
                    x={cx + 12}
                    y={cy + 4}
                    fill="#F1F5F9"
                    fontSize={isSelected ? "11" : "9"}
                    fontWeight={isSelected ? "bold" : "normal"}
                    className="select-none pointer-events-none drop-shadow-md"
                  >
                    {ent.entity_name.split(' ')[0]} ({ent.risk_score})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded text-[10px] space-y-1 text-slate-300 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>High Risk (≥ 70)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Medium Risk (40-69)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Low Risk (&lt; 40)</span>
            </div>
          </div>
        </div>

        {/* Selected Hub / Entity Information Card */}
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
          {selectedEntity ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    {viewMode === 'geographic' ? 'Regional Telemetry Hub' : 'Sector Classification'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedEntity.entity_name}
                  </h3>
                  <div className="text-xs text-slate-400">
                    {selectedEntity.region}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  (selectedEntity.risk_score || 0) >= 70 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  (selectedEntity.risk_score || 0) >= 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {selectedEntity.risk_level} Risk
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Supervisory Score</div>
                  <div className="text-lg font-bold font-mono text-red-400 mt-0.5">
                    {selectedEntity.risk_score}/100
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded border border-slate-800/80">
                  <div className="text-slate-400 text-[10px]">Critical Assets</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {selectedEntity.critical_assets_count} nodes
                  </div>
                </div>
              </div>

              {/* Status Checklist */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Execution Gaps Flagged:</span>
                  <span className="font-bold text-amber-400">{selectedEntity.execution_gaps_count} events</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Negative Space Gaps:</span>
                  <span className="font-bold text-red-400">{selectedEntity.negative_space_count} silent assets</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">CISO Contact:</span>
                  <span className="text-slate-200 truncate max-w-[160px]">{selectedEntity.contact_officer}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectEntity(selectedEntity.entity_id)}
                className="w-full mt-2 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Drill Down into Entity Risk Scorecard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Click any pin on the map to inspect regional SOC metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
