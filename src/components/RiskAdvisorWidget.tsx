import React, { useState, useRef, useEffect } from 'react';
import { EntityRecord, Finding, RemediationTask } from '../data/benchmarkData';
import { Bot, Send, Sparkles, X, ChevronDown, ChevronUp, User, ShieldCheck } from 'lucide-react';

interface RiskAdvisorWidgetProps {
  entities: EntityRecord[];
  allFindings: Finding[];
  remediationTasks: RemediationTask[];
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  chips?: string[];
}

export const RiskAdvisorWidget: React.FC<RiskAdvisorWidgetProps> = ({
  entities,
  allFindings,
  remediationTasks
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: "Greetings, Supervisor. I am the SAT-SA Air-Gapped Supervisory Risk Advisor. I analyze operational telemetry across all 7 Critical Sector Entities to identify execution gaps and silenced assets. How can I assist your audit today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips: [
        "Which entity has highest risk?",
        "Explain NPGC SCADA silence",
        "Summarize Execution Gaps",
        "Recommended remediations"
      ]
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();

    // Query 1: Highest risk entity
    if (q.includes('highest') || q.includes('top risk') || q.includes('worst')) {
      const sorted = [...entities].sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
      const top = sorted[0];
      const second = sorted[1];
      return `Based on live algorithmic scoring, **${top.entity_name}** currently exhibits the highest supervisory risk (${top.risk_score}/100, High), followed by **${second.entity_name}** (${second.risk_score}/100). Primary factors include silenced core assets in Negative Space and high-velocity sub-30 minute ticket closures.`;
    }

    // Query 2: NPGC or SCADA silence
    if (q.includes('npgc') || q.includes('power grid') || q.includes('scada')) {
      return `**National Power Grid Corporation (NPGC)** is flagged for two critical supervisory violations:\n\n1. **Negative Space**: Critical designated asset \`NPGC-SCADA-RTU-09\` has generated zero security alerts in the past 30 days despite continuous transmission. This indicates disconnected syslog forwarders or adversary evasion.\n2. **Execution Gap**: Multiple Critical alerts were closed in under 15 minutes with boilerplate notes like "False positive" and "No action needed", violating NCIIPC Tier-1 triage standards.`;
    }

    // Query 3: Apex Bank or BFSI
    if (q.includes('apex') || q.includes('bank') || q.includes('swift')) {
      return `**Apex National Bank** exhibits an abnormally low Critical alert escalation rate (only 4.2% escalated vs peer norm of 40%), indicating frontline Tier-1 MSSP alert suppression to meet SLA deadlines. Incident cases are frequently marked "Closed - No Threat" in under 20 minutes without attached forensic packet captures.`;
    }

    // Query 4: Execution Gap vs Negative Space explanation
    if (q.includes('difference') || q.includes('what is') || q.includes('execution gap') || q.includes('negative space')) {
      return `**Supervisory Analytics Core Concepts:**\n\n• **Execution Gaps**: Security events that appear resolved on paper, but where operational diligence was absent (e.g. closing a Ransomware alert in 8 minutes with note "Resolved").\n\n• **Negative Space**: The total absence of security signals from high-value infrastructure where background signals MUST exist (e.g. SCADA RTUs or SWIFT servers operating in complete silence for 30 days).`;
    }

    // Query 5: Remediations
    if (q.includes('remediation') || q.includes('fix') || q.includes('recommendation')) {
      return `Active High-Priority Remediation Directives:\n\n1. \`REM-001\`: Restart and verify syslog forwarder on \`NPGC-SCADA-RTU-09\` with heartbeat probes.\n2. \`REM-002\`: Enforce mandatory 30-minute minimum triage and ban boilerplate notes in SOAR playbooks.\n3. \`REM-003\`: Implement automated Tier-2 escalation triggers on all SWIFT transaction queue alerts for Apex Bank.`;
    }

    // Default executive summary
    const highCount = entities.filter(e => (e.risk_score || 0) >= 70).length;
    const totalFindings = allFindings.length;
    return `Cohort Supervisory Summary: Across 7 Critical Sector Entities, ${highCount} entities are currently operating at **High Supervisory Risk** (≥ 70/100). A total of ${totalFindings} findings have been algorithmically cataloged (${allFindings.filter(f => f.type === 'Execution Gap').length} Execution Gaps and ${allFindings.filter(f => f.type === 'Negative Space').length} Negative Space silent assets). All operations are running 100% offline without external cloud dependency.`;
  };

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate instant offline response
    setTimeout(() => {
      const aiReply = generateAnswer(q);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 250);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Minimized Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 border border-blue-400/30"
        >
          <Bot className="w-4 h-4" />
          <span className="text-xs font-semibold">AI Risk Advisor</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[520px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>SAT-SA Risk Advisor</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">
                    100% Offline
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  NCIIPC / NTRO Algorithmic Copilot
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/60">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                      isAi
                        ? 'bg-slate-950 border border-slate-800 text-slate-200'
                        : 'bg-blue-600 text-white font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">
                    {m.timestamp}
                  </span>

                  {/* Quick Prompt Chips */}
                  {m.chips && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleSend(chip)}
                          className="px-2.5 py-1 text-[10px] font-medium bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white rounded-full border border-slate-700/60 transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask supervisory question or query entity risk..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
              title="Send Query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
