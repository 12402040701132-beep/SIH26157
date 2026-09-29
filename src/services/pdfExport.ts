/**
 * SAT-SA Official Client-side PDF Report Generator & Batch Archive Exporter
 * Generates official NCIIPC / NTRO styled supervisory audit dossiers using jsPDF and JSZip
 */
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { EntityRecord, Finding } from '../data/benchmarkData';

export function createPDFDocument(
  targetEntity: { entity_name: string; sector: string; risk_score?: number; risk_level?: string },
  findings: Finding[]
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header Bar (Dark Primary #0F172A)
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Emblem / Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SAT-SA // SUPERVISORY ASSESSMENT DOSSIER', margin, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('GOVERNMENT OF INDIA · NCIIPC / NTRO CYBER OVERSIGHT DIVISION', margin, 48);
  doc.text(`CONFIDENTIAL · OFFICIAL SENSITIVE · GENERATED ${new Date().toUTCString()}`, margin, 61);

  y = 95;

  // Overview Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 65, 4, 4, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Target Entity: ${targetEntity.entity_name}`, margin + 12, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Assigned Sector: ${targetEntity.sector}`, margin + 12, y + 36);

  const score = targetEntity.risk_score ?? 78;
  const level = targetEntity.risk_level ?? 'High';
  const riskColor = level === 'High' ? [239, 68, 68] : level === 'Medium' ? [245, 158, 11] : [34, 197, 94];

  doc.text(`Identified Findings: ${findings.length}`, margin + 12, y + 52);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.text(`Supervisory Risk Index: ${score}/100 (${level} Risk)`, pageWidth - margin - 220, y + 20);

  y += 85;

  // Section 1: Executive Summary
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Executive Supervisory Summary', margin, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const summaryText = 
    `This supervisory audit evaluated operational Security Operations Center (SOC) telemetry for ` +
    `${targetEntity.entity_name} pursuant to National Critical Information Infrastructure Protection ` +
    `guidelines. The tool programmatically inspected for two critical oversight blind spots: ` +
    `1) Execution Gaps (superficial investigation velocity, premature ticket closures, and suppressed escalations), ` +
    `and 2) Negative Space (complete absence of expected telemetry from designated core SCADA/Banking/Telecom controllers). ` +
    `Total supervisory findings: ${findings.length}. Aggregate risk assigned: ${score}/100.`;

  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 2 * margin);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 12 + 10;

  // Section 2: Top Findings & Evidence
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Priority Supervisory Findings & Evidentiary Audit', margin, y);
  y += 18;

  const topFindings = findings.slice(0, 7);

  for (let i = 0; i < topFindings.length; i++) {
    const f = topFindings[i];
    if (y > doc.internal.pageSize.getHeight() - 70) {
      doc.addPage();
      y = margin;
    }

    const isCrit = f.severity === 'Critical';
    doc.setFillColor(isCrit ? 254 : 248, isCrit ? 242 : 250, isCrit ? 242 : 252);
    doc.setDrawColor(isCrit ? 252 : 226, isCrit ? 165 : 232, isCrit ? 165 : 240);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 46, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(isCrit ? 185 : 30, isCrit ? 28 : 41, isCrit ? 28 : 59);
    doc.text(`[${f.severity.toUpperCase()}] ${f.type.toUpperCase()}: ${f.title}`, margin + 10, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const desc = `${f.description.substring(0, 140)}... (Asset: ${f.asset_id} | Ref: ${f.record_id})`;
    doc.text(desc, margin + 10, y + 27);

    doc.setTextColor(100, 116, 139);
    doc.text(`Analyst: ${f.analyst_id} | Closure: ${f.closure_time_minutes}m | Note: "${(f.investigation_notes || 'N/A').substring(0, 60)}"`, margin + 10, y + 39);

    y += 52;
  }

  // Section 3: Recommendations
  if (y > doc.internal.pageSize.getHeight() - 110) {
    doc.addPage();
    y = margin;
  }

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Mandatory Supervisory Directives & Corrective Actions', margin, y);
  y += 16;

  const recs = [
    "1. Impose minimum 30-minute investigation standard on all Critical/High alerts with mandatory packet capture attachments.",
    "2. Deploy automated Negative Space watchdog forwarders on core assets (SCADA RTU, SWIFT, and Core Routing switches).",
    "3. Restructure analyst performance KPIs away from rapid ticket closure velocity to prioritize forensic thoroughness.",
    "4. Conduct comprehensive onsite joint NCIIPC/NTRO inspection of Tier-1 and Tier-2 handover playbooks within 14 days."
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  for (const r of recs) {
    doc.text(r, margin, y);
    y += 13;
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${p} of ${pageCount} · NCIIPC / NTRO Sovereign Supervisory Assessment Architecture`, margin, doc.internal.pageSize.getHeight() - 20);
  }

  return doc;
}

export function exportSupervisoryPDF(
  targetEntity: { entity_name: string; sector: string; risk_score?: number; risk_level?: string },
  findings: Finding[],
  saveImmediately: boolean = true
): jsPDF {
  const doc = createPDFDocument(targetEntity, findings);
  if (saveImmediately) {
    doc.save(`SAT-SA_Audit_Report_${targetEntity.entity_name.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.pdf`);
  }
  return doc;
}

/**
 * Batch Export: Iterates through all entities with 'High' risk level,
 * generates a PDF dossier for each using exportSupervisoryPDF,
 * and bundles them into a single compressed ZIP file using JSZip.
 */
export async function exportBatchHighRiskArchive(
  highRiskEntities: EntityRecord[],
  allFindings: Finding[]
): Promise<void> {
  const zip = new JSZip();

  for (const entity of highRiskEntities) {
    const entityFindings = allFindings.filter(f => f.entity_id === entity.entity_id);
    // Use exportSupervisoryPDF with saveImmediately = false to capture the PDF blob
    const doc = exportSupervisoryPDF(entity, entityFindings, false);
    const pdfBlob = doc.output('blob');
    const safeName = entity.entity_name.replace(/[^a-zA-Z0-9_-]/g, '_');
    zip.file(`Dossier_${entity.entity_id}_${safeName}.pdf`, pdfBlob);
  }

  // Include supervisory manifest
  const manifestContent = `SAT-SA SUPERVISORY BATCH ARCHIVE MANIFEST
Generated: ${new Date().toUTCString()}
Classification: OFFICIAL SENSITIVE
Issuing Authority: Government of India · NCIIPC / NTRO Cyber Oversight Division

Included High-Risk Entities:
${highRiskEntities.map(e => `- [${e.entity_id}] ${e.entity_name} | Sector: ${e.sector} | Risk: ${e.risk_score}/100 (${e.risk_level})`).join('\n')}

Total Individual PDF Dossiers: ${highRiskEntities.length}
`;
  zip.file('MANIFEST.txt', manifestContent);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SAT-SA_High_Risk_Dossiers_Batch_Archive_${new Date().toISOString().substring(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
