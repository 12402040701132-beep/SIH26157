import React from 'react';
import { Finding } from '../data/benchmarkData';
import { generateAuditExplanation } from '../services/analyticsEngine';
import { X, ShieldAlert, CheckCircle2, Copy, FileText, AlertTriangle } from 'lucide-react';

interface EvidenceDrawerProps {
  finding: Finding | null;
  onClose: () => void;
  isReviewed?: boolean;
  onToggleReview?: (findingId: string) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  finding,
  onClose,
  isReviewed,
  onToggleReview
}) => {
  if (!finding) return null;

  const explanation = finding.explanation || generateAuditExplanation(finding);
  const isCrit = finding.severity === 'Critical';
  const isHigh = finding.severity === 'High';

  const copyToClipboard = () => {
    const text = `SAT-SA AUDIT EVIDENCE DOSSIER
Finding ID: ${finding.finding_id}
Type: ${finding.type} (${finding.subtype})
Entity: ${finding.entity_name}
Severity: ${finding.severity}
Asset: ${finding.asset_id}

1. WHAT WAS DETECTED:
${explanation.what}

2. WHY IT IS A SUPERVISORY PROBLEM:
${explanation.why}

3. SUPPORTING EVIDENCE:
${Object.entries(explanation.evidence).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    alert('Evidence Dossier copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs">
              <span className={`px-2 py-0.5 font-bold uppercase rounded text-[10px] ${
                isCrit ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}>
                {finding.severity} · {finding.type}
              </span>
              <span className="text-slate-400">{finding.finding_id}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{finding.timestamp}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 leading-snug">
              {finding.title}
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Target Entity: <span className="text-slate-200 font-medium">{finding.entity_name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: What */}
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              1. What was detected
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {explanation.what}
            </p>
          </div>

          {/* Section 2: Why Flagged? Panel (Core USP) */}
          <div className="bg-slate-950/70 rounded-lg p-4 border border-amber-500/40 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>2. "Why Flagged?" Supervisory Reasoning Panel</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                EXPLAINABILITY CORE
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {explanation.why}
            </p>
          </div>

          {/* Section 3: Supporting Evidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <FileText className="w-4 h-4 text-emerald-400" />
                3. Supporting Audit Evidence & Telemetry Logs
              </div>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Audit Field</th>
                    <th className="py-2.5 px-3 font-semibold">Observed Telemetry Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.entries(explanation.evidence).map(([k, v]) => (
                    <tr key={k} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2 px-3 font-medium text-slate-400 w-2/5">{k}</td>
                      <td className="py-2 px-3 font-mono text-slate-200">{v}</td>
                    </tr>
                  ))}
                  <tr className="hover:bg-slate-900/50">
                    <td className="py-2 px-3 font-medium text-slate-400">Assigned Asset</td>
                    <td className="py-2 px-3 font-mono text-slate-200">{finding.asset_id}</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="py-2 px-3 font-medium text-slate-400">Operating Analyst</td>
                    <td className="py-2 px-3 font-mono text-slate-200">{finding.analyst_id}</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="py-2 px-3 font-medium text-slate-400">Investigation Note Record</td>
                    <td className="py-2 px-3 italic text-amber-200/90">
                      "{finding.investigation_notes || 'No note attached'}"
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Audit Dossier
          </button>

          {onToggleReview && (
            <button
              onClick={() => onToggleReview(finding.finding_id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                isReviewed
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isReviewed ? 'Marked as Reviewed' : 'Mark as Reviewed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
