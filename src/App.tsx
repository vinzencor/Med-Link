import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";

// Pages
import LandingPage from "./pages/LandingPage";
import GetStartedPage from "./pages/GetStartedPage";
import PricingPage from "./pages/PricingPage";
import JobFeedPage from "./pages/JobFeedPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ProfilePage from "./pages/ProfilePage";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PostJobPage from "./pages/PostJobPage";
import ApplicantsPage from "./pages/ApplicantsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            
            {/* Job Seeker Routes */}
            <Route path="/feed" element={<JobFeedPage />} />
            <Route path="/saved" element={<SavedJobsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            
            {/* Recruiter Routes */}
            <Route path="/dashboard" element={<RecruiterDashboard />} />
            <Route path="/post-job" element={<PostJobPage />} />
            <Route path="/applicants" element={<ApplicantsPage />} />
            
            {/* Shared Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/subscription" element={<GetStartedPage />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
