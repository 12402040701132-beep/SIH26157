"""
SAT-SA PDF Supervisory Report Generator
NCIIPC / NTRO Sovereign Cyber Oversight Division
Generates high-fidelity PDF assessment reports using ReportLab.
"""

import io
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

def generate_pdf_report(entity_info, findings, output_stream=None):
    """
    Creates an official NCIIPC/NTRO supervisory assessment PDF report.
    Returns bytes buffer.
    """
    buffer = output_stream if output_stream else io.BytesIO()
    
    if not REPORTLAB_AVAILABLE:
        # Fallback if ReportLab is not available in environment
        buffer.write(b"%PDF-1.4\n% SAT-SA Mock PDF Report\n")
        buffer.write(f"Entity: {entity_info.get('entity_name', 'All Entities')}\n".encode())
        buffer.write(f"Generated at: {datetime.now().isoformat()}\n".encode())
        if hasattr(buffer, 'seek'):
            buffer.seek(0)
        return buffer

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569')
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1E293B')
    )

    story = []

    # Header Banner
    story.append(Paragraph("SAT-SA // SUPERVISORY ASSESSMENT REPORT", title_style))
    story.append(Paragraph(
        f"<b>GOVERNMENT OF INDIA · NCIIPC / NTRO CYBER OVERSIGHT WING</b><br/>"
        f"Assessment Window: 30-Day Retrospective | Generated: {datetime.now().strftime('%d %B %Y, %H:%M:%S UTC')} | Classification: OFFICIAL SENSITIVE",
        subtitle_style
    ))
    story.append(Spacer(1, 15))

    # Entity Overview Table
    ent_name = entity_info.get("entity_name", "All Critical Infrastructure Entities")
    score = entity_info.get("risk_score", "N/A")
    level = entity_info.get("risk_level", "High")
    sector = entity_info.get("sector", "Critical Infrastructure")

    overview_data = [
        [
            Paragraph("<b>Target Entity:</b>", body_style),
            Paragraph(str(ent_name), body_style),
            Paragraph("<b>Assigned Sector:</b>", body_style),
            Paragraph(str(sector), body_style)
        ],
        [
            Paragraph("<b>Supervisory Risk:</b>", body_style),
            Paragraph(f"<font color='{'#EF4444' if level=='High' else '#F59E0B'}'><b>{score}/100 ({level})</b></font>", body_style),
            Paragraph("<b>Total Findings:</b>", body_style),
            Paragraph(str(len(findings)), body_style)
        ]
    ]

    t_overview = Table(overview_data, colWidths=[1.4*inch, 2.2*inch, 1.4*inch, 2.2*inch])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 15))

    # Section 1: Executive Summary
    story.append(Paragraph("1. Executive Supervisory Summary", h2_style))
    exec_summary = (
        f"This supervisory audit evaluated the Security Operations Center (SOC) operational telemetry "
        f"for <b>{ent_name}</b> pursuant to National Critical Information Infrastructure Protection Guidelines. "
        f"The algorithmic supervisor evaluated execution integrity and blind spots across two primary dimensions: "
        f"<b>Execution Gaps</b> (triage quality, SLA compliance velocity, investigation substance) and "
        f"<b>Negative Space</b> (anomalous silence of core assets and telemetry deficit). "
        f"An aggregate risk index of <b>{score}/100</b> was assigned, indicating <b>{level} Supervisory Risk</b>."
    )
    story.append(Paragraph(exec_summary, body_style))
    story.append(Spacer(1, 12))

    # Section 2: Identified Supervisory Findings
    story.append(Paragraph("2. Top Supervisory Findings & Evidence Audit", h2_style))

    findings_table_data = [
        [
            Paragraph("ID / Type", table_header_style),
            Paragraph("Severity", table_header_style),
            Paragraph("Finding Description", table_header_style),
            Paragraph("Supervisory Impact & Evidence", table_header_style)
        ]
    ]

    for f in findings[:10]:
        findings_table_data.append([
            Paragraph(f"<b>{f.get('finding_id', '')}</b><br/>{f.get('type', '')}", table_cell_style),
            Paragraph(f"<font color='{'#EF4444' if f.get('severity')=='Critical' else '#F59E0B'}'><b>{f.get('severity', '')}</b></font>", table_cell_style),
            Paragraph(f"<b>{f.get('title', '')}</b><br/>{f.get('description', '')}", table_cell_style),
            Paragraph(f"Asset: <i>{f.get('asset_id', 'N/A')}</i><br/>Notes: {f.get('investigation_notes', '')[:110]}", table_cell_style)
        ])

    if len(findings_table_data) > 1:
        t_findings = Table(findings_table_data, colWidths=[1.3*inch, 0.8*inch, 2.6*inch, 2.5*inch])
        t_findings.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_findings)
    else:
        story.append(Paragraph("No anomalous findings recorded during this inspection interval.", body_style))

    story.append(Spacer(1, 15))

    # Section 3: Recommendations
    story.append(Paragraph("3. Supervisory Directives & Corrective Actions", h2_style))
    recs = [
        "<b>1. Mandatory Investigation Minimums:</b> Institute a minimum 30-minute triage threshold and mandatory packet/hash evidence attachment for all High and Critical tier alerts.",
        "<b>2. Negative Space Watchdog:</b> Deploy automated heartbeat monitoring on core telemetry forwarders (SCADA RTU, SWIFT, and Core Telecom switches) to immediately alarm if 0 logs are received for > 6 hours.",
        "<b>3. Frontline Escalation Audit:</b> Re-align analyst KPIs away from pure closure speed towards forensic validation depth to prevent SLA suppression.",
        "<b>4. NCIIPC Joint Inspection:</b> Initiate an in-person Tier-2 SOC process assessment within 14 calendar days."
    ]
    for r in recs:
        story.append(Paragraph(r, body_style))
        story.append(Spacer(1, 3))

    doc.build(story)
    
    if hasattr(buffer, 'seek'):
        buffer.seek(0)
    return buffer
