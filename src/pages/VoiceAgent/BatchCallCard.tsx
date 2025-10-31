import { useEffect, useRef, useState } from "react";
import {
  Phone,
  History,
  EllipsisVertical,
  Copy,
  Trash2,
  Square,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  name: string;
  status: string;
  sent: number;
  pickedUp: number;
  successful: number;
  failed: number;
  onDetails?: () => void;
  onStop?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  canStop?: boolean;
}

export default function BatchCallCard({
  name,
  status,
  sent,
  pickedUp,
  successful,
  failed,
  onStop,
  onDuplicate,
  onDelete,
  canStop = false,
}: Props) {
  const successRate = sent > 0 ? Math.round((successful / sent) * 100) : 0;
  const unpickedRate = sent > 0 ? Math.round(((sent - pickedUp) / sent) * 100) : 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const goToLogs = (e?: React.MouseEvent) => {
    e?.preventDefault();
    navigate("/voice-history");
  };

  // Outside click close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // ESC close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="p-5 bg-white rounded-2xl shadow border w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-lg">{name}</h2>

          <span
            className={`px-3 py-1 text-xs rounded-md font-semibold ${
              status === "Sending"
                ? "bg-blue-100 text-blue-700"
                : status === "Scheduled"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {status}
          </span>

          <span className="px-3 py-1 text-xs rounded-md font-semibold bg-gray-100 text-gray-600">
            Voice Call
          </span>
        </div>

        <div className="flex items-center gap-2 relative" ref={menuRef}>
          <button
            onClick={goToLogs}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 flex gap-2 text-gray-600 py-1 rounded-md"
          >
            Call Logs <History className="w-4" />
          </button>

          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <EllipsisVertical className="w-5" />
          </button>

          {/* Ellipsis Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 rounded-lg border bg-white shadow-lg p-2 z-10">
              {/* Stop */}
              <button
                disabled={!canStop}
                onClick={() => {
                  if (!canStop) return;
                  setMenuOpen(false);
                  onStop?.();
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm ${
                  canStop
                    ? "hover:bg-gray-100 text-gray-800"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <Square className="w-4 h-4" />
                Stop
              </button>

              {/* Duplicate */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate?.();
                }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-gray-100 text-gray-800"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>

              {/* Delete */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete?.();
                }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-red-50 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatBox
          icon={<Send className="w-5 h-5" />}
          value={sent}
          label="Sent"
          tint="bg-blue-50"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          valueColor="text-blue-700"
        />

        <StatBox
          icon={<Phone className="w-5 h-5" />}
          value={pickedUp}
          label="Picked Up"
          tint="bg-green-50"
          iconBg="bg-green-100"
          iconColor="text-green-600"
          valueColor="text-green-700"
        />

        <StatBox
          icon={<Phone className="w-5 h-5" />}
          value={successful}
          label="Successful"
          tint="bg-amber-50"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          valueColor="text-amber-700"
        />

        <StatBox
          icon={<Phone className="w-5 h-5" />}
          value={failed}
          label="Failed"
          tint="bg-red-50"
          iconBg="bg-red-100"
          iconColor="text-red-600"
          valueColor="text-red-700"
        />
      </div>

      {/* Progress Bars */}
      <div className="mt-5 space-y-3">
        {/* Success Rate */}
        <ProgressRow label="Success Rate" value={successRate} color="bg-blue-500" />

        {/* Unpicked Rate */}
        <ProgressRow label="Unpicked Rate" value={unpickedRate} color="bg-orange-400" />
      </div>
    </div>
  );
}

/* ✅ StatBox with icon style like screenshot */
const StatBox = ({
  icon,
  value,
  label,
  tint,
  iconBg,
  iconColor,
  valueColor,
}: any) => (
  <div className={`rounded-2xl ${tint} p-4`}>
    <div className="flex items-start gap-3">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-semibold ${valueColor}`}>{value ?? 0}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  </div>
);

/* ✅ Progress bar row */
const ProgressRow = ({ label, value, color }: any) => (
  <div>
    <div className="flex justify-between text-xs font-medium mb-1">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);
