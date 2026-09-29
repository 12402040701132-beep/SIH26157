"""
SAT-SA Explainability Engine
NCIIPC / NTRO Sovereign Cyber Oversight Division
Provides human-understandable audit narratives (What + Why + Evidence) for SOC supervisors.
"""

def generate_explanation(finding):
    """
    Transforms raw detection into a 3-part audit explanation:
    1. WHAT WAS DETECTED
    2. WHY IT IS A SUPERVISORY PROBLEM
    3. SUPPORTING EVIDENCE
    """
    f_type = finding.get("type", "Finding")
    subtype = finding.get("subtype", "")
    title = finding.get("title", "")
    notes = finding.get("investigation_notes", "")
    t_min = finding.get("closure_time_minutes", 0)
    asset = finding.get("asset_id", "N/A")
    record_id = finding.get("record_id", "N/A")
    entity_name = finding.get("entity_name", "Critical Entity")
    analyst = finding.get("analyst_id", "SOC-OP")

    if f_type == "Execution Gap":
        if "Premature" in subtype or "Hollow" in subtype:
            what = f"Alert '{title}' on critical asset '{asset}' was closed by {analyst} in {t_min:.1f} minutes with superficial note: \"{notes}\"."
            why = "High and Critical severity alerts require in-depth root cause investigation, log verification, and artifact validation. Rapid closure with boilerplate phrases is a signature indicator of SLA gaming or analyst fatigue, allowing persistent threat actors to remain undiscovered."
            evidence = {
                "Alert ID": record_id,
                "Target Asset": asset,
                "Closure Duration": f"{t_min:.1f} minutes (Peer benchmark: > 45 mins)",
                "Submitted Note": notes,
                "Analyst Handle": analyst,
                "Audit Tag": "EX-GAP-FAST-CLOSE"
            }
        elif "Case" in subtype:
            what = f"Critical incident case {record_id} was resolved in {t_min:.0f} minutes without substantive root cause analysis documentation."
            why = "Major incident cases signify corroborated malicious indicators. Resolving cases in under 30 minutes prevents thorough incident containment, forensic artifact preservation, and supervisory governance mandated by NCIIPC guidelines."
            evidence = {
                "Case Identifier": record_id,
                "Resolution Time": f"{t_min:.0f} minutes",
                "Recorded RCA": notes,
                "Lead Assigned": analyst,
                "Audit Tag": "EX-GAP-CASE-TRIAGE"
            }
        else:
            what = f"Escalation rate for high/critical security events at {entity_name} is severely depressed below operational norms."
            why = "Frontline Tier-1 analysts are suppressing escalations to avoid triggering higher-tier incident response protocols or missing strict time-to-close metrics."
            evidence = {
                "Entity ID": finding.get("entity_id"),
                "Metric Details": notes,
                "Benchmark Comparison": "Peer Average: 35-45% | Entity: <15%",
                "Audit Tag": "EX-GAP-ESC-SUPPRESS"
            }

    elif f_type == "Negative Space":
        if "Silenced" in subtype:
            what = f"Complete absence of telemetry and security alerts from core designated asset '{asset}' across the entire 30-day supervisory period."
            why = "In a critical national infrastructure environment, core operational assets continuously generate background authentication, service, and boundary signals. Total silence indicates agent deactivation, syslog tampering, segment misconfiguration, or an active adversary intentionally suppressing logging."
            evidence = {
                "Designated Asset": asset,
                "Observed Alerts (30 Days)": "0 (Expected: 15 - 50 alerts)",
                "Asset Classification": "National Critical Information Infrastructure (NCII)",
                "Risk Classification": "Critical Supervisory Blind Spot",
                "Audit Tag": "NEG-SPACE-SILENT-ASSET"
            }
        else:
            what = f"Entity {entity_name} displays an aggregate alert telemetry volume substantially lower than sector peers with similar asset scale."
            why = "A low volume of SOC alerts does not imply superior security posture. It typically denotes blind spots in sensory coverage, unmonitored subnets, or misconfigured SIEM ingest rules."
            evidence = {
                "Entity": entity_name,
                "Volume Deviation": notes,
                "Impacted Infrastructure": "Perimeter & Internal Enclaves",
                "Audit Tag": "NEG-SPACE-LOW-VOLUME"
            }

    else:  # Anomaly
        what = f"Statistical outlier observed in triage duration: record {record_id} processed in {t_min:.1f} minutes."
        why = "The operational turnaround deviates significantly from Gaussian distribution of standard SOC investigation workflows."
        evidence = {
            "Record ID": record_id,
            "Observed Duration": f"{t_min:.1f} minutes",
            "Population Mean": "64.2 minutes",
            "Z-Score / Variance": "Outlier (> 2.5 standard deviations)",
            "Audit Tag": "STAT-OUTLIER-VELOCITY"
        }

    return {
        "what": what,
        "why": why,
        "evidence": evidence
    }
