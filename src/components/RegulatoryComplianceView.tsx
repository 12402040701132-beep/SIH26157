import React, { useState } from 'react';
import { RegulatoryControl, EntityRecord, Finding } from '../data/benchmarkData';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, Filter, FileText, ChevronRight, BookOpen } from 'lucide-react';

interface RegulatoryComplianceViewProps {
  controls: RegulatoryControl[];
  entities: EntityRecord[];
  allFindings: Finding[];
}

export const RegulatoryComplianceView: React.FC<RegulatoryComplianceViewProps> = ({
  controls,
  entities,
  allFindings
}) => {
  const [selectedFramework, setSelectedFramework] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const frameworks = ['All', 'NIST CSF 2.0', 'CIS Controls v8', 'ISO 27001:2022', 'NCIIPC CII Directives'];

  const filteredControls = controls.filter(c => {
    const matchFw = selectedFramework === 'All' || c.framework === selectedFramework;
    const matchStat = statusFilter === 'All' || c.status === statusFilter;
    return matchFw && matchStat;
  });

  const totalControls = controls.length;
  const passCount = controls.filter(c => c.status === 'Pass').length;
  const failCount = controls.filter(c => c.status === 'Fail').length;
  const partialCount = controls.filter(c => c.status === 'Partial').length;

  const overallScore = Math.round(((passCount + partialCount * 0.5) / (totalControls || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Regulatory Compliance & Framework Alignment
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Statutory mapping of detected Execution Gaps and Negative Space against NIST CSF 2.0, CIS Controls v8, and ISO 27001
          </p>
        </div>
      </div>

      {/* Summary Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Cohort Compliance Score</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1 flex items-baseline gap-2">
            <span>{overallScore}%</span>
            <span className="text-xs font-normal text-red-500">Non-Compliant</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Depressed by persistent Negative Space blind spots
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Critical Control Failures</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {failCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Mandatory controls with direct regulatory violations
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Partial Conformance</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {partialCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            SLA gaming detected in incident triage
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Monitored Frameworks</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            4 Standards
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            NIST CSF, CIS v8, ISO 27001, NCIIPC Directives
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {frameworks.map(fw => (
            <button
              key={fw}
              onClick={() => setSelectedFramework(fw)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                selectedFramework === fw
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {fw}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="reg-status-filter" className="text-xs text-slate-400 shrink-0">Status:</label>
          <select
            id="reg-status-filter"
            aria-label="Filter status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Fail">Non-Compliant (Fail)</option>
            <option value="Partial">Partial Compliance</option>
            <option value="Pass">Fully Compliant (Pass)</option>
          </select>
        </div>
      </div>

      {/* Regulatory Controls Checklist Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Control ID & Framework</th>
                <th className="py-3 px-4 font-semibold">Domain & Control Title</th>
                <th className="py-3 px-4 font-semibold">Statutory Mandate Requirement</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Impacted Entities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredControls.map((ctrl) => {
                const isFail = ctrl.status === 'Fail';
                const isPartial = ctrl.status === 'Partial';

                return (
                  <tr key={ctrl.control_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-200">{ctrl.control_id}</div>
                      <div className="text-[10px] text-blue-400 mt-0.5">{ctrl.framework}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{ctrl.title}</div>
                      <div className="text-[11px] text-slate-400">{ctrl.domain}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-sm">
                      {ctrl.requirement}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        isFail
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : isPartial
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isFail ? <XCircle className="w-3 h-3" /> :
                         isPartial ? <AlertCircle className="w-3 h-3" /> :
                         <CheckCircle2 className="w-3 h-3" />}
                        <span>{ctrl.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {ctrl.impacted_entities.map(ent => (
                          <span
                            key={ent}
                            className="px-1.5 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded font-mono text-[10px]"
                          >
                            {ent}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
