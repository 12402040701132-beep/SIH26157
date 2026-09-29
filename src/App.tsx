/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { EntityRiskView } from './components/EntityRiskView';
import { FindingsExplorer } from './components/FindingsExplorer';
import { PriorityReviewQueue } from './components/PriorityReviewQueue';
import { PeerComparison } from './components/PeerComparison';
import { ReportsView } from './components/ReportsView';
import { RegulatoryComplianceView } from './components/RegulatoryComplianceView';
import { RemediationWorkflowView } from './components/RemediationWorkflowView';
import { AuditLogView } from './components/AuditLogView';
import { DataUploadView } from './components/DataUploadView';
import { LoginPage } from './components/LoginPage';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { RiskAdvisorWidget } from './components/RiskAdvisorWidget';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';

import {
  generateBenchmarkData,
  EntityRecord,
  AlertRecord,
  CaseRecord,
  Finding,
  RegulatoryControl,
  RemediationTask,
  AuditLogEntry,
  INITIAL_REGULATORY_CONTROLS,
  INITIAL_REMEDIATION_TASKS,
  INITIAL_AUDIT_LOGS
} from './data/benchmarkData';

import {
  detectExecutionGaps,
  detectNegativeSpace,
  detectAnomalies,
  computeEntityRiskScores,
  generateAuditExplanation,
  DEFAULT_RISK_WEIGHTS,
  RiskWeights
} from './services/analyticsEngine';

import { exportSupervisoryPDF } from './services/pdfExport';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sat_sa_auth_user');
      return saved ? JSON.parse(saved) : {
        name: "Dr. Arvind Verma",
        role: "Supervisory Joint Director",
        email: "dir.verma@nciipc.gov.in"
      };
    } catch {
      return {
        name: "Dr. Arvind Verma",
        role: "Supervisory Joint Director",
        email: "dir.verma@nciipc.gov.in"
      };
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sat_sa_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [currentPage, setCurrentPage] = useState<string>('overview');
  const [entityRiskFilter, setEntityRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Core data states
  const [rawEntities, setRawEntities] = useState<EntityRecord[]>(() => {
    const initial = generateBenchmarkData();
    return initial.entities;
  });

  const [rawAlerts, setRawAlerts] = useState<AlertRecord[]>(() => {
    const initial = generateBenchmarkData();
    return initial.alerts;
  });

  const [rawCases, setRawCases] = useState<CaseRecord[]>(() => {
    const initial = generateBenchmarkData();
    return initial.cases;
  });

  const [regulatoryControls] = useState<RegulatoryControl[]>(INITIAL_REGULATORY_CONTROLS);
  const [remediationTasks, setRemediationTasks] = useState<RemediationTask[]>(INITIAL_REMEDIATION_TASKS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [riskWeights, setRiskWeights] = useState<RiskWeights>(DEFAULT_RISK_WEIGHTS);

  // Selected finding for Evidence Drawer
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Reviewed items state (persisted in localStorage)
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sat_sa_reviewed_items');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sat_sa_reviewed_items', JSON.stringify(Array.from(reviewedIds)));
    } catch {}
  }, [reviewedIds]);

  // Sync dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Compute supervisory analytics
  const { allFindings, enrichedEntities } = useMemo(() => {
    const gaps = detectExecutionGaps(rawAlerts, rawCases);
    const neg = detectNegativeSpace(rawEntities, rawAlerts);
    const anom = detectAnomalies(rawAlerts);

    const findings = [...gaps, ...neg, ...anom].map(f => ({
      ...f,
      explanation: generateAuditExplanation(f)
    }));

    const enriched = computeEntityRiskScores(rawEntities, findings, riskWeights);
    return { allFindings: findings, enrichedEntities: enriched };
  }, [rawEntities, rawAlerts, rawCases, riskWeights]);

  // Audit Logging helper
  const logAuditAction = (action: string, target: string, status: 'SUCCESS' | 'FLAGGED' | 'WARNING' = 'SUCCESS') => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Math.floor(Math.random() * 9000 + 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      user: currentUser.email,
      role: currentUser.role,
      action,
      target,
      status,
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Handlers
  const handleToggleReview = (findingId: string) => {
    setReviewedIds(prev => {
      const next = new Set(prev);
      const isMarking = !next.has(findingId);
      if (isMarking) {
        next.add(findingId);
        logAuditAction('VERIFIED_PRIORITY_FINDING', `Finding ${findingId}`);
      } else {
        next.delete(findingId);
        logAuditAction('REOPENED_FINDING', `Finding ${findingId}`, 'WARNING');
      }
      return next;
    });
  };

  const handleResetReviews = () => {
    if (confirm('Are you sure you want to reset all supervisor audit statuses?')) {
      setReviewedIds(new Set());
      logAuditAction('RESET_REVIEW_QUEUE', 'All Entities Queue Reset', 'WARNING');
    }
  };

  const handleResetBenchmark = () => {
    const fresh = generateBenchmarkData();
    setRawEntities(fresh.entities);
    setRawAlerts(fresh.alerts);
    setRawCases(fresh.cases);
    setReviewedIds(new Set());
    logAuditAction('REGENERATE_BENCHMARK_DATASET', '7 Critical Sector Entities Refreshed');
  };

  const handleLoadCustomData = (
    newEntities?: EntityRecord[],
    newAlerts?: AlertRecord[],
    newCases?: CaseRecord[]
  ) => {
    if (newEntities && newEntities.length > 0) setRawEntities(newEntities);
    if (newAlerts && newAlerts.length > 0) setRawAlerts(newAlerts);
    if (newCases && newCases.length > 0) setRawCases(newCases);
    logAuditAction('OFFLINE_DATA_INGESTED', 'Custom CSV/JSON SOC Telemetry Loaded');
  };

  const handleSelectEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
    setCurrentPage('entities');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: 'Pending' | 'In-Progress' | 'Verified') => {
    setRemediationTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    logAuditAction('UPDATED_REMEDIATION_STATUS', `Task ${taskId} -> ${newStatus}`);
  };

  const handleExportAll = () => {
    const aggregateEntity = {
      entity_name: "National Critical Information Infrastructure (Aggregate)",
      sector: "Multi-Sector (Power, Banking, Telecom, Aviation, Maritime, Rail, Highway)",
      risk_score: Math.round(enrichedEntities.reduce((acc, e) => acc + (e.risk_score || 50), 0) / enrichedEntities.length),
      risk_level: 'High'
    };
    exportSupervisoryPDF(aggregateEntity, allFindings);
    logAuditAction('EXPORT_ALL_DOSSIER', 'Full 7-Entity National Supervisory PDF Dossier');
  };

  const pendingRemediationsCount = remediationTasks.filter(t => t.status === 'Pending').length;

  const handleLoginSuccess = (user: { name: string; role: string; email: string }) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('sat_sa_authenticated', 'true');
      localStorage.setItem('sat_sa_auth_user', JSON.stringify(user));
    } catch {}
    logAuditAction('SESSION_AUTHENTICATED', `Officer ${user.name} authenticated (${user.role})`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('sat_sa_authenticated');
    } catch {}
    logAuditAction('SESSION_TERMINATED', `Officer ${currentUser.name} locked session`);
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col md:flex-row antialiased font-sans transition-colors duration-150`}>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            SA
          </div>
          <span className="font-bold text-sm text-white">SAT-SA</span>
          <span className="text-[10px] text-slate-400">NCIIPC / NTRO</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:sticky top-0 z-40 h-full`}>
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => {
            setCurrentPage(page);
            setMobileMenuOpen(false);
          }}
          reviewedCount={reviewedIds.size}
          totalFindingsCount={allFindings.length}
          onResetReviews={handleResetReviews}
          pendingRemediationsCount={pendingRemediationsCount}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Viewport + Global Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          onOpenSearch={() => setSearchModalOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onExportAll={handleExportAll}
          pendingReviewsCount={allFindings.length - reviewedIds.size}
          onLogout={handleLogout}
          onNavigate={(p) => setCurrentPage(p)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {currentPage === 'overview' && (
            <OverviewDashboard
              entities={enrichedEntities}
              allFindings={allFindings}
              onSelectEntity={handleSelectEntity}
              onOpenFinding={(f) => setActiveFinding(f)}
              onNavigate={(p, filter) => {
                setCurrentPage(p);
                if (filter) setEntityRiskFilter(filter);
              }}
            />
          )}

          {currentPage === 'entities' && (
            <EntityRiskView
              entities={enrichedEntities}
              allFindings={allFindings}
              selectedEntityId={selectedEntityId}
              initialRiskFilter={entityRiskFilter}
              onOpenFinding={(f) => setActiveFinding(f)}
              onExportPDF={(ent, f) => {
                exportSupervisoryPDF(ent, f);
                logAuditAction('EXPORT_ENTITY_PDF', `Dossier for ${ent.entity_name}`);
              }}
              onLogAuditAction={(act, tgt) => logAuditAction(act, tgt)}
              currentWeights={riskWeights}
              onUpdateWeights={(w) => {
                setRiskWeights(w);
                logAuditAction('CONFIGURED_RISK_WEIGHTS', 'Supervisory weighting model re-calibrated');
              }}
            />
          )}

          {currentPage === 'findings' && (
            <FindingsExplorer
              allFindings={allFindings}
              entities={enrichedEntities}
              alerts={rawAlerts}
              onOpenFinding={(f) => setActiveFinding(f)}
            />
          )}

          {currentPage === 'queue' && (
            <PriorityReviewQueue
              allFindings={allFindings}
              reviewedIds={reviewedIds}
              onToggleReview={handleToggleReview}
              onOpenFinding={(f) => setActiveFinding(f)}
              onResetReviews={handleResetReviews}
            />
          )}

          {currentPage === 'peer' && (
            <PeerComparison
              entities={enrichedEntities}
              initialSelectedId={selectedEntityId || undefined}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsView
              entities={enrichedEntities}
              allFindings={allFindings}
            />
          )}

          {currentPage === 'regulatory' && (
            <RegulatoryComplianceView
              controls={regulatoryControls}
              entities={enrichedEntities}
              allFindings={allFindings}
            />
          )}

          {currentPage === 'remediation' && (
            <RemediationWorkflowView
              tasks={remediationTasks}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onAddTask={(t) => setRemediationTasks(prev => [t, ...prev])}
            />
          )}

          {currentPage === 'audit' && (
            <AuditLogView logs={auditLogs} />
          )}

          {currentPage === 'upload' && (
            <DataUploadView
              onLoadCustomData={handleLoadCustomData}
              onResetBenchmark={handleResetBenchmark}
              currentEntitiesCount={rawEntities.length}
              currentAlertsCount={rawAlerts.length}
              currentCasesCount={rawCases.length}
            />
          )}
        </main>
      </div>

      {/* Floating Offline AI Risk Advisor Widget */}
      <RiskAdvisorWidget
        entities={enrichedEntities}
        allFindings={allFindings}
        remediationTasks={remediationTasks}
      />

      {/* Global Cmd+K Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        entities={enrichedEntities}
        allFindings={allFindings}
        regulatoryControls={regulatoryControls}
        remediationTasks={remediationTasks}
        onNavigateToEntity={(id) => {
          setSelectedEntityId(id);
          setCurrentPage('entities');
        }}
        onNavigateToFinding={(f) => setActiveFinding(f)}
        onNavigatePage={(p) => setCurrentPage(p)}
      />

      {/* Security Clearance / Role Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(u) => {
          setCurrentUser(u);
          logAuditAction('SWITCHED_CLEARANCE_ROLE', `Role updated to ${u.role}`);
        }}
      />

      {/* Slide-over Evidence Drawer */}
      <EvidenceDrawer
        finding={activeFinding}
        onClose={() => setActiveFinding(null)}
        isReviewed={activeFinding ? reviewedIds.has(activeFinding.finding_id) : false}
        onToggleReview={(id) => handleToggleReview(id)}
      />
    </div>
  );
}
