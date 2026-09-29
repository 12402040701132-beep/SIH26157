#!/usr/bin/env python3
"""
SAT-SA Synthetic Data Generator
NCIIPC / NTRO Sovereign Cyber Oversight Division
Generates realistic SOC alerts, cases, and entity data with intentional
Execution Gaps and Negative Space anomalies for 7 Critical Sector Entities.
"""

import os
import csv
import random
from datetime import datetime, timedelta

ENTITIES_DATA = [
    {
        "entity_id": "ENT-001",
        "entity_name": "National Power Grid Corporation",
        "sector": "Power & Energy",
        "criticality": "Critical Tier-1",
        "total_assets": 1420,
        "critical_assets_count": 85,
        "soc_tier": "Internal Hybrid 24x7",
        "baseline_daily_alerts": 320,
        "known_execution_gap": True,
        "known_negative_space": True,
        "contact_officer": "Chief Information Security Officer, NPGC"
    },
    {
        "entity_id": "ENT-002",
        "entity_name": "Apex National Bank",
        "sector": "Banking & Financial Services",
        "criticality": "Critical Tier-1",
        "total_assets": 3200,
        "critical_assets_count": 140,
        "soc_tier": "Managed MSSP Tier-3",
        "baseline_daily_alerts": 580,
        "known_execution_gap": True,
        "known_negative_space": False,
        "contact_officer": "Head of Cyber Operations, Apex Bank"
    },
    {
        "entity_id": "ENT-003",
        "entity_name": "Bharat Telecom Ltd",
        "sector": "Telecommunications",
        "criticality": "Critical Tier-1",
        "total_assets": 4800,
        "critical_assets_count": 210,
        "soc_tier": "Internal SOC 24x7",
        "baseline_daily_alerts": 840,
        "known_execution_gap": False,
        "known_negative_space": True,
        "contact_officer": "Director Cyber Defence, BTL"
    },
    {
        "entity_id": "ENT-004",
        "entity_name": "Metro Airport Authority",
        "sector": "Civil Aviation",
        "criticality": "Critical Tier-1",
        "total_assets": 1150,
        "critical_assets_count": 64,
        "soc_tier": "Co-sourced SOC",
        "baseline_daily_alerts": 290,
        "known_execution_gap": True,
        "known_negative_space": True,
        "contact_officer": "Principal IT Security Architect, MAA"
    },
    {
        "entity_id": "ENT-005",
        "entity_name": "Eastern Port Trust",
        "sector": "Maritime Logistics",
        "criticality": "Critical Tier-2",
        "total_assets": 890,
        "critical_assets_count": 42,
        "soc_tier": "Third-Party SLA",
        "baseline_daily_alerts": 180,
        "known_execution_gap": False,
        "known_negative_space": True,
        "contact_officer": "Port Safety & Cyber Officer, EPT"
    },
    {
        "entity_id": "ENT-006",
        "entity_name": "Central Metro Rail",
        "sector": "Urban Rail Transport",
        "criticality": "Critical Tier-2",
        "total_assets": 950,
        "critical_assets_count": 52,
        "soc_tier": "Internal SOC 16x7",
        "baseline_daily_alerts": 210,
        "known_execution_gap": True,
        "known_negative_space": False,
        "contact_officer": "Signaling & Cyber Systems Head, CMR"
    },
    {
        "entity_id": "ENT-007",
        "entity_name": "National Highway Authority",
        "sector": "Roads & Highways",
        "criticality": "Critical Tier-2",
        "total_assets": 1600,
        "critical_assets_count": 38,
        "soc_tier": "Vendor Managed",
        "baseline_daily_alerts": 240,
        "known_execution_gap": False,
        "known_negative_space": False,
        "contact_officer": "Toll Telematics Security Lead, NHA"
    }
]

ALERT_TYPES = [
    ("Privilege Escalation on Domain Controller", "Critical", "Authentication"),
    ("Unusual Outbound C2 Traffic to Bulletproof Host", "Critical", "Network"),
    ("SCADA Telemetry Protocol Disruption", "Critical", "ICS/SCADA"),
    ("SWIFT Transaction Queue Tamper Event", "Critical", "Financial Core"),
    ("Air Traffic Primary Radar Feed Desync", "Critical", "Aviation Sensor"),
    ("Multiple Failed Logins Followed by Successful Admin Access", "High", "Authentication"),
    ("PowerShell Script Executed with Encoded Command", "High", "Endpoint"),
    ("Port Scanning from Substation Segment", "High", "Network"),
    ("DDoS Volumetric Spike on External Gateway", "High", "Perimeter"),
    ("Unauthorized Registry Modification on SCADA HMI", "High", "Endpoint"),
    ("New Service Creation via PsExec", "Medium", "Endpoint"),
    ("Excessive DNS Queries for DGA Domains", "Medium", "Network"),
    ("Certificate Expiration Warning on TLS Gateway", "Low", "Configuration"),
    ("Outdated Endpoint Antivirus Signature", "Low", "Endpoint Compliance"),
    ("User Account Password Changed During Off-Hours", "Low", "Identity")
]

CRITICAL_ASSETS = {
    "ENT-001": ["NPGC-SCADA-RTU-01", "NPGC-SCADA-RTU-09", "NPGC-EMS-CORE-SRV", "NPGC-GRID-DISPATCH-DB", "NPGC-SUBSTATION-GATEWAY-4"],
    "ENT-002": ["APEX-SWIFT-GW-01", "APEX-CORE-BANKING-01", "APEX-HSM-VAULT-02", "APEX-ATM-SWITCH-PRD", "APEX-DB-CLUSTER-PRIMARY"],
    "ENT-003": ["BTL-HLR-CORE-ROUTER-3", "BTL-VLR-AUTH-CLUSTER", "BTL-SS7-FIREWALL-NODE", "BTL-5G-UPF-DATAPLANE", "BTL-CORE-RADIUS-01"],
    "ENT-004": ["MAA-RADAR-FEED-SRV-2", "MAA-BAGGAGE-SCADA-PLC", "MAA-AODB-PRIMARY-SRV", "MAA-ATC-VOICE-GW-01", "MAA-PERIMETER-CCTV-VMS"],
    "ENT-005": ["EPT-TOS-CONTAINER-SRV-1", "EPT-CRANE-PLC-NODE-03", "EPT-VESSEL-TRAFFIC-RADAR", "EPT-GATE-RFID-CTRL-01"],
    "ENT-006": ["CMR-CBTC-SIGNAL-SRV-1", "CMR-TRAIN-DISPATCH-ATS", "CMR-POWER-SCADA-RTU-2", "CMR-FARE-COLLECT-BACKEND"],
    "ENT-007": ["NHA-ETC-FASTAG-HSM-1", "NHA-TOLL-PLAZA-HUB-04", "NHA-VMS-SIGNAGE-CONTROLLER", "NHA-WEIGH-MOTION-GW"]
}

# Assets intentionally silenced for Negative Space demonstration:
SILENCED_ASSETS = {
    "ENT-001": "NPGC-SCADA-RTU-09",
    "ENT-003": "BTL-HLR-CORE-ROUTER-3",
    "ENT-004": "MAA-RADAR-FEED-SRV-2",
    "ENT-005": "EPT-CRANE-PLC-NODE-03"
}

TEMPLATE_NOTES = [
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
]

DETAILED_NOTES = [
    "Analyst reviewed PCAP and verified destination IP is an authorized NTP server. No secondary beaconing observed. Endpoint EDR host isolation not required.",
    "Investigated parent process ancestry. Confirmed legitimate administrative maintenance script signed by Enterprise IT Certificate #9914.",
    "Verified against change management ticket CHG-88219. Database schema update was authorized by DBA team during approved maintenance window.",
    "Alert triaged. Observed multiple TLS handshakes from internal host to external TOR exit node. Host isolated from corporate network via EDR, forensic memory image collected, escalated to Tier 2 Incident Response.",
    "Source IP traced to authorized vulnerability scanner subnet running scheduled monthly credentialed scan. Host logs match Nessus user-agent profile."
]

def generate_datasets(data_dir="data", num_alerts_per_entity=120):
    os.makedirs(data_dir, exist_ok=True)
    random.seed(26157)  # Problem statement seed

    base_time = datetime.now() - timedelta(days=30)
    alerts = []
    cases = []
    alert_counter = 1000
    case_counter = 500

    # Write entities
    entities_path = os.path.join(data_dir, "entities.csv")
    with open(entities_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(ENTITIES_DATA[0].keys()))
        writer.writeheader()
        writer.writerows(ENTITIES_DATA)

    for entity in ENTITIES_DATA:
        ent_id = entity["entity_id"]
        is_gap_entity = entity["known_execution_gap"]
        is_neg_entity = entity["known_negative_space"]
        silenced_asset = SILENCED_ASSETS.get(ent_id)

        # Generate alerts over 30 days
        for i in range(num_alerts_per_entity):
            alert_counter += 1
            alert_id = f"ALT-{alert_counter}"
            alert_info = random.choice(ALERT_TYPES)
            alert_name, default_severity, category = alert_info

            # Pick asset
            possible_assets = CRITICAL_ASSETS[ent_id]
            if is_neg_entity and silenced_asset in possible_assets:
                # Intentionally avoid generating alerts for silenced asset to create Negative Space
                asset_pool = [a for a in possible_assets if a != silenced_asset]
                asset_id = random.choice(asset_pool)
            else:
                asset_id = random.choice(possible_assets)

            # Generate alert time
            offset_seconds = random.randint(0, 30 * 86400)
            created_at = base_time + timedelta(seconds=offset_seconds)

            severity = default_severity
            # Occasionally bump severity for realism
            if random.random() < 0.15:
                severity = "Critical"

            # Status
            status_rand = random.random()
            if status_rand < 0.70:
                status = "Closed"
            elif status_rand < 0.88:
                status = "Escalated"
            else:
                status = "Investigating"

            # Determine triage / closure metrics
            if is_gap_entity and severity in ["Critical", "High"] and status == "Closed":
                # INJECT EXECUTION GAP: Closed abnormally fast with hollow notes
                if random.random() < 0.65:
                    closure_minutes = random.uniform(2.0, 18.0)  # Very fast!
                    investigation_notes = random.choice(TEMPLATE_NOTES)
                    escalated = False
                else:
                    closure_minutes = random.uniform(45.0, 360.0)
                    investigation_notes = random.choice(DETAILED_NOTES)
                    escalated = random.random() < 0.25
            else:
                if status == "Closed":
                    if severity == "Critical":
                        closure_minutes = random.uniform(45.0, 240.0)
                        investigation_notes = random.choice(DETAILED_NOTES)
                    elif severity == "High":
                        closure_minutes = random.uniform(30.0, 180.0)
                        investigation_notes = random.choice(DETAILED_NOTES)
                    else:
                        closure_minutes = random.uniform(10.0, 90.0)
                        investigation_notes = random.choice(DETAILED_NOTES if random.random() < 0.5 else TEMPLATE_NOTES)
                else:
                    closure_minutes = 0.0
                    investigation_notes = "In progress by analyst on shift"

                escalated = True if status == "Escalated" else (random.random() < 0.40 if severity == "Critical" else False)

            closed_at = (created_at + timedelta(minutes=closure_minutes)).strftime("%Y-%m-%d %H:%M:%S") if status == "Closed" else ""

            alerts.append({
                "alert_id": alert_id,
                "entity_id": ent_id,
                "entity_name": entity["entity_name"],
                "alert_name": alert_name,
                "category": category,
                "severity": severity,
                "asset_id": asset_id,
                "status": status,
                "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "closed_at": closed_at,
                "closure_time_minutes": round(closure_minutes, 1),
                "escalated": "Yes" if escalated else "No",
                "analyst_id": f"SOC-OP-{random.randint(10, 25)}",
                "investigation_notes": investigation_notes
            })

            # Create cases for high/critical or escalated items
            if (severity in ["Critical", "High"] and random.random() < 0.35) or status == "Escalated":
                case_counter += 1
                case_id = f"CAS-{case_counter}"
                
                # Case resolution metrics
                if is_gap_entity and random.random() < 0.60:
                    case_time_hrs = round(random.uniform(0.1, 0.4), 2)  # < 25 mins for major case!
                    case_status = "Closed - No Threat"
                    case_rca = "Template triage. No indicator of compromise registered."
                else:
                    case_time_hrs = round(random.uniform(2.5, 14.0), 2)
                    case_status = "Resolved - Remediated"
                    case_rca = "Detailed forensic packet capture analyzed. Firewall block rule updated and hash banned on all endpoints."

                cases.append({
                    "case_id": case_id,
                    "entity_id": ent_id,
                    "entity_name": entity["entity_name"],
                    "case_title": f"Incident Investigation: {alert_name}",
                    "severity": severity,
                    "lead_analyst": f"LEAD-ANALYST-{random.randint(1, 6)}",
                    "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "resolution_time_hours": case_time_hrs,
                    "status": case_status,
                    "root_cause_analysis": case_rca,
                    "linked_alert_id": alert_id
                })

    # Write alerts.csv
    alerts_path = os.path.join(data_dir, "alerts.csv")
    with open(alerts_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(alerts[0].keys()))
        writer.writeheader()
        writer.writerows(alerts)

    # Write cases.csv
    cases_path = os.path.join(data_dir, "cases.csv")
    with open(cases_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(cases[0].keys()))
        writer.writeheader()
        writer.writerows(cases)

    print(f"Generated synthetic data successfully:")
    print(f"- Entities: {len(ENTITIES_DATA)} in {entities_path}")
    print(f"- Alerts: {len(alerts)} in {alerts_path}")
    print(f"- Cases: {len(cases)} in {cases_path}")

if __name__ == "__main__":
    generate_datasets()
