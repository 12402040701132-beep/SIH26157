import React, { useState } from 'react';
import { Finding, EntityRecord, AlertRecord } from '../data/benchmarkData';
import { generateCoverageMatrix, generateAuditExplanation } from '../services/analyticsEngine';
import { Search, Eye, Filter, ShieldAlert, Radio, Activity, Clock, FileWarning, HelpCircle, ChevronDown, ChevronUp, Grid3X3, Server, CheckCircle2, AlertOctagon } from 'lucide-react';

interface FindingsExplorerProps {
  allFindings: Finding[];
  entities: EntityRecord[];
  alerts?: AlertRecord[];
  onOpenFinding: (finding: Finding) => void;
}

export const FindingsExplorer: React.FC<FindingsExplorerProps> = ({
  allFindings,
  entities,
  alerts = [],
  onOpenFinding
}) => {
  const [activeTab, setActiveTab] = useState<'Execution Gap' | 'Negative Space' | 'Anomaly' | 'Coverage Matrix'>('Execution Gap');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedWhyIds, setExpandedWhyIds] = useState<Set<string>>(new Set());

  // Coverage Matrix Entity Selection
  const [matrixEntityId, setMatrixEntityId] = useState<string>(entities[0]?.entity_id || 'ENT-001');

  const executionGaps = allFindings.filter(f => f.type === 'Execution Gap');
  const negativeSpace = allFindings.filter(f => f.type === 'Negative Space');
  const anomalies = allFindings.filter(f => f.type === 'Anomaly');

  const currentPool = 
    activeTab === 'Execution Gap' ? executionGaps :
    activeTab === 'Negative Space' ? negativeSpace :
    activeTab === 'Anomaly' ? anomalies : [];

  const filtered = currentPool.filter(f => {
    const matchSev = severityFilter === 'All' || f.severity === severityFilter;
    const matchEnt = entityFilter === 'All' || f.entity_id === entityFilter;
    const matchQ = 
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.finding_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.asset_id && f.asset_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSev && matchEnt && matchQ;
  });

  const toggleWhyFlagged = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWhyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const matrixData = generateCoverageMatrix(matrixEntityId, alerts);
  const matrixSelectedEntity = entities.find(e => e.entity_id === matrixEntityId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Supervisory Findings & Evidence Explorer
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Dual-engine algorithmic detection of Execution Gaps, Negative Space blind spots, Statistical Outliers, and Telemetry Coverage Matrices
        </p>
      </div>

      {/* Tabs / Segmented Control */}
      <div className="flex flex-wrap border-b border-slate-800 gap-1">
        <button
          onClick={() => setActiveTab('Execution Gap')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'Execution Gap'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Execution Gaps ({executionGaps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('Negative Space')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'Negative Space'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Negative Space ({negativeSpace.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('Anomaly')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'Anomaly'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Statistical Anomalies ({anomalies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('Coverage Matrix')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'Coverage Matrix'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Asset × Severity Coverage Matrix (Negative Space)</span>
        </button>
      </div>

      {/* Context Banner */}
      {activeTab !== 'Coverage Matrix' && (
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg text-xs leading-relaxed text-slate-300">
          {activeTab === 'Execution Gap' && (
            <p>
              <strong className="text-amber-400">Execution Gap Concept (Section 7.1):</strong> Incidents or alerts marked as "Resolved" or "False Positive", but where operational investigation was dangerously superficial — including closures in &lt; 30 minutes with boilerplate notes ("N/A", "False positive", "Resolved"), copy-paste dispositions by analysts, or suppressed escalation ratios to inflate SLA compliance.
            </p>
          )}
          {activeTab === 'Negative Space' && (
            <p>
              <strong className="text-red-400">Negative Space Concept (Section 7.2):</strong> The absence of expected security signals where signals MUST exist. Highlights high-value SCADA, Core Banking, and Telecom assets that generated 0 alerts over 30 days despite continuous operational throughput (Expressed as <em>Expected X, Observed Y</em>).
            </p>
          )}
          {activeTab === 'Anomaly' && (
            <p>
              <strong className="text-blue-400">Statistical Anomaly Concept (Section 7.3):</strong> Outlier detection identifying extreme velocity closures (&lt; 5 minutes), abnormal case resolution durations, and multi-factor peer deviations relative to national baseline distributions.
            </p>
          )}
        </div>
      )}

      {/* Coverage Matrix Tab View */}
      {activeTab === 'Coverage Matrix' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-emerald-400" />
                Asset × Severity Telemetry Coverage Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Explicit Expected vs Observed verification across core SCADA, Banking, and Telecom assets
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="matrix-entity-select" className="text-xs text-slate-400 font-medium">Select Entity:</label>
              <select
                id="matrix-entity-select"
                aria-label="Select Entity"
                value={matrixEntityId}
                onChange={(e) => setMatrixEntityId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-hidden font-medium"
              >
                {entities.map(e => (
                  <option key={e.entity_id} value={e.entity_id}>
                    {e.entity_name} ({e.sector})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-3 px-4 font-semibold">Asset Identifier</th>
                  <th className="py-3 px-3 font-semibold text-center text-red-400">Critical</th>
                  <th className="py-3 px-3 font-semibold text-center text-amber-400">High</th>
                  <th className="py-3 px-3 font-semibold text-center text-blue-400">Medium</th>
                  <th className="py-3 px-3 font-semibold text-center text-slate-400">Low</th>
                  <th className="py-3 px-3 font-semibold text-center">Observed Total</th>
                  <th className="py-3 px-3 font-semibold text-center">Expected Baseline</th>
                  <th className="py-3 px-4 font-semibold text-right">Supervisory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {matrixData.map(row => {
                  const isSilenced = row.status === 'Zero Telemetry (Silenced)';
                  const isDeficit = row.status === 'Deficit';

                  return (
                    <tr
                      key={row.assetId}
                      className={`transition-colors ${
                        isSilenced ? 'bg-red-500/10 hover:bg-red-500/15' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white flex items-center gap-2">
                          <Server className={`w-3.5 h-3.5 ${isSilenced ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
                          <span>{row.assetId}</span>
                        </div>
                        {row.isRegisteredCritical && (
                          <div className="text-[10px] text-blue-400 mt-0.5">
                            ★ Tier-1 National Critical Information Infrastructure (NCII)
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-red-400">
                        {row.criticalCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-amber-400">
                        {row.highCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-blue-400">
                        {row.mediumCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {row.lowCount}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-white">
                        {row.totalCount}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        ≥ {row.expectedMinCount} events
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          isSilenced
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                            : isDeficit
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {isSilenced ? <AlertOctagon className="w-3 h-3" /> :
                           isDeficit ? <Clock className="w-3 h-3" /> :
                           <CheckCircle2 className="w-3 h-3" />}
                          <span>{row.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search findings by title, asset, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
              >
                <option value="All">All Critical Entities</option>
                {entities.map(e => (
                  <option key={e.entity_id} value={e.entity_id}>{e.entity_name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical Severity</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>
            </div>
          </div>

          {/* Findings Cards List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-400">
                <FileWarning className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium">No supervisory findings match your active filters.</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing filters or switching tabs.</p>
              </div>
            ) : (
              filtered.map(f => {
                const isCrit = f.severity === 'Critical';
                const isHigh = f.severity === 'High';
                const isExpanded = expandedWhyIds.has(f.finding_id);
                const explanation = f.explanation || generateAuditExplanation(f);

                return (
                  <div
                    key={f.finding_id}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1.5 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCrit ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                            isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          }`}>
                            {f.severity}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">{f.finding_id}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-300 font-medium">{f.entity_name}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400">Asset: <code className="text-slate-300">{f.asset_id}</code></span>
                        </div>

                        <h3 className="text-sm font-bold text-white">
                          {f.title}
                        </h3>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {f.description}
                        </p>

                        <div className="text-[11px] text-slate-400 pt-1 flex flex-wrap items-center gap-3">
                          {f.closure_time_minutes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Duration: {f.closure_time_minutes}m</span>
                            </span>
                          )}
                          {f.investigation_notes && (
                            <span className="truncate max-w-md italic text-slate-400">
                              Note: "{f.investigation_notes}"
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 self-end md:self-start">
                        {/* Why Flagged inline toggle */}
                        <button
                          onClick={(e) => toggleWhyFlagged(f.finding_id, e)}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 rounded transition-colors flex items-center gap-1 border border-amber-500/30"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Why Flagged?</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => onOpenFinding(f)}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Evidence</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Why Flagged Panel */}
                    {isExpanded && (
                      <div className="mt-3 p-3.5 bg-slate-950 rounded-lg border border-amber-500/30 text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400 text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>"Why Flagged?" Supervisory Reasoning</span>
                        </div>
                        <div className="text-slate-200 leading-relaxed">
                          <strong>Supervisory Impact:</strong> {explanation.why}
                        </div>
                        <div className="pt-2 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {Object.entries(explanation.evidence).slice(0, 4).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1 rounded">
                              <span className="text-slate-400">{k}:</span>
                              <span className="font-mono text-slate-200">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
