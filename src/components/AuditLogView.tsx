import React, { useState } from 'react';
import { AuditLogEntry } from '../data/benchmarkData';
import { ShieldCheck, Download, Search, CheckCircle2, AlertTriangle, Hash, FileText } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredLogs = logs.filter(l => {
    const matchQ = 
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchQ && matchStatus;
  });

  const exportAuditCSV = () => {
    const headers = ["Log ID", "Timestamp", "Supervisor / User", "Role", "Action Performed", "Target Entity / Artifact", "Status", "Cryptographic Hash (SHA-256)"];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.target.replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.hash}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SAT-SA_Regulatory_Audit_Trail_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Cryptographic Supervisory Audit Trail
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Immutable chain-of-custody log tracking user access, findings review, report export, and remediation actions
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, action, target, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="audit-filter-status" className="text-xs text-slate-400 shrink-0">Filter Status:</label>
          <select
            id="audit-filter-status"
            aria-label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-hidden"
          >
            <option value="All">All Events ({logs.length})</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FLAGGED">FLAGGED</option>
            <option value="WARNING">WARNING</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Log ID & Timestamp</th>
                <th className="py-3 px-4 font-semibold">User & Clearance Role</th>
                <th className="py-3 px-4 font-semibold">Action Performed</th>
                <th className="py-3 px-4 font-semibold">Target Object</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold font-mono">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-200">{l.id}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{l.timestamp}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{l.user}</div>
                    <div className="text-[10px] text-blue-400">{l.role}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-300">
                    {l.action}
                  </td>

                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                    {l.target}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      l.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      l.status === 'FLAGGED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {l.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={l.hash}>
                    {l.hash.substring(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
