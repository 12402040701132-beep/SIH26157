import React, { useState } from 'react';
import { EntityRecord, Finding } from '../data/benchmarkData';
import { exportSupervisoryPDF, exportBatchHighRiskArchive } from '../services/pdfExport';
import { FileText, Download, Printer, Shield, CheckCircle2, AlertOctagon, Building2, Archive, Flame } from 'lucide-react';

interface ReportsViewProps {
  entities: EntityRecord[];
  allFindings: Finding[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  entities,
  allFindings
}) => {
  const [selectedScope, setSelectedScope] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  const highRiskEntities = entities.filter(e => (e.risk_score || 0) >= 70);

  const selectedEntity = selectedScope === 'All'
    ? {
        entity_name: "National Critical Information Infrastructure (Aggregate)",
        sector: "Cross-Sector National Critical Infrastructure (Power, Banking, Telecom, Aviation)",
        risk_score: Math.round(entities.reduce((acc, e) => acc + (e.risk_score || 50), 0) / entities.length),
        risk_level: 'High'
      }
    : entities.find(e => e.entity_id === selectedScope) || entities[0];

  const targetFindings = selectedScope === 'All'
    ? allFindings
    : allFindings.filter(f => f.entity_id === selectedScope);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      exportSupervisoryPDF(selectedEntity, targetFindings);
      setIsGenerating(false);
    }, 300);
  };

  const handleBatchExport = async () => {
    try {
      setIsBatchGenerating(true);
      await exportBatchHighRiskArchive(highRiskEntities, allFindings);
    } catch (err) {
      console.error('Batch export failed:', err);
      alert('Batch export encountered an error generating the archive.');
    } finally {
      setIsBatchGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Official Supervisory Audit Reports & PDF Generation
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Export cryptographic, publication-grade NCIIPC / NTRO supervisory dossiers for regulatory enforcement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Batch Export High Risk Archive Button */}
          <button
            onClick={handleBatchExport}
            disabled={isBatchGenerating || highRiskEntities.length === 0}
            className="px-3.5 py-2 text-xs font-semibold bg-red-600/90 hover:bg-red-500 text-white rounded-md transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 border border-red-500/40"
            title="Generate a compressed .ZIP archive containing individual PDF dossiers for all High-Risk entities"
          >
            <Archive className="w-4 h-4" />
            <span>
              {isBatchGenerating
                ? 'Compressing High-Risk Archive...'
                : `Batch Export High-Risk Archive (.ZIP - ${highRiskEntities.length})`}
            </span>
          </button>

          {/* Single / Aggregate PDF Download */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Compiling PDF...' : 'Download Current PDF Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Batch Export Notice Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">Batch Export Ready for {highRiskEntities.length} High-Risk Entities:</span>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Includes {highRiskEntities.map(e => e.entity_name).join(', ')}. Bundles individual verified dossiers + cryptographic manifest into a single ZIP archive.
            </div>
          </div>
        </div>

        <button
          onClick={handleBatchExport}
          disabled={isBatchGenerating}
          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white rounded border border-slate-700 text-xs font-medium shrink-0 self-start sm:self-auto transition-colors"
        >
          {isBatchGenerating ? 'Packaging...' : 'Download All High-Risk (.ZIP)'}
        </button>
      </div>

      {/* Scope Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="report-scope-select" className="text-xs font-medium text-slate-300 shrink-0">Report Scope:</label>
          <select
            id="report-scope-select"
            aria-label="Report Scope"
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white font-medium focus:outline-hidden focus:border-blue-500 w-full sm:w-80"
          >
            <option value="All">All Critical Infrastructure Entities (Cohort Dossier)</option>
            {entities.map(e => (
              <option key={e.entity_id} value={e.entity_id}>
                {e.entity_name} ({e.sector})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-4">
          <span>Identified Findings: <strong className="text-white">{targetFindings.length}</strong></span>
          <span>·</span>
          <span>Risk Status: <strong className="text-red-400">{selectedEntity.risk_score}/100 ({selectedEntity.risk_level})</strong></span>
        </div>
      </div>

      {/* Report Document Preview Sheet */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 sm:p-10 shadow-2xl space-y-8 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              GOVERNMENT OF INDIA · NCIIPC / NTRO CYBER OVERSIGHT DIVISION
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              SUPERVISORY SOC AUDIT ASSESSMENT REPORT
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Statutory Critical Infrastructure Protection Compliance Dossier · 30-Day Retrospective
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 space-y-1">
            <div>Classification: <strong className="text-amber-400">OFFICIAL SENSITIVE</strong></div>
            <div>Generated: <span className="font-mono text-slate-300">{new Date().toUTCString()}</span></div>
            <div>Architecture: <span className="text-emerald-400">Air-Gapped Sovereign Engine</span></div>
          </div>
        </div>

        {/* Entity Scorecard Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-lg border border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Target Entity</div>
            <div className="text-sm font-bold text-white mt-0.5">{selectedEntity.entity_name}</div>
            <div className="text-xs text-slate-400">{selectedEntity.sector}</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">Assigned Supervisory Risk</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-0.5">
              {selectedEntity.risk_score}/100
            </div>
            <div className="text-xs text-red-400 font-semibold uppercase">{selectedEntity.risk_level} Priority Oversight</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">Detected Anomalies</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {targetFindings.length} Total Gaps
            </div>
            <div className="text-xs text-slate-400">Execution flaws & silenced assets</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2">
            1. Executive Supervisory Summary
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            This supervisory assessment was executed using SAT-SA algorithmic inspection protocols across operational SIEM and ticket management logs. Traditional oversight methods focus strictly on ticket counts and nominal SLA closure times. Our supervisory algorithms uncovered systematic blind spots categorized into <strong>Execution Gaps</strong> (rapid closures with boilerplate notes) and <strong>Negative Space</strong> (critical infrastructure assets operating in complete telemetry silence).
          </p>
        </div>

        {/* Section 2: Top Audit Findings Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2">
            2. Evidentiary Findings Summary
          </h3>
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3 font-semibold">ID / Type</th>
                  <th className="py-2 px-3 font-semibold">Severity</th>
                  <th className="py-2 px-3 font-semibold">Finding Title</th>
                  <th className="py-2 px-3 font-semibold">Target Asset</th>
                  <th className="py-2 px-3 font-semibold">Evidence Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {targetFindings.slice(0, 8).map(f => (
                  <tr key={f.finding_id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-mono text-slate-300">
                      <div>{f.finding_id}</div>
                      <div className="text-[10px] text-slate-400">{f.type}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        f.severity === 'Critical' ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-200">{f.title}</td>
                    <td className="py-2 px-3 font-mono text-slate-300">{f.asset_id}</td>
                    <td className="py-2 px-3 text-slate-400 italic">
                      "{f.investigation_notes || f.description.substring(0, 50)}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {targetFindings.length > 8 && (
            <div className="text-center text-xs text-slate-400 pt-1">
              + {targetFindings.length - 8} additional findings documented in full PDF dossier
            </div>
          )}
        </div>

        {/* Section 3: Directives */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2">
            3. Mandatory Supervisory Directives & Corrective Actions
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800 flex items-start gap-2.5">
              <span className="font-bold text-blue-400 shrink-0">DIR-01:</span>
              <div>
                <strong>Mandatory Minimum Triage Threshold:</strong> Ban single-analyst ticket closure under 30 minutes for Critical/High alerts without documented packet capture verification.
              </div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800 flex items-start gap-2.5">
              <span className="font-bold text-blue-400 shrink-0">DIR-02:</span>
              <div>
                <strong>Negative Space Heartbeat Forwarders:</strong> Deploy independent watchdog daemons on all NCII core servers (SCADA RTUs, SWIFT gateways, and ATC radar feeds) that alarm if telemetry stops for &gt; 6 hours.
              </div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800 flex items-start gap-2.5">
              <span className="font-bold text-blue-400 shrink-0">DIR-03:</span>
              <div>
                <strong>KPI Realignment:</strong> Remove ticket volume speed quotas from Tier-1 analyst performance evaluations to eradicate artificial SLA suppression.
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Official National Cyber Oversight Instrument · Air-Gapped Sovereign Architecture</span>
          <span className="font-mono text-slate-500">AUTH-REF: NCIIPC-NTRO-SUPERVISORY-DIRECTIVE</span>
        </div>
      </div>
    </div>
  );
};
