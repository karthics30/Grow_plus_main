// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import NotFound from "./pages/NotFound";
// import SendCampaignPage from "./pages/campaigns/SendCampaignPage";
// import SendCampaignList from "./pages/campaigns/SendCampaignList";
// import DashboardLayout from "./components/DashboardLayout";
// import Index from "./pages/Index";
// import VoiceAgent from "./pages/VoiceAgent/VoiceAgent";
// import CallHistory from "./pages/VoiceAgent/CallHistory/CallHistory";
// import Contacts from "./pages/Contacts";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <Routes>
//           {/* Public route */}
//           <Route path="/" element={<Login />} />

//           {/* Protected layout wrapper */}
//           <Route element={<DashboardLayout />}>
//             <Route path="/index" element={<Index />} />
//             <Route path="/dashboard" element={<Dashboard />} />

//             {/* ✅ Campaign Routes */}
//             <Route path="/send-campaign" element={<SendCampaignPage />} />
//             <Route path="/send-campaign/list/:id" element={<SendCampaignList />} />
//             <Route path="/voice-agent" element={< VoiceAgent/>} />
//             <Route path="/voice-history" element={< CallHistory/>} />
//             <Route path="/contacts" element={<Contacts />} />
//           </Route>

//           {/* Catch-all */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom"; // ✅ changed BrowserRouter → HashRouter
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SendCampaignPage from "./pages/campaigns/SendCampaignPage";
import SendCampaignList from "./pages/campaigns/SendCampaignList";
import DashboardLayout from "./components/DashboardLayout";
import Index from "./pages/Index";
import VoiceAgent from "./pages/VoiceAgent/VoiceAgent";
import CallHistory from "./pages/VoiceAgent/CallHistory/CallHistory";
import Contacts from "./pages/Contacts";

const queryClient = new QueryClient();
//main barnacjs
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Protected layout wrapper */}
          <Route element={<DashboardLayout />}>
            <Route path="/index" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ✅ Campaign Routes */}
            <Route path="/send-campaign" element={<SendCampaignPage />} />
            <Route path="/send-campaign/list/:id" element={<SendCampaignList />} />
            <Route path="/voice-agent" element={<VoiceAgent />} />
            <Route path="/voice-history" element={<CallHistory />} />
            <Route path="/contacts" element={<Contacts />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
