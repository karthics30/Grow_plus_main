// CallHistoryTable.tsx
import React from "react";

interface CallHistoryItem {
  id: string;
  contact: string;
  campaign: string;
  duration: string;
  status: "Completed" | "Failed" | "Sending";
  outcome: string;
  timestamp: string;
}

interface CallHistoryTableProps {
  data: CallHistoryItem[];
  onViewCall: (callId: string) => void;
}

const CallHistoryTable: React.FC<CallHistoryTableProps> = ({
  data,
  onViewCall,
}) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "Completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "Sending":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No calls found matching your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
              Contact
            </th>
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
              Campaign
            </th>
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
              Duration
            </th>
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
              Status
            </th>
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
              Outcome
            </th>
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
              Timestamp
            </th>
            <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((call) => (
            <tr key={call.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <span className="font-medium">{call.contact}</span>
              </td>
              <td className="py-3 px-4 text-sm">{call.campaign}</td>
              <td className="py-3 px-4 text-sm">{call.duration}</td>
              <td className="py-3 px-4">
                <span className={getStatusBadge(call.status)}>
                  {call.status}
                </span>
              </td>
              <td className="py-3 px-4 text-sm">{call.outcome}</td>
              <td className="py-3 px-4 text-sm">{call.timestamp}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => onViewCall(call.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CallHistoryTable;
