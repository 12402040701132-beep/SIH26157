import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Search, 
  ListOrdered, 
  BarChart3, 
  FileText, 
  Upload, 
  ShieldCheck, 
  RotateCcw,
  BookOpen,
  Wrench,
  Shield,
  LogOut,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  reviewedCount: number;
  totalFindingsCount: number;
  onResetReviews: () => void;
  pendingRemediationsCount: number;
  currentUser?: { name: string; role: string; email: string };
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  reviewedCount,
  totalFindingsCount,
  onResetReviews,
  pendingRemediationsCount,
  currentUser,
  onLogout
}) => {
  const navSections = [
    {
      title: 'SUPERVISORY INTELLIGENCE',
      items: [
        { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'entities', label: 'Entity Risk View', icon: Building2 },
        { id: 'findings', label: 'Findings Explorer', icon: Search },
        { id: 'queue', label: 'Priority Review Queue', icon: ListOrdered, badge: Math.max(0, totalFindingsCount - reviewedCount) },
        { id: 'peer', label: 'Peer Comparison', icon: BarChart3 }
      ]
    },
    {
      title: 'GOVERNANCE & DIRECTIVES',
      items: [
        { id: 'reports', label: 'Reports & Batch Export', icon: FileText },
        { id: 'regulatory', label: 'Regulatory Compliance', icon: BookOpen },
        { id: 'remediation', label: 'Remediation Directives', icon: Wrench, badge: pendingRemediationsCount }
      ]
    },
    {
      title: 'SYSTEM & AUDIT',
      items: [
        { id: 'audit', label: 'Audit Trail Log', icon: Shield },
        { id: 'upload', label: 'Data Ingestion', icon: Upload }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 text-slate-200 overflow-y-auto select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>SAT-SA</span>
                <span className="text-[10px] font-mono px-1 py-0.2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                  SOVEREIGN
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                SOC Supervisory Analytics
              </div>
            </div>
          </div>

          <div className="mt-2.5 text-[10px] text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800 flex flex-col gap-0.5">
            <div className="text-slate-300 font-medium flex items-center justify-between">
              <span>National Cyber Oversight</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-slate-500 font-mono text-[9px]">NCIIPC / NTRO · Air-Gapped Engine</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-2.5 space-y-4">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {sec.title}
              </div>
              <nav className="space-y-0.5">
                {sec.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectPage(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* User Session & Status */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/70 space-y-2.5">
        {currentUser && (
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-semibold text-white truncate">{currentUser.name}</div>
                <div className="text-[9px] text-blue-400 truncate">{currentUser.role}</div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Lock Session / Sign Out"
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Supervisory Audit Queue
          </div>
          <div className="flex items-center justify-between text-xs mt-0.5">
            <span className="text-slate-300">Reviewed items:</span>
            <span className="font-mono text-emerald-400 font-bold">{reviewedCount} verified</span>
          </div>
        </div>

        <button
          onClick={onResetReviews}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Review Queue</span>
        </button>
      </div>
    </aside>
  );
};
