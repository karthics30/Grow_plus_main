/* eslint-disable @typescript-eslint/no-explicit-any */
// CallDetailsDrawer.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  Download,
  Calendar,
  Clock,
  Phone,
  User,
  Building,
} from "lucide-react";

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

interface CallDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  callDetails: CallDetails | null;
}

const CallDetailsDrawer: React.FC<CallDetailsDrawerProps> = ({
  open,
  onClose,
  callDetails,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Format duration from milliseconds to MM:SS format
  const formatTime = (ms: number) => {
    if (!ms || ms <= 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Handle audio playback
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleDownload = () => {
    if (callDetails?.recording_url) {
      const link = document.createElement("a");
      link.href = callDetails.recording_url;
      link.download = `call-recording-${callDetails.call_id}.wav`;
      link.click();
    }
  };

  // Reset audio when call details change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [callDetails]);

  if (!callDetails) return null;

  const timestamp = formatTimestamp(callDetails.start_timestamp);
  const totalDuration = formatTime(callDetails.duration_ms);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Call Details</h2>
            <p className="text-sm text-muted-foreground">
              Call ID: {callDetails.call_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Call Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span>{timestamp.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Time:</span>
                  <span>{timestamp.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Duration:</span>
                  <span>{totalDuration}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Agent:</span>
                  <span>{callDetails.agent_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Campaign:</span>
                  <span>{callDetails.agent_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      callDetails.call_status === "ended"
                        ? "bg-green-100 text-green-800"
                        : callDetails.call_status === "ongoing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {callDetails.call_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Call Analysis */}
            {callDetails.call_analysis && (
              <div className="space-y-3">
                <h3 className="font-semibold">Call Analysis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Sentiment:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        callDetails.call_analysis.user_sentiment === "Positive"
                          ? "bg-green-100 text-green-800"
                          : callDetails.call_analysis.user_sentiment ===
                            "Negative"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {callDetails.call_analysis.user_sentiment}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Successful:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        callDetails.call_analysis.call_successful
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {callDetails.call_analysis.call_successful ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                {callDetails.call_analysis.call_summary && (
                  <div className="text-sm">
                    <span className="font-medium">Summary:</span>
                    <p className="mt-1 text-muted-foreground">
                      {callDetails.call_analysis.call_summary}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recording Player */}
            {callDetails.recording_url && (
              <div className="space-y-4">
                <h3 className="font-semibold">Call Recording</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {/* Audio Player */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayback}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(currentTime * 1000)}</span>
                        <span>{formatTime(callDetails.duration_ms)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                      title="Download recording"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Hidden audio element */}
                  <audio
                    ref={audioRef}
                    src={callDetails.recording_url}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>
              </div>
            )}

            {/* Transcript */}
            {callDetails.transcript && (
              <div className="space-y-3">
                <h3 className="font-semibold">Transcript</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {callDetails.transcript}
                  </pre>
                </div>
              </div>
            )}

            {/* Cost Information */}
            {callDetails.call_cost && (
              <div className="space-y-3">
                <h3 className="font-semibold">Cost Breakdown</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span>Total Cost:</span>
                    <span className="font-semibold">
                      ${callDetails.call_cost.combined_cost.toFixed(2)}
                    </span>
                  </div>
                  {callDetails.call_cost.product_costs?.map(
                    (product: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm text-muted-foreground mt-1"
                      >
                        <span>{product.product}:</span>
                        <span>${product.cost?.toFixed(2) || "0.00"}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="space-y-3">
              <h3 className="font-semibold">Technical Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Call ID:</span>
                  <span className="font-mono text-xs">
                    {callDetails.call_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Agent ID:</span>
                  <span className="font-mono text-xs">
                    {callDetails.agent_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Disconnection Reason:</span>
                  <span>{callDetails.disconnection_reason || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CallDetailsDrawer;
