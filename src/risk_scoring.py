"""
SAT-SA Risk Scoring Engine
NCIIPC / NTRO Sovereign Cyber Oversight Division
Computes multi-factor supervisory risk scores (0-100) and risk levels.
"""

def calculate_entity_risk(entity_id, all_findings, total_alerts_count=100):
    """
    Computes a composite risk score (0-100) for a given entity based on:
    - Execution Gaps (Critical: 18 pts, High: 10 pts, Med: 5 pts)
    - Negative Space (Critical: 25 pts, High: 15 pts)
    - Anomalies (High: 8 pts, Med: 4 pts)
    - Scaled and capped at 100
    """
    entity_findings = [f for f in all_findings if f["entity_id"] == entity_id]
    
    score = 12.0  # Base natural operational baseline
    
    for f in entity_findings:
        f_type = f.get("type")
        sev = f.get("severity")
        
        if f_type == "Negative Space":
            # Negative space is the most dangerous blind spot
            if sev == "Critical":
                score += 26.0
            elif sev == "High":
                score += 16.0
            else:
                score += 8.0
        elif f_type == "Execution Gap":
            if sev == "Critical":
                score += 18.0
            elif sev == "High":
                score += 11.0
            else:
                score += 5.0
        elif f_type == "Anomaly":
            if sev == "Critical":
                score += 14.0
            elif sev == "High":
                score += 8.0
            else:
                score += 4.0

    final_score = min(max(round(score), 5), 100)
    
    if final_score >= 70:
        level = "High"
        badge_color = "#EF4444"
    elif final_score >= 40:
        level = "Medium"
        badge_color = "#F59E0B"
    else:
        level = "Low"
        badge_color = "#22C55E"
        
    return {
        "risk_score": final_score,
        "risk_level": level,
        "badge_color": badge_color,
        "findings_count": len(entity_findings),
        "execution_gaps_count": sum(1 for f in entity_findings if f["type"] == "Execution Gap"),
        "negative_space_count": sum(1 for f in entity_findings if f["type"] == "Negative Space"),
        "anomalies_count": sum(1 for f in entity_findings if f["type"] == "Anomaly")
    }

def enrich_entities_with_risk(entities_df, all_findings, alerts_df):
    results = []
    for idx, row in entities_df.iterrows():
        ent_id = row["entity_id"]
        ent_alerts = alerts_df[alerts_df["entity_id"] == ent_id]
        risk_info = calculate_entity_risk(ent_id, all_findings, len(ent_alerts))
        
        item = dict(row)
        item.update(risk_info)
        results.append(item)
        
    return sorted(results, key=lambda x: x["risk_score"], reverse=True)
