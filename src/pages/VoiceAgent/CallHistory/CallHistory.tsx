import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CallHistory: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const rows = []; // <-- replace with your rows or API data later

  // fake row for demo — remove once real data exists
  const DEMO = [
    {
      time: "2025-10-31 12:05:11",
      duration: "02:15",
      channelType: "Voice",
      cost: "$0.037",
      sessionId: "sess_9f32a1",
      endReason: "Completed",
      sessionStatus: "Succeeded",
      userSentiment: "Positive",
      from: "+15551234567",
      to: "+15557654321",
      direction: "Outbound",
      sessionOutcome: "Successful",
      e2eLatency: "380 ms",
    },
    {
    time: "2025-10-31 12:05:11",
    duration: "02:15",
    channelType: "Voice",
    cost: "$0.037",
    sessionId: "sess_9f32a1",
    endReason: "Completed",
    sessionStatus: "Succeeded",
    userSentiment: "Positive",
    from: "+15551234567",
    to: "+15557654321",
    direction: "Outbound",
    sessionOutcome: "Successful",
    e2eLatency: "380 ms",
  },
  {
    time: "2025-10-31 11:48:02",
    duration: "00:00",
    channelType: "Voice",
    cost: "$0.000",
    sessionId: "sess_1d7b9c",
    endReason: "No Answer",
    sessionStatus: "Failed",
    userSentiment: "Neutral",
    from: "+15551234567",
    to: "+15553334444",
    direction: "Outbound",
    sessionOutcome: "Unsuccessful",
    e2eLatency: "—",
  },
  {
    time: "2025-10-31 10:03:45",
    duration: "04:41",
    channelType: "Voice",
    cost: "$0.089",
    sessionId: "sess_71aa0e",
    endReason: "User hangup",
    sessionStatus: "Succeeded",
    userSentiment: "Negative",
    from: "+15558889999",
    to: "+15551234567",
    direction: "Inbound",
    sessionOutcome: "Successful",
    e2eLatency: "412 ms",
  },
  ];

  const data = rows.length ? rows : DEMO;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [query, data]);

  return (
    <div className="p-4">
      {/* Header with Back Button */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/voice-agent")}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 border"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-semibold">Call History</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-4 w-full sm:w-80 relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search calls"
          className="w-full h-10 rounded-lg border px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-xl border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Time</th>
              <th className="px-3 py-2 text-left font-medium">Duration</th>
              <th className="px-3 py-2 text-left font-medium">Channel Type</th>
              <th className="px-3 py-2 text-left font-medium">Cost</th>
              <th className="px-3 py-2 text-left font-medium">Session ID</th>
              <th className="px-3 py-2 text-left font-medium">End Reason</th>
              <th className="px-3 py-2 text-left font-medium">Session Status</th>
              <th className="px-3 py-2 text-left font-medium">User Sentiment</th>
              <th className="px-3 py-2 text-left font-medium">From</th>
              <th className="px-3 py-2 text-left font-medium">To</th>
              <th className="px-3 py-2 text-left font-medium">Direction</th>
              <th className="px-3 py-2 text-left font-medium">Session Outcome</th>
              <th className="px-3 py-2 text-left font-medium">End to End Latency</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{r.time}</td>
                <td className="px-3 py-2">{r.duration}</td>
                <td className="px-3 py-2">{r.channelType}</td>
                <td className="px-3 py-2">{r.cost}</td>
                <td className="px-3 py-2 font-mono">{r.sessionId}</td>
                <td className="px-3 py-2">{r.endReason}</td>
                <td className="px-3 py-2">{r.sessionStatus}</td>
                <td className="px-3 py-2">{r.userSentiment}</td>
                <td className="px-3 py-2 font-mono">{r.from}</td>
                <td className="px-3 py-2 font-mono">{r.to}</td>
                <td className="px-3 py-2">{r.direction}</td>
                <td className="px-3 py-2">{r.sessionOutcome}</td>
                <td className="px-3 py-2">{r.e2eLatency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallHistory;
