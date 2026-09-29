import React, { useState } from 'react';
import { ShieldCheck, User, KeyRound, Lock, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; role: string; email: string };
  onUpdateUser: (user: { name: string; role: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser
}) => {
  const [selectedRole, setSelectedRole] = useState(currentUser.role);
  const [userName, setUserName] = useState(currentUser.name);
  const [tokenInput, setTokenInput] = useState('NCIIPC-SEC-7749-AUTH');

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateUser({
      name: userName,
      role: selectedRole,
      email: `${userName.toLowerCase().replace(/[^a-z]/g, '')}@nciipc.gov.in`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Government Security Clearance
              </h2>
              <p className="text-xs text-slate-400">NCIIPC / NTRO Access Credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Supervisor Full Name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white focus:outline-hidden focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Clearance Role & Permissions:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value="Supervisory Joint Director">Supervisory Joint Director (Full Approval & Directives)</option>
              <option value="Cyber Audit Inspector">Cyber Audit Inspector (Review & Verification)</option>
              <option value="Critical Entity Liaison">Critical Entity Liaison (Read-Only Remediation)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Air-Gapped PKI Smart Token:</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value={tokenInput}
                className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-2 py-2 text-slate-400 font-mono text-xs focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block">Hardware Token Verified · Air-Gapped</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            Update Clearance Session
          </button>
        </div>
      </div>
    </div>
  );
};
