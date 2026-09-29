import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  User, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu,
  CreditCard,
  HardDrive,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; role: string; email: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'credentials' | 'smartcard'>('credentials');
  
  // Credentials state
  const [email, setEmail] = useState('dir.verma@nciipc.gov.in');
  const [password, setPassword] = useState('GovtCyber#2026!');
  const [role, setRole] = useState('Supervisory Joint Director');
  const [tokenOtp, setTokenOtp] = useState('892-410');
  
  // Smart Card state
  const [smartCardInserted, setSmartCardInserted] = useState(false);
  const [smartCardPin, setSmartCardPin] = useState('9421');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (authMethod === 'credentials') {
      setLoadingStep('Verifying Service ID with Local Air-Gapped PKI Keystore...');
      setTimeout(() => {
        setLoadingStep('Validating Hardware OTP Token (Time-based sync)...');
        setTimeout(() => {
          setLoadingStep('Authorizing Supervisory Clearance Tier...');
          setTimeout(() => {
            const nameMap: Record<string, string> = {
              'Supervisory Joint Director': 'Dr. Arvind Verma',
              'Cyber Audit Inspector': 'Insp. Vikram Mehta',
              'Critical Entity Liaison': 'Sunita Deshmukh'
            };

            onLoginSuccess({
              name: nameMap[role] || 'Dr. Arvind Verma',
              role,
              email: email.trim() || 'dir.verma@nciipc.gov.in'
            });
            setIsLoading(false);
          }, 400);
        }, 400);
      }, 400);
    } else {
      // Smart card flow
      if (!smartCardInserted) {
        setErrorMessage('Please insert or connect your Government PKI Cryptographic Smart Card.');
        setIsLoading(false);
        return;
      }
      setLoadingStep('Reading X.509 v3 Digital Certificate from Cryptographic Chip...');
      setTimeout(() => {
        setLoadingStep('Decrypting Sovereign Token Challenge with Private Key...');
        setTimeout(() => {
          onLoginSuccess({
            name: 'Dr. Arvind Verma',
            role: 'Supervisory Joint Director',
            email: 'dir.verma@nciipc.gov.in'
          });
          setIsLoading(false);
        }, 500);
      }, 500);
    }
  };

  const selectPersona = (pRole: string, pName: string, pEmail: string, pPin: string) => {
    setRole(pRole);
    setEmail(pEmail);
    setPassword('GovtCyber#2026!');
    setTokenOtp(pPin);
    setAuthMethod('credentials');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#070D17] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Subtle Background Sovereign Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.12)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <header className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
              <span>SAT-SA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                SOVEREIGN
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Supervisory Analytics Tool for SOC Assessment
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Air-Gapped Node</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-mono text-[11px]">NCIIPC / NTRO</span>
          </div>

          <div className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400">
            SHA-256: <span className="text-emerald-400">7f2a...890c (Verified)</span>
          </div>
        </div>
      </header>

      {/* Center Auth Console */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Card Top Strip */}
          <div className="p-6 border-b border-slate-800/80 bg-slate-950/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                  <Lock className="w-3 h-3" />
                  <span>Sovereign Cyber Defense Portal</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1.5">
                  National Cyber Oversight Authentication
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Restricted to accredited National SOC Supervisory Inspectors and Directors
                </p>
              </div>

              <div className="hidden sm:block text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Classification</div>
                <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded mt-0.5">
                  CONFIDENTIAL // AIR-GAP
                </div>
              </div>
            </div>

            {/* Auth Method Selector */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/70">
              <button
                type="button"
                onClick={() => setAuthMethod('credentials')}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  authMethod === 'credentials'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Service ID & Hardware 2FA</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('smartcard')}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  authMethod === 'smartcard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>PKI Smart Card / Token</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM A: Service ID & Hardware 2FA */}
            {authMethod === 'credentials' && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Official Government Service ID / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer.id@nciipc.gov.in"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Designated Supervisory Clearance Tier
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:outline-hidden focus:border-blue-500 font-medium"
                  >
                    <option value="Supervisory Joint Director">Tier 1: Supervisory Joint Director (Full Approval & Directives)</option>
                    <option value="Cyber Audit Inspector">Tier 2: Cyber Audit Inspector (Verification & Evidence Audit)</option>
                    <option value="Critical Entity Liaison">Tier 3: Critical Entity SOC Liaison (Directives & Review)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Access PIN / Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-white font-mono focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                      <span>2FA Hardware OTP</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Synced</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={tokenOtp}
                        onChange={(e) => setTokenOtp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-emerald-400 font-mono font-bold focus:outline-hidden focus:border-blue-500"
                        placeholder="892-410"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 animate-spin text-blue-200" />
                      <span className="font-mono text-xs">{loadingStep || 'Authenticating...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>Authenticate & Access Supervisory Console</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM B: Smart Card / PKI Token Simulator */}
            {authMethod === 'smartcard' && (
              <div className="space-y-4 text-xs">
                <div className={`p-4 rounded-xl border transition-all ${
                  smartCardInserted 
                    ? 'bg-blue-950/30 border-blue-500/50 shadow-md shadow-blue-500/10' 
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-5 h-5 ${smartCardInserted ? 'text-blue-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="font-semibold text-white">Cryptographic PKI Smart Card Reader</div>
                        <div className="text-[10px] text-slate-400 font-mono">USB / Contactless Interface CCID #01</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSmartCardInserted(!smartCardInserted)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                        smartCardInserted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm'
                      }`}
                    >
                      {smartCardInserted ? 'Eject Card' : 'Insert Govt PKI Card'}
                    </button>
                  </div>

                  {smartCardInserted ? (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Cardholder:</span>
                        <span className="font-bold text-white font-mono">Dr. Arvind Verma</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Certificate Subject:</span>
                        <span className="text-blue-400 font-mono">CN=Arvind Verma, OU=Supervisory, O=NCIIPC</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Validity:</span>
                        <span className="text-emerald-400 font-mono">2026-01-01 to 2029-01-01 (ACTIVE)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs">No cryptographic token detected in local hardware port.</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Click "Insert Govt PKI Card" to simulate hardware insertion.</p>
                    </div>
                  )}
                </div>

                {smartCardInserted && (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Enter Smart Card Cryptographic PIN
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        maxLength={8}
                        value={smartCardPin}
                        onChange={(e) => setSmartCardPin(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-emerald-400 font-mono text-center tracking-widest text-sm focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleLogin()}
                  disabled={isLoading || !smartCardInserted}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 animate-spin text-emerald-200" />
                      <span className="font-mono text-xs">{loadingStep}</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In with Cryptographic PKI Identity</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Demo Personas Bar */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Quick Demo Clearance Profiles (1-Click Fill)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">SIH Judging Evaluation Mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => selectPersona(
                    'Supervisory Joint Director',
                    'Dr. Arvind Verma',
                    'dir.verma@nciipc.gov.in',
                    '892-410'
                  )}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    role === 'Supervisory Joint Director'
                      ? 'bg-blue-950/40 border-blue-500/40 shadow-xs'
                      : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Dr. Arvind Verma</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded">
                      Tier 1
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-400 mt-0.5">Supervisory Joint Director</div>
                  <div className="text-[9px] text-slate-500 truncate mt-1">Full Executive Oversight & Directives</div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPersona(
                    'Cyber Audit Inspector',
                    'Insp. Vikram Mehta',
                    'insp.mehta@ntro.gov.in',
                    '671-339'
                  )}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    role === 'Cyber Audit Inspector'
                      ? 'bg-amber-950/40 border-amber-500/40 shadow-xs'
                      : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Insp. Vikram Mehta</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded">
                      Tier 2
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-400 mt-0.5">Cyber Audit Inspector</div>
                  <div className="text-[9px] text-slate-500 truncate mt-1">Evidence Drilldown & Review Queue</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Sovereign Node Metadata */}
      <footer className="p-4 border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between px-6 z-10 gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          <span>Government of India · National Critical Information Infrastructure Protection Centre (NCIIPC)</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>AIR-GAPPED SOVEREIGN ENGINE</span>
          <span>·</span>
          <span>STRICTLY CONFIDENTIAL</span>
        </div>
      </footer>
    </div>
  );
};
