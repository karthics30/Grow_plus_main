import { useEffect, useState, } from "react";
import { Mail, Eye, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import { API_ENDPOINTS } from "@/config/api";


export interface Campaign {
  id: string;
  title: string;
  status: "active" | "scheduled" | "completed";
  category: string;
  sent: number;
  opened: number;
  clicked: number;
  failed: number;
  openRate: number;
  clickRate: number;
}

interface EmailCampaignDashboardProps {
  onCreate: () => void;
}

export default function EmailCampaignDashboard({ onCreate }: EmailCampaignDashboardProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getStatusVariant = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "scheduled":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleViewDetails = async (id: string) => {
  await fetchEmailLogs(Number(id)); // ✅ Always passes an ID
  navigate(`/send-campaign/list/${id}`);
};



 useEffect(() => {
  const fetchCampaigns = async () => {
    try {
      // 1️⃣ Fetch all campaigns
      const response = await fetch(API_ENDPOINTS.getAll);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const res = await response.json();

      // 2️⃣ Fetch all email logs once
      const logsResponse = await fetch(API_ENDPOINTS.sendLogs);
      const logsRes = await logsResponse.json();
      const allLogs = Array.isArray(logsRes.data) ? logsRes.data : [];

      if (res?.success && Array.isArray(res.data)) {
        // 3️⃣ Format campaign data
        const formatted = res.data.map((c: any) => {
          // Filter logs by campaign ID
          const campaignLogs = allLogs.filter((log: any) => log.CampaignId === c.id);

          // Compute counts
          const sent = campaignLogs.filter((log: any) => log.Status === "SENT").length;
          const opened = campaignLogs.filter((log: any) => log.Seen === "Seen").length;
          const failed = campaignLogs.filter((log: any) => log.Status === "FAILED").length;
          const replied = campaignLogs.filter((log: any) => log.Reply && log.Reply !== "No Reply").length;

          const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
          const clickRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;

          return {
            id: c.id,
            title: c.CampaignName,
            desc: c.Desc,
            sentAt: c.sentAt,
            status: "active",
            category: "General",
            sent,
            opened,
            clicked: replied, // using reply count as click count for now
            failed,
            openRate,
            clickRate,
          };
        });

        setCampaigns(formatted);
      } else {
        console.warn("Invalid campaign response format:", res);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchCampaigns();
}, []);


const fetchEmailLogs = async (campaignId?: number) => {
  if (!campaignId) {
    console.warn("⚠️ No campaignId provided — skipping log fetch");
    return;
  }

  try {
    console.log("Fetching logs for campaign:", campaignId);
    const response = await fetch(`${API_ENDPOINTS.sendLogs}/${campaignId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const res = await response.json();
    if (res.success) {
      console.log("✅ Email logs fetched:", res.data);
    } else {
      console.warn("⚠️ Unexpected response:", res);
    }
  } catch (err) {
    console.error("❌ Failed to fetch logs:", err);
  }
};



  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Email Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your email campaigns</p>
        </div>
        <Button size="lg" onClick={onCreate} className="gap-2">
          <Mail className="w-5 h-5" />
          New Campaign
        </Button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="w-full h-56 rounded-lg" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center text-muted-foreground mt-20">
          No campaigns found. Click <span className="font-semibold">New Campaign</span> to create one.
        </div>
      ) : (
        <div className="space-y-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-foreground">{campaign.title}</h3>
                  <Badge variant={getStatusVariant(campaign.status)} className="capitalize">
                    {campaign.status}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {campaign.category || "General"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(campaign.id)}
                  className="text-foreground hover:bg-accent"
                >
                  View Details
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard icon={<Mail className="w-5 h-5 text-primary" />} label="Sent" value={2} bg="primary" />
                <StatCard icon={<Eye className="w-5 h-5 text-success" />} label="Opened" value={1} bg="success" />
                <StatCard icon={<Sparkles className="w-5 h-5 text-accent" />} label="Clicked" value={campaign.clicked} bg="accent" />
                <StatCard icon={<XCircle className="w-5 h-5 text-destructive" />} label="Failed" value={0} bg="destructive" />
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                <ProgressRow label="Open Rate" value={campaign.openRate} />
                <ProgressRow label="Click Rate" value={campaign.clickRate} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Helper Components ---------------- */
function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className={`bg-${bg}/5 rounded-lg p-4 flex items-center gap-3`}>
      <div className={`bg-${bg}/10 p-2 rounded-lg`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value?.toLocaleString?.() || 0}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
