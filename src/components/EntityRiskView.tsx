import React, { useState } from 'react';
import { EntityRecord, Finding, CRITICAL_ASSET_REGISTRY, SILENCED_ASSETS } from '../data/benchmarkData';
import { RiskWeights, DEFAULT_RISK_WEIGHTS } from '../services/analyticsEngine';
import { Search, ArrowUpDown, Shield, AlertTriangle, Radio, Server, FileText, ChevronRight, X, ExternalLink, Download, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface EntityRiskViewProps {
  entities: EntityRecord[];
  allFindings: Finding[];
  selectedEntityId?: string | null;
  initialRiskFilter?: 'All' | 'High' | 'Medium' | 'Low';
  onOpenFinding: (finding: Finding) => void;
  onExportPDF: (entity: EntityRecord, findings: Finding[]) => void;
  onLogAuditAction?: (action: string, target: string) => void;
  currentWeights?: RiskWeights;
  onUpdateWeights?: (newWeights: RiskWeights) => void;
}

export const EntityRiskView: React.FC<EntityRiskViewProps> = ({
  entities,
  allFindings,
  selectedEntityId,
  initialRiskFilter = 'All',
  onOpenFinding,
  onExportPDF,
  onLogAuditAction,
  currentWeights = DEFAULT_RISK_WEIGHTS,
  onUpdateWeights
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>(initialRiskFilter);
  const [sortBy, setSortBy] = useState<'risk_score' | 'entity_name' | 'findings_count'>('risk_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeEntityModal, setActiveEntityModal] = useState<EntityRecord | null>(
    selectedEntityId ? entities.find(e => e.entity_id === selectedEntityId) || null : null
  );

  // Weights modal state
  const [weightsModalOpen, setWeightsModalOpen] = useState(false);
  const [tempWeights, setTempWeights] = useState<RiskWeights>(currentWeights);

  const sectors = ['All', ...Array.from(new Set(entities.map(e => e.sector)))];

  const filtered = entities
    .filter(e => {
      const matchSearch = e.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.entity_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSector = sectorFilter === 'All' || e.sector === sectorFilter;
      const score = e.risk_score || 0;
      const matchRisk = 
        riskFilter === 'All' ? true :
        riskFilter === 'High' ? score >= 70 :
        riskFilter === 'Medium' ? score >= 40 && score < 70 :
        score < 40;
      return matchSearch && matchSector && matchRisk;
    })
    .sort((a, b) => {
      let vA: any = a[sortBy] ?? 0;
      let vB: any = b[sortBy] ?? 0;
      if (typeof vA === 'string') {
        return sortOrder === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      return sortOrder === 'asc' ? vA - vB : vB - vA;
    });

  const handleSort = (field: 'risk_score' | 'entity_name' | 'findings_count') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getEntityFindings = (entId: string) => {
    return allFindings.filter(f => f.entity_id === entId);
  };

  // Export as CSV functionality
  const handleExportCSV = () => {
    const headers = [
      "Entity ID",
      "Entity Name",
      "Sector",
      "Criticality",
      "Supervisory Risk Score (0-100)",
      "Risk Classification",
      "Total Findings",
      "Execution Gaps",
      "Negative Space Gaps",
      "Statistical Anomalies",
      "Total Monitored Assets",
      "Critical Assets Count",
      "SOC Operating Model",
      "Responsible Contact Officer",
      "Geographic Regional Hub"
    ];

    const rows = filtered.map(e => [
      `"${e.entity_id}"`,
      `"${e.entity_name.replace(/"/g, '""')}"`,
      `"${e.sector}"`,
      `"${e.criticality}"`,
      e.risk_score ?? 0,
      `"${e.risk_level}"`,
      e.findings_count ?? 0,
      e.execution_gaps_count ?? 0,
      e.negative_space_count ?? 0,
      e.anomalies_count ?? 0,
      e.total_assets,
      e.critical_assets_count,
      `"${e.soc_tier}"`,
      `"${e.contact_officer.replace(/"/g, '""')}"`,
      `"${e.region}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SAT-SA_Entity_Risk_Inventory_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onLogAuditAction) {
      onLogAuditAction("EXPORT_CSV", `Entity Risk Scorecard (${filtered.length} entities)`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Entity Risk View & Critical Sector Registry
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Searchable, multi-factor risk scorecard assessing operational SOC posture across national infrastructure
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              setTempWeights(currentWeights);
              setWeightsModalOpen(true);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-md transition-colors flex items-center gap-1.5 border border-slate-700 shadow-sm"
            title="Configure transparent supervisory risk scoring weights (Section 7.4)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Configurable Weights</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-2 shadow-sm"
            title="Download CSV for regulatory audit reporting"
          >
            <Download className="w-4 h-4" />
            <span>Export as CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col lg:flex-row items-center gap-4 justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by entity name, sector, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Risk Level Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs w-full lg:w-auto overflow-x-auto">
          {(['All', 'High', 'Medium', 'Low'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setRiskFilter(tier)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                riskFilter === tier
                  ? tier === 'High' ? 'bg-red-600 text-white font-semibold shadow-xs'
                    : tier === 'Medium' ? 'bg-amber-600 text-white font-semibold shadow-xs'
                    : tier === 'Low' ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tier === 'All' ? 'All Risks' : `${tier} Risk`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <label htmlFor="risk-view-sector-filter" className="text-xs text-slate-400 shrink-0">Filter Sector:</label>
          <select
            id="risk-view-sector-filter"
            aria-label="Filter Sector"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 w-full md:w-auto"
          >
            {sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Entities Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th 
                  onClick={() => handleSort('entity_name')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Entity Name & Classification</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Sector</th>
                <th 
                  onClick={() => handleSort('risk_score')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Score (0-100)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Risk Level</th>
                <th 
                  onClick={() => handleSort('findings_count')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Total Findings</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Gaps / Silence</th>
                <th className="py-3 px-4 font-semibold text-right">Supervisory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(ent => (
                <tr 
                  key={ent.entity_id}
                  onClick={() => setActiveEntityModal(ent)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100 text-sm">{ent.entity_name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-slate-400">{ent.entity_id}</span>
                      <span>·</span>
                      <span>{ent.criticality}</span>
                      <span>·</span>
                      <span>{ent.soc_tier}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    {ent.sector}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
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

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      ent.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      ent.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {ent.risk_level}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {ent.findings_count} findings
                  </td>

                  <td className="py-3 px-4 text-slate-400 text-xs">
                    <span className="text-amber-400">{ent.execution_gaps_count} Gaps</span>
                    <span className="mx-1 text-slate-600">/</span>
                    <span className="text-red-400">{ent.negative_space_count} Silent</span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEntityModal(ent);
                      }}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded transition-colors inline-flex items-center gap-1"
                    >
                      <span>Breakdown</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entity Detailed Breakdown Modal */}
      {activeEntityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-lg text-slate-100 flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span className="font-mono text-blue-400">{activeEntityModal.entity_id}</span>
                  <span>·</span>
                  <span>{activeEntityModal.sector}</span>
                  <span>·</span>
                  <span>{activeEntityModal.criticality}</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {activeEntityModal.entity_name}
                </h2>
                <div className="text-xs text-slate-400 mt-1">
                  Responsible Officer: <span className="text-slate-200">{activeEntityModal.contact_officer}</span> · Hub: <span className="text-blue-400">{activeEntityModal.region}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveEntityModal(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Metric Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Supervisory Risk</div>
                  <div className={`text-xl font-bold font-mono mt-1 ${
                    (activeEntityModal.risk_score || 0) >= 70 ? 'text-red-400' :
                    (activeEntityModal.risk_score || 0) >= 40 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {activeEntityModal.risk_score}/100
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{activeEntityModal.risk_level} Priority</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Findings</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {activeEntityModal.findings_count}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Under evaluation</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Execution Gaps</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    {activeEntityModal.execution_gaps_count}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Triage & velocity flaws</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Negative Space</div>
                  <div className="text-xl font-bold text-red-400 mt-1">
                    {activeEntityModal.negative_space_count}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Silenced assets</div>
                </div>
              </div>

              {/* Critical Assets Inspection */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  National Critical Information Infrastructure (NCII) Assets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(CRITICAL_ASSET_REGISTRY[activeEntityModal.entity_id] || []).map(asset => {
                    const isSilenced = SILENCED_ASSETS[activeEntityModal.entity_id] === asset;
                    return (
                      <div
                        key={asset}
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          isSilenced
                            ? 'bg-red-500/10 border-red-500/40 text-red-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSilenced ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                          <span className="font-mono font-medium">{asset}</span>
                        </div>
                        {isSilenced ? (
                          <span className="text-[10px] px-2 py-0.5 font-bold uppercase bg-red-500/20 text-red-400 rounded">
                            SILENT (30 DAYS)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Active Logs</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specific Findings List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Associated Supervisory Findings ({getEntityFindings(activeEntityModal.entity_id).length})
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {getEntityFindings(activeEntityModal.entity_id).map(f => (
                    <div
                      key={f.finding_id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className={`font-bold uppercase ${
                            f.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            [{f.severity}] {f.type}
                          </span>
                          <span className="text-slate-400">{f.finding_id}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-100 mt-0.5">{f.title}</div>
                      </div>
                      <button
                        onClick={() => {
                          onOpenFinding(f);
                        }}
                        className="text-xs text-blue-400 hover:text-white px-2.5 py-1 bg-slate-900 hover:bg-blue-600 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <span>Evidence</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                SOC Model: {activeEntityModal.soc_tier} ({activeEntityModal.total_assets} endpoints)
              </span>
              <button
                onClick={() => onExportPDF(activeEntityModal, getEntityFindings(activeEntityModal.entity_id))}
                className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Official PDF Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Supervisory Risk Weights Configuration Modal (Section 7.4) */}
      {weightsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-0.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Section 7.4 Supervisory Formulation</span>
                </div>
                <h2 className="text-base font-bold text-white">
                  Configurable Risk Scoring Weights
                </h2>
                <p className="text-[11px] text-slate-400">
                  Transparent multi-factor index formula applied across all monitored critical infrastructure
                </p>
              </div>
              <button
                onClick={() => setWeightsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-300 mb-1">
                  <span>Negative Space - Critical Asset Blackout:</span>
                  <span className="font-mono text-red-400 font-bold">+{tempWeights.negativeSpaceCritical} pts</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={tempWeights.negativeSpaceCritical}
                  onChange={(e) => setTempWeights({ ...tempWeights, negativeSpaceCritical: Number(e.target.value) })}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-300 mb-1">
                  <span>Negative Space - Volume Deficit (&gt;45%):</span>
                  <span className="font-mono text-amber-400 font-bold">+{tempWeights.negativeSpaceHigh} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={tempWeights.negativeSpaceHigh}
                  onChange={(e) => setTempWeights({ ...tempWeights, negativeSpaceHigh: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-300 mb-1">
                  <span>Execution Gap - Critical Rapid Closure (&lt;30m):</span>
                  <span className="font-mono text-amber-400 font-bold">+{tempWeights.executionGapCritical} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={tempWeights.executionGapCritical}
                  onChange={(e) => setTempWeights({ ...tempWeights, executionGapCritical: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-300 mb-1">
                  <span>Execution Gap - Suppressed Escalation (&lt;15%):</span>
                  <span className="font-mono text-blue-400 font-bold">+{tempWeights.executionGapHigh} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={tempWeights.executionGapHigh}
                  onChange={(e) => setTempWeights({ ...tempWeights, executionGapHigh: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-300 mb-1">
                  <span>Statistical Velocity Outlier Multiplier:</span>
                  <span className="font-mono text-purple-400 font-bold">+{tempWeights.anomalyWeight} pts</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={tempWeights.anomalyWeight}
                  onChange={(e) => setTempWeights({ ...tempWeights, anomalyWeight: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
              <button
                onClick={() => setTempWeights(DEFAULT_RISK_WEIGHTS)}
                className="px-3 py-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to NCIIPC Standard</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeightsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onUpdateWeights) onUpdateWeights(tempWeights);
                    setWeightsModalOpen(false);
                    if (onLogAuditAction) onLogAuditAction("SUPERVISORY_WEIGHTS_UPDATED", "Custom Risk Model Recomputed");
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded"
                >
                  Apply & Recalculate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
