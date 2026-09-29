import React from 'react';
import { EntityRecord, Finding } from '../data/benchmarkData';
import { GeographicRiskMap } from './GeographicRiskMap';
import { ComplianceTrendSparkline } from './ComplianceTrendSparkline';
import { PredictiveRiskForecast } from './PredictiveRiskForecast';
import { ValidationStoryCard } from './ValidationStoryCard';
import { Building2, Flame, AlertTriangle, AlertOctagon, ChevronRight, Eye, Download, ShieldCheck, Activity } from 'lucide-react';

interface OverviewDashboardProps {
  entities: EntityRecord[];
  allFindings: Finding[];
  onSelectEntity: (entityId: string) => void;
  onOpenFinding: (finding: Finding) => void;
  onNavigate: (page: string, filter?: 'All' | 'High' | 'Medium' | 'Low') => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  entities,
  allFindings,
  onSelectEntity,
  onOpenFinding,
  onNavigate
}) => {
  const totalEntities = entities.length;
  const highRiskEntities = entities.filter(e => (e.risk_score || 0) >= 70);
  const mediumRiskEntities = entities.filter(e => (e.risk_score || 0) >= 40 && (e.risk_score || 0) < 70);
  const lowRiskEntities = entities.filter(e => (e.risk_score || 0) < 40);
  const totalFindings = allFindings.length;
  const entitiesNeedingAttention = entities.filter(e => (e.findings_count || 0) > 0).length;

  const top5Entities = [...entities]
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, 5);

  const criticalFindings = allFindings
    .filter(f => f.severity === 'Critical')
    .slice(0, 6);

  // Donut chart math
  const highCount = highRiskEntities.length;
  const medCount = mediumRiskEntities.length;
  const lowCount = lowRiskEntities.length;
  const total = highCount + medCount + lowCount || 1;

  const pHigh = (highCount / total) * 100;
  const pMed = (medCount / total) * 100;
  const pLow = (lowCount / total) * 100;

  const c = 2 * Math.PI * 40;
  const dashHigh = (pHigh / 100) * c;
  const dashMed = (pMed / 100) * c;
  const dashLow = (pLow / 100) * c;

  const offsetHigh = 0;
  const offsetMed = -dashHigh;
  const offsetLow = -(dashHigh + dashMed);

  // Aggregate fleet 30-day compliance sparkline data
  const fleetTrend = [68, 67, 65, 63, 64, 60, 58, 59, 56, 54, 55, 52, 50, 48];

  return (
    <div className="space-y-6">
      {/* Top Banner / System Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <span>National Critical Information Infrastructure Protection Centre</span>
            <span>·</span>
            <span>NTRO Cyber Oversight Division</span>
            <span>·</span>
            <span className="text-emerald-400">Air-Gapped Sovereign Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            National Critical Infrastructure SOC Supervisory Console
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
            Automated supervisory analytics identifying silent compromises: detecting <strong>Execution Gaps</strong> (hollow sub-30m closures) and <strong>Negative Space</strong> (core SCADA, Banking & Telco controllers operating with zero alerts).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => onNavigate('queue')}
            className="px-3.5 py-2 text-xs font-semibold bg-red-600/90 hover:bg-red-500 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-sm border border-red-500/30"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Priority Queue ({criticalFindings.length} Critical)</span>
          </button>

          <button
            onClick={() => onNavigate('findings')}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Explore All Findings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Interactive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Entities */}
        <div 
          onClick={() => onNavigate('entities', 'All')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-lg p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Entities Monitored</span>
            <Building2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {totalEntities}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-slate-300 font-medium">7 Critical Sectors</span>
            <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">Inspect →</span>
          </div>
        </div>

        {/* Card 2: High Risk Entities */}
        <div 
          onClick={() => onNavigate('entities', 'High')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-red-500/30 hover:border-red-500 rounded-lg p-4 cursor-pointer transition-all group shadow-sm shadow-red-500/5"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span className="text-red-400 font-semibold">High Risk Entities</span>
            <Flame className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-2 flex items-baseline gap-2">
            <span>{highCount}</span>
            <span className="text-xs font-normal text-red-500/80">({pHigh.toFixed(0)}% of cohort)</span>
          </div>
          <div className="text-[11px] text-red-400/90 mt-1 flex items-center justify-between">
            <span>Risk score ≥ 70/100</span>
            <span className="text-red-400 group-hover:translate-x-0.5 transition-transform font-medium">Filter High →</span>
          </div>
        </div>

        {/* Card 3: Total Findings */}
        <div 
          onClick={() => onNavigate('findings')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-lg p-4 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Findings Detected</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {totalFindings}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Gaps & Silenced Assets</span>
            <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">Explore →</span>
          </div>
        </div>

        {/* Card 4: 30-Day Fleet Compliance Trend */}
        <div 
          onClick={() => onNavigate('regulatory')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-lg p-4 cursor-pointer transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Fleet Compliance Trend</span>
            <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1">
            <ComplianceTrendSparkline data={fleetTrend} width={150} height={36} color="#3B82F6" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-amber-400/90">Silenced SCADA impact</span>
            <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">Audits →</span>
          </div>
        </div>
      </div>

      {/* Supervisory Validation Story: KPI Mirage vs. Ground Reality */}
      <ValidationStoryCard />

      {/* Predictive 30-Day Risk Forecast Module */}
      <PredictiveRiskForecast
        entities={entities}
        onSelectEntity={onSelectEntity}
      />

      {/* Interactive Geographical Risk Map */}
      <GeographicRiskMap
        entities={entities}
        onSelectEntity={onSelectEntity}
      />

      {/* Middle Grid: Risk Distribution Donut & Top 5 Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Cohort Risk Distribution
              </h2>
              <p className="text-xs text-slate-400">Classification by supervisory risk tier</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">0-100 INDEX</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1E293B"
                  strokeWidth="14"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="14"
                  strokeDasharray={`${dashHigh} ${c}`}
                  strokeDashoffset={offsetHigh}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray={`${dashMed} ${c}`}
                  strokeDashoffset={offsetMed}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#22C55E"
                  strokeWidth="14"
                  strokeDasharray={`${dashLow} ${c}`}
                  strokeDashoffset={offsetLow}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{totalEntities}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Entities</span>
              </div>
            </div>

            <div className="space-y-3 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="w-3 h-3 rounded-xs bg-red-500 shrink-0" />
                <span className="text-slate-300">High Risk (≥ 70)</span>
                <span className="font-bold text-red-400 ml-auto sm:ml-4 font-mono">{highCount} ({pHigh.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="w-3 h-3 rounded-xs bg-amber-500 shrink-0" />
                <span className="text-slate-300">Medium Risk (40-69)</span>
                <span className="font-bold text-amber-400 ml-auto sm:ml-4 font-mono">{medCount} ({pMed.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 shrink-0" />
                <span className="text-slate-300">Low Risk (&lt; 40)</span>
                <span className="font-bold text-emerald-400 ml-auto sm:ml-4 font-mono">{lowCount} ({pLow.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Algorithm: Multi-factor Execution Gap & Negative Space weighting</span>
          </div>
        </div>

        {/* Top 5 High-Risk Entities Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Top High-Risk Critical Entities
              </h2>
              <p className="text-xs text-slate-400">Ranked by combined supervisory vulnerability score</p>
            </div>
            <button
              onClick={() => onNavigate('entities')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>View All 7</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Entity Name</th>
                  <th className="py-2.5 px-3 font-semibold">Sector</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Index</th>
                  <th className="py-2.5 px-3 font-semibold">Classification</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {top5Entities.map((ent, i) => (
                  <tr key={ent.entity_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[10px]">#{i + 1}</span>
                        <span>{ent.entity_name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{ent.sector}</td>
                    <td className="py-2.5 px-3 font-bold font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              (ent.risk_score || 0) >= 70 ? 'bg-red-500' :
                              (ent.risk_score || 0) >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${ent.risk_score}%` }}
                          />
                        </div>
                        <span className={
                          (ent.risk_score || 0) >= 70 ? 'text-red-400' :
                          (ent.risk_score || 0) >= 40 ? 'text-amber-400' : 'text-emerald-400'
                        }>
                          {ent.risk_score}/100
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ent.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        ent.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {ent.risk_level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectEntity(ent.entity_id)}
                        className="text-xs text-blue-400 hover:text-white px-2 py-1 bg-slate-800 hover:bg-blue-600 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Silenced assets and hollow closures carry highest impact</span>
          </div>
        </div>
      </div>

      {/* Recent Critical Findings Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Recent Critical Findings
            </h2>
            <p className="text-xs text-slate-400">Immediate supervisory inspection required for tier-1 violations</p>
          </div>
          <button
            onClick={() => onNavigate('findings')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>All Findings ({totalFindings})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {criticalFindings.map((f) => (
            <div
              key={f.finding_id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase">
                    {f.type}
                  </span>
                  <span className="font-mono text-slate-400">{f.finding_id}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-100 line-clamp-1">
                  {f.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {f.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 truncate max-w-[150px] font-medium">{f.entity_name}</span>
                <button
                  onClick={() => onOpenFinding(f)}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Evidence</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
