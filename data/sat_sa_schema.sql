-- SAT-SA AIR-GAPPED SQLITE DATABASE SCHEMA
-- NCIIPC / NTRO Sovereign Cyber Oversight Division

CREATE TABLE IF NOT EXISTS entities (
    entity_id TEXT PRIMARY KEY,
    entity_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    criticality TEXT NOT NULL,
    total_assets INTEGER DEFAULT 0,
    critical_assets_count INTEGER DEFAULT 0,
    soc_tier TEXT NOT NULL,
    baseline_daily_alerts INTEGER DEFAULT 200,
    known_execution_gap BOOLEAN DEFAULT 0,
    known_negative_space BOOLEAN DEFAULT 0,
    contact_officer TEXT,
    region TEXT,
    risk_score REAL DEFAULT 0,
    risk_level TEXT DEFAULT 'Low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    entity_id TEXT REFERENCES entities(entity_id),
    entity_name TEXT NOT NULL,
    alert_name TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('Critical', 'High', 'Medium', 'Low')),
    asset_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Closed', 'Escalated', 'Investigating')),
    created_at DATETIME NOT NULL,
    closed_at DATETIME,
    closure_time_minutes REAL DEFAULT 0,
    escalated TEXT DEFAULT 'No',
    analyst_id TEXT NOT NULL,
    investigation_notes TEXT
);

CREATE TABLE IF NOT EXISTS cases (
    case_id TEXT PRIMARY KEY,
    entity_id TEXT REFERENCES entities(entity_id),
    entity_name TEXT NOT NULL,
    case_title TEXT NOT NULL,
    severity TEXT NOT NULL,
    lead_analyst TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    resolution_time_hours REAL DEFAULT 0,
    status TEXT NOT NULL,
    root_cause_analysis TEXT,
    linked_alert_id TEXT
);

CREATE TABLE IF NOT EXISTS supervisory_findings (
    finding_id TEXT PRIMARY KEY,
    entity_id TEXT REFERENCES entities(entity_id),
    type TEXT NOT NULL CHECK(type IN ('Execution Gap', 'Negative Space', 'Anomaly')),
    subtype TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    record_id TEXT,
    asset_id TEXT,
    closure_time_minutes REAL DEFAULT 0,
    investigation_notes TEXT,
    analyst_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_object TEXT NOT NULL,
    status TEXT NOT NULL,
    sha256_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS remediation_tasks (
    task_id TEXT PRIMARY KEY,
    entity_id TEXT REFERENCES entities(entity_id),
    finding_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    assigned_to TEXT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'In-Progress', 'Verified')),
    priority TEXT DEFAULT 'High',
    remediation_guidance TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
