import React, { useMemo, useState } from "react";
import { X, Plus, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TimeRange = { start: string; end: string };
export type TimeWindowConfig = { ranges: TimeRange[]; days: number[] }; // 1=Mon…7=Sun

const DOW: { id: number; label: string; short: string }[] = [
  { id: 1, label: "Every Monday", short: "Mon" },
  { id: 2, label: "Every Tuesday", short: "Tue" },
  { id: 3, label: "Every Wednesday", short: "Wed" },
  { id: 4, label: "Every Thursday", short: "Thu" },
  { id: 5, label: "Every Friday", short: "Fri" },
  { id: 6, label: "Every Saturday", short: "Sat" },
  { id: 7, label: "Every Sunday", short: "Sun" },
];

export const DEFAULT_TIME_WINDOW: TimeWindowConfig = {
  ranges: [{ start: "00:00", end: "23:59" }],
  days: [1, 2, 3, 4, 5, 6, 7],
};

function normalizeTW(v?: Partial<TimeWindowConfig> | null): TimeWindowConfig {
  const ranges =
    Array.isArray(v?.ranges) && v!.ranges.length
      ? v!.ranges.map((r) => ({ start: r.start ?? "00:00", end: r.end ?? "23:59" }))
      : DEFAULT_TIME_WINDOW.ranges.slice();
  const days =
    Array.isArray(v?.days) && v!.days.length
      ? [...v!.days].sort((a, b) => a - b)
      : DEFAULT_TIME_WINDOW.days.slice();
  return { ranges, days };
}

function fmtSummary(val: TimeWindowConfig) {
  const ranges = val.ranges.map((r) => `${r.start}-${r.end}`).join(", ");
  const all = DOW.map((d) => d.id);
  const same = val.days.length === all.length && all.every((d, i) => d === val.days[i]);
  const days = same ? "Mon–Sun" : DOW.filter((d) => val.days.includes(d.id)).map((d) => d.short).join(",");
  return `${ranges}${ranges && days ? ", " : ""}${days}`;
}

type Props = {
  /** Can be undefined; we normalize it internally */
  value?: TimeWindowConfig;
  onChange: (v: TimeWindowConfig) => void;
};

const TimeWindowPicker: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const safeValue = useMemo(() => normalizeTW(value), [value]);
  const [draft, setDraft] = useState<TimeWindowConfig>(safeValue);

  const openPicker = () => {
    setDraft(safeValue);
    setOpen(true);
  };

  const toggleDay = (id: number) =>
    setDraft((v) => {
      const has = v.days.includes(id);
      const days = has ? v.days.filter((d) => d !== id) : [...v.days, id].sort((a, b) => a - b);
      return { ...v, days };
    });

  const addRange = () =>
    setDraft((v) => ({ ...v, ranges: [...v.ranges, { start: "00:00", end: "23:59" }] }));

  const updateRange = (i: number, key: "start" | "end", val: string) =>
    setDraft((v) => {
      const ranges = v.ranges.slice();
      ranges[i] = { ...ranges[i], [key]: val };
      return { ...v, ranges };
    });

  const removeRange = (i: number) =>
    setDraft((v) => ({ ...v, ranges: v.ranges.filter((_, idx) => idx !== i) }));

  const summary = useMemo(() => fmtSummary(safeValue), [safeValue]);

  return (
    <>
      {/* Trigger chip */}
      <button
        type="button"
        onClick={openPicker}
        className="inline-flex items-center gap-2 text-xs px-2.5 h-8 rounded-md border hover:bg-accent"
        aria-haspopup="dialog"
      >
        <Clock className="w-4 h-4" />
        {summary}
      </button>

      {/* Popover */}
      {open && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute right-6 top-28 w-[380px] bg-background border rounded-xl shadow-xl p-4">
            <div className="space-y-3">
              <div className="text-sm font-medium">Select Time Range</div>

              {/* Ranges */}
              <div className="space-y-2">
                {draft.ranges.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={r.start}
                      onChange={(e) => updateRange(i, "start", e.target.value)}
                      className="h-9 rounded-md border px-2 text-sm min-w-[110px]"
                    >
                      {OPTIONS_24H.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm">–</span>
                    <select
                      value={r.end}
                      onChange={(e) => updateRange(i, "end", e.target.value)}
                      className="h-9 rounded-md border px-2 text-sm min-w-[110px]"
                    >
                      {OPTIONS_24H.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {draft.ranges.length > 1 && (
                      <button
                        type="button"
                        className="ml-1 p-2 rounded-md hover:bg-accent"
                        onClick={() => removeRange(i)}
                        aria-label="Remove range"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRange}
                  className="inline-flex items-center gap-2 text-xs px-2.5 h-8 rounded-md border hover:bg-accent"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Days */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Days of Week</div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="w-full h-9 rounded-md border px-3 text-sm flex items-center justify-between"
                  >
                    {fmtDaysLabel(draft.days)}
                    <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" fill="none" strokeWidth="2" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow">
                      {DOW.map((d) => {
                        const selected = draft.days.includes(d.id);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleDay(d.id)}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent text-sm"
                          >
                            <span>{d.label}</span>
                            {selected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onChange(normalizeTW(draft));
                    setOpen(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TimeWindowPicker;

function fmtDaysLabel(days: number[]) {
  if (!days?.length) return "Select days";
  if (days.length === 7) return "Mon–Sun";
  const map = new Map(DOW.map((d) => [d.id, d.short]));
  return [...days].sort((a, b) => a - b).map((d) => map.get(d)).join(", ");
}

const OPTIONS_24H = Array.from({ length: 24 * 60 }, (_, i) => {
  const h = String(Math.floor(i / 60)).padStart(2, "0");
  const m = String(i % 60).padStart(2, "0");
  return `${h}:${m}`;
});
