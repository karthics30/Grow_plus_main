import React from "react";
import { RecipientRow } from "./UploadRecipients";

const RecipientsPreview: React.FC<{ rows: RecipientRow[] }> = ({ rows }) => {
  const has = rows.length > 0;

  return (
    <div className="overflow-y-auto px-6 py-5 bg-muted/30">
      <div className="text-sm font-medium mb-3">Recipients</div>

      {!has ? (
        <div className="h-full min-h-[300px] flex items-center justify-center text-sm text-muted-foreground">
          Please upload recipients first
        </div>
      ) : (
        <div className="overflow-auto rounded-md border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr className="text-left">
                <th className="px-3 py-2 w-16">ID</th>
                <th className="px-3 py-2">phone number</th>
                <th className="px-3 py-2">ignore e164 validation</th>
                <th className="px-3 py-2">dynamic variable1</th>
                <th className="px-3 py-2">dynamic variable2</th>
                <th className="px-3 py-2 text-right">status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2 font-mono">{r.phone_number}</td>
                  <td className="px-3 py-2">{r.ignore_e164_validation || "false"}</td>
                  <td className="px-3 py-2">{r.dynamic_variable1 || ""}</td>
                  <td className="px-3 py-2">{r.dynamic_variable2 || ""}</td>
                  <td className="px-3 py-2 text-right">
                    {r._valid ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">valid</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">invalid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecipientsPreview;
