#!/usr/bin/env python3
"""
SAT-SA SQLite Seeder (Standard Library Pure Python)
NCIIPC / NTRO Sovereign Cyber Oversight Division
Initializes local SQLite database 'data/sat_sa.db' from generated CSV benchmarks without external dependencies.
"""

import os
import csv
import sqlite3

DB_PATH = "data/sat_sa.db"
SCHEMA_PATH = "data/sat_sa_schema.sql"

def seed_database():
    os.makedirs("data", exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            cursor.executescript(f.read())

    # Ingest entities
    ent_path = "data/entities.csv"
    if os.path.exists(ent_path):
        with open(ent_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO entities 
                    (entity_id, entity_name, sector, criticality, total_assets, critical_assets_count, soc_tier, baseline_daily_alerts, known_execution_gap, known_negative_space, contact_officer)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row["entity_id"], row["entity_name"], row["sector"], row["criticality"],
                    int(row["total_assets"]), int(row["critical_assets_count"]), row["soc_tier"],
                    int(row["baseline_daily_alerts"]), row["known_execution_gap"].lower() == "true",
                    row["known_negative_space"].lower() == "true", row["contact_officer"]
                ))
        print(f"[+] Loaded entities into SQLite.")

    # Ingest alerts
    alt_path = "data/alerts.csv"
    if os.path.exists(alt_path):
        with open(alt_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO alerts 
                    (alert_id, entity_id, entity_name, alert_name, category, severity, asset_id, status, created_at, closed_at, closure_time_minutes, escalated, analyst_id, investigation_notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row["alert_id"], row["entity_id"], row["entity_name"], row["alert_name"],
                    row["category"], row["severity"], row["asset_id"], row["status"],
                    row["created_at"], row["closed_at"], float(row.get("closure_time_minutes", 0) or 0),
                    row["escalated"], row["analyst_id"], row["investigation_notes"]
                ))
        print(f"[+] Loaded alerts into SQLite.")

    # Ingest cases
    cas_path = "data/cases.csv"
    if os.path.exists(cas_path):
        with open(cas_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO cases 
                    (case_id, entity_id, entity_name, case_title, severity, lead_analyst, created_at, resolution_time_hours, status, root_cause_analysis, linked_alert_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row["case_id"], row["entity_id"], row["entity_name"], row["case_title"],
                    row["severity"], row["lead_analyst"], row["created_at"],
                    float(row.get("resolution_time_hours", 0) or 0), row["status"],
                    row["root_cause_analysis"], row["linked_alert_id"]
                ))
        print(f"[+] Loaded cases into SQLite.")

    conn.commit()
    conn.close()
    print(f"[✓] SAT-SA SQLite Database seeded successfully at: {DB_PATH}")

if __name__ == "__main__":
    seed_database()
