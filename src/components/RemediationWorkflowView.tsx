import React, { useState } from 'react';
import { RemediationTask } from '../data/benchmarkData';
import { CheckCircle2, Clock, AlertTriangle, Terminal, Copy, Check, Plus, Bell, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RemediationWorkflowViewProps {
  tasks: RemediationTask[];
  onUpdateTaskStatus: (taskId: string, newStatus: 'Pending' | 'In-Progress' | 'Verified') => void;
  onAddTask: (task: RemediationTask) => void;
}

export const RemediationWorkflowView: React.FC<RemediationWorkflowViewProps> = ({
  tasks,
  onUpdateTaskStatus,
  onAddTask
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reminderSentId, setReminderSentId] = useState<string | null>(null);

  const handleCopyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleStatusChange = (id: string, newStatus: 'Pending' | 'In-Progress' | 'Verified') => {
    onUpdateTaskStatus(id, newStatus);
    if (newStatus === 'Verified') {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#22C55E', '#3B82F6']
      });
    }
  };

  const handleSendReminder = (id: string) => {
    setReminderSentId(id);
    setTimeout(() => setReminderSentId(null), 2500);
  };

  const filteredTasks = tasks.filter(t => {
    return filterStatus === 'All' || t.status === filterStatus;
  });

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In-Progress').length;
  const verifiedCount = tasks.filter(t => t.status === 'Verified').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Remediation Workflow & Corrective Action Directives
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Track, assign, and verify corrective directives issued to Critical Sector Entities with automated reminders
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Pending Directives</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting entity engineer action</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">In-Progress Mitigations</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {inProgressCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Telemetry configuration underway</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Verified & Closed</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {verifiedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Validated by supervisory inspector</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['All', 'Pending', 'In-Progress', 'Verified'] as const).map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              filterStatus === st
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            {st} ({st === 'All' ? tasks.length : tasks.filter(t => t.status === st).length})
          </button>
        ))}
      </div>

      {/* Remediation Cards List */}
      <div className="space-y-4">
        {filteredTasks.map((t) => {
          const isPending = t.status === 'Pending';
          const isInProg = t.status === 'In-Progress';
          const isVerified = t.status === 'Verified';

          return (
            <div
              key={t.id}
              className={`bg-slate-900 border rounded-lg p-5 transition-all space-y-4 ${
                isVerified
                  ? 'border-emerald-500/30 bg-slate-950/40 opacity-80'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-blue-400 font-bold">{t.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-300 font-semibold">{t.entity_name}</span>
                    <span className="text-slate-600">·</span>
                    <span className="px-1.5 py-0.2 bg-slate-950 text-slate-400 border border-slate-800 rounded font-mono text-[10px]">
                      Ref: {t.finding_id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {t.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Assigned: <strong className="text-slate-200">{t.assigned_to}</strong> · Target Deadline: <strong className="text-amber-400 font-mono">{t.due_date}</strong>
                  </div>
                </div>

                {/* Status Badges & Controls */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value as any)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded border focus:outline-hidden ${
                      isVerified
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : isInProg
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Verified">Verified</option>
                  </select>

                  <button
                    onClick={() => handleSendReminder(t.id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
                    title="Send Automated Reminder to Entity CISO"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {reminderSentId === t.id && (
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded flex items-center gap-2 animate-in fade-in">
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                  <span>Automated regulatory notice transmitted to {t.assigned_to}. Logged in supervisory audit trail.</span>
                </div>
              )}

              {/* Guidance Description */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800/80">
                <span className="font-semibold text-slate-400 block mb-0.5">Remediation Protocol:</span>
                {t.remediation_guidance}
              </div>

              {/* Copyable CLI Commands Box */}
              {t.cli_commands && t.cli_commands.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      Remediation CLI Commands (Engineers / SOC Admins):
                    </span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-md p-2.5 font-mono text-xs text-slate-200 space-y-1 overflow-x-auto">
                    {t.cli_commands.map((cmd, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 hover:bg-slate-900/60 p-1 rounded">
                        <span className="text-emerald-400">$ {cmd}</span>
                        <button
                          onClick={() => handleCopyCommand(cmd, `${t.id}-${i}`)}
                          className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded shrink-0 flex items-center gap-1"
                        >
                          {copiedId === `${t.id}-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `${t.id}-${i}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
