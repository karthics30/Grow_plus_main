import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import TimeWindowPicker, { TimeWindowConfig } from "./TimeWindowPicker";

type WhenToSend = "now" | "schedule";

type Props = {
  whenToSend: WhenToSend;
  setWhenToSend: (v: WhenToSend) => void;

  scheduledDateTime: string;
  setScheduledDateTime: (v: string) => void;

  timezone: string;
  setTimezone: (v: string) => void;
  tzOptions: string[];

  // ⬇️ changed: config instead of {start,end}
  timeWindowCfg?: TimeWindowConfig;
  setTimeWindowCfg: (w: TimeWindowConfig) => void;

  reservedOtherCalls: number;
  setReservedOtherCalls: (v: number) => void;

  batchConcurrency: number;
  setBatchConcurrency: (v: number) => void;

  recipientsCount: number;
  estMinutes: number;
};

const SendOptions: React.FC<Props> = ({
  whenToSend, setWhenToSend,
  scheduledDateTime, setScheduledDateTime,
  timezone, setTimezone, tzOptions,
  timeWindowCfg, setTimeWindowCfg,
  reservedOtherCalls, setReservedOtherCalls,
  batchConcurrency, setBatchConcurrency,
  recipientsCount, estMinutes,
}) => {
  return (
    <>
      {/* When to send */}
      <div className="space-y-3">
        <label className="text-sm font-medium block">When to send the calls</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setWhenToSend("now")}
            className={`h-10 rounded-md border px-3 text-sm ${whenToSend === "now" ? "border-primary ring-2 ring-ring" : "hover:bg-accent"}`}
          >
            Send Now
          </button>
          <button
            type="button"
            onClick={() => setWhenToSend("schedule")}
            className={`h-10 rounded-md border px-3 text-sm ${whenToSend === "schedule" ? "border-primary ring-2 ring-ring" : "hover:bg-accent"}`}
          >
            Schedule
          </button>
        </div>

        {whenToSend === "schedule" && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Select date</label>
              <input
                type="datetime-local"
                className="w-full h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Timezone</label>
              <select
                className="w-full h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring bg-background"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {tzOptions.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* When Calls Can Run (picker) */}
      <div className="space-y-3">
        <label className="text-sm font-medium block">When Calls Can Run</label>
        <TimeWindowPicker value={timeWindowCfg} onChange={setTimeWindowCfg} />
      </div>

      {/* Concurrency */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Reserved Concurrency for Other Calls</label>
        <div className="text-xs text-muted-foreground">
          Number of concurrency reserved for all other calls, such as inbound calls.
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button" variant="outline" size="icon" className="h-9 w-9"
            onClick={() => {
              const next = Math.max(0, reservedOtherCalls - 1);
              setReservedOtherCalls(next);
              setBatchConcurrency(Math.max(1, 20 - next));
            }}
            aria-label="Decrease"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <input
            type="number" className="h-9 w-16 rounded-md border text-center text-sm"
            value={reservedOtherCalls}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value || 0));
              setReservedOtherCalls(v);
              setBatchConcurrency(Math.max(1, 20 - v));
            }}
            min={0}
          />
          <Button
            type="button" variant="outline" size="icon" className="h-9 w-9"
            onClick={() => {
              const next = Math.min(19, reservedOtherCalls + 1);
              setReservedOtherCalls(next);
              setBatchConcurrency(Math.max(1, 20 - next));
            }}
            aria-label="Increase"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-3 rounded-md border bg-muted/40 p-3 text-xs">
          <div className="font-medium mb-1">
            Concurrency allocated to batch calling: {batchConcurrency}
          </div>
          {recipientsCount > 0 && (
            <div className="text-muted-foreground">
              Estimated time to complete all calls: {estMinutes} minutes (assuming each call lasts 5 minutes)
            </div>
          )}
          <a href="#" onClick={(e) => e.preventDefault()} className="underline underline-offset-4">
            Purchase more concurrency
          </a>
        </div>
      </div>
    </>
  );
};

export default SendOptions;
