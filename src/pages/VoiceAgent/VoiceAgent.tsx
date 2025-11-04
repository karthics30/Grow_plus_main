// import React, { useEffect, useState } from "react";
// import { Phone } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import BatchCallDrawer, { BatchSummary } from "./BatchCallDrawer";
// import BatchCallCard from "./BatchCallCard";

// const VoiceAgent: React.FC = () => {
//   const [open, setOpen] = useState(false);
//   const [batches, setBatches] = useState<BatchSummary[]>([]);

//   // ESC closes
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
//     if (open) window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open]);

//   const handleCreated = (summary: BatchSummary) => {
//     setBatches((prev) => [summary, ...prev]);
//   };

//   const hasBatches = batches.length > 0;

//   return (
//     <div className="w-full min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-3 border-b">
//         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//           <Phone className="w-4 h-4" />
//           <span>Batch Call</span>
//         </div>
//         <Button onClick={() => setOpen(true)} className="rounded-full">
//           Create a batch call
//         </Button>
//       </div>

//       {/* Content */}
//       {hasBatches ? (
//         <div className="p-4">
//           <div className="p-4 ">
//             {batches.map((b) => (
//               <BatchCallCard
//                 key={b.id}
//                 name={b.name}
//                 status={b.status}
//                 sent={b.recipients}
//                 pickedUp={b.pickedUp}
//                 successful={b.successful}
//                 failed={b.recipients - b.pickedUp}
//                 onDetails={() => alert("Show batch details here")}
//                 // ✅ new actions
//                 onStop={() => {
//                   console.log("Stop batch:", b.id);
//                   // TODO: call API OR change state here
//                 }}
//                 onDuplicate={() => {
//                   console.log("Duplicate batch:", b.id);
//                   // TODO: push new card
//                 }}
//                 onDelete={() => {
//                   console.log("Delete batch:", b.id);
//                   // TODO: remove from list state
//                 }}
//                 // ✅ enable Stop only when status indicates active sending
//                 canStop={b.status === "Sending"}
//               />
//             ))}
//           </div>
//         </div>
//       ) : (
//         /* Empty state */
//         <div className="flex items-center justify-center h-[calc(100vh-56px)] px-4">
//           <div className="text-center text-sm text-muted-foreground space-y-3">
//             <div className="mx-auto w-10 h-10 rounded-lg border flex items-center justify-center">
//               <Phone className="w-4 h-4" />
//             </div>
//             <p>You don&apos;t have any batch call</p>
//           </div>
//         </div>
//       )}

//       {/* Overlay */}
//       {open && (
//         <div
//           className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
//           onClick={() => setOpen(false)}
//         />
//       )}

//       {/* Drawer */}
//       <BatchCallDrawer
//         open={open}
//         onClose={() => setOpen(false)}
//         onCreated={handleCreated}
//       />
//     </div>
//   );
// };

// export default VoiceAgent;

// import React, { useEffect, useState } from "react";
// import { Phone } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import BatchCallDrawer, { BatchSummary } from "./BatchCallDrawer";
// import BatchCallCard from "./BatchCallCard";

// // Types based on Retell AI API
// interface RetellCall {
//   call_id: string;
//   agent_id: string;
//   status: "ongoing" | "ended" | "error";
//   start_timestamp: number;
//   end_timestamp?: number;
//   duration?: number;
//   from_number: string;
//   to_number: string;
//   cost?: number;
// }

// interface RetellCallsResponse {
//   calls: RetellCall[];
//   next_page_token?: string;
// }

// const RETELL_API_KEY = import.meta.env.VITE_APP_RETELL_API_KEY; // Replace with your actual API key
// const RETELL_BASE_URL = import.meta.env.VITE_APP_RETELL_BASE_URL; // Replace with your actual API key

// const VoiceAgent: React.FC = () => {
//   const [open, setOpen] = useState(false);
//   const [batches, setBatches] = useState<BatchSummary[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   console.log(RETELL_BASE_URL, "This is hte api key");

//   // Fetch calls from Retell AI
//   const fetchCalls = async (): Promise<BatchSummary[]> => {
//     try {
//       const response = await fetch(`${RETELL_BASE_URL}/list-calls`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${RETELL_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch calls: ${response.statusText}`);
//       }

//       const data: RetellCallsResponse = await response.json();

//       // Transform Retell calls to BatchSummary format
//       return data.calls.map((call, index) => {
//         // Map Retell status to your app's status
//         const statusMap = {
//           ongoing: "Sending",
//           ended: "Completed",
//           error: "Failed",
//         } as const;

//         // Mock some data since Retell doesn't provide all the fields we need
//         // You might need to track these separately in your database
//         const mockRecipients = Math.floor(Math.random() * 100) + 50;
//         const mockPickedUp = Math.floor(mockRecipients * 0.6);
//         const mockSuccessful = Math.floor(mockPickedUp * 0.8);

//         return {
//           id: call.call_id,
//           name: `Call ${index + 1}`,
//           status: statusMap[call.status] || "Completed",
//           sent: mockRecipients,
//           pickedUp: mockPickedUp,
//           successful: mockSuccessful,
//           createdAt: new Date(call.start_timestamp * 1000),
//         };
//       });
//     } catch (err) {
//       console.error("Error fetching calls:", err);
//       throw err;
//     }
//   };

//   // Get specific call details
//   const fetchCallDetails = async (callId: string): Promise<RetellCall> => {
//     try {
//       const response = await fetch(`${RETELL_BASE_URL}/get-call/${callId}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${RETELL_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch call details: ${response.statusText}`);
//       }

//       return await response.json();
//     } catch (err) {
//       console.error("Error fetching call details:", err);
//       throw err;
//     }
//   };

//   // Load calls on component mount
//   useEffect(() => {
//     const loadCalls = async () => {
//       try {
//         setLoading(true);
//         const calls = await fetchCalls();
//         setBatches(calls);
//         setError(null);
//       } catch (err) {
//         setError("Failed to load calls");
//         console.error(err);

//         // Fallback to mock data if API fails
//         const mockDataForBatch: BatchSummary[] = [
//           {
//             id: "1",
//             name: "Weekly Follow-up",
//             status: "Sending",
//             sent: 150,
//             pickedUp: 45,
//             successful: 32,
//             createdAt: new Date(),
//           },
//           {
//             id: "2",
//             name: "Product Launch",
//             status: "Completed",
//             sent: 200,
//             pickedUp: 89,
//             successful: 76,
//             createdAt: new Date(),
//           },
//         ];
//         setBatches(mockDataForBatch);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCalls();
//   }, []);

//   // ESC closes
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
//     if (open) window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open]);

//   const handleCreated = (summary: BatchSummary) => {
//     setBatches((prev) => [summary, ...prev]);
//   };

//   const handleStop = async (batchId: string) => {
//     try {
//       console.log("Stopping batch:", batchId);
//       // TODO: Implement stop call API if available
//       // For now, just update local state
//       setBatches((prev) =>
//         prev.map((batch) =>
//           batch.id === batchId ? { ...batch, status: "Completed" } : batch
//         )
//       );
//     } catch (err) {
//       console.error("Error stopping batch:", err);
//     }
//   };

//   const handleDuplicate = (batchId: string) => {
//     const batchToDuplicate = batches.find((b) => b.id === batchId);
//     if (batchToDuplicate) {
//       const duplicatedBatch: BatchSummary = {
//         ...batchToDuplicate,
//         id: Date.now().toString(),
//         name: `${batchToDuplicate.name} (Copy)`,
//         createdAt: new Date(),
//       };
//       setBatches((prev) => [duplicatedBatch, ...prev]);
//     }
//   };

//   const handleDelete = (batchId: string) => {
//     setBatches((prev) => prev.filter((b) => b.id !== batchId));
//   };

//   const handleDetails = async (batchId: string) => {
//     try {
//       const callDetails = await fetchCallDetails(batchId);
//       alert(
//         `Call Details:\nFrom: ${callDetails.from_number}\nTo: ${
//           callDetails.to_number
//         }\nStatus: ${callDetails.status}\nDuration: ${
//           callDetails.duration || 0
//         }s`
//       );
//     } catch (err) {
//       alert("Failed to load call details");
//     }
//   };

//   const hasBatches = batches.length > 0;

//   if (loading) {
//     return (
//       <div className="w-full min-h-screen flex items-center justify-center">
//         <div className="text-center">Loading calls...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-3 border-b">
//         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//           <Phone className="w-4 h-4" />
//           <span>Batch Call</span>
//         </div>
//         <Button onClick={() => setOpen(true)} className="rounded-full">
//           Create a batch call
//         </Button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="p-4 bg-destructive/10 text-destructive text-sm">
//           {error}
//         </div>
//       )}

//       {/* Content */}
//       {hasBatches ? (
//         <div className="p-4">
//           <div className="space-y-4">
//             {batches.map((b) => (
//               <BatchCallCard
//                 key={b.id}
//                 name={b.name}
//                 status={b.status}
//                 sent={b.sent}
//                 pickedUp={b.pickedUp}
//                 successful={b.successful}
//                 failed={b.sent - b.pickedUp}
//                 onDetails={() => handleDetails(b.id)}
//                 onStop={() => handleStop(b.id)}
//                 onDuplicate={() => handleDuplicate(b.id)}
//                 onDelete={() => handleDelete(b.id)}
//                 canStop={b.status === "Sending"}
//               />
//             ))}
//           </div>
//         </div>
//       ) : (
//         /* Empty state */
//         <div className="flex items-center justify-center h-[calc(100vh-56px)] px-4">
//           <div className="text-center text-sm text-muted-foreground space-y-3">
//             <div className="mx-auto w-10 h-10 rounded-lg border flex items-center justify-center">
//               <Phone className="w-4 h-4" />
//             </div>
//             <p>You don&apos;t have any batch call</p>
//           </div>
//         </div>
//       )}

//       {/* Overlay */}
//       {open && (
//         <div
//           className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
//           onClick={() => setOpen(false)}
//         />
//       )}

//       {/* Drawer */}
//       <BatchCallDrawer
//         open={open}
//         onClose={() => setOpen(false)}
//         onCreated={handleCreated}
//       />
//     </div>
//   );
// };

// export default VoiceAgent;

// import React, { useEffect, useState } from "react";
// import { Phone } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import BatchCallDrawer, { BatchSummary } from "./BatchCallDrawer";
// import CallHistoryTable from "./CallHistoryTable";
// import BatchCallCard from "./BatchCallCard";

// // Types based on Retell AI API
// interface RetellCall {
//   call_id: string;
//   agent_id: string;
//   agent_name: string;
//   call_status: "ongoing" | "ended" | "not_connected" | "error";
//   start_timestamp: number;
//   end_timestamp: number;
//   duration_ms: number;
//   from_number: string;
//   to_number: string;
//   call_cost?: {
//     combined_cost: number;
//   };
//   call_analysis?: {
//     call_summary: string;
//     user_sentiment: string;
//     call_successful: boolean;
//   };
//   transcript?: string;
//   disconnection_reason?: string;
//   direction?: "outbound" | "inbound";
// }

// interface CallHistoryItem {
//   id: string;
//   contact: string;
//   campaign: string;
//   duration: string;
//   status: "Completed" | "Failed" | "Sending";
//   outcome: string;
//   timestamp: string;
//   cost?: number;
//   sentiment?: string;
//   transcript?: string;
// }

// const RETELL_API_KEY = import.meta.env.VITE_APP_RETELL_API_KEY;
// const RETELL_BASE_URL = import.meta.env.VITE_APP_RETELL_BASE_URL;

// const VoiceAgent: React.FC = () => {
//   const [open, setOpen] = useState(false);
//   const [batches, setBatches] = useState<BatchSummary[]>([]);
//   const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Format duration from milliseconds to MM:SS format
//   const formatDuration = (ms: number): string => {
//     if (!ms || ms <= 0) return "0:00";
//     const totalSeconds = Math.floor(ms / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds.toString().padStart(2, "0")}`;
//   };

//   // Format timestamp to readable date
//   const formatTimestamp = (timestamp: number): string => {
//     const date = new Date(timestamp);
//     return (
//       date.toLocaleDateString("en-CA") +
//       " " +
//       date.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//       })
//     );
//   };

//   // Map Retell status to app status
//   const mapStatus = (
//     callStatus: string
//   ): "Completed" | "Failed" | "Sending" => {
//     switch (callStatus) {
//       case "ended":
//         return "Completed";
//       case "ongoing":
//         return "Sending";
//       case "not_connected":
//       case "error":
//       default:
//         return "Failed";
//     }
//   };

//   // Determine outcome based on call analysis
//   const getOutcome = (call: RetellCall): string => {
//     if (call.call_status === "not_connected") {
//       return "Not connected";
//     }

//     if (call.call_analysis) {
//       if (call.call_analysis.call_successful) {
//         return "Successful";
//       }
//       return call.call_analysis.call_summary || "No outcome";
//     }

//     return call.disconnection_reason || "Unknown";
//   };

//   // Get contact name from phone number (you might want to map this from your contacts)
//   const getContactName = (phoneNumber: string): string => {
//     // This is a simple mapping - you might want to fetch this from your contacts database
//     const contactMap: { [key: string]: string } = {
//       "5512821255": "John Smith",
//       "918667789015": "Sarah Johnson",
//       // Add more mappings as needed
//     };

//     return contactMap[phoneNumber] || phoneNumber;
//   };

//   // Fetch calls from Retell AI
//   const fetchCalls = async (): Promise<RetellCall[]> => {
//     try {
//       const response = await fetch(`${RETELL_BASE_URL}/list-calls`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${RETELL_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch calls: ${response.statusText}`);
//       }

//       const data = await response.json();
//       return data; // Your API returns array directly
//     } catch (err) {
//       console.error("Error fetching calls:", err);
//       throw err;
//     }
//   };

//   // Transform Retell calls to CallHistoryItem format
//   const transformCallsToHistory = (calls: RetellCall[]): CallHistoryItem[] => {
//     return calls.map((call) => {
//       const contactName =
//         call.direction === "outbound"
//           ? getContactName(call.to_number)
//           : getContactName(call.from_number);

//       return {
//         id: call.call_id,
//         contact: contactName,
//         campaign: call.agent_name,
//         duration: formatDuration(call.duration_ms),
//         status: mapStatus(call.call_status),
//         outcome: getOutcome(call),
//         timestamp: formatTimestamp(call.start_timestamp),
//         cost: call.call_cost?.combined_cost,
//         sentiment: call.call_analysis?.user_sentiment,
//         transcript: call.transcript,
//       };
//     });
//   };

//   // Load calls on component mount
//   useEffect(() => {
//     const loadCalls = async () => {
//       try {
//         setLoading(true);
//         const calls = await fetchCalls();
//         const history = transformCallsToHistory(calls);
//         setCallHistory(history);
//         setError(null);

//         // Also transform for batch summary (if still needed for other parts)
//         const batchSummaries: BatchSummary[] = calls.map((call, index) => ({
//           id: call.call_id,
//           name: `Call ${index + 1}`,
//           status: mapStatus(call.call_status),
//           sent: 1, // Single call
//           pickedUp: call.call_status === "ended" ? 1 : 0,
//           successful: call.call_analysis?.call_successful ? 1 : 0,
//           createdAt: new Date(call.start_timestamp),
//         }));
//         setBatches(batchSummaries);
//       } catch (err) {
//         setError("Failed to load calls");
//         console.error(err);

//         // Fallback to mock data if API fails
//         const mockCallHistory: CallHistoryItem[] = [
//           {
//             id: "1",
//             contact: "John Smith",
//             campaign: "Q1 Follow-up Calls",
//             duration: "5:45",
//             status: "Completed",
//             outcome: "Meeting scheduled",
//             timestamp: "2024-01-15 10:30",
//           },
//           {
//             id: "2",
//             contact: "Sarah Johnson",
//             campaign: "Product Demo Outreach",
//             duration: "8:32",
//             status: "Completed",
//             outcome: "Interested",
//             timestamp: "2024-01-15 11:15",
//           },
//         ];
//         setCallHistory(mockCallHistory);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCalls();
//   }, []);

//   // ESC closes
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
//     if (open) window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open]);

//   const handleCreated = (summary: BatchSummary) => {
//     setBatches((prev) => [summary, ...prev]);
//   };

//   const handleStop = async (batchId: string) => {
//     try {
//       console.log("Stopping batch:", batchId);
//       setBatches((prev) =>
//         prev.map((batch) =>
//           batch.id === batchId ? { ...batch, status: "Completed" } : batch
//         )
//       );
//     } catch (err) {
//       console.error("Error stopping batch:", err);
//     }
//   };

//   const handleDuplicate = (batchId: string) => {
//     const batchToDuplicate = batches.find((b) => b.id === batchId);
//     if (batchToDuplicate) {
//       const duplicatedBatch: BatchSummary = {
//         ...batchToDuplicate,
//         id: Date.now().toString(),
//         name: `${batchToDuplicate.name} (Copy)`,
//         createdAt: new Date(),
//       };
//       setBatches((prev) => [duplicatedBatch, ...prev]);
//     }
//   };

//   const handleDelete = (batchId: string) => {
//     setBatches((prev) => prev.filter((b) => b.id !== batchId));
//     setCallHistory((prev) => prev.filter((call) => call.id !== batchId));
//   };

//   const handleDetails = async (batchId: string) => {
//     const call = callHistory.find((c) => c.id === batchId);
//     if (call) {
//       alert(
//         `Call Details:\nContact: ${call.contact}\nCampaign: ${call.campaign}\nDuration: ${call.duration}\nStatus: ${call.status}\nOutcome: ${call.outcome}\nTimestamp: ${call.timestamp}`
//       );
//     }
//   };

//   const hasBatches = batches.length > 0;
//   const hasCallHistory = callHistory.length > 0;

//   if (loading) {
//     return (
//       <div className="w-full min-h-screen flex items-center justify-center">
//         <div className="text-center">Loading calls...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-3 border-b">
//         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//           <Phone className="w-4 h-4" />
//           <span>Batch Call</span>
//         </div>
//         <Button onClick={() => setOpen(true)} className="rounded-full">
//           Create a batch call
//         </Button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="p-4 bg-destructive/10 text-destructive text-sm">
//           {error}
//         </div>
//       )}

//       {/* Content */}
//       {hasCallHistory ? (
//         <div className="p-4">
//           {/* Call History Table */}
//           <div className="bg-white rounded-lg border">
//             <CallHistoryTable data={callHistory} />
//           </div>

//           {/* Batch Call Cards (if still needed) */}
//           {hasBatches && (
//             <div className="mt-6">
//               <h3 className="text-lg font-semibold mb-4">Batch Calls</h3>
//               <div className="space-y-4">
//                 {batches.map((b) => (
//                   <BatchCallCard
//                     key={b.id}
//                     name={b.name}
//                     status={b.status}
//                     sent={b.sent}
//                     pickedUp={b.pickedUp}
//                     successful={b.successful}
//                     failed={b.sent - b.pickedUp}
//                     onDetails={() => handleDetails(b.id)}
//                     onStop={() => handleStop(b.id)}
//                     onDuplicate={() => handleDuplicate(b.id)}
//                     onDelete={() => handleDelete(b.id)}
//                     canStop={b.status === "Sending"}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         /* Empty state */
//         <div className="flex items-center justify-center h-[calc(100vh-56px)] px-4">
//           <div className="text-center text-sm text-muted-foreground space-y-3">
//             <div className="mx-auto w-10 h-10 rounded-lg border flex items-center justify-center">
//               <Phone className="w-4 h-4" />
//             </div>
//             <p>You don&apos;t have any call history</p>
//           </div>
//         </div>
//       )}

//       {/* Overlay */}
//       {open && (
//         <div
//           className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
//           onClick={() => setOpen(false)}
//         />
//       )}

//       {/* Drawer */}
//       <BatchCallDrawer
//         open={open}
//         onClose={() => setOpen(false)}
//         onCreated={handleCreated}
//       />
//     </div>
//   );
// };

// export default VoiceAgent;
// VoiceAgent.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import BatchCallDrawer, { BatchSummary } from "./BatchCallDrawer";
import CallHistoryFilters from "./CallHistoryFilters";
import CallHistoryTable from "./CallHistoryTable";
import CallDetailsDrawer from "./CallDetailsDrawer";


// Types based on Retell AI API
interface RetellCall {
  call_id: string;
  agent_id: string;
  agent_name: string;
  call_status: "ongoing" | "ended" | "not_connected" | "error";
  start_timestamp: number;
  end_timestamp: number;
  duration_ms: number;
  from_number: string;
  to_number: string;
  call_cost?: {
    combined_cost: number;
  };
  call_analysis?: {
    call_summary: string;
    user_sentiment: string;
    call_successful: boolean;
  };
  transcript?: string;
  disconnection_reason?: string;
  direction?: "outbound" | "inbound";
}

interface CallHistoryItem {
  id: string;
  contact: string;
  contactNumber: string;
  campaign: string;
  duration: string;
  durationMs: number;
  status: "Completed" | "Failed" | "Sending";
  outcome: string;
  timestamp: string;
  timestampMs: number;
  cost?: number;
  sentiment?: string;
  transcript?: string;
}

interface CallDetails {
  call_id: string;
  call_type: string;
  agent_id: string;
  agent_version: number;
  agent_name: string;
  collected_dynamic_variables: any;
  call_status: string;
  start_timestamp: number;
  end_timestamp: number;
  duration_ms: number;
  transcript: string;
  transcript_object: any[];
  transcript_with_tool_calls: any[];
  recording_url: string;
  recording_multi_channel_url: string;
  public_log_url: string;
  disconnection_reason: string;
  latency: any;
  call_cost: any;
  call_analysis: {
    in_voicemail: boolean;
    call_summary: string;
    user_sentiment: string;
    custom_analysis_data: any;
    call_successful: boolean;
  };
  opt_out_sensitive_data_storage: boolean;
  data_storage_setting: string;
  llm_token_usage: any;
  access_token: string;
  from_number?: string;
  to_number?: string;
  direction?: string;
}

export interface FilterOptions {
  status: string;
  search: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const RETELL_API_KEY = import.meta.env.VITE_APP_RETELL_API_KEY;
const RETELL_BASE_URL = import.meta.env.VITE_APP_RETELL_BASE_URL;

const VoiceAgent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallDetails | null>(null);
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [filteredCallHistory, setFilteredCallHistory] = useState<
    CallHistoryItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    search: "",
    dateRange: {
      from: null,
      to: null,
    },
    sortBy: "timestamp",
    sortOrder: "desc",
  });

  // Format duration from milliseconds to MM:SS format
  const formatDuration = (ms: number): string => {
    if (!ms || ms <= 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString("en-CA") +
      " " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  };

  // Map Retell status to app status
  const mapStatus = (
    callStatus: string
  ): "Completed" | "Failed" | "Sending" => {
    switch (callStatus) {
      case "ended":
        return "Completed";
      case "ongoing":
        return "Sending";
      case "not_connected":
      case "error":
      default:
        return "Failed";
    }
  };

  // Determine outcome based on call analysis
  const getOutcome = (call: RetellCall): string => {
    if (call.call_status === "not_connected") {
      return "Not connected";
    }

    if (call.call_analysis) {
      if (call.call_analysis.call_successful) {
        return "Successful";
      }
      return call.call_analysis.call_summary || "No outcome";
    }

    return call.disconnection_reason || "Unknown";
  };

  // Get contact name from phone number
  const getContactName = (phoneNumber: string): string => {
    const contactMap: { [key: string]: string } = {
      "5512821255": "John Smith",
      "918667789015": "Sarah Johnson",
      "5551234567": "Mike Johnson",
      "5559876543": "Emily Davis",
      "5554567890": "Robert Wilson",
    };

    return contactMap[phoneNumber] || `Unknown (${phoneNumber})`;
  };

  // Fetch calls from Retell AI
  const fetchCalls = async (): Promise<RetellCall[]> => {
    try {
      const response = await fetch(`${RETELL_BASE_URL}/list-calls`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch calls: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching calls:", err);
      throw err;
    }
  };

  // Fetch specific call details
  const fetchCallDetails = async (callId: string): Promise<CallDetails> => {
    try {
      const response = await fetch(`${RETELL_BASE_URL}/get-call/${callId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch call details: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Error fetching call details:", err);
      throw err;
    }
  };

  // Transform Retell calls to CallHistoryItem format
  const transformCallsToHistory = (calls: RetellCall[]): CallHistoryItem[] => {
    return calls.map((call) => {
      const contactName =
        call.direction === "outbound"
          ? getContactName(call.to_number)
          : getContactName(call.from_number);

      const contactNumber =
        call.direction === "outbound" ? call.to_number : call.from_number;

      return {
        id: call.call_id,
        contact: contactName,
        contactNumber: contactNumber,
        campaign: call.agent_name,
        duration: formatDuration(call.duration_ms),
        durationMs: call.duration_ms,
        status: mapStatus(call.call_status),
        outcome: getOutcome(call),
        timestamp: formatTimestamp(call.start_timestamp),
        timestampMs: call.start_timestamp,
        cost: call.call_cost?.combined_cost,
        sentiment: call.call_analysis?.user_sentiment,
        transcript: call.transcript,
      };
    });
  };

  // Handle view call details
  const handleViewCall = async (callId: string) => {
    try {
      const callDetails = await fetchCallDetails(callId);
      setSelectedCall(callDetails);
      setDetailsOpen(true);
    } catch (err) {
      console.error("Error fetching call details:", err);
      setError("Failed to load call details");
    }
  };

  // Apply filters and sorting
  const applyFiltersAndSorting = useMemo(() => {
    let filtered = [...callHistory];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((call) => call.status === filters.status);
    }

    // Filter by search term (contact name or number)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (call) =>
          call.contact.toLowerCase().includes(searchTerm) ||
          call.contactNumber.includes(searchTerm) ||
          call.campaign.toLowerCase().includes(searchTerm) ||
          call.outcome.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by date range
    if (filters.dateRange.from) {
      filtered = filtered.filter(
        (call) => call.timestampMs >= filters.dateRange.from!.getTime()
      );
    }
    if (filters.dateRange.to) {
      // Add one day to include the entire end date
      const endOfDay = new Date(filters.dateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (call) => call.timestampMs <= endOfDay.getTime()
      );
    }

    // Sort the data
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case "contact":
          aValue = a.contact;
          bValue = b.contact;
          break;
        case "campaign":
          aValue = a.campaign;
          bValue = b.campaign;
          break;
        case "duration":
          aValue = a.durationMs;
          bValue = b.durationMs;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "outcome":
          aValue = a.outcome;
          bValue = b.outcome;
          break;
        case "timestamp":
        default:
          aValue = a.timestampMs;
          bValue = b.timestampMs;
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return filters.sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return filters.sortOrder === "asc"
          ? aValue < bValue
            ? -1
            : aValue > bValue
            ? 1
            : 0
          : aValue > bValue
          ? -1
          : aValue < bValue
          ? 1
          : 0;
      }
    });

    return filtered;
  }, [callHistory, filters]);

  // Update filtered calls when filters change
  useEffect(() => {
    setFilteredCallHistory(applyFiltersAndSorting);
    setCurrentPage(1); // Reset to first page when filters change
  }, [applyFiltersAndSorting]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCallHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCalls = filteredCallHistory.slice(startIndex, endIndex);

  // Load calls on component mount
  useEffect(() => {
    const loadCalls = async () => {
      try {
        setLoading(true);
        const calls = await fetchCalls();
        const history = transformCallsToHistory(calls);
        setCallHistory(history);
        setError(null);

        // Also transform for batch summary
        const batchSummaries: BatchSummary[] = calls.map((call, index) => ({
          id: call.call_id,
          name: `Call ${index + 1}`,
          status: mapStatus(call.call_status),
          sent: 1,
          pickedUp: call.call_status === "ended" ? 1 : 0,
          successful: call.call_analysis?.call_successful ? 1 : 0,
          createdAt: new Date(call.start_timestamp),
        }));
        setBatches(batchSummaries);
      } catch (err) {
        setError("Failed to load calls");
        console.error(err);

        // Fallback to mock data if API fails
        const mockCallHistory: CallHistoryItem[] = [
          {
            id: "1",
            contact: "John Smith",
            contactNumber: "5551234567",
            campaign: "Q1 Follow-up Calls",
            duration: "5:45",
            durationMs: 345000,
            status: "Completed",
            outcome: "Meeting scheduled",
            timestamp: "2024-01-15 10:30",
            timestampMs: new Date("2024-01-15 10:30").getTime(),
          },
          {
            id: "2",
            contact: "Sarah Johnson",
            contactNumber: "5559876543",
            campaign: "Product Demo Outreach",
            duration: "8:32",
            durationMs: 512000,
            status: "Completed",
            outcome: "Interested",
            timestamp: "2024-01-15 11:15",
            timestampMs: new Date("2024-01-15 11:15").getTime(),
          },
          {
            id: "3",
            contact: "Mike Johnson",
            contactNumber: "5554567890",
            campaign: "Q1 Follow-up Calls",
            duration: "2:15",
            durationMs: 135000,
            status: "Failed",
            outcome: "Not connected",
            timestamp: "2024-01-14 14:20",
            timestampMs: new Date("2024-01-14 14:20").getTime(),
          },
        ];
        setCallHistory(mockCallHistory);
      } finally {
        setLoading(false);
      }
    };

    loadCalls();
  }, []);

  // ESC closes drawers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (detailsOpen) {
          setDetailsOpen(false);
        } else if (open) {
          setOpen(false);
        }
      }
    };

    if (open || detailsOpen) {
      window.addEventListener("keydown", onKey);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [open, detailsOpen]);

  const handleCreated = (summary: BatchSummary) => {
    setBatches((prev) => [summary, ...prev]);
  };

  const handleStop = async (batchId: string) => {
    try {
      console.log("Stopping batch:", batchId);
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === batchId ? { ...batch, status: "Completed" } : batch
        )
      );
    } catch (err) {
      console.error("Error stopping batch:", err);
    }
  };

  const handleDuplicate = (batchId: string) => {
    const batchToDuplicate = batches.find((b) => b.id === batchId);
    if (batchToDuplicate) {
      const duplicatedBatch: BatchSummary = {
        ...batchToDuplicate,
        id: Date.now().toString(),
        name: `${batchToDuplicate.name} (Copy)`,
        createdAt: new Date(),
      };
      setBatches((prev) => [duplicatedBatch, ...prev]);
    }
  };

  const handleDelete = (batchId: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
    setCallHistory((prev) => prev.filter((call) => call.id !== batchId));
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const hasCallHistory = callHistory.length > 0;

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">Loading calls...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>Batch Call</span>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-full">
          Create a batch call
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {hasCallHistory ? (
        <div className="p-4">
          {/* Filters */}
          <CallHistoryFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            totalItems={filteredCallHistory.length}
          />

          {/* Call History Table */}
          <div className="bg-white rounded-lg border">
            <CallHistoryTable
              data={paginatedCalls}
              onViewCall={handleViewCall}
            />
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredCallHistory.length)} of{" "}
                {filteredCallHistory.length} calls
              </span>

              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded text-sm ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex items-center justify-center h-[calc(100vh-56px)] px-4">
          <div className="text-center text-sm text-muted-foreground space-y-3">
            <div className="mx-auto w-10 h-10 rounded-lg border flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <p>You don&apos;t have any call history</p>
          </div>
        </div>
      )}

      {/* Overlays */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {detailsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setDetailsOpen(false)}
        />
      )}

      {/* Drawers */}
      <BatchCallDrawer
        open={open}
        onClose={() => setOpen(false)}
        onCreated={handleCreated}
      />

      <CallDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        callDetails={selectedCall}
      />
    </div>
  );
};

export default VoiceAgent;
