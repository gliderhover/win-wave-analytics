import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserTierProvider } from "@/contexts/UserTierContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";
import Performance from "./pages/Performance";
import Pricing from "./pages/Pricing";
import Suggestions from "./pages/Suggestions";
import Elite from "./pages/Elite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserTierProvider>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserTierProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
