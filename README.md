# SAT-SA: Supervisory Analytics Tool for SOC Assessment
**NCIIPC / NTRO Sovereign Cyber Oversight Division**

SAT-SA is an **offline-first Supervisory Analytics Platform** designed for national cybersecurity oversight bodies (such as NCIIPC and NTRO). Traditional SOC management reviews what alerts were raised and closed, leaving critical supervisory blind spots. SAT-SA programmatically detects:

1. **Execution Gaps**: Alerts and cases nominally closed to meet SLAs, but with dangerously superficial triage (< 15-30 min closure on Critical/High alerts, template/empty notes, suppressed escalations).
2. **Negative Space**: The absence of expected signals where signals MUST exist (critical assets with 0 alerts over 30 days, suppressed telemetry pipelines, abnormal silence).
3. **Statistical Anomalies**: Velocity outliers and triage time deviations.

---

## ⚡ Offline Installation & Execution

### Prerequisites
- Python 3.9+
- Standard environment (no external cloud connections, no internet required)

### Setup & Run
```bash
# 1. Install dependencies from requirements.txt
pip install -r requirements.txt

# 2. Generate initial synthetic benchmark datasets
python generate_data.py

# 3. Launch the Streamlit Supervisory Console
streamlit run app.py
```

---

## 📂 Repository Structure

```text
SAT-SA/
├── app.py                  ← Main Streamlit supervisory application
├── generate_data.py        ← Benchmark synthetic data generator
├── requirements.txt        ← Offline Python package requirements
├── README.md               ← Documentation and setup guide
├── data/
│   ├── entities.csv        ← Critical Sector Entity registry
│   ├── alerts.csv          ← 30-day SOC alert logs
│   ├── cases.csv           ← Corroborated incident investigation cases
│   └── generate_data.py    ← Local data generator copy
└── src/
    ├── analytics.py        ← Execution Gap + Negative Space + Anomaly logic
    ├── risk_scoring.py     ← Multi-factor 0-100 supervisory risk engine
    ├── explainability.py   ← What + Why + Evidence drawer narratives
    └── pdf_report.py       ← ReportLab official NCIIPC/NTRO PDF report generator
```

---

## 🛡️ Critical Sector Entities Modeled

1. **National Power Grid Corporation** (Power & Energy - Injected SCADA RTU-09 silence + rapid closure gaps)
2. **Apex National Bank** (Banking & Finance - SWIFT & Core Banking telemetry)
3. **Bharat Telecom Ltd** (Telecommunications - Silenced HLR router negative space)
4. **Metro Airport Authority** (Civil Aviation - Radar sensor silence & rapid closure)
5. **Eastern Port Trust** (Maritime Logistics - Container TOS silence & volume deficit)
6. **Central Metro Rail** (Urban Rail - Signaling triage anomalies)
7. **National Highway Authority** (Toll Telematics - FASTag HSM operational baseline)

---

## 📊 Core Features

- **Overview Dashboard**: 4 key supervisory metrics, Risk Distribution Donut Chart, Top 5 High-Risk Entities, Recent Critical Findings ticker.
- **Entity Risk View**: Searchable, sortable entity risk table with detailed breakdown modals.
- **Findings Explorer**: Tabbed view of Execution Gaps, Negative Space, and Anomalies with interactive "View Evidence" drawers showing **What**, **Why**, and exact **Supporting Evidence**.
- **Priority Review Queue**: Ranked alerts requiring immediate supervisor attention with session-state "Mark as Reviewed" persistence.
- **Peer Comparison**: Radar charts and side-by-side metric tables comparing entities against sector baselines.
- **Official PDF Reports**: Client & server PDF generation with executive summaries, findings tables, and regulatory directives.
- **Data Ingestion**: Offline CSV/JSON dataset validator and upload pipeline.
