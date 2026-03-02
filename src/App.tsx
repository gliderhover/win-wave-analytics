import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserTierProvider } from "@/contexts/UserTierContext";
import { LeagueProvider } from "@/contexts/LeagueContext";
import { I18nProvider } from "@/i18n/I18nContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";
import Performance from "./pages/Performance";
import Pricing from "./pages/Pricing";
import Suggestions from "./pages/Suggestions";
import Elite from "./pages/Elite";
import Simulation from "./pages/Simulation";
import SimulationContest from "./pages/SimulationContest";
import SimulationPortfolio from "./pages/SimulationPortfolio";
import SimulationLeaderboard from "./pages/SimulationLeaderboard";
import SimulationCertification from "./pages/SimulationCertification";
import MatchLab from "./pages/MatchLab";
import Community from "./pages/Community";
import CommunityCategory from "./pages/CommunityCategory";
import CommunityPostPage from "./pages/CommunityPost";
import CommunityNewPost from "./pages/CommunityNewPost";
import CommunityProfile from "./pages/CommunityProfile";
import CommunityMod from "./pages/CommunityMod";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

// Force HMR refresh
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
      <UserTierProvider>
        <LeagueProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/suggestions" element={<Suggestions />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/elite" element={<Elite />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/simulation/contest" element={<SimulationContest />} />
              <Route path="/simulation/portfolio" element={<SimulationPortfolio />} />
              <Route path="/simulation/leaderboard" element={<SimulationLeaderboard />} />
              <Route path="/simulation/certification" element={<SimulationCertification />} />
              <Route path="/match/:id" element={<MatchLab />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/r/:categorySlug" element={<CommunityCategory />} />
              <Route path="/community/post/:postId" element={<CommunityPostPage />} />
              <Route path="/community/new" element={<CommunityNewPost />} />
              <Route path="/community/profile/:userId" element={<CommunityProfile />} />
              <Route path="/community/mod" element={<CommunityMod />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LeagueProvider>
      </UserTierProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
