import React, { useState } from 'react';
import { Finding } from '../data/benchmarkData';
import { CheckCircle2, RotateCcw, AlertTriangle, Eye, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PriorityReviewQueueProps {
  allFindings: Finding[];
  reviewedIds: Set<string>;
  onToggleReview: (id: string) => void;
  onOpenFinding: (finding: Finding) => void;
  onResetReviews: () => void;
}

export const PriorityReviewQueue: React.FC<PriorityReviewQueueProps> = ({
  allFindings,
  reviewedIds,
  onToggleReview,
  onOpenFinding,
  onResetReviews
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [supervisorNotes, setSupervisorNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('sat_sa_supervisor_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleNoteChange = (id: string, note: string) => {
    const updated = { ...supervisorNotes, [id]: note };
    setSupervisorNotes(updated);
    try {
      localStorage.setItem('sat_sa_supervisor_notes', JSON.stringify(updated));
    } catch {}
  };

  const handleReviewClick = (id: string) => {
    const willBeReviewed = !reviewedIds.has(id);
    onToggleReview(id);
    if (willBeReviewed) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#3B82F6', '#22C55E', '#F59E0B']
      });
    }
  };

  // Compile prioritized queue
  // Negative Space Criticals & Execution Gap Criticals rank highest
  const rankedItems = allFindings.map((f, idx) => {
    let priorityWeight = 100;
    if (f.severity === 'Critical') priorityWeight += 150;
    if (f.severity === 'High') priorityWeight += 80;
    if (f.type === 'Negative Space') priorityWeight += 90;
    if (f.type === 'Execution Gap') priorityWeight += 70;
    
    return {
      finding: f,
      priorityWeight,
      reviewed: reviewedIds.has(f.finding_id)
    };
  }).sort((a, b) => {
    if (a.reviewed !== b.reviewed) return a.reviewed ? 1 : -1;
    return b.priorityWeight - a.priorityWeight;
  });

  const displayed = rankedItems.filter(item => {
    if (filterMode === 'pending') return !item.reviewed;
    if (filterMode === 'reviewed') return item.reviewed;
    return true;
  });

  const pendingCount = rankedItems.filter(r => !r.reviewed).length;
  const reviewedCount = reviewedIds.size;
  const totalCount = rankedItems.length;
  const progressPct = totalCount > 0 ? (reviewedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Priority Supervisory Review Queue
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Algorithmic priority ordering of suspect closures and silent assets requiring senior supervisor verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetReviews}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Audit State</span>
          </button>
        </div>
      </div>

      {/* Progress & Status Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Supervisory Audit Progress
            </div>
            <div className="text-lg font-bold text-white mt-0.5 flex items-baseline gap-2">
              <span>{reviewedCount} Completed</span>
              <span className="text-xs text-slate-400 font-normal">/ {pendingCount} Pending Verification</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterMode === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterMode('reviewed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterMode === 'reviewed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Reviewed ({reviewedCount})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Priority Queue List */}
      <div className="space-y-3">
        {displayed.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-slate-200">No items in this queue filter!</p>
            <p className="text-xs text-slate-400 mt-1">
              {filterMode === 'pending' ? 'All priority supervisory items have been reviewed.' : 'No reviewed items recorded yet.'}
            </p>
          </div>
        ) : (
          displayed.slice(0, 30).map((item, idx) => {
            const f = item.finding;
            const isCrit = f.severity === 'Critical';
            const isHigh = f.severity === 'High';
            const noteVal = supervisorNotes[f.finding_id] || '';

            return (
              <div
                key={f.finding_id}
                className={`bg-slate-900 border rounded-lg p-4 transition-all ${
                  item.reviewed
                    ? 'border-emerald-500/30 bg-slate-950/40 opacity-75'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Metadata */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        RANK #{idx + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCrit ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {f.severity}
                      </span>
                      <span className="text-slate-300 font-semibold">{f.entity_name}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 font-mono text-[11px]">{f.finding_id}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {f.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="text-slate-400 font-medium">Supervisor Flag:</span> {f.description}
                    </p>

                    <div className="text-[11px] text-slate-400 pt-1 flex flex-wrap items-center gap-3">
                      <span>Asset: <strong className="text-slate-300 font-mono">{f.asset_id}</strong></span>
                      {f.closure_time_minutes > 0 && (
                        <span>Closure: <strong className="text-slate-300">{f.closure_time_minutes}m</strong></span>
                      )}
                      <span>Analyst: <strong className="text-slate-300">{f.analyst_id}</strong></span>
                    </div>

                    {/* Inline Supervisor Note */}
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Add supervisor audit comment / action taken..."
                        value={noteVal}
                        onChange={(e) => handleNoteChange(f.finding_id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                    <button
                      onClick={() => onOpenFinding(f)}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Evidence</span>
                    </button>

                    <button
                      onClick={() => handleReviewClick(f.finding_id)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
                        item.reviewed
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{item.reviewed ? 'Verified' : 'Mark Reviewed'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
