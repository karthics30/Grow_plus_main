import { useState } from "react";
import SendCampaignList from "./SendCampaignList";
import SendCampaign from "./SendCampaign";
import EmailCampaignDashboard from "./EmailDashboard";

const SendCampaignPage = () => {
  const [view, setView] = useState<"dashboard" | "list" | "create">("dashboard");

  return (
    <>
      {view === "dashboard" && (
        <EmailCampaignDashboard onCreate={() => setView("create")} />
      )}
      {view === "list" && (
        <SendCampaignList onCreate={() => setView("create")} />
      )}
      {view === "create" && (
        <SendCampaign onCreate={() => setView("dashboard")} />
      )}
    </>
  );
};

export default SendCampaignPage;
