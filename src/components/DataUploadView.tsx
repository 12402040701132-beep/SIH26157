import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, RefreshCw, FileText, Database, Layers } from 'lucide-react';
import { EntityRecord, AlertRecord, CaseRecord } from '../data/benchmarkData';

interface DataUploadViewProps {
  onLoadCustomData: (entities?: EntityRecord[], alerts?: AlertRecord[], cases?: CaseRecord[]) => void;
  onResetBenchmark: () => void;
  currentEntitiesCount: number;
  currentAlertsCount: number;
  currentCasesCount: number;
}

export const DataUploadView: React.FC<DataUploadViewProps> = ({
  onLoadCustomData,
  onResetBenchmark,
  currentEntitiesCount,
  currentAlertsCount,
  currentCasesCount
}) => {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<any[] | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string>('');

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split(/\r\n|\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      // Basic CSV splitter handling quotes
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of lines[i]) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));

      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ?? '';
      });
      rows.push(row);
    }
    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'entities' | 'alerts' | 'cases') => {
    setUploadError(null);
    setUploadStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let data: any[] = [];
        if (file.name.endsWith('.json')) {
          data = JSON.parse(text);
          if (!Array.isArray(data)) throw new Error("JSON file must contain an array of records.");
        } else {
          data = parseCSV(text);
        }

        if (data.length === 0) {
          throw new Error("File contains zero valid data rows.");
        }

        setPreviewRows(data.slice(0, 5));
        setPreviewFilename(`${file.name} (${data.length} rows parsed)`);

        if (type === 'entities') {
          onLoadCustomData(data, undefined, undefined);
          setUploadStatus(`Successfully parsed and loaded ${data.length} entity records.`);
        } else if (type === 'alerts') {
          onLoadCustomData(undefined, data, undefined);
          setUploadStatus(`Successfully parsed and loaded ${data.length} alert records.`);
        } else {
          onLoadCustomData(undefined, undefined, data);
          setUploadStatus(`Successfully parsed and loaded ${data.length} case records.`);
        }
      } catch (err: any) {
        setUploadError(err.message || "Failed to parse data file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Offline Data Ingestion & Schema Validation
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Ingest enterprise SOC alerts, cases, or critical infrastructure registries (CSV/JSON) for automated supervisory audit
        </p>
      </div>

      {/* Current Dataset Status Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Active Supervisory Database State
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
              <span>Monitored Entities: <strong className="text-white font-mono">{currentEntitiesCount}</strong></span>
              <span>·</span>
              <span>Total Alerts Loaded: <strong className="text-white font-mono">{currentAlertsCount}</strong></span>
              <span>·</span>
              <span>Incident Cases: <strong className="text-white font-mono">{currentCasesCount}</strong></span>
            </div>
          </div>

          <button
            onClick={onResetBenchmark}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-md transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate National Benchmark Dataset</span>
          </button>
        </div>
      </div>

      {/* Status Banners */}
      {uploadStatus && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Validation Error: {uploadError}</span>
        </div>
      )}

      {/* 3 Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Entities Upload */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">1. Entities Registry</span>
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold text-white">Upload Entities (CSV / JSON)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Required columns: <code>entity_id, entity_name, sector, total_assets, critical_assets_count</code>
            </p>
          </div>

          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-lg cursor-pointer bg-slate-950 transition-colors">
            <Upload className="w-6 h-6 text-slate-500 mb-1" />
            <span className="text-xs text-slate-300 font-medium">Select entities.csv</span>
            <span className="text-[10px] text-slate-500 mt-0.5">or drop JSON file</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => handleFileUpload(e, 'entities')}
              className="hidden"
            />
          </label>
        </div>

        {/* Alerts Upload */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">2. SOC Alerts Log</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold text-white">Upload Alerts (CSV / JSON)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Required: <code>alert_id, entity_id, severity, asset_id, closure_time_minutes, investigation_notes</code>
            </p>
          </div>

          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-amber-500 rounded-lg cursor-pointer bg-slate-950 transition-colors">
            <Upload className="w-6 h-6 text-slate-500 mb-1" />
            <span className="text-xs text-slate-300 font-medium">Select alerts.csv</span>
            <span className="text-[10px] text-slate-500 mt-0.5">or drop JSON file</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => handleFileUpload(e, 'alerts')}
              className="hidden"
            />
          </label>
        </div>

        {/* Cases Upload */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">3. Incident Cases</span>
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold text-white">Upload Cases (CSV / JSON)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Required: <code>case_id, entity_id, resolution_time_hours, root_cause_analysis</code>
            </p>
          </div>

          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-emerald-500 rounded-lg cursor-pointer bg-slate-950 transition-colors">
            <Upload className="w-6 h-6 text-slate-500 mb-1" />
            <span className="text-xs text-slate-300 font-medium">Select cases.csv</span>
            <span className="text-[10px] text-slate-500 mt-0.5">or drop JSON file</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => handleFileUpload(e, 'cases')}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* File Preview Table */}
      {previewRows && previewRows.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Data Ingestion Preview: <span className="font-mono text-blue-400">{previewFilename}</span>
            </h3>
            <span className="text-[11px] text-slate-400">Showing first 5 rows</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  {Object.keys(previewRows[0]).slice(0, 7).map(col => (
                    <th key={col} className="py-2 px-3 font-semibold font-mono">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {previewRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    {Object.values(r).slice(0, 7).map((val: any, j) => (
                      <td key={j} className="py-2 px-3 text-slate-300 font-mono text-[11px] truncate max-w-[180px]">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
