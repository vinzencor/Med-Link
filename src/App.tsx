
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import GetStartedPage from "./pages/GetStartedPage"; // Keeping for reference, but Auth is main entry
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminLoginPage from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// App Pages
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
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/get-started" element={<GetStartedPage />} />
              <Route path="/pricing" element={<PricingPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login/superuser" element={<AdminLoginPage />} />
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              {/* Recruiter Routes */}
              <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
                <Route path="/dashboard" element={<RecruiterDashboard />} />
                <Route path="/post-job" element={<PostJobPage />} />
                <Route path="/applicants" element={<ApplicantsPage />} />
              </Route>

              {/* Job Seeker Routes */}
              <Route element={<ProtectedRoute allowedRoles={['job_seeker']} />}>
                <Route path="/feed" element={<JobFeedPage />} />
                <Route path="/saved" element={<SavedJobsPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
              </Route>

              {/* Shared Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/subscription" element={<PricingPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
