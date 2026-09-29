/**
 * SAT-SA Benchmark Dataset, Geographic Metadata & Advanced Types
 * NCIIPC / NTRO Sovereign Supervisory Framework
 */

export interface EntityRecord {
  entity_id: string;
  entity_name: string;
  sector: string;
  criticality: string;
  total_assets: number;
  critical_assets_count: number;
  soc_tier: string;
  baseline_daily_alerts: number;
  known_execution_gap: boolean;
  known_negative_space: boolean;
  contact_officer: string;
  region: string;
  geo_coordinates: { lat: number; lng: number; xPercent: number; yPercent: number };
  compliance_score?: number;
  risk_score?: number;
  risk_level?: 'High' | 'Medium' | 'Low';
  badge_color?: string;
  findings_count?: number;
  execution_gaps_count?: number;
  negative_space_count?: number;
  anomalies_count?: number;
  trend?: number[];
}

export interface AlertRecord {
  alert_id: string;
  entity_id: string;
  entity_name: string;
  alert_name: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  asset_id: string;
  status: 'Closed' | 'Escalated' | 'Investigating';
  created_at: string;
  closed_at: string;
  closure_time_minutes: number;
  escalated: 'Yes' | 'No';
  analyst_id: string;
  investigation_notes: string;
}

export interface CaseRecord {
  case_id: string;
  entity_id: string;
  entity_name: string;
  case_title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  lead_analyst: string;
  created_at: string;
  resolution_time_hours: number;
  status: string;
  root_cause_analysis: string;
  linked_alert_id: string;
}

export interface Finding {
  finding_id: string;
  type: 'Execution Gap' | 'Negative Space' | 'Anomaly';
  subtype: string;
  entity_id: string;
  entity_name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  record_id: string;
  asset_id: string;
  closure_time_minutes: number;
  investigation_notes: string;
  analyst_id: string;
  created_at: string;
  timestamp: string;
  framework_ref?: string;
  remediation_cmd?: string;
  explanation?: {
    what: string;
    why: string;
    evidence: Record<string, string>;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
  status: 'SUCCESS' | 'FLAGGED' | 'WARNING';
  hash: string;
}

export interface RegulatoryControl {
  control_id: string;
  framework: 'NIST CSF 2.0' | 'CIS Controls v8' | 'ISO 27001:2022' | 'NCIIPC CII Directives';
  domain: string;
  title: string;
  requirement: string;
  status: 'Pass' | 'Fail' | 'Partial';
  impacted_entities: string[];
  severity: 'Critical' | 'High' | 'Medium';
}

export interface RemediationTask {
  id: string;
  entity_id: string;
  entity_name: string;
  finding_id: string;
  title: string;
  category: 'Execution Gap' | 'Negative Space' | 'Audit Compliance';
  assigned_to: string;
  due_date: string;
  status: 'Pending' | 'In-Progress' | 'Verified';
  priority: 'High' | 'Medium' | 'Low';
  cli_commands: string[];
  remediation_guidance: string;
  created_at: string;
  supervisor_notes: string;
}

export const INITIAL_ENTITIES: EntityRecord[] = [
  {
    entity_id: "ENT-001",
    entity_name: "National Power Grid Corporation",
    sector: "Power & Energy",
    criticality: "Critical Tier-1",
    total_assets: 1420,
    critical_assets_count: 85,
    soc_tier: "Internal Hybrid 24x7",
    baseline_daily_alerts: 320,
    known_execution_gap: true,
    known_negative_space: true,
    contact_officer: "Dr. A. K. Sharma (CISO, NPGC)",
    region: "Northern Power Grid (Delhi-NCR & Punjab)",
    geo_coordinates: { lat: 28.6139, lng: 77.2090, xPercent: 35, yPercent: 28 },
    trend: [64, 62, 58, 60, 55, 52, 48, 51, 46, 42, 45, 41, 38, 36]
  },
  {
    entity_id: "ENT-002",
    entity_name: "Apex National Bank",
    sector: "Banking & Financial Services",
    criticality: "Critical Tier-1",
    total_assets: 3200,
    critical_assets_count: 140,
    soc_tier: "Managed MSSP Tier-3",
    baseline_daily_alerts: 580,
    known_execution_gap: true,
    known_negative_space: false,
    contact_officer: "V. R. Sundaram (Head of Cyber Operations)",
    region: "Western Financial Corridor (Mumbai BKC)",
    geo_coordinates: { lat: 19.0760, lng: 72.8777, xPercent: 26, yPercent: 54 },
    trend: [72, 70, 68, 65, 62, 59, 58, 55, 52, 54, 50, 48, 49, 47]
  },
  {
    entity_id: "ENT-003",
    entity_name: "Bharat Telecom Ltd",
    sector: "Telecommunications",
    criticality: "Critical Tier-1",
    total_assets: 4800,
    critical_assets_count: 210,
    soc_tier: "Internal SOC 24x7",
    baseline_daily_alerts: 840,
    known_execution_gap: false,
    known_negative_space: true,
    contact_officer: "Pooja Deshmukh (Director Cyber Defence)",
    region: "Southern Telecom Backbone (Bengaluru / Hyderabad)",
    geo_coordinates: { lat: 12.9716, lng: 77.5946, xPercent: 38, yPercent: 78 },
    trend: [85, 84, 82, 79, 75, 78, 74, 70, 68, 65, 66, 62, 60, 58]
  },
  {
    entity_id: "ENT-004",
    entity_name: "Metro Airport Authority",
    sector: "Civil Aviation",
    criticality: "Critical Tier-1",
    total_assets: 1150,
    critical_assets_count: 64,
    soc_tier: "Co-sourced SOC",
    baseline_daily_alerts: 290,
    known_execution_gap: true,
    known_negative_space: true,
    contact_officer: "Capt. Rajesh Varma (Chief Security Architect)",
    region: "Northern Civil Aviation Enclave (Delhi IGI)",
    geo_coordinates: { lat: 28.5562, lng: 77.1000, xPercent: 33, yPercent: 32 },
    trend: [58, 55, 52, 50, 48, 45, 42, 44, 40, 39, 36, 38, 35, 33]
  },
  {
    entity_id: "ENT-005",
    entity_name: "Eastern Port Trust",
    sector: "Maritime Logistics",
    criticality: "Critical Tier-2",
    total_assets: 890,
    critical_assets_count: 42,
    soc_tier: "Third-Party SLA",
    baseline_daily_alerts: 180,
    known_execution_gap: false,
    known_negative_space: true,
    contact_officer: "S. K. Ganguly (Port Safety & Cyber Officer)",
    region: "Bay of Bengal Port & Maritime Terminal (Kolkata & Paradip)",
    geo_coordinates: { lat: 22.5726, lng: 88.3639, xPercent: 68, yPercent: 48 },
    trend: [62, 60, 59, 57, 54, 50, 49, 45, 48, 42, 40, 39, 37, 36]
  },
  {
    entity_id: "ENT-006",
    entity_name: "Central Metro Rail",
    sector: "Urban Rail Transport",
    criticality: "Critical Tier-2",
    total_assets: 950,
    critical_assets_count: 52,
    soc_tier: "Internal SOC 16x7",
    baseline_daily_alerts: 210,
    known_execution_gap: true,
    known_negative_space: false,
    contact_officer: "Naveen Chhabra (Signaling Cyber Systems Head)",
    region: "Central Transit Hub (Nagpur & Bhopal)",
    geo_coordinates: { lat: 21.1458, lng: 79.0882, xPercent: 44, yPercent: 52 },
    trend: [76, 75, 72, 70, 68, 65, 63, 60, 59, 58, 54, 55, 52, 51]
  },
  {
    entity_id: "ENT-007",
    entity_name: "National Highway Authority",
    sector: "Roads & Highways",
    criticality: "Critical Tier-2",
    total_assets: 1600,
    critical_assets_count: 38,
    soc_tier: "Vendor Managed",
    baseline_daily_alerts: 240,
    known_execution_gap: false,
    known_negative_space: false,
    contact_officer: "Anand Verma (Toll Telematics Security Lead)",
    region: "National Golden Quadrilateral Expressway Hub",
    geo_coordinates: { lat: 26.8467, lng: 80.9462, xPercent: 48, yPercent: 36 },
    trend: [88, 86, 85, 87, 84, 85, 83, 82, 80, 81, 79, 82, 80, 81]
  }
];

export const CRITICAL_ASSET_REGISTRY: Record<string, string[]> = {
  "ENT-001": ["NPGC-SCADA-RTU-01", "NPGC-SCADA-RTU-09", "NPGC-EMS-CORE-SRV", "NPGC-GRID-DISPATCH-DB", "NPGC-SUBSTATION-GATEWAY-4"],
  "ENT-002": ["APEX-SWIFT-GW-01", "APEX-CORE-BANKING-01", "APEX-HSM-VAULT-02", "APEX-ATM-SWITCH-PRD", "APEX-DB-CLUSTER-PRIMARY"],
  "ENT-003": ["BTL-HLR-CORE-ROUTER-3", "BTL-VLR-AUTH-CLUSTER", "BTL-SS7-FIREWALL-NODE", "BTL-5G-UPF-DATAPLANE", "BTL-CORE-RADIUS-01"],
  "ENT-004": ["MAA-RADAR-FEED-SRV-2", "MAA-BAGGAGE-SCADA-PLC", "MAA-AODB-PRIMARY-SRV", "MAA-ATC-VOICE-GW-01", "MAA-PERIMETER-CCTV-VMS"],
  "ENT-005": ["EPT-TOS-CONTAINER-SRV-1", "EPT-CRANE-PLC-NODE-03", "EPT-VESSEL-TRAFFIC-RADAR", "EPT-GATE-RFID-CTRL-01"],
  "ENT-006": ["CMR-CBTC-SIGNAL-SRV-1", "CMR-TRAIN-DISPATCH-ATS", "CMR-POWER-SCADA-RTU-2", "CMR-FARE-COLLECT-BACKEND"],
  "ENT-007": ["NHA-ETC-FASTAG-HSM-1", "NHA-TOLL-PLAZA-HUB-04", "NHA-VMS-SIGNAGE-CONTROLLER", "NHA-WEIGH-MOTION-GW"]
};

export const SILENCED_ASSETS: Record<string, string> = {
  "ENT-001": "NPGC-SCADA-RTU-09",
  "ENT-003": "BTL-HLR-CORE-ROUTER-3",
  "ENT-004": "MAA-RADAR-FEED-SRV-2",
  "ENT-005": "EPT-CRANE-PLC-NODE-03"
};

export const INITIAL_REGULATORY_CONTROLS: RegulatoryControl[] = [
  {
    control_id: "NIST-DE.CM-1",
    framework: "NIST CSF 2.0",
    domain: "Detect - Continuous Monitoring",
    title: "Network and Host Telemetry Coverage",
    requirement: "The network is monitored to detect potential cybersecurity events across all critical operational nodes.",
    status: "Fail",
    impacted_entities: ["NPGC", "BTL", "MAA", "EPT"],
    severity: "Critical"
  },
  {
    control_id: "NIST-RS.AN-1",
    framework: "NIST CSF 2.0",
    domain: "Respond - Incident Analysis",
    title: "Investigation Completeness & Depth",
    requirement: "Investigations of notifications from detection systems are documented with forensic indicators and root-cause analysis.",
    status: "Fail",
    impacted_entities: ["NPGC", "Apex Bank", "CMR"],
    severity: "Critical"
  },
  {
    control_id: "CIS-CTRL-8.2",
    framework: "CIS Controls v8",
    domain: "Audit Log Management",
    title: "Collect Audit Logs from Core Assets",
    requirement: "Ensure all core operating systems, SCADA controllers, and transactional switches continuously ship logs to centralized SIEM.",
    status: "Fail",
    impacted_entities: ["NPGC", "BTL", "MAA", "EPT"],
    severity: "Critical"
  },
  {
    control_id: "CIS-CTRL-17.3",
    framework: "CIS Controls v8",
    domain: "Incident Response",
    title: "Establish Incident Escalation Thresholds",
    requirement: "Critical alerts must automatically trigger multi-tiered review without unilateral frontline suppression.",
    status: "Partial",
    impacted_entities: ["NPGC", "Apex Bank"],
    severity: "High"
  },
  {
    control_id: "ISO-27001-A.12.4.1",
    framework: "ISO 27001:2022",
    domain: "Operations Security",
    title: "Event Logging & Synchronized Review",
    requirement: "Event logs recording user activities, exceptions, faults, and security events shall be produced, kept, and regularly reviewed.",
    status: "Fail",
    impacted_entities: ["NPGC", "BTL", "EPT"],
    severity: "High"
  },
  {
    control_id: "NCIIPC-CII-DIR-04",
    framework: "NCIIPC CII Directives",
    domain: "Critical Information Infrastructure Oversight",
    title: "Zero-Silence Assurance on Designated SCADA/SWIFT Systems",
    requirement: "No designated critical asset may operate for > 24 hours without explicit supervisory heartbeat verification.",
    status: "Fail",
    impacted_entities: ["NPGC", "BTL", "MAA", "EPT"],
    severity: "Critical"
  }
];

export const INITIAL_REMEDIATION_TASKS: RemediationTask[] = [
  {
    id: "REM-001",
    entity_id: "ENT-001",
    entity_name: "National Power Grid Corporation",
    finding_id: "NEG-ASSET-ENT-001-NPGC-SCADA-RTU-09",
    title: "Restore Syslog & Heartbeat Agent on SCADA-RTU-09",
    category: "Negative Space",
    assigned_to: "Substation SecOps Lead (NPGC)",
    due_date: "2026-10-05",
    status: "Pending",
    priority: "High",
    cli_commands: [
      "sudo systemctl restart rsyslog.service",
      "rsyslogd -N1 -v",
      "nc -zv 10.200.4.10 514 -u",
      "/opt/nciipc/bin/heartbeat_probe --target NPGC-SCADA-RTU-09 --verify"
    ],
    remediation_guidance: "Inspect physical fiber tap and verify RTU syslog daemon forwarder. Conduct integrity check to confirm logging daemon has not been suppressed by malicious actor.",
    created_at: "2026-09-28",
    supervisor_notes: "Mandatory NCIIPC audit finding. Escalated to Joint Director."
  },
  {
    id: "REM-002",
    entity_id: "ENT-001",
    entity_name: "National Power Grid Corporation",
    finding_id: "GAP-ALT-1004",
    title: "Enforce 30-Min Minimum Triage Rule for Critical Alerts",
    category: "Execution Gap",
    assigned_to: "SOC Shift Manager",
    due_date: "2026-10-02",
    status: "In-Progress",
    priority: "High",
    cli_commands: [
      "siem-admin --policy update --min-closure-time 30 --enforce-rca true",
      "siem-admin --ban-template-note 'False positive'",
      "siem-admin --ban-template-note 'Resolved'"
    ],
    remediation_guidance: "Update ticketing SOAR playbook to require mandatory PCAP or host memory hash attachment before any Critical alert can be closed.",
    created_at: "2026-09-28",
    supervisor_notes: "Frontline analysts notified of SLA policy update."
  },
  {
    id: "REM-003",
    entity_id: "ENT-002",
    entity_name: "Apex National Bank",
    finding_id: "GAP-ESC-ENT-002",
    title: "Reconfigure Automatic Tier-2 Escalation for SWIFT Queue Alerts",
    category: "Execution Gap",
    assigned_to: "BFSI Incident Lead",
    due_date: "2026-10-04",
    status: "In-Progress",
    priority: "High",
    cli_commands: [
      "soar-ctl set-rule --trigger 'SWIFT*' --auto-escalate tier-2",
      "audit-check --verify-rule-id RL-BFSI-901"
    ],
    remediation_guidance: "Escalation rate was artificially depressed to 4.2%. Enable bypass rule so MSSP Tier-1 cannot close SWIFT anomalies without CISO escalation.",
    created_at: "2026-09-27",
    supervisor_notes: "MSSP SLA penalty clause invoked."
  },
  {
    id: "REM-004",
    entity_id: "ENT-003",
    entity_name: "Bharat Telecom Ltd",
    finding_id: "NEG-ASSET-ENT-003-BTL-HLR-CORE-ROUTER-3",
    title: "Investigate Silent HLR Core Router Logging Pipeline",
    category: "Negative Space",
    assigned_to: "Telecom Core Security Ops",
    due_date: "2026-10-06",
    status: "Pending",
    priority: "High",
    cli_commands: [
      "show logging | include HLR-CORE-ROUTER-3",
      "test logging host 10.140.2.5 transport udp port 514",
      "snmpwalk -v3 -u nciipc-audit 10.140.2.10 .1.3.6.1.4.1"
    ],
    remediation_guidance: "Core routing switch with 4.2M subscribers had 0 security alerts in 30 days. Verify ACL configuration on border firewall.",
    created_at: "2026-09-29",
    supervisor_notes: "Awaiting field engineer telemetry verification."
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AUD-8801",
    timestamp: "2026-09-29 07:15:22 UTC",
    user: "dir.verma@nciipc.gov.in",
    role: "Supervisory Joint Director",
    action: "SESSION_AUTHENTICATED",
    target: "SAT-SA Air-Gapped Supervisory Console",
    status: "SUCCESS",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    id: "AUD-8802",
    timestamp: "2026-09-29 07:22:40 UTC",
    user: "dir.verma@nciipc.gov.in",
    role: "Supervisory Joint Director",
    action: "ALGORITHMIC_AUDIT_RUN",
    target: "7 Critical Sector Entities / 840 Alerts Ingested",
    status: "FLAGGED",
    hash: "7d1a54127b222502f5b79b5fb0803061152a44f92b37e23c65dd0f32957ff01e"
  },
  {
    id: "AUD-8803",
    timestamp: "2026-09-29 07:31:14 UTC",
    user: "inspector.mehta@ntro.gov.in",
    role: "Cyber Audit Inspector",
    action: "VERIFIED_PRIORITY_FINDING",
    target: "GAP-ALT-1004 (Premature Closure NPGC)",
    status: "SUCCESS",
    hash: "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72"
  },
  {
    id: "AUD-8804",
    timestamp: "2026-09-29 07:45:09 UTC",
    user: "dir.verma@nciipc.gov.in",
    role: "Supervisory Joint Director",
    action: "EXPORT_SUPERVISORY_PDF",
    target: "National Power Grid Corporation Audit Dossier",
    status: "SUCCESS",
    hash: "01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
  },
  {
    id: "AUD-8805",
    timestamp: "2026-09-29 08:02:18 UTC",
    user: "inspector.mehta@ntro.gov.in",
    role: "Cyber Audit Inspector",
    action: "ASSIGNED_REMEDIATION_DIRECTIVE",
    target: "REM-001 (NPGC SCADA-RTU-09 Syslog Restoration)",
    status: "SUCCESS",
    hash: "6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090"
  }
];

const TEMPLATE_NOTES = [
  "False positive",
  "Resolved",
  "No action needed",
  "--",
  "N/A",
  "Ok",
  "Closed per shift lead",
  "Known scanner activity",
  "Duplicate alert",
  "Checked and safe"
];

const DETAILED_NOTES = [
  "Analyst reviewed PCAP and verified destination IP is an authorized NTP server. No secondary beaconing observed. Endpoint EDR host isolation not required.",
  "Investigated parent process ancestry. Confirmed legitimate administrative maintenance script signed by Enterprise IT Certificate #9914.",
  "Verified against change management ticket CHG-88219. Database schema update was authorized by DBA team during approved maintenance window.",
  "Alert triaged. Observed multiple TLS handshakes from internal host to external TOR exit node. Host isolated from corporate network via EDR, forensic memory image collected, escalated to Tier 2 Incident Response.",
  "Source IP traced to authorized vulnerability scanner subnet running scheduled monthly credentialed scan. Host logs match Nessus user-agent profile."
];

const ALERT_DEFINITIONS: Array<{ name: string; defaultSeverity: 'Critical' | 'High' | 'Medium' | 'Low'; category: string }> = [
  { name: "Privilege Escalation on Domain Controller", defaultSeverity: "Critical", category: "Authentication" },
  { name: "Unusual Outbound C2 Traffic to Bulletproof Host", defaultSeverity: "Critical", category: "Network" },
  { name: "SCADA Telemetry Protocol Disruption", defaultSeverity: "Critical", category: "ICS/SCADA" },
  { name: "SWIFT Transaction Queue Tamper Event", defaultSeverity: "Critical", category: "Financial Core" },
  { name: "Air Traffic Primary Radar Feed Desync", defaultSeverity: "Critical", category: "Aviation Sensor" },
  { name: "Multiple Failed Logins Followed by Successful Admin Access", defaultSeverity: "High", category: "Authentication" },
  { name: "PowerShell Script Executed with Encoded Command", defaultSeverity: "High", category: "Endpoint" },
  { name: "Port Scanning from Substation Segment", defaultSeverity: "High", category: "Network" },
  { name: "DDoS Volumetric Spike on External Gateway", defaultSeverity: "High", category: "Perimeter" },
  { name: "Unauthorized Registry Modification on SCADA HMI", defaultSeverity: "High", category: "Endpoint" },
  { name: "New Service Creation via PsExec", defaultSeverity: "Medium", category: "Endpoint" },
  { name: "Excessive DNS Queries for DGA Domains", defaultSeverity: "Medium", category: "Network" },
  { name: "Certificate Expiration Warning on TLS Gateway", defaultSeverity: "Low", category: "Configuration" },
  { name: "Outdated Endpoint Antivirus Signature", defaultSeverity: "Low", category: "Endpoint Compliance" },
  { name: "User Account Password Changed During Off-Hours", defaultSeverity: "Low", category: "Identity" }
];

export function generateBenchmarkData(alertsPerEntity = 110): {
  entities: EntityRecord[];
  alerts: AlertRecord[];
  cases: CaseRecord[];
} {
  const alerts: AlertRecord[] = [];
  const cases: CaseRecord[] = [];
  let alertCounter = 1000;
  let caseCounter = 500;
  const now = new Date();

  INITIAL_ENTITIES.forEach(entity => {
    const isGapEntity = entity.known_execution_gap;
    const isNegEntity = entity.known_negative_space;
    const silencedAsset = SILENCED_ASSETS[entity.entity_id];
    const assetPool = CRITICAL_ASSET_REGISTRY[entity.entity_id] || ["ASSET-01", "ASSET-02"];

    for (let i = 0; i < alertsPerEntity; i++) {
      alertCounter++;
      const alertId = `ALT-${alertCounter}`;
      const def = ALERT_DEFINITIONS[Math.floor(Math.random() * ALERT_DEFINITIONS.length)];
      
      let severity = def.defaultSeverity;
      if (Math.random() < 0.15) severity = 'Critical';

      let chosenAsset = assetPool[Math.floor(Math.random() * assetPool.length)];
      if (isNegEntity && silencedAsset && assetPool.length > 1) {
        const filtered = assetPool.filter(a => a !== silencedAsset);
        chosenAsset = filtered[Math.floor(Math.random() * filtered.length)];
      }

      const daysAgo = Math.random() * 29;
      const createdDate = new Date(now.getTime() - daysAgo * 86400000);
      
      const randStatus = Math.random();
      const status: 'Closed' | 'Escalated' | 'Investigating' = 
        randStatus < 0.70 ? 'Closed' : randStatus < 0.88 ? 'Escalated' : 'Investigating';

      let closureMinutes = 0;
      let notes = "In progress by analyst on shift";
      let escalated: 'Yes' | 'No' = 'No';

      if (status === 'Closed') {
        if (isGapEntity && (severity === 'Critical' || severity === 'High')) {
          if (Math.random() < 0.65) {
            closureMinutes = +(Math.random() * 16 + 2).toFixed(1);
            notes = TEMPLATE_NOTES[Math.floor(Math.random() * TEMPLATE_NOTES.length)];
            escalated = 'No';
          } else {
            closureMinutes = +(Math.random() * 280 + 40).toFixed(1);
            notes = DETAILED_NOTES[Math.floor(Math.random() * DETAILED_NOTES.length)];
            escalated = Math.random() < 0.2 ? 'Yes' : 'No';
          }
        } else {
          if (severity === 'Critical') {
            closureMinutes = +(Math.random() * 180 + 45).toFixed(1);
            notes = DETAILED_NOTES[Math.floor(Math.random() * DETAILED_NOTES.length)];
            escalated = Math.random() < 0.45 ? 'Yes' : 'No';
          } else if (severity === 'High') {
            closureMinutes = +(Math.random() * 120 + 30).toFixed(1);
            notes = DETAILED_NOTES[Math.floor(Math.random() * DETAILED_NOTES.length)];
            escalated = Math.random() < 0.25 ? 'Yes' : 'No';
          } else {
            closureMinutes = +(Math.random() * 80 + 10).toFixed(1);
            notes = Math.random() < 0.5 ? DETAILED_NOTES[0] : TEMPLATE_NOTES[0];
          }
        }
      } else if (status === 'Escalated') {
        escalated = 'Yes';
      }

      const closedDate = status === 'Closed' 
        ? new Date(createdDate.getTime() + closureMinutes * 60000).toISOString().replace('T', ' ').substring(0, 19)
        : '';

      alerts.push({
        alert_id: alertId,
        entity_id: entity.entity_id,
        entity_name: entity.entity_name,
        alert_name: def.name,
        category: def.category,
        severity,
        asset_id: chosenAsset,
        status,
        created_at: createdDate.toISOString().replace('T', ' ').substring(0, 19),
        closed_at: closedDate,
        closure_time_minutes: closureMinutes,
        escalated,
        analyst_id: `SOC-OP-${Math.floor(Math.random() * 16 + 10)}`,
        investigation_notes: notes
      });

      if (((severity === 'Critical' || severity === 'High') && Math.random() < 0.35) || status === 'Escalated') {
        caseCounter++;
        let resHours = +(Math.random() * 12 + 2).toFixed(2);
        let caseStatus = "Resolved - Remediated";
        let rca = "Detailed forensic packet capture analyzed. Firewall block rule updated and hash banned on all endpoints.";

        if (isGapEntity && Math.random() < 0.6) {
          resHours = +(Math.random() * 0.35 + 0.1).toFixed(2);
          caseStatus = "Closed - No Threat";
          rca = "Template triage. No indicator of compromise registered.";
        }

        cases.push({
          case_id: `CAS-${caseCounter}`,
          entity_id: entity.entity_id,
          entity_name: entity.entity_name,
          case_title: `Incident Investigation: ${def.name}`,
          severity,
          lead_analyst: `LEAD-ANALYST-${Math.floor(Math.random() * 6 + 1)}`,
          created_at: createdDate.toISOString().replace('T', ' ').substring(0, 19),
          resolution_time_hours: resHours,
          status: caseStatus,
          root_cause_analysis: rca,
          linked_alert_id: alertId
        });
      }
    }
  });

  return {
    entities: INITIAL_ENTITIES,
    alerts,
    cases
  };
}
