
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthGuard } from "./components/auth/AuthGuard";

// Modals
import { TaskModal } from "./components/modals/TaskModal";
import { PersonModal } from "./components/modals/PersonModal";
import { DeleteModal } from "./components/modals/DeleteModal";
import { DailyCloseModal } from "./components/modals/DailyCloseModal";
import { SkillModal } from "./components/modals/SkillModal";
import { TeamMemberModal } from "./components/modals/TeamMemberModal";
import { UnifiedRescheduleModal } from "./components/modals/UnifiedRescheduleModal";
import { WelcomeModal } from "./components/modals/WelcomeModal";

// Pages
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import PeoplePage from "./pages/PeoplePage";
import ReportsPage from "./pages/ReportsPage";
import DailyClosePage from "./pages/DailyClosePage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";
import BackupPage from "./pages/BackupPage";
import { SkillsPage } from "./pages/SkillsPage";
import AdminPage from "./pages/AdminPage";
import { SignInPage } from "./components/auth/SignInPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";

// Create QueryClient with better configuration for immediate updates
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000, // Reduzido de 5 minutos para 30 segundos
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<SignInPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />
            
            {/* Protected routes */}
            <Route path="/*" element={
              <AuthGuard>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/people" element={<PeoplePage />} />
                    <Route path="/skills" element={<SkillsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/daily-close" element={<DailyClosePage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/backup" element={<BackupPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
                
                {/* Global Modals */}
                <TaskModal />
                <PersonModal />
                <SkillModal />
                <TeamMemberModal />
                <UnifiedRescheduleModal />
                <DeleteModal />
                <DailyCloseModal />
                <WelcomeModal />
              </AuthGuard>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
