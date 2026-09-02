import { ChangeEvent, useState } from "react";
import { Download, FileUp } from "lucide-react";

interface ImportExportControlsProps {
  onExportJson: () => void;
  onExportTxt: () => void;
  onExportXlsx: () => Promise<void>;
  onImport: (file: File) => Promise<void>;
}

export function ImportExportControls({
  onExportJson,
  onExportTxt,
  onExportXlsx,
  onImport,
}: ImportExportControlsProps) {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isBusy, setIsBusy] = useState(false);

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setMessage("");
    setIsBusy(true);
    try {
      await onImport(file);
      setMessage("Data imported successfully.");
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Import failed.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleExportXlsx = async () => {
    setError("");
    setMessage("");
    setIsBusy(true);
    try {
      await onExportXlsx();
      setMessage("XLSX exported.");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "XLSX export failed.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <h2 className="text-lg font-semibold text-slate-100">Import / Export</h2>
      <p className="mt-1 text-xs text-slate-400">
        Importing replaces all current data after confirmation. Supports this app&apos;s JSON/TXT/XLSX.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExportJson}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
        >
          <Download size={16} /> Export JSON
        </button>
        <button
          type="button"
          onClick={onExportTxt}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
        >
          <Download size={16} /> Export TXT
        </button>
        <button
          type="button"
          onClick={handleExportXlsx}
          disabled={isBusy}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-800 px-3 py-2 text-sm text-violet-50 transition hover:bg-violet-700 disabled:opacity-60"
        >
          <Download size={16} /> Export XLSX
        </button>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500">
          <FileUp size={16} /> Import file
          <input
            type="file"
            accept=".json,.txt,.xlsx"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </section>
  );
}
