import React, { useState } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  ShieldAlert, 
  User, 
  LogOut, 
  Download, 
  ShieldCheck, 
  ChevronRight,
  Bell,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onOpenSearch: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: { name: string; role: string; email: string };
  onOpenAuth: () => void;
  onExportAll: () => void;
  pendingReviewsCount: number;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

const PAGE_TITLES: Record<string, string> = {
  overview: 'Overview Dashboard',
  entities: 'Entity Risk View',
  findings: 'Findings Explorer',
  queue: 'Priority Review Queue',
  peer: 'Peer Comparison',
  reports: 'Reports & Batch Export',
  regulatory: 'Regulatory Compliance',
  remediation: 'Remediation Directives',
  audit: 'Audit Trail Log',
  upload: 'Data Ingestion & Benchmark'
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenSearch,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onOpenAuth,
  onExportAll,
  pendingReviewsCount,
  onLogout,
  onNavigate
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 text-slate-100 select-none">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
          <span className="text-slate-500 hidden sm:inline">National Oversight</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
          <span className="font-semibold text-white truncate">
            {PAGE_TITLES[currentPage] || 'Supervisory Console'}
          </span>
        </div>

        {/* Global Search Trigger */}
        <div className="max-w-xs w-full hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">Search entities, findings, assets...</span>
            </div>
            <kbd className="font-mono text-[10px] bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* DEFCON Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-md text-[11px] font-semibold text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>THREAT: ELEVATED (DEFCON-3)</span>
        </div>

        {/* Quick Export All Button */}
        <button
          onClick={onExportAll}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
          title="Export CSV of all entities and findings"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Export All</span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-white shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-white truncate max-w-[130px] leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-blue-400 truncate max-w-[130px] leading-tight">{currentUser.role}</div>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in duration-100 divide-y divide-slate-800/80">
              <div className="p-2.5">
                <div className="font-bold text-white text-sm">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-mono font-medium">
                    {currentUser.role}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5"
                >
                  <User className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-medium">Switch Supervisory Clearance</div>
                    <div className="text-[10px] text-slate-500">Change operational tier</div>
                  </div>
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Lock Console / Sign Out</div>
                    <div className="text-[10px] text-red-400/70">Return to authentication gate</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
