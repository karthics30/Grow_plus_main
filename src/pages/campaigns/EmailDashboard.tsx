import { useEffect, useState } from "react";
import { Mail, Eye, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Assuming API_ENDPOINTS is imported from the file above
import { API_ENDPOINTS } from "@/config/api";

export interface Campaign {
  id: string;
  title: string;
  status: "active" | "inactive" | "scheduled" | "completed"; // ✅ added "inactive"
  category: string;
  sent: number;
  opened: number;
  clicked: number;
  failed: number;
  engagementRate: number;
  clickToOpenRate: number;
}

interface EmailCampaignDashboardProps {
  onCreate: () => void;
}

export default function EmailCampaignDashboard({
  onCreate,
}: EmailCampaignDashboardProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getStatusVariant = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary"; // ✅ gray for inactive
      case "scheduled":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/send-campaign/list/${id}`);
  };

  /**
   * Fetches all campaigns and then fetches the stats for each campaign
   * from the new single-campaign stats API endpoint.
   */
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // 1️⃣ Fetch all campaigns
        const campaignsResponse = await fetch(API_ENDPOINTS.getAll);
        if (!campaignsResponse.ok)
          throw new Error(`HTTP error! status: ${campaignsResponse.status}`);
        const campaignsRes = await campaignsResponse.json();

        if (campaignsRes?.success && Array.isArray(campaignsRes.data)) {
          const rawCampaigns = campaignsRes.data;

          // 2️⃣ Fetch stats for all campaigns concurrently
          const statsPromises = rawCampaigns.map((campaign: any) =>
            fetch(API_ENDPOINTS.getCampaignStats(Number(campaign.id)))
              .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
              })
              .catch((error) => {
                console.error(
                  `Error fetching stats for campaign ${campaign.id}:`,
                  error
                );
                return { success: false, data: null };
              })
          );

          const allStatsResults = await Promise.all(statsPromises);

          // 3️⃣ Combine campaign info + stats
          const formattedCampaigns = rawCampaigns.map(
            (c: any, index: number) => {
              const stats = allStatsResults[index]?.data || {
                sentCount: 0,
                openCount: 0,
                failedCount: 0,
                clickedCount: allStatsResults[index]?.data?.clickedCount || 0,
              };

              const sent = stats.sentCount;
              const failed = stats.failedCount;
              const delivered = sent - failed; // ✅ Actual delivered emails
              const opened = stats.openCount;
              const clicked = stats.clickedCount;

              // 🧮 Engagement Rate = (Unique Opens / Delivered Emails) * 100
              const engagementRate =
                delivered > 0 ? Math.round((opened / sent) * 100) /100 : 0;

              // 🧮 Click-to-Open Rate (CTOR) = (Unique Clicks / Unique Opens) * 100
              const clickToOpenRate =
                opened > 0 ? Math.round((sent / clicked) * 100) : 0;

              // 🧮 Click Rate (optional overall metric)
              const clickRate =
                delivered > 0 ? Math.round((clicked / delivered) * 100) : 0;

              return {
                id: c.id,
                title: c.CampaignName,
                desc: c.Desc,
                sentAt: c.sentAt,
                status: "active" as Campaign["status"],
                category: "General",
                sent,
                delivered,
                opened,
                clicked,
                failed,
                engagementRate,
                clickToOpenRate,
                clickRate,
              };
            }
          );

          setCampaigns(formattedCampaigns);
        } else {
          console.warn("Invalid campaign response format:", campaignsRes);
        }
      } catch (error) {
        console.error("Failed to fetch campaigns or stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Email Campaigns
          </h1>
          <p className="text-muted-foreground">
            Create and manage your email campaigns
          </p>
        </div>
        <Button size="lg" onClick={onCreate} className="gap-2">
          <Mail className="w-5 h-5" />
          New Campaign
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="w-full h-56 rounded-lg" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center text-muted-foreground mt-20">
          No campaigns found. Click{" "}
          <span className="font-semibold">New Campaign</span> to create one.
        </div>
      ) : (
        <div className="space-y-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${
                campaign.status === "inactive" ? "opacity-60" : ""
              }`} // ✅ visually gray out inactive
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    {campaign.title}
                  </h3>
                  <Badge
                    variant={getStatusVariant(campaign.status)}
                    className="capitalize"
                  >
                    {campaign.status}
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
                <StatCard
                  icon={<Mail className="w-5 h-5 text-primary" />}
                  label="Sent"
                  value={campaign.sent}
                  bg="primary"
                />
                <StatCard
                  icon={<Eye className="w-5 h-5 text-success" />}
                  label="Opened"
                  value={campaign.opened}
                  bg="success"
                />
                <StatCard
                  icon={<Sparkles className="w-5 h-5 text-accent" />}
                  label="Clicked"
                  value={campaign.clicked}
                  bg="accent"
                />
                <StatCard
                  icon={<XCircle className="w-5 h-5 text-destructive" />}
                  label="Failed"
                  value={campaign.failed}
                  bg="destructive"
                />
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-4">
                <ProgressRow
                  label="Open Rate"
                  value={campaign.engagementRate}
                />
                {/* <ProgressRow
                  label="Click-to-Open Rate"
                  value={campaign.clickToOpenRate}
                /> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Helper Components ---------------- */
function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className={`bg-${bg}/5 rounded-lg p-4 flex items-center gap-3`}>
      <div className={`bg-${bg}/10 p-2 rounded-lg`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground">
          {value?.toLocaleString?.() || 0}
        </p>
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
