import React, { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadRecipients, { RecipientRow } from "./UploadRecipients";
import RecipientsPreview from "./RecipientsPreview";
import SendOptions from "./SendOptions";
import { TimeWindowConfig, DEFAULT_TIME_WINDOW } from "./TimeWindowPicker";

const BASE_URL = import.meta.env.VITE_APP_BASEURL;

export type BatchSummary = {
  id: string;
  name: string;
  status: "Sending" | "Scheduled" | "Completed";
  recipients: number;
  sent: number;
  pickedUp: number;
  successful: number;
  createdAt: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (summary: BatchSummary) => void;
};

type WhenToSend = "now" | "schedule";

const uuid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const BatchCallDrawer: React.FC<Props> = ({ open, onClose, onCreated }) => {
  // ===== defaults / reset helper =====
  const defaults = useMemo(
    () => ({
      batchName: "",
      fromNumber: "+15512821255 (GroPlus)",
      timeWindowCfg: DEFAULT_TIME_WINDOW as TimeWindowConfig,
      whenToSend: "now" as WhenToSend,
      scheduledDateTime: "",
      timezone:
        (Intl.DateTimeFormat().resolvedOptions().timeZone as string) || "UTC",
      reservedOtherCalls: 1,
      batchConcurrency: 19,
      rows: [] as RecipientRow[],
    }),
    []
  );

  // ===== state =====
  const [batchName, setBatchName] = useState(defaults.batchName);
  const [fromNumber, setFromNumber] = useState(defaults.fromNumber);
  const fromNumberOptions = useMemo(
    () => [
      "+15512821255 (GroPlus)",
      "+12135551234 (Sales)",
      "+447700900123 (UK Line)",
    ],
    []
  );
  const [timeWindowCfg, setTimeWindowCfg] = useState<TimeWindowConfig>(
    defaults.timeWindowCfg
  );

  const [rows, setRows] = useState<RecipientRow[]>(defaults.rows);
  const recipientsCount = rows.length;
  const allValid = recipientsCount > 0 && rows.every((r) => r._valid);

  const [whenToSend, setWhenToSend] = useState<WhenToSend>(defaults.whenToSend);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(
    defaults.scheduledDateTime
  );
  const tzOptions =
    (typeof Intl.supportedValuesOf === "function" &&
      Intl.supportedValuesOf("timeZone")) ||
    ([
      "UTC",
      "America/New_York",
      "Europe/London",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Asia/Tokyo",
    ] as string[]);
  const [timezone, setTimezone] = useState<string>(defaults.timezone);

  const [reservedOtherCalls, setReservedOtherCalls] = useState<number>(
    defaults.reservedOtherCalls
  );
  const [batchConcurrency, setBatchConcurrency] = useState<number>(
    defaults.batchConcurrency
  );

  // Derived
  const canSend =
    batchName.trim().length > 0 && recipientsCount > 0 && allValid;
  const estMinutes = Math.ceil(
    (recipientsCount * 5) / Math.max(1, batchConcurrency)
  );

  // Modals
  const [showError, setShowError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // reset helper
  const resetForm = () => {
    setBatchName(defaults.batchName);
    setFromNumber(defaults.fromNumber);
    setTimeWindowCfg(DEFAULT_TIME_WINDOW);
    setRows(defaults.rows);
    setWhenToSend(defaults.whenToSend);
    setScheduledDateTime(defaults.scheduledDateTime);
    setTimezone(defaults.timezone);
    setReservedOtherCalls(defaults.reservedOtherCalls);
    setBatchConcurrency(defaults.batchConcurrency);
  };

  const handleSaveDraft = () => setShowError(true);

  // const actuallySend = () => {
  //   // Build payload (if you POST, do it here)
  //   const payload = {
  //     batchName,
  //     fromNumber,
  //     whenToSend,
  //     scheduledAt: whenToSend === "schedule" ? { datetimeLocal: scheduledDateTime, timezone } : null,
  //     timeWindow: timeWindowCfg,
  //     reservedOtherCalls,
  //     batchConcurrency,
  //     recipients: rows.map(({ _valid, id, ...rest }) => rest),
  //   };
  //   console.log("SEND BATCH:", payload);

  //   // Create summary for the parent page
  //   const summary: BatchSummary = {
  //     id: uuid(),
  //     name: batchName,
  //     status: whenToSend === "schedule" ? "Scheduled" : "Sending",
  //     recipients: recipientsCount,
  //     sent: 0,
  //     pickedUp: 0,
  //     successful: 0,
  //     createdAt: new Date().toISOString(),
  //   };
  //   onCreated(summary);

  //   // Reset state and close
  //   resetForm();
  //   onClose();
  // };

  // const actuallySend = async () => {
  //   const payload = {
  //     batchName,
  //     fromNumber,
  //     whenToSend,
  //     scheduledAt:
  //       whenToSend === "schedule"
  //         ? { datetimeLocal: scheduledDateTime, timezone }
  //         : null,
  //     timeWindow: timeWindowCfg,
  //     reservedOtherCalls,
  //     batchConcurrency,
  //     recipients: rows.map(({ _valid, id, ...rest }) => rest),
  //   };

  //   try {
  //     const res = await fetch(`${BASE_URL}retell/start-batch-call`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await res.json();
  //     console.log("✅ Batch call initiated:", data);

  //     // Create local summary for UI
  //     const summary: BatchSummary = {
  //       id: uuid(),
  //       name: batchName,
  //       status: whenToSend === "schedule" ? "Scheduled" : "Sending",
  //       recipients: recipientsCount,
  //       sent: 0,
  //       pickedUp: 0,
  //       successful: 0,
  //       createdAt: new Date().toISOString(),
  //     };
  //     onCreated(summary);

  //     resetForm();
  //     onClose();
  //   } catch (error) {
  //     console.error("❌ Error starting batch call:", error);
  //   }
  // };

  const actuallySend = async () => {
    // Transform recipients → tasks
    const tasks = rows.map(({ _valid, id, phone_number, ...rest }) => ({
      to_number: phone_number, // ✅ rename to API's required field
      metadata: { ...rest }, // ✅ put all other fields under metadata
    }));

    const payload = {
      batchName,
      fromNumber,
      whenToSend,
      scheduledAt:
        whenToSend === "schedule"
          ? { datetimeLocal: scheduledDateTime, timezone }
          : null,
      timeWindow: timeWindowCfg,
      reservedOtherCalls,
      batchConcurrency,
      tasks, // ✅ correct key for Retell API
    };

    try {
      const res = await fetch(`${BASE_URL}retell/start-batch-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("✅ Batch call initiated:", data);

      // Create local summary for UI
      const summary: BatchSummary = {
        id: uuid(),
        name: batchName,
        status: whenToSend === "schedule" ? "Scheduled" : "Sending",
        recipients: rows.length,
        sent: 0,
        pickedUp: 0,
        successful: 0,
        createdAt: new Date().toISOString(),
      };
      onCreated(summary);

      resetForm();
      onClose();
    } catch (error) {
      console.error("❌ Error starting batch call:", error);
    }
  };

  const handleSend = () => setShowConfirm(true);

  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <aside
      ref={ref}
      className={[
        "fixed right-0 top-0 z-50 h-screen w-full max-w-[1100px] bg-background shadow-2xl border-l",
        "transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full",
        "flex flex-col",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label="Create a batch call"
    >
      {/* Title row */}
      <div className="flex items-center justify-between px-6 h-14 border-b">
        <div className="flex items-center gap-2">
          <span className="font-medium">Create a batch call</span>
          <span className="text-xs text-muted-foreground">
            • Batch call cost $0.005 per dial
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => {
            resetForm();
            onClose();
          }}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2">
          {/* Left column */}
          <div className="overflow-y-auto px-6 py-5 space-y-6 border-r">
            {/* Batch Call Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch Call Name</label>
              <input
                type="text"
                className="w-full h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>

            {/* From number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From number</label>
              <div className="relative">
                <select
                  className="w-full h-10 rounded-md border pr-9 pl-3 text-sm outline-none focus:ring-2 focus:ring-ring appearance-none bg-background"
                  value={fromNumber}
                  onChange={(e) => setFromNumber(e.target.value)}
                >
                  {fromNumberOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload + Dropzone */}
            <UploadRecipients rows={rows} setRows={setRows} />

            {/* Send options (picker + concurrency) */}
            <SendOptions
              whenToSend={whenToSend}
              setWhenToSend={setWhenToSend}
              scheduledDateTime={scheduledDateTime}
              setScheduledDateTime={setScheduledDateTime}
              timezone={timezone}
              setTimezone={setTimezone}
              tzOptions={tzOptions as string[]}
              timeWindowCfg={timeWindowCfg}
              setTimeWindowCfg={setTimeWindowCfg}
              reservedOtherCalls={reservedOtherCalls}
              setReservedOtherCalls={(v) => {
                setReservedOtherCalls(v);
                setBatchConcurrency(Math.max(1, 20 - v)); // demo total
              }}
              batchConcurrency={batchConcurrency}
              setBatchConcurrency={setBatchConcurrency}
              recipientsCount={recipientsCount}
              estMinutes={estMinutes}
            />

            <div className="text-xs text-muted-foreground">
              You’ve read and agree with the Terms of service.
            </div>
          </div>

          {/* Right column */}
          <RecipientsPreview rows={rows} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => setShowError(true)}>
          Save as draft
        </Button>
        <Button onClick={handleSend} disabled={!canSend}>
          Send
        </Button>
      </div>

      {/* Error modal */}
      {showError && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowError(false)}
          />
          <div className="relative bg-background rounded-xl shadow-xl border w-[520px] p-6">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                !
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">Error</div>
                <div className="text-sm text-muted-foreground">
                  Invalid task provided
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setShowError(false)}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-background rounded-xl shadow-xl border w-[520px] p-6">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                !
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">
                  Schedule calls to send?
                </div>
                <div className="text-sm text-muted-foreground">
                  You are about to schedule calls to be sent to{" "}
                  {recipientsCount} recipients .
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowConfirm(false);
                  actuallySend();
                }}
              >
                Send Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default BatchCallDrawer;
