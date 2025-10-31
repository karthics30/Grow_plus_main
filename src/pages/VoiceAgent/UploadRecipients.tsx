import React, { useState } from "react";
import { FileDown, Trash2, Upload } from "lucide-react";

export type RecipientRow = {
  id: number;
  phone_number: string;
  ignore_e164_validation?: string;
  dynamic_variable1?: string;
  dynamic_variable2?: string;
  _valid: boolean;
};

const isE164 = (s: string) => /^\+[1-9]\d{1,14}$/.test((s || "").trim());

// tiny CSV parser (handles quotes)
function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let cur = "", row: string[] = [], quotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"' && quotes && n === '"') { cur += '"'; i++; continue; }
    if (c === '"') { quotes = !quotes; continue; }
    if (c === "," && !quotes) { row.push(cur); cur = ""; continue; }
    if ((c === "\n" || c === "\r") && !quotes) {
      if (cur.length || row.length) { row.push(cur); out.push(row); row = []; cur = ""; }
      if (c === "\r" && n === "\n") i++;
      continue;
    }
    cur += c;
  }
  if (cur.length || row.length) { row.push(cur); out.push(row); }
  return out.filter(r => r.length && !(r.length === 1 && r[0] === ""));
}

type Props = {
  rows: RecipientRow[];
  setRows: (rows: RecipientRow[]) => void;
};

const UploadRecipients: React.FC<Props> = ({ rows, setRows }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const count = rows.length;

  const downloadTemplate = () => {
    const content =
`phone number,ignore e164 validation,dynamic variable1,dynamic variable2
+14001231234,false,value1 (optional),value2 (optional)
+Onlyphonenumberisrequired.Feelfreetoaddorremovetheothercolumns.,,,
+Setignoree164validationtotruetoskipe164formatvalidationforphonenumbers.,true,,`;
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "recipients.csv"; document.body.appendChild(a);
    a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const readCsv = async (file: File) => {
    const text = await file.text();
    const grid = parseCsv(text);
    if (!grid.length) { setRows([]); return; }

    const headers = grid[0].map(h => h.trim().toLowerCase());
    const idx = (name: string) => headers.findIndex(h => h === name);

    const ip = idx("phone number");
    const ii = idx("ignore e164 validation");
    const iv1 = idx("dynamic variable1");
    const iv2 = idx("dynamic variable2");

    const parsed: RecipientRow[] = grid.slice(1).map((r, i) => {
      const phone = (ip >= 0 ? r[ip] : r[0])?.trim() || "";
      const ignore = (ii >= 0 ? r[ii] : "").toString().trim().toLowerCase();
      const gv1 = iv1 >= 0 ? r[iv1] : "";
      const gv2 = iv2 >= 0 ? r[iv2] : "";
      const skip = ignore === "true" || ignore === "1" || ignore === "yes";
      const valid = skip ? !!phone : isE164(phone);
      return { id: i + 1, phone_number: phone, ignore_e164_validation: ignore, dynamic_variable1: gv1, dynamic_variable2: gv2, _valid: valid };
    }).filter(r => r.phone_number);

    setRows(parsed);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    setCsvFile(f);
    await readCsv(f);
  };

  const onDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.name.toLowerCase().endsWith(".csv")) {
      setCsvFile(f);
      await readCsv(f);
    }
  };

  const clearCsv = () => { setCsvFile(null); setRows([]); };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Upload Recipients</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 text-xs px-2.5 h-8 rounded-md border hover:bg-accent"
          title="Download the template"
        >
          <FileDown className="w-4 h-4" />
          Download the template
        </button>
        {csvFile && (
          <span className="text-xs text-muted-foreground">
            {csvFile.name} • {count} Recipients
          </span>
        )}
      </div>

      {!csvFile ? (
        <label
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDrop={onDrop}
          className={[
            "mt-2 flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 cursor-pointer text-center",
            dragActive ? "bg-accent/40" : "bg-transparent",
          ].join(" ")}
        >
          <input type="file" accept=".csv" onChange={onFileChange} className="hidden" />
          <div className="w-9 h-9 rounded-md border flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-sm">
            Choose a <span className="font-medium">csv</span> or drag & drop it here.
          </div>
          <div className="text-xs text-muted-foreground">Up to 50 MB</div>
        </label>
      ) : (
        <div className="mt-2 flex items-center justify-between rounded-md border p-3 bg-muted/40">
          <div className="text-xs">
            <span className="font-medium">{csvFile.name}</span>
            <span className="text-muted-foreground"> • {count} Recipients</span>
          </div>
          <button type="button" className="p-2 rounded-md hover:bg-accent" onClick={clearCsv} aria-label="Remove file">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadRecipients;
