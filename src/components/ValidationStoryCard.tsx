import React, { useState } from 'react';
import { Eye, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Sparkles, AlertTriangle, Radio } from 'lucide-react';

interface CaseStudy {
  id: string;
  name: string;
  sector: string;
  conventionalMetric: string;
  conventionalStatus: 'passed' | 'healthy';
  conventionalDetail: string;
  satsaFindingType: 'Execution Gap' | 'Negative Space';
  satsaFlag: string;
  satsaReality: string;
  evidenceRef: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-1',
    name: 'Apex National Bank',
    sector: 'Banking & Financial (BFSI)',
    conventionalMetric: '99.4% SLA Compliance',
    conventionalStatus: 'passed',
    conventionalDetail: 'Traditional KPI reports show 100% of Critical/High alerts resolved in < 15 minutes. Dashboard displays green "EXCELLENT".',
    satsaFindingType: 'Execution Gap',
    satsaFlag: 'Premature Closure & Suppressed Escalations',
    satsaReality: 'Critical ransomware & SWIFT transaction alerts closed in 4–8 minutes by operators using boilerplate text "Resolved / False positive" without PCAP analysis or escalation.',
    evidenceRef: 'GAP-ALT-ALT-1002 · Asset SWIFT-GW-01'
  },
  {
    id: 'case-2',
    name: 'National Power Grid Corp',
    sector: 'Power & Energy (SCADA)',
    conventionalMetric: 'Zero High-Severity Alerts (Past 30d)',
    conventionalStatus: 'healthy',
    conventionalDetail: 'Traditional dashboard shows 0 critical alerts from regional transmission grid. Standard scorecards interpret zero alerts as "Zero Threats".',
    satsaFindingType: 'Negative Space',
    satsaFlag: 'Silenced Critical SCADA Controller',
    satsaReality: 'Asset NPGC-SCADA-RTU-09 has generated 0 telemetry events in 30 days despite continuous power routing. The sensor feed dropped or an adversary suppressed syslog forwarders.',
    evidenceRef: 'NEG-ASSET-ENT-001 · Asset NPGC-SCADA-RTU-09'
  },
  {
    id: 'case-3',
    name: 'Bharat Telecom Ltd',
    sector: 'Telecommunications',
    conventionalMetric: '142 Alerts Closed per Shift',
    conventionalStatus: 'passed',
    conventionalDetail: 'Traditional metrics reward high ticket closure velocity. Operator throughput is recorded in top 95th percentile.',
    satsaFindingType: 'Execution Gap',
    satsaFlag: 'Automated / Copy-Paste Hollow Disposition',
    satsaReality: 'Same operator closed 28 consecutive Core SGSN router alerts within 12 seconds each, pasting identical boilerplate "Checked and safe" without diagnostic commands.',
    evidenceRef: 'GAP-ALT-ALT-1025 · Asset BTL-SGSN-CORE-02'
  }
];

export const ValidationStoryCard: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');
  const [activeView, setActiveView] = useState<'compare' | 'conventional' | 'satsa'>('compare');

  const selectedCase = CASE_STUDIES.find(c => c.id === selectedCaseId) || CASE_STUDIES[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Supervisory Validation Story
            </span>
            <span className="text-xs text-slate-400">Why Conventional Dashboards Fail</span>
          </div>
          <h2 className="text-sm font-bold text-white mt-1">
            The KPI Mirage vs. SAT-SA Ground Reality
          </h2>
          <p className="text-xs text-slate-400">
            Demonstrating how normal KPI scorecards mask critical blind spots that SAT-SA algorithmically surfaces.
          </p>
        </div>

        {/* Case Selector Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 p-1 rounded-md border border-slate-800">
          {CASE_STUDIES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedCaseId === c.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Conventional KPI Dashboard (The Mirage) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                1. Conventional SOC KPI Dashboard
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Scorecard: GREEN / HEALTHY
              </span>
            </div>

            <div className="mt-2">
              <div className="text-lg font-bold text-slate-200 font-mono">
                {selectedCase.conventionalMetric}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {selectedCase.conventionalDetail}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Blind Spot: Pure velocity & closure counting</span>
            <span className="text-red-400/80 font-medium">Misses Work Quality</span>
          </div>
        </div>

        {/* Right: SAT-SA Supervisory Reality (The Ground Truth) */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-sm shadow-amber-500/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                {selectedCase.satsaFindingType === 'Execution Gap' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Radio className="w-3.5 h-3.5 text-red-400" />
                )}
                2. SAT-SA Supervisory Intelligence
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                <AlertTriangle className="w-3 h-3" />
                CRITICAL VULNERABILITY
              </span>
            </div>

            <div className="mt-2">
              <div className="text-sm font-bold text-red-400 flex items-center gap-2">
                <span>{selectedCase.satsaFlag}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                  {selectedCase.satsaFindingType}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {selectedCase.satsaReality}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Evidence Ref: {selectedCase.evidenceRef}</span>
            <span className="text-blue-400 font-semibold">Priority #1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
