import React, { useState, useEffect } from 'react';
import { EntityRecord, Finding, RegulatoryControl, RemediationTask } from '../data/benchmarkData';
import { Search, X, Building2, ShieldAlert, BookOpen, Wrench, ChevronRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  entities: EntityRecord[];
  allFindings: Finding[];
  regulatoryControls: RegulatoryControl[];
  remediationTasks: RemediationTask[];
  onNavigateToEntity: (entityId: string) => void;
  onNavigateToFinding: (finding: Finding) => void;
  onNavigatePage: (page: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  entities,
  allFindings,
  regulatoryControls,
  remediationTasks,
  onNavigateToEntity,
  onNavigateToFinding,
  onNavigatePage
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedEntities = q
    ? entities.filter(e => e.entity_name.toLowerCase().includes(q) || e.sector.toLowerCase().includes(q) || e.entity_id.toLowerCase().includes(q))
    : entities.slice(0, 3);

  const matchedFindings = q
    ? allFindings.filter(f => f.title.toLowerCase().includes(q) || f.finding_id.toLowerCase().includes(q) || f.asset_id.toLowerCase().includes(q))
    : allFindings.slice(0, 3);

  const matchedControls = q
    ? regulatoryControls.filter(c => c.control_id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.framework.toLowerCase().includes(q))
    : regulatoryControls.slice(0, 2);

  const matchedTasks = q
    ? remediationTasks.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    : remediationTasks.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search entities, findings, assets, regulatory controls (Esc to close)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-[420px] overflow-y-auto p-4 space-y-4">
          {/* Matched Entities */}
          {matchedEntities.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Critical Infrastructure Entities
              </div>
              <div className="space-y-1">
                {matchedEntities.map(ent => (
                  <button
                    key={ent.entity_id}
                    onClick={() => {
                      onNavigateToEntity(ent.entity_id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-blue-600/20 border border-slate-800/80 hover:border-blue-500/50 flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{ent.entity_name}</div>
                      <div className="text-[10px] text-slate-400">{ent.sector} · Risk: <strong className="text-red-400">{ent.risk_score}/100</strong></div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Findings */}
          {matchedFindings.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Supervisory Findings & Gaps
              </div>
              <div className="space-y-1">
                {matchedFindings.map(f => (
                  <button
                    key={f.finding_id}
                    onClick={() => {
                      onNavigateToFinding(f);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-amber-600/20 border border-slate-800/80 hover:border-amber-500/50 flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span className={`px-1 py-0.2 rounded text-[9px] font-bold uppercase ${
                          f.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {f.severity}
                        </span>
                        <span>{f.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{f.entity_name} · Asset: <code className="text-slate-300 font-mono">{f.asset_id}</code></div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Controls */}
          {matchedControls.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Regulatory Controls (NIST / CIS / ISO)
              </div>
              <div className="space-y-1">
                {matchedControls.map(ctrl => (
                  <button
                    key={ctrl.control_id}
                    onClick={() => {
                      onNavigatePage('regulatory');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-emerald-600/20 border border-slate-800/80 hover:border-emerald-500/50 flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white font-mono">{ctrl.control_id}: {ctrl.title}</div>
                      <div className="text-[10px] text-slate-400">{ctrl.framework} · Status: <span className="text-red-400 font-bold">{ctrl.status}</span></div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Navigate with arrows or press Esc to close</span>
          <span className="font-mono text-blue-400">100% Offline Indexing</span>
        </div>
      </div>
    </div>
  );
};
