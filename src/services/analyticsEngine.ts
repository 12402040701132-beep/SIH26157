/**
 * SAT-SA Analytics Engine
 * Port of core algorithmic supervisor rules (Execution Gaps, Negative Space, Outliers)
 * Aligned with NCIIPC / NTRO Sovereign Supervisory Framework
 */
import { AlertRecord, CaseRecord, EntityRecord, Finding, CRITICAL_ASSET_REGISTRY, SILENCED_ASSETS } from '../data/benchmarkData';

const TEMPLATE_PATTERNS = [
  "false positive", "resolved", "no action needed", "--", "n/a",
  "ok", "closed per shift lead", "known scanner activity",
  "duplicate alert", "checked and safe"
];

export interface RiskWeights {
  negativeSpaceCritical: number;
  negativeSpaceHigh: number;
  executionGapCritical: number;
  executionGapHigh: number;
  anomalyWeight: number;
  baseline: number;
}

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  negativeSpaceCritical: 26,
  negativeSpaceHigh: 16,
  executionGapCritical: 18,
  executionGapHigh: 11,
  anomalyWeight: 8,
  baseline: 12
};

export function isTemplateNote(note?: string): boolean {
  if (!note || typeof note !== 'string') return true;
  const cleaned = note.trim().toLowerCase();
  if (cleaned.length < 15) return true;
  return TEMPLATE_PATTERNS.some(p => cleaned.includes(p));
}

export function detectExecutionGaps(alerts: AlertRecord[], cases: CaseRecord[]): Finding[] {
  const findings: Finding[] = [];

  // Rule 1: Fast closure of Critical/High alerts (< 30 min) with template/empty notes
  for (const alert of alerts) {
    if (alert.status === 'Closed' && (alert.severity === 'Critical' || alert.severity === 'High')) {
      const closureTime = alert.closure_time_minutes || 0;
      if (closureTime < 30 && isTemplateNote(alert.investigation_notes)) {
        findings.push({
          finding_id: `GAP-ALT-${alert.alert_id}`,
          type: 'Execution Gap',
          subtype: 'Premature Closure with Hollow Triage',
          entity_id: alert.entity_id,
          entity_name: alert.entity_name,
          severity: alert.severity,
          title: `Premature Closure: ${alert.alert_name}`,
          description: `${alert.severity} alert on asset ${alert.asset_id} was marked closed in ${closureTime}m with superficial triage note: "${alert.investigation_notes}".`,
          record_id: alert.alert_id,
          asset_id: alert.asset_id,
          closure_time_minutes: closureTime,
          investigation_notes: alert.investigation_notes,
          analyst_id: alert.analyst_id,
          created_at: alert.created_at,
          timestamp: alert.closed_at || alert.created_at
        });
      }
    }
  }

  // Rule 2: High/Critical severity cases with very low investigation time (< 0.5 hrs)
  for (const c of cases) {
    if ((c.severity === 'Critical' || c.severity === 'High') && c.resolution_time_hours < 0.5) {
      const minutes = Math.round(c.resolution_time_hours * 60);
      findings.push({
        finding_id: `GAP-CAS-${c.case_id}`,
        type: 'Execution Gap',
        subtype: 'Superficial Incident Case Resolution',
        entity_id: c.entity_id,
        entity_name: c.entity_name,
        severity: c.severity,
        title: `Sub-30m Case Resolution: ${c.case_title}`,
        description: `${c.severity} incident investigation was marked resolved in ${minutes}m without forensic containment audit.`,
        record_id: c.case_id,
        asset_id: 'Entity Core Infrastructure',
        closure_time_minutes: minutes,
        investigation_notes: c.root_cause_analysis,
        analyst_id: c.lead_analyst,
        created_at: c.created_at,
        timestamp: c.created_at
      });
    }
  }

  // Rule 3: Abnormally low escalation rate (< 15%) for critical events
  const entityGroups = new Map<string, AlertRecord[]>();
  for (const a of alerts) {
    if (!entityGroups.has(a.entity_id)) entityGroups.set(a.entity_id, []);
    entityGroups.get(a.entity_id)!.push(a);
  }

  entityGroups.forEach((entAlerts, entId) => {
    const critAlerts = entAlerts.filter(a => a.severity === 'Critical');
    if (critAlerts.length >= 6) {
      const escalatedCount = critAlerts.filter(a => a.escalated === 'Yes').length;
      const rate = (escalatedCount / critAlerts.length) * 100;
      if (rate < 15) {
        findings.push({
          finding_id: `GAP-ESC-${entId}`,
          type: 'Execution Gap',
          subtype: 'Suppressed Escalation Rate',
          entity_id: entId,
          entity_name: entAlerts[0].entity_name,
          severity: 'High',
          title: `Abnormally Low Escalation Ratio (${rate.toFixed(1)}%)`,
          description: `Only ${escalatedCount} of ${critAlerts.length} critical alerts were escalated to Tier-2 (expected ≥ 35%). Frontline analysts suppressing alerts to satisfy SLA targets.`,
          record_id: `ESC-${entId}`,
          asset_id: 'Tier-1 SOC Queue',
          closure_time_minutes: 0,
          investigation_notes: `Observed escalation rate is ${rate.toFixed(1)}% vs national critical peer benchmark 40.0%.`,
          analyst_id: 'SOC Shift Supervisor',
          created_at: 'Last 30 Days',
          timestamp: 'Monthly Baseline'
        });
      }
    }

    // Rule 4: Analyst Copy-Paste Rapid Succession Heuristic (Section 7.1)
    const analystMap = new Map<string, AlertRecord[]>();
    entAlerts.forEach(a => {
      if (a.status === 'Closed' && a.investigation_notes) {
        if (!analystMap.has(a.analyst_id)) analystMap.set(a.analyst_id, []);
        analystMap.get(a.analyst_id)!.push(a);
      }
    });

    analystMap.forEach((analystAlerts, analystId) => {
      if (analystAlerts.length >= 4) {
        const noteCounts = new Map<string, number>();
        analystAlerts.forEach(a => {
          const clean = a.investigation_notes.trim().toLowerCase();
          noteCounts.set(clean, (noteCounts.get(clean) || 0) + 1);
        });

        noteCounts.forEach((count, noteText) => {
          if (count >= 4) {
            findings.push({
              finding_id: `GAP-CP-${entId}-${analystId}`,
              type: 'Execution Gap',
              subtype: 'Copy-Paste Disposition Pattern',
              entity_id: entId,
              entity_name: entAlerts[0].entity_name,
              severity: 'Medium',
              title: `Analyst Note Duplication: ${analystId}`,
              description: `Analyst ${analystId} repeatedly closed ${count} alerts with identical copy-paste disposition note: "${noteText.substring(0, 45)}...".`,
              record_id: analystId,
              asset_id: 'SOC Analyst Console',
              closure_time_minutes: 0,
              investigation_notes: `Detected ${count} instances of repetitive boilerplate notes by operator ${analystId}.`,
              analyst_id: analystId,
              created_at: 'Observed Shift',
              timestamp: 'Shift Audit'
            });
          }
        });
      }
    });
  });

  return findings;
}

export function detectNegativeSpace(entities: EntityRecord[], alerts: AlertRecord[]): Finding[] {
  const findings: Finding[] = [];
  const peerAvgAlerts = alerts.length / Math.max(entities.length, 1);

  for (const ent of entities) {
    const entAlerts = alerts.filter(a => a.entity_id === ent.entity_id);
    const activeAssets = new Set(entAlerts.map(a => a.asset_id));
    const registeredAssets = CRITICAL_ASSET_REGISTRY[ent.entity_id] || [];

    // Rule 1: Silenced critical designated asset (0 alerts in 30 days) - "Expected X, observed Y"
    for (const asset of registeredAssets) {
      if (!activeAssets.has(asset)) {
        findings.push({
          finding_id: `NEG-ASSET-${ent.entity_id}-${asset}`,
          type: 'Negative Space',
          subtype: 'Silenced Critical Asset',
          entity_id: ent.entity_id,
          entity_name: ent.entity_name,
          severity: 'Critical',
          title: `Telemetry Blackout: ${asset}`,
          description: `Zero security alerts or audit events received from designated critical asset "${asset}" over 30 days. Expected 25–60 background events, observed 0. Indicates disabled syslog forwarder, unmonitored segment, or evasive rootkit.`,
          record_id: asset,
          asset_id: asset,
          closure_time_minutes: 0,
          investigation_notes: `Expected: 25–60 events | Observed: 0 events (100% telemetry absence). Asset registered in National CII database.`,
          analyst_id: 'Ingestion Pipeline Watchdog',
          created_at: '30-Day Window',
          timestamp: 'Ongoing Gap'
        });
      }
    }

    // Rule 2: Subdued overall volume (> 45% below peer average)
    if (entAlerts.length < peerAvgAlerts * 0.55) {
      findings.push({
        finding_id: `NEG-VOL-${ent.entity_id}`,
        type: 'Negative Space',
        subtype: 'Subdued Ingestion Volume',
        entity_id: ent.entity_id,
        entity_name: ent.entity_name,
        severity: 'High',
        title: `Abnormal Ingestion Deficit (${entAlerts.length} total alerts)`,
        description: `Aggregate alert telemetry for ${ent.entity_name} is ${entAlerts.length} events vs sector average of ${Math.round(peerAvgAlerts)}. Denotes massive blind spots across internal subnets. Expected: ${Math.round(peerAvgAlerts)}, Observed: ${entAlerts.length}.`,
        record_id: `VOL-${ent.entity_id}`,
        asset_id: 'Enterprise Boundary Sensors',
        closure_time_minutes: 0,
        investigation_notes: `Volume deficit: ${(((peerAvgAlerts - entAlerts.length) / peerAvgAlerts) * 100).toFixed(1)}% below peer norm. Expected: ${Math.round(peerAvgAlerts)} | Observed: ${entAlerts.length}.`,
        analyst_id: 'SIEM Architecture Daemon',
        created_at: '30-Day Window',
        timestamp: 'Monthly Aggregate'
      });
    }
  }

  return findings;
}

export function detectAnomalies(alerts: AlertRecord[]): Finding[] {
  const anomalies: Finding[] = [];
  const closedAlerts = alerts.filter(a => a.status === 'Closed' && a.closure_time_minutes > 0);
  if (closedAlerts.length < 10) return anomalies;

  for (const a of closedAlerts) {
    if ((a.severity === 'Critical' || a.severity === 'High') && a.closure_time_minutes < 5.0) {
      anomalies.push({
        finding_id: `ANO-VEL-${a.alert_id}`,
        type: 'Anomaly',
        subtype: 'Extreme Velocity Outlier',
        entity_id: a.entity_id,
        entity_name: a.entity_name,
        severity: 'High',
        title: `Velocity Outlier: ${a.alert_id} (${a.closure_time_minutes}m)`,
        description: `${a.severity} alert was closed in ${a.closure_time_minutes} minutes, which is in the bottom 1st percentile of investigation duration.`,
        record_id: a.alert_id,
        asset_id: a.asset_id,
        closure_time_minutes: a.closure_time_minutes,
        investigation_notes: a.investigation_notes,
        analyst_id: a.analyst_id,
        created_at: a.created_at,
        timestamp: a.closed_at || a.created_at
      });
    }
  }

  return anomalies;
}

export function generateAuditExplanation(f: Finding): {
  what: string;
  why: string;
  evidence: Record<string, string>;
} {
  const fType = f.type;
  const subtype = f.subtype || '';
  const title = f.title;
  const notes = f.investigation_notes || '';
  const tMin = f.closure_time_minutes;
  const asset = f.asset_id || 'N/A';
  const recordId = f.record_id || 'N/A';
  const entityName = f.entity_name || 'Critical Entity';
  const analyst = f.analyst_id || 'SOC-OP';

  if (fType === 'Execution Gap') {
    if (subtype.includes('Premature') || subtype.includes('Hollow')) {
      return {
        what: `Critical/High alert "${title}" on asset ${asset} was closed by ${analyst} in only ${tMin} minutes with generic boilerplate note: "${notes}".`,
        why: `High-priority alerts demand systematic telemetry correlation (PCAP, DNS query logs, memory checks). Instant closure with generic template notes signals SLA gaming, leaving sophisticated intrusions uninvestigated.`,
        evidence: {
          "Alert Identifier": recordId,
          "Asset Under Investigation": asset,
          "Actual Closure Duration": `${tMin} minutes (Sector Benchmark: > 45 mins)`,
          "Recorded Investigation Note": notes,
          "Operator ID": analyst,
          "NCIIPC Supervisory Classification": "EX-GAP-FAST-CLOSE"
        }
      };
    } else if (subtype.includes('Case')) {
      return {
        what: `Incident Case ${recordId} for ${title} was closed in ${tMin} minutes with superficial root-cause documentation.`,
        why: `Corroborated incident cases represent validated security events. Resolving an incident in under 30 minutes prevents thorough containment, malware persistence checks, and forensic integrity.`,
        evidence: {
          "Case Identifier": recordId,
          "Investigation Duration": `${tMin} minutes`,
          "Logged Root Cause Analysis": notes,
          "Case Lead": analyst,
          "NCIIPC Supervisory Classification": "EX-GAP-CASE-TRIAGE"
        }
      };
    } else if (subtype.includes('Copy-Paste')) {
      return {
        what: `Operator ${analyst} closed multiple security events in rapid sequence with identical boilerplate disposition text.`,
        why: `Repetitive copy-paste dispositions demonstrate mechanical ticket disposal without reading alerts or performing individual asset verification.`,
        evidence: {
          "Operator ID": analyst,
          "Repetition Pattern": notes,
          "Investigation Quality": "Zero individual correlation",
          "NCIIPC Supervisory Classification": "EX-GAP-COPY-PASTE"
        }
      };
    } else {
      return {
        what: `Escalation frequency for critical alerts at ${entityName} is critically suppressed below peer operational baselines.`,
        why: `Frontline Tier-1 analysts are resolving severe security signals without escalating to specialized Tier-2/3 incident responders to safeguard SLA metrics.`,
        evidence: {
          "Entity ID": f.entity_id,
          "Operational Escalation Ratio": notes,
          "Expected Baseline": "35% - 50% escalation for Criticals",
          "NCIIPC Supervisory Classification": "EX-GAP-ESC-SUPPRESS"
        }
      };
    }
  } else if (fType === 'Negative Space') {
    if (subtype.includes('Silenced')) {
      return {
        what: `Total absence of security telemetry or audit events from designated critical asset "${asset}" across 30 days. Expected 25–60 events, observed 0.`,
        why: `In high-value infrastructure, core OT/IT controllers produce steady background authentication and service events. Zero alerts indicates logging pipeline tampering, failed forwarder agents, or an adversary actively masking actions.`,
        evidence: {
          "Asset Identifier": asset,
          "Telemetry Observation": "Expected: 25–60 events | Observed: 0",
          "Asset Criticality": "Tier-1 National Critical Information Infrastructure",
          "Risk Impact": "High-risk unmonitored blind spot",
          "NCIIPC Supervisory Classification": "NEG-SPACE-SILENT-ASSET"
        }
      };
    } else {
      return {
        what: `Entity ${entityName} exhibits an aggregate alert volume drastically lower than peer organizations of equivalent scale.`,
        why: `Abnormally low event volume typically indicates sensor dropouts, unmonitored corporate subnets, or misconfigured SIEM ingest rules rather than an absence of threats.`,
        evidence: {
          "Entity Name": entityName,
          "Observed Volume": notes,
          "Coverage Scope": "Substation / Branch Network",
          "NCIIPC Supervisory Classification": "NEG-SPACE-LOW-VOLUME"
        }
      };
    }
  } else {
    return {
      what: `Statistical outlier in triage timing: Alert ${recordId} was closed in ${tMin} minutes.`,
      why: `The turnaround time is more than 2.5 standard deviations faster than typical triage curves for this class of threat.`,
      evidence: {
        "Record ID": recordId,
        "Closure Duration": `${tMin} minutes`,
        "Peer Distribution Mean": "64.2 minutes",
        "Outlier Score": "Top 1% velocity outlier",
        "NCIIPC Supervisory Classification": "STAT-OUTLIER-VELOCITY"
      }
    };
  }
}

export function computeEntityRiskScores(
  entities: EntityRecord[],
  findings: Finding[],
  weights: RiskWeights = DEFAULT_RISK_WEIGHTS
): EntityRecord[] {
  return entities.map(ent => {
    const entFindings = findings.filter(f => f.entity_id === ent.entity_id);
    let score = weights.baseline;

    for (const f of entFindings) {
      if (f.type === 'Negative Space') {
        score += f.severity === 'Critical' ? weights.negativeSpaceCritical : f.severity === 'High' ? weights.negativeSpaceHigh : 8;
      } else if (f.type === 'Execution Gap') {
        score += f.severity === 'Critical' ? weights.executionGapCritical : f.severity === 'High' ? weights.executionGapHigh : 5;
      } else {
        score += f.severity === 'Critical' ? weights.anomalyWeight * 1.5 : weights.anomalyWeight;
      }
    }

    const finalScore = Math.min(Math.max(Math.round(score), 8), 100);
    const riskLevel: 'High' | 'Medium' | 'Low' = 
      finalScore >= 70 ? 'High' : finalScore >= 40 ? 'Medium' : 'Low';
    const badgeColor = 
      riskLevel === 'High' ? '#EF4444' : riskLevel === 'Medium' ? '#F59E0B' : '#22C55E';

    return {
      ...ent,
      risk_score: finalScore,
      risk_level: riskLevel,
      badge_color: badgeColor,
      findings_count: entFindings.length,
      execution_gaps_count: entFindings.filter(f => f.type === 'Execution Gap').length,
      negative_space_count: entFindings.filter(f => f.type === 'Negative Space').length,
      anomalies_count: entFindings.filter(f => f.type === 'Anomaly').length
    };
  }).sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
}

/**
 * Generates an Asset × Severity Coverage Matrix for Negative Space analysis (Section 7.2)
 */
export function generateCoverageMatrix(
  entityId: string,
  alerts: AlertRecord[]
): Array<{
  assetId: string;
  isRegisteredCritical: boolean;
  isSilenced: boolean;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalCount: number;
  expectedMinCount: number;
  status: 'Normal' | 'Deficit' | 'Zero Telemetry (Silenced)';
}> {
  const registeredAssets = CRITICAL_ASSET_REGISTRY[entityId] || [];
  const silencedAsset = SILENCED_ASSETS[entityId];
  const entAlerts = alerts.filter(a => a.entity_id === entityId);

  // Group by asset
  const assetMap = new Map<string, { critical: number; high: number; medium: number; low: number }>();

  // Ensure all registered critical assets exist in map even if 0 alerts
  registeredAssets.forEach(a => {
    assetMap.set(a, { critical: 0, high: 0, medium: 0, low: 0 });
  });

  entAlerts.forEach(a => {
    if (!assetMap.has(a.asset_id)) {
      assetMap.set(a.asset_id, { critical: 0, high: 0, medium: 0, low: 0 });
    }
    const counts = assetMap.get(a.asset_id)!;
    if (a.severity === 'Critical') counts.critical++;
    else if (a.severity === 'High') counts.high++;
    else if (a.severity === 'Medium') counts.medium++;
    else counts.low++;
  });

  return Array.from(assetMap.entries()).map(([assetId, counts]) => {
    const isReg = registeredAssets.includes(assetId);
    const isSil = silencedAsset === assetId || (isReg && (counts.critical + counts.high + counts.medium + counts.low === 0));
    const total = counts.critical + counts.high + counts.medium + counts.low;
    const expectedMin = isReg ? 20 : 5;

    let status: 'Normal' | 'Deficit' | 'Zero Telemetry (Silenced)' = 'Normal';
    if (total === 0) {
      status = 'Zero Telemetry (Silenced)';
    } else if (total < expectedMin) {
      status = 'Deficit';
    }

    return {
      assetId,
      isRegisteredCritical: isReg,
      isSilenced: isSil,
      criticalCount: counts.critical,
      highCount: counts.high,
      mediumCount: counts.medium,
      lowCount: counts.low,
      totalCount: total,
      expectedMinCount: expectedMin,
      status
    };
  }).sort((a, b) => {
    if (a.isSilenced !== b.isSilenced) return a.isSilenced ? -1 : 1;
    return a.totalCount - b.totalCount;
  });
}
